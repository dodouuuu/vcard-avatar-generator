/**
 * DiceBear avatar style helpers.
 *
 * Utilities for working with @dicebear/collection at runtime.
 * Style lists and parameter schemas are read from the library,
 * not hardcoded here.
 */

import type { Options } from '@dicebear/core'

/** Common (non-style-specific) options from @dicebear/core Options. */
export type CommonOption = {
  key: keyof Options
  label: string
  type: 'select' | 'color' | 'toggle'
  options?: { value: string; label: string }[]
}

/** Common config keys and their visual controls. */
export const COMMON_OPTIONS: CommonOption[] = [
  { key: 'backgroundColor', label: '底色', type: 'color' },
  {
    key: 'radius',
    label: '形状',
    type: 'select',
    options: [
      { value: '50', label: '圆形' },
      { value: '20', label: '圆角' },
      { value: '0', label: '方形' },
    ],
  },
  {
    key: 'scale',
    label: '缩放',
    type: 'select',
    options: [
      { value: '80', label: '80%' },
      { value: '100', label: '100%' },
      { value: '120', label: '120%' },
    ],
  },
  { key: 'flip', label: '翻转', type: 'toggle' },
  {
    key: 'rotate',
    label: '旋转',
    type: 'select',
    options: [
      { value: '0', label: '0°' },
      { value: '90', label: '90°' },
      { value: '180', label: '180°' },
      { value: '270', label: '270°' },
    ],
  },
]

/** Default values for common options. */
export const DEFAULT_COMMON: Record<string, string> = {
  backgroundColor: 'transparent',
  radius: '50',
  scale: '100',
  flip: 'false',
  rotate: '0',
}

/** Schema property shape. */
export type SchemaProp = {
  type?: string
  items?: { enum?: string[] }
  default?: unknown
}

/**
 * Keys that are male-only (facial hair, beard).
 */
const MALE_ONLY_KEYS = new Set(['facialHair', 'beard', 'facialHairColor'])

/**
 * Keys that are female-only (lip color, makeup, etc.).
 */
const FEMALE_ONLY_KEYS = new Set(['lipColor'])

/**
 * Keys that are noise / internal params to skip.
 */
const NOISE_KEYS = new Set(['base', 'style'])

/**
 * Keys that are probability controls. We handle them explicitly
 * rather than filtering them out.
 */
const PROBABILITY_SUFFIX = 'Probability'

/**
 * Check if a parameter key is a probability control.
 */
export function isProbabilityParam(key: string): boolean {
  return key.endsWith(PROBABILITY_SUFFIX)
}

/**
 * Derive the base param name from a probability key.
 * e.g. "facialHairProbability" -> "facialHair"
 */
export function probabilityBaseKey(key: string): string {
  return key.slice(0, -PROBABILITY_SUFFIX.length)
}

/**
 * Check if a param key is gender-specific noise to skip.
 */
export function isNoiseParam(key: string): boolean {
  return NOISE_KEYS.has(key) || isProbabilityParam(key)
}

/**
 * Check if a param is relevant for a specific gender.
 */
export function isRelevantForGender(key: string, gender: 'male' | 'female'): boolean {
  if (gender === 'male' && FEMALE_ONLY_KEYS.has(key)) return false
  if (gender === 'female' && MALE_ONLY_KEYS.has(key)) return false
  return true
}

/**
 * Filter params relevant for a specific gender.
 */
export function filterParams(
  props: Record<string, SchemaProp>,
  gender: 'male' | 'female',
): [string, SchemaProp][] {
  return Object.entries(props).filter(([key]) => {
    if (isNoiseParam(key)) return false
    if (!isRelevantForGender(key, gender)) return false
    return true
  })
}

/**
 * Build sensible gender-based defaults from a style's schema properties.
 *
 * Strategy: DON'T pre-set style params — leave them empty so DiceBear
 * uses seed-based randomization (changing the seed = different avatar).
 *
 * The only exceptions are probability overrides:
 * - Male: facialHair/beard probability=100 (always show)
 * - Female: facialHair/beard probability=0 (never show)
 *
 * @returns A Record<string, string[]> suitable for DiceBear params.
 */
export function getGenderDefaults(
  _props: Record<string, SchemaProp>,
  _gender: 'male' | 'female',
): Record<string, string[]> {
  // Deliberately empty — let DiceBear randomize based on seed
  return {}
}

/**
 * Get gender-specific probability overrides.
 *
 * For male: enable facial hair/beard (probability=100)
 * For female: disable facial hair/beard (probability=0)
 */
export function getGenderProbabilities(
  props: Record<string, SchemaProp>,
  gender: 'male' | 'female',
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const [key, prop] of Object.entries(props)) {
    if (!isProbabilityParam(key)) continue
    const baseKey = probabilityBaseKey(key)

    // Default: use schema default if available
    const schemaDefault =
      prop.default !== undefined ? Number(prop.default) : undefined

    if (gender === 'male' && MALE_ONLY_KEYS.has(baseKey)) {
      result[key] = 100 // Always show facial hair for male
    } else if (gender === 'female' && MALE_ONLY_KEYS.has(baseKey)) {
      result[key] = 0 // Never show facial hair for female
    } else if (schemaDefault !== undefined && !isNaN(schemaDefault)) {
      result[key] = schemaDefault
    }
  }

  return result
}

