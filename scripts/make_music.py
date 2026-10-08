"""Cut the background track to the 38 s video. Writes public/audio/music.mp3.

Source: "Positive Optimistic Background Music" by LNPlusMusic (Pixabay #286238),
150 BPM, so 1 bar = 1.6 s and a 4-bar phrase = 6.4 s.

- The video starts inside the track's soft section, so the full band comes in
  (track 83.595 s, a downbeat) exactly on the green chat bubble at 15.5 s.
- One 4-bar phrase (track 94.795-101.195 s) is removed. That join had the
  closest match of any bar-aligned cut, and it lands at 26.7 s, on the cut to
  the doorstep scene.
- The track's own final downbeat (109.195 s) then lands at 34.7 s, on
  "BuyTech" and the logo tile springing up, and its natural ring-out carries
  the tagline to the end.
"""
import os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/assets/music/lnplusmusic-positive-optimistic-286238.mp3"
OUT = f"{ROOT}/public/audio/music.mp3"

LIFT, LIFT_AT = 83.595, 15.5   # track downbeat -> video time
CUT_A, CUT_B = 94.795, 101.195  # removed phrase
TOTAL = 38.0
XF = 0.04                       # crossfade at the join

start = LIFT - LIFT_AT
part1_end = CUT_A + XF / 2
part2_start = CUT_B - XF / 2
part2_len = TOTAL - (part1_end - start) + XF + 0.2

graph = (
    f"[0]atrim={start:.3f}:{part1_end:.3f},asetpts=PTS-STARTPTS[a];"
    f"[0]atrim={part2_start:.3f}:{part2_start + part2_len:.3f},asetpts=PTS-STARTPTS[b];"
    f"[a][b]acrossfade=d={XF}:c1=tri:c2=tri,"
    f"atrim=0:{TOTAL},afade=t=in:d=0.8,afade=t=out:st={TOTAL - 0.6}:d=0.6,"
    "loudnorm=I=-18:TP=-1.5:LRA=11[out]"
)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", graph, "-map", "[out]",
                "-ar", "44100", "-ac", "2", "-b:a", "192k", OUT], check=True)
print("wrote", OUT)
