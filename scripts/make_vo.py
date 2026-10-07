"""Generate the voiceover with ElevenLabs and place each line on its cue.

The whole script is read in ONE request so pacing and intonation flow
naturally. Character timestamps from the API are used to cut the take at
the pauses between lines; each line is then placed on its cue. If a line
would collide with the next one, the next one starts a little later rather
than anything being squeezed (at most a 5% tempo nudge as a last resort).
Long silences inside a line are shortened to a natural breath; the words
themselves are never cut. Several takes are generated and the one that
needs the least adjustment wins.

The API key is injected by the environment's network secret for
api.elevenlabs.io (header xi-api-key), so none is needed here.
Usage: python3 scripts/make_vo.py [voice_id] [takes]
"""
import base64, json, os, subprocess, sys, tempfile

VOICE = sys.argv[1] if len(sys.argv) > 1 else "IKne3meq5aSn9XLyUdCD"  # Charlie
TAKES = int(sys.argv[2]) if len(sys.argv) > 2 else 3
MODEL = "eleven_multilingual_v2"
TOTAL = 38.0
MIN_GAP = 0.3     # shortest breath between two lines
MAX_LATE = 0.45   # how far a line may slip past its cue
MAX_TEMPO = 1.05  # last-resort speed-up, barely audible
SPEED = 1.17      # ElevenLabs' own delivery speed for the whole read (Charlie is unhurried)
MAX_PAUSE = 0.28  # longest silence kept inside a line
# (cue, must end by, text)
LINES = [
    (0.4, 4.7, "Omar has had the same camera sitting in his cart for eight months."),
    (4.8, 9.2, "Every payday he opens it. Looks at the price. Closes the tab."),
    (9.05, 15.7, "Meanwhile, life keeps happening. Sunrise at Jebel Jais. His daughter's first run on Kite Beach. All on a phone doing its best."),
    (15.8, 20.7, "Then a friend sends him a link. Same camera. A price that finally makes sense."),
    (20.8, 27.2, "Brand new, sealed. Free delivery, next day. And he pays when it reaches him."),
    (27.3, 31.0, "This time, the photo looks the way the moment felt."),
    (34.6, 37.85, "BuyTech. Great shots, minus the big price tag."),
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp = tempfile.mkdtemp()


def sh(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def duration(path):
    return float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path))


def take(n):
    """One full read. Returns (wav path, [(start, end)] speech span per line)."""
    sep = "\n\n"
    text = sep.join(t for _, _, t in LINES)
    body = {
        "text": text,
        "model_id": MODEL,
        "seed": 1000 + n,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": SPEED},
    }
    out = f"{tmp}/take{n}.json"
    code = sh("curl", "-sS", "-m", "180", "-o", out, "-w", "%{http_code}", "-X", "POST",
              f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
              "-H", "Content-Type: application/json", "-d", json.dumps(body))
    if code != "200":
        sys.exit(f"take {n}: HTTP {code}: {open(out, errors='ignore').read()[:300]}")
    d = json.load(open(out))
    mp3 = f"{tmp}/take{n}.mp3"
    open(mp3, "wb").write(base64.b64decode(d["audio_base64"]))
    wav = f"{tmp}/take{n}.wav"
    sh("ffmpeg", "-v", "error", "-y", "-i", mp3, "-ar", "44100", "-ac", "1", wav)
    a = d["alignment"]
    starts, ends = a["character_start_times_seconds"], a["character_end_times_seconds"]
    lines, pos = [], 0
    for _, _, t in LINES:
        i, j = pos, pos + len(t) - 1
        # Split the line into speech pieces wherever the silence between two
        # words is longer than MAX_PAUSE, and keep only MAX_PAUSE of it.
        pieces, a = [], starts[i]
        for c in range(i, j):
            if t[c - i] == " ":
                gap_start, gap_end = ends[c - 1], starts[c + 1]
                if gap_end - gap_start > MAX_PAUSE:
                    pieces.append((a, gap_start + MAX_PAUSE / 2))
                    a = gap_end - MAX_PAUSE / 2
        pieces.append((a, ends[j] + 0.12))  # keep the natural tail
        lines.append(pieces)
        pos = j + 1 + len(sep)
    return wav, lines


def plan(lines):
    """Place lines on cues. Returns (placements, cost); placement = (start, tempo, dur)."""
    placed, cost, prev_end = [], 0.0, 0.0
    for (cue, limit, _), pieces in zip(LINES, lines):
        dur = sum(b - a for a, b in pieces)
        start = max(cue, prev_end + MIN_GAP)
        late = start - cue
        tempo = 1.0
        if start + dur > limit:
            tempo = min(MAX_TEMPO, dur / max(0.1, limit - start))
        end = start + dur / tempo
        cost += late * 2 + (tempo - 1) * 40 + max(0, end - limit) * 20 + max(0, late - MAX_LATE) * 20
        placed.append((start, tempo, dur))
        prev_end = end
    return placed, cost


best = None
for n in range(TAKES):
    wav, lines = take(n)
    placed, cost = plan(lines)
    print(f"take {n}: speech {sum(p[2] for p in placed):.2f}s after pause trimming, cost {cost:.2f}")
    if best is None or cost < best[3]:
        best = (wav, lines, placed, cost)

wav, lines, placed, cost = best
inputs, filters, timings = [], [], []
for k, ((cue, limit, text), pieces, (start, tempo, dur)) in enumerate(zip(LINES, lines, placed)):
    seg = f"{tmp}/seg{k}.wav"
    pieces = [(max(0.0, pieces[0][0] - 0.06), pieces[0][1])] + pieces[1:]
    parts = "".join(
        f"[0]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[p{m}];"
        for m, (a, b) in enumerate(pieces)
    )
    total = sum(b - a for a, b in pieces)
    chain = "".join(f"[p{m}]" for m in range(len(pieces)))
    af = f"{parts}{chain}concat=n={len(pieces)}:v=0:a=1,afade=t=out:st={total - 0.08:.3f}:d=0.08"
    if tempo > 1.0:
        af += f",atempo={tempo:.4f}"
    sh("ffmpeg", "-v", "error", "-y", "-i", wav, "-filter_complex", af, seg)
    real = duration(seg)
    at = start - 0.06
    print(f"line {k + 1}: cue {cue:5.2f}s  speech {start:5.2f}s  ends {at + real:5.2f}s (limit {limit})  tempo {tempo:.3f}")
    timings.append({"start": round(start, 2), "end": round(at + real, 2)})
    inputs += ["-i", seg]
    ms = int(round(at * 1000))
    filters.append(f"[{k}]adelay={ms}|{ms}[d{k}]")
mix = "".join(f"[d{k}]" for k in range(len(LINES)))
filters.append(f"{mix}amix=inputs={len(LINES)}:normalize=0,apad=whole_dur={TOTAL},atrim=0:{TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[out]")
os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
out = f"{ROOT}/public/audio/vo.mp3"
sh("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]",
   "-ar", "44100", "-ac", "2", "-b:a", "192k", out)
json.dump(timings, open(f"{ROOT}/public/audio/vo-timings.json", "w"), indent=1)
print("wrote", out)
