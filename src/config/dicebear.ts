/**
 * DiceBear v10 gender-specific defaults.
 *
 * Builds male / female default options for each avatar style.
 */
import type { Style } from '@dicebear/core'

import type { StoredOptions } from '../types'

/** Default base options shared by all avatars (v10-compatible). */
export const DEFAULT_BASE: StoredOptions = {
  backgroundColor: ['transparent'],
  borderRadius: 50,
  scale: 1,
}

/**
 * Build male-specific defaults — enable facial hair components.
 * Scans the style's components for keys containing "facialHair" or "beard",
 * picks the first variant, and sets probability to 100.
 *
 * @param style
 * @returns Male-specific default options.
 */
export function buildMaleDefaults(style: Style): StoredOptions {
  const result: StoredOptions = {}

  for (const [name, comp] of style.components()) {
    if (comp.extendsName() !== undefined) {
      continue
    }

    const lower = name.toLowerCase()
    if (!lower.includes('facialhair') && !lower.includes('beard')) {
      continue
    }

    const variants = [...comp.variants().keys()]
    if (variants.length > 0) {
      result[`${name}Variant`] = variants[0]
    }
    result[`${name}Probability`] = 100
  }

  return result
}

/**
 * Build female-specific defaults — disable facial hair components.
 *
 * @param style
 * @returns Female-specific default options.
 */
export function buildFemaleDefaults(style: Style): StoredOptions {
  const result: StoredOptions = {}

  for (const [name, comp] of style.components()) {
    if (comp.extendsName() !== undefined) {
      continue
    }

    const lower = name.toLowerCase()
    if (!lower.includes('facialhair') && !lower.includes('beard')) {
      continue
    }

    result[`${name}Probability`] = 0
  }

  return result
}
