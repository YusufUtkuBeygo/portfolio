# Portfolio

Retro handheld-console themed portfolio. Drag a cartridge into the console to open a project.

## Run locally

```bash
npm install
npm run dev
```

## Structure

| Path | What |
|---|---|
| `src/data/` | Profile info and the project list (edit these to update the site) |
| `src/sections/` | One file per page section: hero, console, projects, contact |
| `src/styles/` | CSS |
| `src/assets/` | Images and sounds used by the code |
| `public/` | Files copied as-is (favicon) |
| `.github/workflows/deploy.yml` | Publishes to GitHub Pages on push to `main` |

Built with Vite and anime.js.
