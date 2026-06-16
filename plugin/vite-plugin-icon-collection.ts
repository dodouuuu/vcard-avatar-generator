/**
 * Vite plugin that scans source files for line-md icon usage and generates
 * a real module file that registers only the used icons via addCollection().
 *
 * This eliminates the runtime dependency on Iconify API — all icon data is
 * bundled at build time, and only the icons actually used are included.
 */
import fs from 'node:fs'
import path from 'node:path'

import type { Plugin } from 'vite'

/* ─── Helpers ─────────────────────────────────────── */

/**
 * Write content to file if it differs from existing content.
 * Skips write when content is unchanged to avoid unnecessary rebuilds.
 * @param filePath - Target file path.
 * @param fileContent - Content to write.
 */
function write(filePath: string, fileContent: string): void {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8')
    if (existing === fileContent) {
      return
    }
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, fileContent, 'utf-8')
}

/**
 * Recursively collect all .svelte files under a directory.
 * @param dir - Directory to scan.
 * @returns Absolute file paths.
 */
function collectSvelteFiles(dir: string): string[] {
  const result: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      result.push(...collectSvelteFiles(full))
    } else if (entry.isFile() && full.endsWith('.svelte')) {
      result.push(full)
    }
  }
  return result
}

/**
 * Scan source files for used icon names, then read the line-md collection
 * and return a filtered IconifyJSON with only the used icons.
 * @returns Filtered IconifyJSON object.
 */
function collectIcons() {
  // 1. Scan source files for used icon names
  const used = new Set<string>()
  for (const file of collectSvelteFiles(path.resolve('src'))) {
    const content = fs.readFileSync(file, 'utf-8')
    for (const m of content.matchAll(/["']line-md:([a-zA-Z0-9-]+)["']/g)) {
      used.add(m[1])
    }
  }

  // 2. Read full line-md collection and keep only used icons
  const jsonPath = path.resolve('node_modules/@iconify-json/line-md/icons.json')
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const fullIcons = raw.icons as Record<string, { body: string }>

  const icons: Record<string, { body: string }> = {}
  for (const name of used) {
    if (fullIcons[name]) {
      icons[name] = fullIcons[name]
    } else {
      console.warn(`[icon-collection] Icon "line-md:${name}" not found`)
    }
  }

  return {
    prefix: raw.prefix ?? 'line-md',
    icons,
    width: raw.width ?? 24,
    height: raw.height ?? 24,
  }
}

/* ─── Plugin ──────────────────────────────────────── */

/**
 * Vite plugin that bundles only used line-md icons at build time.
 * @returns Vite plugin instance.
 */
export function iconCollectionPlugin(): Plugin {
  return {
    name: 'vite-plugin-icon-collection',

    buildStart() {
      const collection = collectIcons()
      write(path.resolve('src/generated/icons.json'), JSON.stringify(collection))
    },
  }
}
