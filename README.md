# Emotion Wheel - Simple Web App

This is a simple web page that inlines your "01-Feeling-Wheel-segmented.svg", finds each segment layer, and provides hover and click interactions plus an info panel.

How it works
- The page is split 50/50 horizontally: left side contains the wheel, right side shows an info panel centered vertically to the wheel.
- The app fetches and inlines `01-Feeling-Wheel-segmented.svg` (so the file must be next to `index.html`).
- It looks for elements with ids (e.g., `fear-1-nervous`, `fear-2-scared`, etc.). It groups segments by the first token of the id (before the first dash) to identify the main emotion, and uses the remainder as sub-feeling labels.
- Hover: subtle scale and shadow to preview a segment.
- Click: selects a segment (only one at a time) and shows the main emotion and list of sub-feelings in the info panel.

Files
- index.html — main page
- styles.css — styling and transitions
- script.js — loads SVG, wires up interactions
- 01-Feeling-Wheel-segmented.svg — (not included here) expected to be in the same directory

Notes / Troubleshooting
- If the script doesn't detect any segments, ensure that each of the 32 segment layers in the SVG has an `id` attribute. The parsing expects ids in a form similar to `fear-1-nervous` but also works with a few other common layer id conventions; check the console for diagnostics.
- For a smoother dev workflow, you can inline the SVG directly inside `index.html` (replace the fetch+insert logic), or serve this directory with a static server (e.g., `npx serve`).

Next steps I can help with
- Push these files to the repository on the new branch and open a PR.
- Improve the UI styling, add animations, or show the sub-feelings visually around the wheel.
- Add deep linking so clicking a segment updates the URL hash for shareable state.
