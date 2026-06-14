/**
 * DiceBear avatar style helpers.
 *
 * Utilities for working with @dicebear/collection at runtime.
 * Everything is driven by each style's JSON Schema — no hardcoded
 * param labels or category maps.
 */

import type { Options } from '@dicebear/core'

/** Common (non-style-specific) options from @dicebear/core Options. */
export type CommonOption = {
  key: keyof Options
  label: string
  type: 'select' | 'color' | 'toggle'
  options?: { value: string; label: string }[]
}

/** Common config keys and their visual controls — matches @dicebear/core Options. */
export const COMMON_OPTIONS: CommonOption[] = [
  {
    key: 'backgroundColor',
    label: '底色',
    type: 'color',
    options: [
      { value: 'transparent', label: '透明' },
      { value: '#d4d4d8', label: '浅灰' },
      { value: '#a1a1aa', label: '中灰' },
      { value: '#52525b', label: '深灰' },
      { value: '#18181b', label: '暗黑' },
    ],
  },
  {
    key: 'backgroundType',
    label: '背景',
    type: 'select',
    options: [
      { value: 'solid', label: '纯色' },
      { value: 'gradientLinear', label: '渐变' },
    ],
  },
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
  { key: 'clip', label: '裁切', type: 'toggle' },
]

/** Default values for common options — aligned with @dicebear/core defaults. */
export const DEFAULT_COMMON: Record<string, string> = {
  backgroundColor: 'transparent',
  backgroundType: 'solid',
  radius: '50',
  scale: '100',
  flip: 'false',
  rotate: '0',
  clip: 'false',
}

/** Schema property shape (subset of JSONSchema7). */
export type SchemaProp = {
  type?: string
  items?: { type?: string; enum?: string[]; pattern?: string }
  minimum?: number
  maximum?: number
  default?: unknown
}

// -- Gender-specific param groups --

/** Param keys that are male-only features. */
const MALE_ONLY_KEYS = new Set(['facialHair', 'beard', 'facialHairColor'])

/** Param keys that are female-only features. */
const FEMALE_ONLY_KEYS = new Set(['lipColor'])

/** Param keys that are internal / noise — always skipped. */
const NOISE_KEYS = new Set(['base', 'style'])

/** Suffix for probability control params. */
const PROBABILITY_SUFFIX = 'Probability'

// -- Schema-driven param classification --

/** Kinds of schema param for rendering. */
export type ParamKind = 'component' | 'color' | 'probability'

/**
 * Classify a schema param by its JSON Schema shape.
 *
 * - `probability`: integer with min/max = 0..100
 * - `color`: array items with a hex-color pattern
 * - `component`: array items with a string enum (non-color)
 *
 * @param key - The schema property key.
 * @param prop - The schema property definition.
 * @returns The classified param kind.
 */
export function classifyParam(key: string, prop: SchemaProp): ParamKind {
  if (
    prop.type === 'integer' &&
    prop.minimum !== undefined &&
    prop.maximum !== undefined &&
    prop.minimum >= 0 &&
    prop.maximum <= 100
  ) {
    return 'probability'
  }

  if (prop.type === 'array' && prop.items) {
    if (prop.items.pattern && /hex|color|#[a-fA-F0-9]/i.test(prop.items.pattern)) {
      return 'color'
    }
    if (prop.items.enum) {
      return 'component'
    }
  }

  // Fallback: guess by key name
  if (key.toLowerCase().includes('color') || key.endsWith('Color')) {
    return 'color'
  }
  return 'component'
}

/**
 * Extract enum values from a schema prop (for component/color options).
 *
 * @param prop - The schema property definition.
 * @returns Array of enum string values.
 */
export function getEnumValues(prop: SchemaProp): string[] {
  if (prop.items?.enum?.length) {
    return prop.items.enum
  }
  return []
}

/**
 * Extract color values from a schema prop default.
 *
 * @param prop - The schema property definition.
 * @returns Array of color string values.
 */
export function getColorValues(prop: SchemaProp): string[] {
  if (prop.items?.enum?.length) {
    return prop.items.enum
  }
  if (Array.isArray(prop.default)) {
    return prop.default.filter((v): v is string => typeof v === 'string')
  }
  return []
}

/**
 * Check if a color value is a valid hex color code.
 *
 * @param val - The value to check.
 * @returns Whether the value is a valid hex color.
 */
export function isHexColor(val: string): boolean {
  return /^#?[0-9a-f]{3,8}$/i.test(val)
}

// -- Param filtering & defaults --

/**
 * Check if a param key is a probability control.
 *
 * @param key - The param key to check.
 * @returns Whether the key is a probability param.
 */
