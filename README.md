# vCard Avatar Generator

> English | [简体中文](README_zh-CN.md)

## 📌 Introduction

> TODO: Add project introduction

A tool to batch generate random avatars with specified styles for your vCard contacts.

## ✨ Features

> TODO: Add detailed feature descriptions

- **Batch Processing** — Import a vCard file and generate avatars for all contacts at once
- **Customizable Styles** — Choose from multiple avatar styles (geometric, cartoon, gradient, etc.)
- **Stable Output** — Seed-based generation ensures the same contact always gets the same avatar
- **Lightweight & Fast** — Runs entirely in the browser, no external API required

## 📦 Tech Stack

- Vite + Svelte 5 + TypeScript
- Tailwind CSS v4
- Avatar generation powered by Canvas API

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18

### Install & Run

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

## 📖 Usage

> TODO: Add detailed usage guide

- **Input**: Standard `.vcf` file
- **Workflow**: Import → Choose style → Generate → Export
- **Output**: vCard file or Zip package with embedded avatar images

## 🏗️ Project Structure

> TODO: Fill in actual project structure

```
src/
├── main.ts          # Entry point
├── App.svelte       # Main app component
├── app.css          # Global styles
├── lib/             # Core logic
│   ├── parser/      # vCard parsing
│   ├── generator/   # Avatar generator
│   └── export/      # Export handling
├── components/      # UI components
└── types/           # Type definitions
```

## ⚙️ Configuration

> TODO: Add configuration options

- Customizable avatar style list
- Output image size and format settings
- Seed generation rules

## 🧪 Dev Commands

| Command              | Description             |
| -------------------- | ----------------------- |
| `npm run dev`        | Start dev server        |
| `npm run build`      | Build for production    |
| `npm run lint`       | ESLint check            |
| `npm run lint:fix`   | ESLint check & auto-fix |
| `npm run format`     | Prettier format check   |
| `npm run format:fix` | Prettier format & write |
| `npm run check`      | Svelte/TS type check    |

## 📄 License

MIT
