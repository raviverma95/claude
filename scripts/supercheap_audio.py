"""Build the Supercheap soundtrack (everything except the voiceover).

Writes public/supercheap/audio/music.mp3 and public/supercheap/audio/snap.wav.

- 0-12.2 s: a minimal tense bed (clock tick + muted low pulse), synthesised
  here. It ticks faster through scene 3 ("ticking builds") and cuts to silence
  for scene 4 ("Moving interstate is stressful enough").
- 15.0 s: the upbeat track kicks in on the logo snap. Source: "Positive
  Optimistic Background Music" by LNPlusMusic (Pixabay #286238, 150 BPM).
  Track 45.195-57.995 s (8 bars, opening on its lift) is followed by
  83.595 s to the end (its final full section), joined at a phrase boundary,
  so its final downbeat lands at 53.4 s on the end card.
- snap.wav: a short synthesised finger snap, the brand sound, placed by the
  video on the logo sting, the price reveal, the 60+ stat and the end card.
"""
import os, subprocess
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f"{ROOT}/assets/music/lnplusmusic-positive-optimistic-286238.mp3"
OUT = f"{ROOT}/public/supercheap/audio"
SR = 44100
TOTAL = 55.0
MUSIC_AT = 15.0
rng = np.random.default_rng(7)


def bandpass_noise(n, lo, hi):
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    spec[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(spec, n)


def tick(pitch):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    body = bandpass_noise(n, pitch * 0.7, pitch * 1.6) * np.exp(-t / 0.006)
    tone = np.sin(2 * np.pi * pitch * t) * np.exp(-t / 0.01) * 0.5
    s = body / (np.abs(body).max() + 1e-9) + tone
    return s / np.abs(s).max()


def pulse():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    def thump(t0, amp):
        tt = np.clip(t - t0, 0, None)
        env = (tt > 0) * (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.09)
        return amp * env * (np.sin(2 * np.pi * 52 * tt) + 0.4 * np.sin(2 * np.pi * 104 * tt))
    s = thump(0, 1.0) + thump(0.16, 0.6)  # lub-dub
    return s / np.abs(s).max()


def snap():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    crack = bandpass_noise(n, 1800, 9000) * np.exp(-t / 0.012)
    click = np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.008)
    body = np.sin(2 * np.pi * 900 * t) * np.exp(-t / 0.02) * 0.3
    s = crack / np.abs(crack).max() + 0.6 * click + body
    s[: int(0.0008 * SR)] *= np.linspace(0, 1, int(0.0008 * SR))
    return s / np.abs(s).max()


def place(buf, clip, at, gain):
    i = int(at * SR)
    j = min(len(buf), i + len(clip))
    buf[i:j] += clip[: j - i] * gain


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-", path],
                   input=pcm, check=True)


# Tense bed
bed = np.zeros(int(TOTAL * SR))
t, k = 0.0, 0
while t < 12.2:
    interval = 0.5 if t < 5.2 else (0.375 if t < 8.6 else 0.25)  # ticking builds through scene 3
    level = 0.22 + 0.18 * min(1, t / 12)
    place(bed, tick(3200 if k % 2 == 0 else 2400), t, level)
    t += interval
    k += 1
for b in np.arange(0.0, 12.0, 1.0):
    place(bed, pulse(), b, 0.35 + 0.25 * b / 12)
bed[int(12.2 * SR):] = 0
os.makedirs(OUT, exist_ok=True)
write_wav(f"{OUT}/snap.wav", snap() * 0.9)

# Upbeat track from the logo snap
graph = (
    "[0]atrim=45.175:58.015,asetpts=PTS-STARTPTS[a];"
    "[0]atrim=83.575:114,asetpts=PTS-STARTPTS[b];"
    "[a][b]acrossfade=d=0.04:c1=tri:c2=tri,"
    f"atrim=0:{TOTAL - MUSIC_AT + 0.02},equalizer=f=2500:t=q:w=1.2:g=-4,equalizer=f=1200:t=q:w=1.5:g=-2,"
    f"afade=t=out:st={TOTAL - MUSIC_AT - 0.5}:d=0.5,loudnorm=I=-18:TP=-1.5:LRA=11,aresample={SR}[out]"
)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-filter_complex", graph, "-map", "[out]",
                      "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
music = np.frombuffer(raw, dtype=np.float32)
mix = bed.copy()
place(mix, music, MUSIC_AT - 0.02, 1.0)  # the track's first downbeat sits 20 ms in
write_wav(f"{OUT}/music.wav", mix)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{OUT}/music.wav", "-ac", "2", "-b:a", "192k", f"{OUT}/music.mp3"], check=True)
for f in ("music.wav",):
    os.remove(f"{OUT}/{f}")
print("wrote", f"{OUT}/music.mp3", "and", f"{OUT}/snap.wav")