export function isProbabilityParam(key: string): boolean {
  return key.endsWith(PROBABILITY_SUFFIX)
}

/**
 * Derive the base param name from a probability key.
 * e.g. "facialHairProbability" -> "facialHair"
 *
 * @param key - The probability param key.
 * @returns The base param key without the Probability suffix.
 */
export function probabilityBaseKey(key: string): string {
  return key.slice(0, -PROBABILITY_SUFFIX.length)
}

/**
 * Check if a param key is noise to always skip.
 *
 * @param key - The param key to check.
 * @returns Whether the key is noise/internal.
 */
export function isNoiseParam(key: string): boolean {
  return NOISE_KEYS.has(key) || isProbabilityParam(key)
}

/**
 * Check if a param is relevant for a specific gender.
 *
 * @param key - The param key.
 * @param gender - 'male' or 'female'.
 * @returns Whether the param is relevant for the given gender.
 */
export function isRelevantForGender(key: string, gender: 'male' | 'female'): boolean {
  if (gender === 'male' && FEMALE_ONLY_KEYS.has(key)) {
    return false
  }
  if (gender === 'female' && MALE_ONLY_KEYS.has(key)) {
    return false
  }
  return true
}

/**
 * Filter schema params relevant for a specific gender.
 *
 * @param props - All schema properties.
 * @param gender - 'male' or 'female'.
 * @returns Filtered entries relevant to the gender.
 */
export function filterParams(
  props: Record<string, SchemaProp>,
  gender: 'male' | 'female',
): [string, SchemaProp][] {
  return Object.entries(props).filter(([key]) => {
    if (isNoiseParam(key)) {
      return false
    }
    if (!isRelevantForGender(key, gender)) {
      return false
    }
    return true
  })
}

/**
 * Build gender-based config defaults from the style schema.
 *
 * Only overrides probability params for gender-specific features:
 * - Male: facialHair/beard probability=100, pick first facial hair variant
 * - Female: facialHair/beard probability=0
 *
 * All other params are left empty so DiceBear uses seed-based randomization.
 *
 * @param props - All schema properties.
 * @param gender - 'male' or 'female'.
 * @returns Default config map for the gender.
 */
export function buildGenderConfig(
  props: Record<string, SchemaProp>,
  gender: 'male' | 'female',
): Record<string, string[]> {
  const config: Record<string, string[]> = {}

  for (const key of Object.keys(props)) {
    if (!isProbabilityParam(key)) {
      continue
    }
    const baseKey = probabilityBaseKey(key)

    if (!MALE_ONLY_KEYS.has(baseKey) && !FEMALE_ONLY_KEYS.has(baseKey)) {
      continue
    }

    if (gender === 'male' && MALE_ONLY_KEYS.has(baseKey)) {
      config[key] = ['100']

      // Also pick the first facial hair variant
      const baseProp = props[baseKey]
      const enumVals = baseProp?.items?.enum ?? []
      if (enumVals.length > 0) {
        config[baseKey] = [enumVals[0]!]
      }
    } else if (gender === 'female' && MALE_ONLY_KEYS.has(baseKey)) {
      config[key] = ['0']
    }
  }

  return config
}

// -- Label generation --

/**
 * Convert a camelCase param key to a human-readable Chinese label.
 *
 * Uses a small priority lookup for common DiceBear params,
 * then falls back to auto-generated English label from camelCase.
 *
 * @param key - The schema property key.
 * @returns Human-readable label string.
 */
export function paramLabel(key: string): string {
  const prio: Record<string, string> = {
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
    earrings: '耳饰',
    glasses: '眼镜',
    facialHair: '胡须',
    beard: '胡须',
    mask: '口罩',
    gesture: '手势',
    features: '特征',
    hairAccessories: '发饰',
    freckles: '雀斑',
    bodyIcon: '身体图标',
    // Colors (suffix-based detection handles most, these are special cases)
    backgroundColor: '底色',
    skinColor: '肤色',
    hairColor: '发色',
    clothesColor: '衣服色',
    shirtColor: '上衣色',
    hatColor: '帽子色',
    facialHairColor: '胡须色',
    accessoriesColor: '配饰色',
    earringsColor: '耳饰色',
    glassesColor: '眼镜色',
    eyebrowsColor: '眉色',
    eyesColor: '眼色',
    noseColor: '鼻色',
    mouthColor: '嘴色',
    lipColor: '唇色',
    frecklesColor: '雀斑色',
  }

  if (prio[key]) {
    return prio[key]
  }

  // Auto-generate: split camelCase, capitalize each word
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
