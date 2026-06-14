# vCard Avatar Generator

> English | [简体中文](README_zh-CN.md)

## Introduction

A browser-based tool to batch-generate avatars for your vCard contacts. Upload a `.vcf` or `.xlsx` file, review and edit contact details, then download an updated `.vcf` file with embedded avatar images. All processing is done locally — no data is uploaded to any server.

## Features

- **Import .vcf / .xlsx** — Supports vCard 2.1/3.0/4.0 files via drag-and-drop or file picker (powered by [ical.js](https://github.com/kewisch/ical.js))
- **XLSX Template** — Download a ready-to-use template for spreadsheet-based contact management
- **Chinese Name Gender Guessing** — Automatically infer gender from given names using a Naive Bayes model trained on ~2,000,000 records (~9,442 characters)
- **Gallery-style Contact Table** — Browse and edit contact names, genders, and phone numbers in a clean table layout with avatar previews
- **vCard 3.0 Export** — Generate standard `.vcf` files with `PHOTO`, `GENDER`, `ORG`, `TEL`, and structured `N`/`FN` properties
- **Privacy-first** — Runs entirely in the browser; no data leaves your device

## Tech Stack

- **Build**: Vite + Svelte 5 + TypeScript
- **Styling**: Tailwind CSS v4 + [daisyUI](https://daisyui.com/) 5
- **Icons**: [Iconify](https://iconify.design/) (`@iconify/svelte` + `line-md` set)
- **vCard Parsing**: [ical.js](https://github.com/kewisch/ical.js)
- **Code Quality**: ESLint + Prettier + Husky + commitlint + lint-staged

## Getting Started

### Prerequisites

- Node.js >= 18

### Install & Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build          # Production build (base: /)
npm run build:demo     # Demo build (base: /vcard-avatar-generator/, requires .env.demo)
```

## Usage

1. **Upload** — Drag & drop a `.vcf` or `.xlsx` file onto the upload page, or click to browse
2. **Review** — Parsed contacts are displayed in a table where you can edit names and genders
3. **Export** — Click the download button to get an updated `.vcf` file with embedded avatars

> For spreadsheet users, download the [XLSX template](/template/vcard-template.xlsx) from the upload page, fill in your contacts, then import it directly.

## Project Structure

```
src/
├── main.ts                     # Entry point
├── App.svelte                  # Root component with page routing
├── app.css                     # Global styles
├── types.ts                    # Contact / Tel / Gender type definitions
├── config/
│   └── ads.ts                  # Ad slot configuration (images, links)
├── components/
│   ├── Header.svelte           # Top bar with title & GitHub link
│   ├── Footer.svelte           # Bottom bar with copyright
│   └── FileUploader.svelte     # File upload component (drag/select/parse)
├── pages/
│   ├── Upload.svelte           # Upload page (three-column layout + ad slots)
│   └── Editor.svelte           # Contact editor (sortable table, sticky column)
└── utils/
    ├── contact-reader.ts       # Unified file reader (.vcf / .xlsx)
    ├── contact-writer.ts       # vCard 3.0 serialiser with base64 photo
    ├── chinese-gender-guesser.ts   # Naive Bayes gender predictor
    ├── chinese-gender-data.ts      # Frequency data for ~9,442 characters
    └── reader/
        ├── reader-vcard.ts     # ical.js-based vCard parser
        └── reader-xlsx.ts      # XLSX parser
```

## Configuration

- The application runs entirely client-side — no server configuration needed
- Supported file types: `.vcf`, `.xlsx`
- Gender guessing can be overridden per contact in the editor
- Exported vCards follow the vCard 3.0 standard with base64-encoded PNG avatars

## Dev Commands

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start dev server         |
| `npm run build`      | Build for production     |
| `npm run build:demo` | Demo build (custom base) |
| `npm run preview`    | Preview production build |
| `npm run lint`       | ESLint check             |
| `npm run lint:fix`   | ESLint check & auto-fix  |
| `npm run format`     | Prettier format check    |
| `npm run format:fix` | Prettier format & write  |
| `npm run check`      | Svelte/TS type check     |

## License

MIT
