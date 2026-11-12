# Venus · How Hub-Funded Spoke Markets Work (31s explainer)

- `site/index.html` — the animated scene (three.js + HTML). Open with any static server
  (`python3 -m http.server` inside `site/`) and add `?play` to watch it live.
  `window.renderAt(seconds)` draws one exact frame; timings, copy and colours are at the top of the script.
- `vo.py` — voiceover lines (Kokoro TTS, voice `af_heart`). `line1..6.wav` are the takes used.
- `frames.py` — renders frames with Playwright: `python3 frames.py frames --all 30 0 936`.
- `audio.py` — places the voiceover on the timeline and adds a quiet placeholder pad (`mix.wav`).
- Encode: `ffmpeg -framerate 30 -i frames/f%05d.png -i mix.wav -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest out.mp4`

To swap in a human or ElevenLabs voice, replace the `lineN.wav` files (keep each line within its
scene window) and re-run `audio.py` + the encode step; the picture does not change.
