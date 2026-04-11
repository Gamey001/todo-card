# Todo Card

A responsive, accessible Todo Item Card built with React + Vite. Submitted for the Frontend Wizards Stage 0 challenge.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher (v20 recommended)
- npm v9+

> If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use 20` before any npm commands.

## Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/gamalieldashuaDataFi/todo-card.git
cd todo-card

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Production build (output → `dist/`) |
| `npm run preview` | Serve the production build locally |

## Project Structure

```
todo-card/
├── index.html          # Vite HTML entry point
├── vite.config.js      # Vite + React plugin config
├── package.json
└── src/
    ├── main.jsx        # React root mount
    ├── App.jsx         # App wrapper
    ├── index.css       # Global reset & body styles
    ├── TodoCard.jsx    # Main card component
    └── TodoCard.css    # Component styles
```

## Key Implementation Details

- **Time remaining** — calculated from a fixed due date (`2026-04-16T18:00:00Z`) and refreshed every 60 seconds via `setInterval`.
- **Checkbox toggle** — marks the card done, strikes through the title, and flips the status badge to "Done".
- **All `data-testid` attributes** are in place for automated testing (see the spec in `TodoCard.jsx`).
- **Accessibility** — real `<input type="checkbox">`, `aria-live="polite"` on the time-remaining field, visible focus rings, and WCAG AA contrast throughout.

## Deployment

The `dist/` folder produced by `npm run build` is a static site — drop it on any static host:

- **Vercel** — import the repo, set build command `npm run build`, output dir `dist`.
- **Netlify** — same settings, or drag-and-drop the `dist/` folder.
- **GitHub Pages** — use the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package or a GitHub Actions workflow targeting the `dist/` folder.
