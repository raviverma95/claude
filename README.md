# BuyTech brand intro: "Eight Months in the Cart"

38 s, 1140 frames at 30 fps, 1920 x 1080. Built in Remotion from the script and motion brief.

- `renders/buytech-intro.mp4`: master render (H.264, CRF 16)
- `renders/buytech-intro-captioned-preview.mp4`: same cut with the voiceover script as subtitles, for review while there is no VO
- `renders/stills/`: one still from the midpoint of each scene

## Render

```bash
npm install
npx remotion render BrandIntro out/buytech-intro.mp4 --codec h264 --crf 16
npx remotion studio            # live preview
```

## Adding the voiceover and music

Drop the files in and re-render. Nothing else needs changing:

- `public/audio/vo.mp3`: one file, timed so each line starts at the times in `VO_LINES` (`src/BrandIntro.tsx`)
- `public/audio/music.mp3`: plays at 70% and ducks to 25% under each VO line, then fades out at 36.7 s

The composition detects both files when it renders.

## Where things live

- `src/scenes/Scene1.tsx` … `Scene7.tsx`: one component per scene, using the brief's absolute frame numbers
- `src/data.ts`: product name and price (from the live product page) and the screenshot coordinates used for the price ring, card highlights and button pulse
- `src/theme.ts`: brand tokens and motion defaults
- `public/screens/`: website screenshots supplied by the client
- `public/fonts/`: Poppins 700/800 and Inter 500 from Google Fonts, stored locally so renders work offline
