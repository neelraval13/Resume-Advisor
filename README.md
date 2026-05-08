# Jogen · 助言

Tailored resume advice from Claude.

## What it does

Upload a resume, paste or fetch a job description, and receive honest structured advice from Claude:

- **Fit assessment** — score with narrative
- **Strengths to emphasize** — items already in the resume worth foregrounding
- **Line edits** — verbatim before/after suggestions, copy-pasteable for LaTeX users
- **Structural suggestions** — section reordering recommendations
- **Skill gap recommendations** — projects, courses, reading paths with "this week" concrete starters
- **Honest concerns** — red flags the candidate should know

The advisor philosophy is explicit: never fabricate, line edits over wholesale rewrites, real growth recommendations for genuine gaps.

## Stack

- React 19 + TypeScript 6 + Vite 8 (Rolldown bundler)
- React Compiler for automatic memoization
- Tailwind CSS v4 with editorial design tokens (paper, ink, rust palette)
- shadcn/ui primitives (Button, Badge, Card, Accordion)
- Self-hosted Fraunces and JetBrains Mono via @fontsource-variable
- Backend: FastAPI + Pydantic + Anthropic SDK with SSE streaming ([repo](https://github.com/neelraval13/Resume-Advisor-Backend))

## Setup

```bash
pnpm install
cp .env.example .env  # then edit with real values
pnpm dev
```

Required env vars:

- `VITE_API_URL` — backend URL (e.g. `https://resume-advisor-api.onrender.com`)
- `VITE_API_KEY` — shared secret for backend's `X-API-Key` header

Note that `VITE_*` env vars are baked into the built bundle and visible in the browser — acceptable for an internal tool, not for a public product. If Jogen ever goes public, the architecture changes (per-user auth, backend-issued tokens).

## Architecture

```
src/
├── App.tsx                       state machine entry, status-based view rendering
├── components/
│   ├── ui/                       shadcn primitives (Button, Badge, Card, Accordion)
│   ├── Layout.tsx                page shell with footer
│   ├── ResumeInput.tsx           file upload + parsed-state card
│   ├── JDInput.tsx               URL fetch / paste textarea toggle
│   ├── AnalyzingState.tsx        loading view during stream
│   ├── ErrorView.tsx             parse / stream / input error treatments
│   ├── FitScore.tsx              editorial score card (rust/amber/olive by tone)
│   ├── StrengthCard.tsx          olive left-rule strength callout
│   ├── LineEditCard.tsx          before/after diff with priority Badge + Copy Button
│   ├── StructuralSuggestion.tsx  section reordering row
│   ├── SkillGapCard.tsx          gap + action + 'this week' callout
│   ├── RedFlag.tsx               warning row in rust-deep
│   ├── FullRewrite.tsx           collapsed-by-default Accordion
│   └── ResultsView.tsx           composes all results sections, sorts gaps critical-first
├── lib/
│   ├── api.ts                    typed fetch wrapper + endpoint functions
│   ├── api-types.ts              auto-generated from backend OpenAPI (do not edit)
│   ├── types.ts                  clean re-export layer + hand-typed analyze schemas
│   ├── sse.ts                    SSE wire-format parser using ReadableStream
│   ├── state.ts                  reducer, actions, selectors, exhaustive switch via assertNever
│   ├── config.ts                 typed env var access with fail-fast validation
│   ├── fixtures.ts               sample analysis for component dev
│   └── utils.ts                  cn() helper from shadcn (clsx + tailwind-merge)
├── index.css                     editorial design tokens, shadcn token mapping, base styles
└── main.tsx                      React entry point
```

## Design tokens

Defined in `src/index.css` as a Tailwind v4 `@theme` block. The full editorial palette:

| Token              | Hex        | Use                                           |
|--------------------|------------|-----------------------------------------------|
| `paper`            | `#F1EDE4`  | warm beige page background                    |
| `paper-warm`       | `#FBF8F0`  | slightly warmer surface (cards)               |
| `ink`              | `#17140F`  | near-black text                               |
| `ink-muted`        | `#5C564A`  | secondary text                                |
| `ink-faint`        | `#8A8478`  | tertiary text, captions, mono labels          |
| `rust`             | `#A8421C`  | primary accent                                |
| `rust-deep`        | `#6B2810`  | dark rust for emphasis text                   |
| `rust-pale`        | `#F5E1D8`  | rust tint background (this-week callouts)     |
| `amber-pale`       | `#F5EBD8`  | amber tint background (mixed-fit zone)        |
| `amber-deep`       | `#6B4A10`  | amber emphasis text                           |
| `olive-pale`       | `#E8EBD6`  | sage tint background (strong-fit zone)        |
| `olive-deep`       | `#3D441A`  | olive emphasis text, strength rules           |
| `rule`             | `#D3CCB9`  | hairline rules and borders                    |
| `rule-soft`        | `#EDEBDD`  | soft borders, dividers                        |

Typography: Fraunces serif for body and display, JetBrains Mono for caps labels and metadata. Sharp corners (`--radius: 0`) — editorial aesthetic.

shadcn semantic tokens (`--background`, `--primary`, etc.) are mapped to point at editorial tokens in `src/index.css`, so shadcn primitives inherit the editorial palette without per-usage overrides.

## State machine

The analyze flow is modeled as a state machine in `src/lib/state.ts`. States are mutually exclusive — the UI renders exactly one view per state.

```
idle ──RESUME_PARSED──▶ idle (with resume)
idle ──JD_PROVIDED──▶ idle (with jd)
idle (with both) ──ANALYZE_START──▶ analyzing
analyzing ──ANALYZE_SUCCESS──▶ results
analyzing ──ANALYZE_ERROR──▶ error
analyzing ──ANALYZE_PARSE_ERROR──▶ error (with raw_text)
results | error ──RESET──▶ idle (preserves resume + jd)
any ──CLEAR_RESUME──▶ idle (clears resume only)
any ──CLEAR_JD──▶ idle (clears jd only)
```

Inputs are preserved across error/results transitions so retry doesn't require re-upload. The reducer uses an exhaustive switch with `assertNever` so adding a new action without handling it becomes a compile-time error.

## Regenerating API types

When the backend's OpenAPI surface changes, regenerate the TypeScript types:

```bash
pnpm types:gen
```

This updates `src/lib/api-types.ts`. The analyze endpoint's response schemas are hand-typed in `src/lib/types.ts` because FastAPI's OpenAPI generator doesn't expose schemas behind StreamingResponse. When the backend adds a documentation-only route exposing those schemas, the hand-typed block in `types.ts` can be deleted.

## SSE handling

Browser's built-in `EventSource` doesn't support POST or custom headers, so `src/lib/sse.ts` parses the wire format manually using `fetch` with a `ReadableStream<Uint8Array>` reader. Three layers of parsing — bytes → text events → typed events — yield typed `AnalyzeStreamEvent`s through an async generator. The consuming code uses `for await` with discriminated-union narrowing.

Key implementation detail: `decoder.decode(value, { stream: true })` is required to handle UTF-8 multi-byte characters that may split across chunk boundaries.

## Running tests

The frontend doesn't yet have automated tests; the architecture supports adding Vitest in V2.

For end-to-end verification, run the backend locally and point `VITE_API_URL` at `http://localhost:8000`. The full pipeline (parse → fetch-jd → analyze) can be exercised through the UI in ~25 seconds when the backend is warm.

## Roadmap

V2 candidates, in rough priority order:

1. **Cover letter generation** — same inputs, different prompt, leverages existing analyzer infrastructure
2. **Saved base resume** — paste once, tailor against many JDs without re-uploading
3. **Interview prep output** — given the analysis, generate likely interview questions tied to matched strengths and gaps
4. **Streaming retry** — single corrective retry on malformed JSON
5. **Vitest test suite** — coverage for the SSE parser, state reducer, and component snapshots
6. **OCR for scanned PDFs** — Tesseract.js integration for image-only resumes (backend change)
7. **Per-user auth** — if Jogen goes public, replace shared-secret with JWT or session-based auth

## License

Private. All rights reserved.
