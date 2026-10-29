"""Generate a voiceover with ElevenLabs and place each line on its cue.

Usage: python3 scripts/make_vo.py scripts/vo/<video>.json [takes]

The whole script is read in ONE request so pacing and intonation flow
naturally. Character timestamps from the API are used to cut the take at
the pauses between lines; each line is then placed on its cue. If a line
would collide with the next one, the next one starts a little later rather
than anything being squeezed (at most a small tempo nudge as a last resort).
Long silences inside a line are shortened to a natural breath; the words
themselves are never cut. Several takes are generated and the one that
needs the least adjustment wins.

Config keys: voice, model, total (s), speed, max_pause, min_gap, max_late,
max_tempo, stability, style, out, timings, lines: [[cue, must end by, text], ...]

The API key is injected by the environment's network secret for
api.elevenlabs.io (header xi-api-key), so none is needed here.
"""
import base64, json, os, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = json.load(open(sys.argv[1]))
TAKES = int(sys.argv[2]) if len(sys.argv) > 2 else 3
LINES = [tuple(l) for l in CFG["lines"]]
tmp = tempfile.mkdtemp()


def sh(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def duration(path):
    return float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path))


def take(n):
    """One full read. Returns (wav path, [[(start, end)] speech pieces per line])."""
    sep = "\n\n"
    text = sep.join(t for _, _, t in LINES)
    body = {
        "text": text,
        "model_id": CFG["model"],
        "seed": 1000 + n,
        "voice_settings": {"stability": CFG["stability"], "similarity_boost": 0.8, "style": CFG["style"],
                           "use_speaker_boost": True, "speed": CFG["speed"]},
    }
    out = f"{tmp}/take{n}.json"
    code = sh("curl", "-sS", "-m", "180", "-o", out, "-w", "%{http_code}", "-X", "POST",
              f"https://api.elevenlabs.io/v1/text-to-speech/{CFG['voice']}/with-timestamps?output_format=mp3_44100_128",
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
        # words is longer than max_pause, and keep only max_pause of it.
        pieces, a0 = [], starts[i]
        for c in range(i, j):
            if t[c - i] == " ":
                gap_start, gap_end = ends[c - 1], starts[c + 1]
                if gap_end - gap_start > CFG["max_pause"]:
                    pieces.append((a0, gap_start + CFG["max_pause"] / 2))
                    a0 = gap_end - CFG["max_pause"] / 2
        pieces.append((a0, ends[j] + 0.12))  # keep the natural tail
        lines.append(pieces)
        pos = j + 1 + len(sep)
    return wav, lines


def plan(lines):
    """Place lines on cues. Returns (placements, cost); placement = (start, tempo, dur)."""
    placed, cost, prev_end = [], 0.0, 0.0
    for (cue, limit, _), pieces in zip(LINES, lines):
        dur = sum(b - a for a, b in pieces)
        start = max(cue, prev_end + CFG["min_gap"])
        late = start - cue
        tempo = 1.0
        if start + dur > limit:
            tempo = min(CFG["max_tempo"], dur / max(0.1, limit - start))
        end = start + dur / tempo
        cost += late * 2 + (tempo - 1) * 40 + max(0, end - limit) * 20 + max(0, late - CFG["max_late"]) * 20
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
filters.append(f"{mix}amix=inputs={len(LINES)}:normalize=0,apad=whole_dur={CFG['total']},atrim=0:{CFG['total']},loudnorm=I=-16:TP=-1.5:LRA=11[out]")
out = os.path.join(ROOT, CFG["out"])
os.makedirs(os.path.dirname(out), exist_ok=True)
sh("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]",
   "-ar", "44100", "-ac", "2", "-b:a", "192k", out)
json.dump(timings, open(os.path.join(ROOT, CFG["timings"]), "w"), indent=1)
print("wrote", out)