/**
 * Build complete default config for a gender.
 *
 * Returns ONLY the minimum params needed for gender differentiation:
 * - Male: enable facial hair (probability=100), pick first facial hair variant
 * - Female: disable facial hair (probability=0)
 *
 * All other params are left empty so DiceBear uses seed-based randomization,
 * making the "regenerate" button actually change the avatar appearance.
 */
export function buildGenderConfig(
  props: Record<string, SchemaProp>,
  gender: 'male' | 'female',
): Record<string, string[]> {
  const config: Record<string, string[]> = {}

  for (const [key, prop] of Object.entries(props)) {
    if (!isProbabilityParam(key)) continue
    const baseKey = probabilityBaseKey(key)

    // Only override probabilities for gender-specific features
    if (!MALE_ONLY_KEYS.has(baseKey) && !FEMALE_ONLY_KEYS.has(baseKey)) continue

    if (gender === 'male' && MALE_ONLY_KEYS.has(baseKey)) {
      config[key] = ['100'] // always show facial hair for male

      // Also pick the first facial hair variant so there's something to show
      const baseProp = props[baseKey]
      const enumVals = baseProp?.items?.enum ?? []
      if (enumVals.length > 0) {
        config[baseKey] = [enumVals[0]!]
      }
    } else if (gender === 'female' && MALE_ONLY_KEYS.has(baseKey)) {
      config[key] = ['0'] // never show facial hair for female
    }
  }

  return config
}

/**
 * Guess whether a schema property name looks like a color picker.
 */
export function isColorParam(key: string): boolean {
  return /color/i.test(key)
}

/** Mapping of DiceBear param keys to Chinese labels, grouped by category. */
export const PARAM_LABELS: Record<string, string> = {
  // Face components
  top: '发型',
  hair: '发型',
  head: '脸型',
  face: '表情',
  eyebrows: '眉毛',
  brows: '眉毛',
  eyes: '眼睛',
  nose: '鼻子',
  mouth: '嘴巴',
  lips: '嘴唇',
  ears: '耳朵',
  // Body / clothing
  clothing: '衣服',
  shirt: '上衣',
  body: '身体',
  clothingGraphic: '图案',
  // Accessories
  accessories: '配饰',
  accessoriesHat: '帽子',
  earrings: '耳饰',
  glasses: '眼镜',
  facialHair: '胡须',
  beard: '胡须',
  mask: '口罩',
  gesture: '手势',
  features: '特征',
  // Hair details
  hairAccessories: '发饰',
  // Colors
  hairColor: '发色',
  skinColor: '肤色',
  clothesColor: '衣服色',
  facialHairColor: '胡须色',
  accessoriesColor: '配饰色',
  hatColor: '帽子色',
  earringsColor: '耳饰色',
  glassesColor: '眼镜色',
  backgroundColor: '底色',
  eyebrowsColor: '眉色',
  eyesColor: '眼色',
  noseColor: '鼻色',
  mouthColor: '嘴色',
  lipColor: '唇色',
  headContrastColor: '头发色',
  baseColor: '肤色',
  shirtColor: '上衣色',
  eyeShadowColor: '眼影',
  lipColor: '唇色',
  // Details
  freckles: '雀斑',
  frecklesColor: '雀斑色',
  bodyIcon: '身体图标',
  mask: '口罩',
}

export const PARAM_CATEGORIES: Record<string, string> = {
  // Group keys by category
  top: 'components',
  hair: 'components',
  head: 'components',
  face: 'components',
  eyebrows: 'components',
  brows: 'components',
  eyes: 'components',
  nose: 'components',
  mouth: 'components',
  lips: 'components',
  ears: 'components',
  clothing: 'components',
  shirt: 'components',
  body: 'components',
  clothingGraphic: 'components',
  accessories: 'components',
  earrings: 'components',
  glasses: 'components',
  facialHair: 'components',
  beard: 'components',
  mask: 'components',
  gesture: 'components',
  features: 'components',
  hairAccessories: 'components',
  freckles: 'components',
  bodyIcon: 'components',
  // Colors
  hairColor: 'colors',
  skinColor: 'colors',
  clothesColor: 'colors',
  facialHairColor: 'colors',
  accessoriesColor: 'colors',
  hatColor: 'colors',
  earringsColor: 'colors',
  glassesColor: 'colors',
  eyebrowsColor: 'colors',
  eyesColor: 'colors',
  noseColor: 'colors',
  mouthColor: 'colors',
  lipColor: 'colors',
  headContrastColor: 'colors',
  baseColor: 'colors',
  shirtColor: 'colors',
  eyeShadowColor: 'colors',
  frecklesColor: 'colors',
}

/**
 * Get category label for param grouping.
 */
export function categoryLabel(cat: string): string {
  return cat === 'colors' ? '颜色' : cat === 'components' ? '部件' : cat
}

/**
 * Get a display label for a DiceBear schema property key.
 */
export function paramLabel(key: string): string {
  const hexMatch = key.match(/^#[0-9a-f]{3,8}$/i)
  if (hexMatch) return key
  return PARAM_LABELS[key] ?? key
}
