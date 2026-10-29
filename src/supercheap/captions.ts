import voTimings from '../../public/supercheap/audio/vo-timings.json';
import captionLines from '../../public/supercheap/captions.json';

/**
 * Voiceover lines split into caption phrases (public/supercheap/captions.json, also read by
 * scripts/supercheap_srt.py). One stressed word per phrase is
 * marked *like this* and shows in red-400. Phrase times are spread across the
 * measured line (public/supercheap/audio/vo-timings.json) by length.
 * `onScreen: false` lines are already spelled out as a TitleCard / EndCard, so
 * the burned-in caption is hidden for them (it still goes in the .srt).
 */
const LINES: {phrases: string[]; onScreen?: boolean}[] = captionLines;

export type Caption = {start: number; end: number; text: string; onScreen: boolean};

export const CAPTIONS: Caption[] = LINES.flatMap((line, i) => {
  const {start, end} = voTimings[i];
  const lengths = line.phrases.map((p) => p.replace(/\*/g, '').length);
  const total = lengths.reduce((a, b) => a + b, 0);
  let t = start;
  return line.phrases.map((text, k) => {
    const d = ((end - start) * lengths[k]) / total;
    const c = {start: t, end: t + d, text, onScreen: line.onScreen !== false};
    t += d;
    return c;
  });
});

/** Start time (s) of the phrase containing `word` in VO line `line` (0-based). */
export const phraseAt = (line: number, word: string) => {
  const c = CAPTIONS.filter((x) => x.start >= voTimings[line].start - 0.01 && x.end <= voTimings[line].end + 0.01).find((x) =>
    x.text.replace(/\*/g, '').toLowerCase().includes(word.toLowerCase()),
  );
  if (!c) throw new Error(`no phrase with "${word}" in line ${line}`);
  return c.start;
};

export {voTimings};
