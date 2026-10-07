"""Generate the voiceover with ElevenLabs, one line per request, and lay each
line at its start time from the script. Writes public/audio/vo.mp3.

The API key is injected by the environment's network secret for
api.elevenlabs.io (header xi-api-key), so none is needed here.
Usage: python3 scripts/make_vo.py [voice_id]
"""
import json, os, subprocess, sys, tempfile

VOICE = sys.argv[1] if len(sys.argv) > 1 else "TX3LPaxmHKxFdv7VOQHJ"  # Liam
MODEL = "eleven_multilingual_v2"
TOTAL = 38.0
# (start, latest end, text) - latest end leaves a small gap before the next line
LINES = [
    (0.4, 4.65, "Omar has had the same camera sitting in his cart for eight months."),
    (4.8, 9.15, "Every payday he opens it. Looks at the price. Closes the tab."),
    (9.3, 15.65, "Meanwhile, life keeps happening. Sunrise at Jebel Jais. His daughter's first run on Kite Beach. All on a phone doing its best."),
    (15.8, 20.65, "Then a friend sends him a link. Same camera. A price that finally makes sense."),
    (20.8, 27.15, "Brand new, sealed. Free delivery, next day. And he pays when it reaches him."),
    (27.3, 30.9, "This time, the photo looks the way the moment felt."),
    (34.6, 37.7, "BuyTech. Great shots, minus the big price tag."),
]

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tmp = tempfile.mkdtemp()


def sh(*cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def duration(path):
    return float(sh("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path))


def tts(i, text, speed, prev_text, next_text):
    raw = f"{tmp}/line{i}_raw.mp3"
    body = {
        "text": text,
        "model_id": MODEL,
        "previous_text": prev_text,
        "next_text": next_text,
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.45, "use_speaker_boost": True, "speed": speed},
    }
    code = sh(
        "curl", "-sS", "-m", "90", "-o", raw, "-w", "%{http_code}", "-X", "POST",
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        "-H", "Content-Type: application/json", "-d", json.dumps(body),
    )
    if code != "200":
        sys.exit(f"line {i}: HTTP {code}: {open(raw, errors='ignore').read()[:300]}")
    # Trim silence at both ends so the line starts exactly on its cue.
    trimmed = f"{tmp}/line{i}.wav"
    trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
    sh("ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
       f"{trim},areverse,{trim},areverse", "-ar", "44100", "-ac", "1", trimmed)
    return trimmed


placed = []
for i, (start, end, text) in enumerate(LINES):
    slot = end - start
    prev_text = LINES[i - 1][2] if i else ""
    next_text = LINES[i + 1][2] if i + 1 < len(LINES) else ""
    speed = 1.0
    while True:
        wav = tts(i, text, speed, prev_text, next_text)
        d = duration(wav)
        if d <= slot or speed >= 1.15:
            break
        speed = min(1.15, round(speed * d / slot + 0.02, 2))
    if d > slot:  # last resort: gentle time-stretch, pitch preserved
        fitted = f"{tmp}/line{i}_fit.wav"
        sh("ffmpeg", "-v", "error", "-y", "-i", wav, "-af", f"atempo={d / slot:.4f}", fitted)
        wav, d = fitted, duration(fitted)
    print(f"line {i + 1}: {start:5.2f}s  {d:4.2f}s of {slot:4.2f}s  speed {speed}")
    placed.append((start, wav))

inputs, filters = [], []
for k, (start, wav) in enumerate(placed):
    inputs += ["-i", wav]
    ms = int(round(start * 1000))
    filters.append(f"[{k}]adelay={ms}|{ms}[d{k}]")
mix = "".join(f"[d{k}]" for k in range(len(placed)))
filters.append(f"{mix}amix=inputs={len(placed)}:normalize=0,apad=whole_dur={TOTAL},atrim=0:{TOTAL},loudnorm=I=-16:TP=-1.5:LRA=11[out]")
os.makedirs(f"{ROOT}/public/audio", exist_ok=True)
out = f"{ROOT}/public/audio/vo.mp3"
sh("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]",
   "-ar", "44100", "-ac", "2", "-b:a", "192k", out)
print("wrote", out, f"{duration(out):.2f}s")
