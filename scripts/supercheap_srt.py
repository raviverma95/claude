"""Write the .srt for YouTube from the same caption phrases and timings the video burns in.

Reads public/supercheap/captions.json and public/supercheap/audio/vo-timings.json
(phrase times are spread across each measured line by length, exactly as in
src/supercheap/captions.ts). Every line goes in, including the ones the video
shows as a title card instead of a caption.
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lines = json.load(open(f"{ROOT}/public/supercheap/captions.json"))
timings = json.load(open(f"{ROOT}/public/supercheap/audio/vo-timings.json"))
out = sys.argv[1] if len(sys.argv) > 1 else f"{ROOT}/renders/supercheap/supercheap-who-do-you-trust.srt"


def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


cues = []
for line, tm in zip(lines, timings):
    lengths = [len(p.replace("*", "")) for p in line["phrases"]]
    total = sum(lengths)
    t = tm["start"]
    for p, n in zip(line["phrases"], lengths):
        d = (tm["end"] - tm["start"]) * n / total
        cues.append((t, t + d, p.replace("*", "")))
        t += d

os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, "w") as fh:
    for i, (a, b, text) in enumerate(cues, 1):
        fh.write(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n")
print("wrote", out, len(cues), "cues")
