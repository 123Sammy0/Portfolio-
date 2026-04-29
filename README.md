# MD SAKIB — Dark Sci‑Fi Cinematic Portfolio

Deploy-ready static portfolio with:
- dark sci-fi visual system
- interactive Three.js character stage
- auto background removal for character sheet assets
- mouse/touch reactive motion + cinematic UI

## Local run
```bash
python -m http.server 4173
```
Open `http://localhost:4173`.

## Character sheet setup
1. Put your sheet image at: `assets/character/explorer-sheet.png`
2. The app automatically removes white background pixels in runtime and renders the character on stage.

## Deployment
No build step required.

### Vercel
- Framework: `Other`
- Build command: *(empty)*
- Output directory: `.`

### Netlify
- Build command: *(empty)*
- Publish directory: `.`
