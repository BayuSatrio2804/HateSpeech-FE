# HateSpeech-FE

Frontend for the Indonesian Hate Speech Detector — a single-page React + Vite app that calls the FastAPI backend (`HateSpeech-BE/`) to classify Indonesian text as toxic or non-toxic.

Built with React 19, Vite 7, TypeScript, Tailwind v4, and shadcn/ui (`base-lyra` / `mist`).

## Features

- **Detector** — paste Indonesian text, get a toxic / non-toxic verdict with per-class probability bars and the model threshold.
- **History** — last 50 predictions kept locally in `localStorage` (`hatespeech.history`); click a row to reload it into the detector; clear-all has an undo toast.
- **Model Info** — fields from `/model-info` plus the latest `/health` result, with a refresh button.
- **i18n** — English / Bahasa Indonesia toggle, persisted via `localStorage` (`i18nextLng`).
- **Theme** — light / dark / system from the existing `ThemeProvider`; toggle in the header or press `d`.
- **Status dot** — green / red indicator in the header bound to `/health`.

## Tech Stack

- React 19 + Vite 7 + TypeScript (strict)
- Tailwind v4 + shadcn/ui (`base-lyra` style, `mist` base color, `base-ui` primitives)
- `react-i18next` + `i18next-browser-languagedetector`
- `sonner` for toasts
- `lucide-react` for icons

## Project Layout

```
src/
  components/
    AppShell.tsx              # header + sidebar + content slot
    StatusDot.tsx             # /health indicator
    LanguageSwitcher.tsx      # EN / ID dropdown
    ThemeToggle.tsx           # sun / moon button
    theme-provider.tsx        # existing scaffold (do not rewrite)
    ui/                       # shadcn primitives (auto-generated)
  features/
    detector/
      DetectorPanel.tsx       # textarea + analyze + result
      ResultCard.tsx          # verdict badge + progress bars
      SampleChips.tsx         # curated Indonesian examples
    history/
      HistoryPanel.tsx
      useHistory.ts           # localStorage-backed hook
    model-info/
      ModelInfoPanel.tsx
  i18n/
    index.ts                  # i18next.init(...)
    en.json
    id.json
  lib/
    api.ts                    # predict(), getHealth(), getModelInfo(), ApiError
    types.ts                  # mirrors of backend schemas
    utils.ts                  # cn() helper
  App.tsx                     # ThemeProvider > TooltipProvider > AppShell + Toaster
  main.tsx                    # imports ./i18n
```

## API Contract

The frontend talks to three backend endpoints:

```ts
// GET /health
type Health = { status: string; model_loaded: boolean }

// GET /model-info
type ModelInfo = {
  model_key: string
  model_name: string
  labels: string[]                  // ["non_toxic", "toxic"]
  threshold: number                 // e.g. 0.49
  max_length: number                // e.g. 128
}

// POST /predict
type PredictRequest = { text: string }   // 1..5000 chars, server trims
type PredictResponse = {
  label: "non_toxic" | "toxic"
  is_toxic: boolean
  scores: { non_toxic: number; toxic: number }
  threshold: number
}
```

All errors raised by `lib/api.ts` are `ApiError` instances (status `0` = network failure, `422` = validation, `503` = model unavailable). Errors surface as `sonner` toasts and inline messages on the detector.

## Getting Started

Requires Node 20 (see `.nvmrc`).

```bash
# 1. Install deps
npm install

# 2. Configure the backend URL
cp .env.example .env
# edit .env if your backend isn't on http://localhost:8000

# 3. Start the backend (in another terminal)
cd ../HateSpeech-BE
uvicorn app.main:app --reload

# 4. Start the dev server
npm run dev
# open http://localhost:5173
```

## Scripts

| Command              | Purpose                                |
| -------------------- | -------------------------------------- |
| `npm run dev`        | Start the Vite dev server              |
| `npm run build`      | Type-check and produce `dist/`         |
| `npm run preview`    | Serve the production build locally     |
| `npm run typecheck`  | `tsc --noEmit`                         |
| `npm run lint`       | Run ESLint                             |
| `npm run format`     | Run Prettier on `**/*.{ts,tsx}`        |

## Environment Variables

| Variable              | Default                  | Notes                          |
| --------------------- | ------------------------ | ------------------------------ |
| `VITE_API_BASE_URL`   | `http://localhost:8000`  | Base URL of the FastAPI backend |

## Adding shadcn Components

```bash
npx shadcn@latest add <component>
```

Components are written to `src/components/ui/`. Note that the auto-generated `sonner.tsx` ships with a `next-themes` import; we replace it with our own `useTheme` from `@/components/theme-provider`.

## Deployment (Cloudflare Pages)

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** read from `.nvmrc` (currently `20`)
- **Environment variables (Preview + Production):** set `VITE_API_BASE_URL` to your deployed backend URL
- **Caching:** `public/_headers` pins immutable caching for `/assets/*` and forces revalidation everywhere else
- No `_redirects` needed — there is no client-side router

## Conventions

- No router, no global store, no data-fetching library — the surface is small (3 endpoints, 1 form). State lives in `AppShell`, panel components, and the `useHistory` hook.
- The path alias `@/` resolves to `src/` (set in `vite.config.ts` and `tsconfig.json`).
- ESLint softens `react-hooks/set-state-in-effect` and exempts the shadcn scaffold (`components/ui/**`, `hooks/**`) from `react-refresh/only-export-components` — keep app code under those rules.
- Sample chip texts intentionally stay in Indonesian under both locales (the model is Indonesian-only); only labels around them translate.

## Out of Scope

- Authentication, accounts, or server-side history
- Batch / CSV uploads
- Multi-page routing
- Test suite (Vitest / RTL) — deferred
