# Nest Tutorial

A learning API built with NestJS. The repository grows one pull request at a time,
each adding a distinct area of the framework.

**Pull 1** — project setup, a hello world endpoint, i18n, and Swagger docs.

## Requirements

| | Version |
|---|---|
| Node.js | >= 24 (developed on 24.12) |
| npm | >= 11 |

The project runs as **ESM** (`"type": "module"`) with `moduleResolution: nodenext`.
Two consequences worth remembering while writing code: every internal import needs
a `.js` extension even though the file is `.ts`, and `__dirname` does not exist —
use `import.meta.dirname`.

## Getting started

```bash
npm install
cp .env.example .env
npm run start:dev
```

Open http://localhost:3000/api/docs for the Swagger UI.

## Environment variables

Declared in `.env` (template in `.env.example`). Every variable is validated at
startup by `src/config/env.validation.ts` — a missing or mistyped value stops the
app immediately rather than letting it run half-configured.

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `3000` | HTTP port |
| `APP_NAME` | `Nest Tutorial` | Title shown in Swagger |
| `DEFAULT_LANGUAGE` | `en` | Fallback language |

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Run in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run the compiled build (run `build` first) |
| `npm run lint` | sunlint (Sun\* standards) + ESLint |
| `npm run lint:security` | sunlint security rules only |
| `npm test` | Unit tests (Vitest) |
| `npm run test:cov` | Tests with coverage report |
| `npm run test:e2e` | End-to-end tests |
| `npm run format` | Format with Prettier |

## API

Every endpoint lives under the `/api` prefix.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/hello` | Greeting in the requested language |
| `GET` | `/api/docs` | Swagger UI |
| `GET` | `/api/docs-json` | OpenAPI schema as JSON |

```bash
curl "localhost:3000/api/hello?name=Dung"           # {"message":"Hello, Dung!"}
curl "localhost:3000/api/hello?name=Dung&lang=vi"   # {"message":"Xin chào, Dung!"}
curl "localhost:3000/api/hello"                     # 400 — name is required
```

## Internationalisation

The language is resolved in priority order, stopping at the first match:

1. Query parameter — `?lang=vi`
2. Header — `x-lang: vi`
3. `Accept-Language` header
4. Fall back to `en`

This applies to successful responses and validation error messages alike.
Translations live in `src/i18n/{en,vi}/`.

> When adding a language, remember the JSON files are copied into `dist/` through
> the `assets` entry in `nest-cli.json`. Without it, development works fine while
> production returns raw translation keys.

## Project structure

```
src/
├── config/
│   ├── app.config.ts          # Config under the 'app' namespace
│   └── env.validation.ts      # Environment validation at boot
├── i18n/
│   ├── en/{common,validation}.json
│   └── vi/{common,validation}.json
├── modules/
│   └── hello/
│       ├── dto/hello-query.dto.ts
│       ├── hello.controller.ts
│       └── hello.module.ts
├── app.module.ts              # Wires ConfigModule, I18nModule and feature modules
└── main.ts                    # Prefix, validation pipe, exception filter, Swagger
```

## Code quality

`npm run lint` runs two tools that work at different levels:

- **sunlint** — the Sun\* rule set (66 rules) covering code quality and security
- **ESLint** — syntactic rules, most importantly `no-floating-promises`, which
  catches promises that were never awaited

They do not overlap: sunlint inspects *what the code does*, ESLint inspects *how
it is written*.
