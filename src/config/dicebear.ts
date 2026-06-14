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

/**
 * Guess whether a schema property name looks like a color picker.
 * @param key
 */
export function isColorParam(key: string): boolean {
  return /color/i.test(key)
}

/**
 * Guess whether a schema property is gender-neutral noise (probabilities, etc.).
 * @param key
 * @returns Whether the key is noise.
 */
export function isNoiseParam(key: string): boolean {
  return /probability/i.test(key) || key === 'base' || key === 'style'
}

/**
 * Guess whether a schema property is more relevant for male avatars.
 * @param key
 * @returns Whether the key is male-suggested.
 */
export function isMaleSuggested(key: string): boolean {
  return key === 'facialHair' || key === 'facialHairColor'
}

/**
 * Guess whether a schema property is more relevant for female avatars.
 * @param key
 * @returns Whether the key is female-suggested.
 */
export function isFemaleSuggested(key: string): boolean {
  return key === 'lipColor'
}

/**
 * Filter params relevant for a specific gender.
 * @param props
 * @param gender
 * @returns Filtered entries.
 */
export function filterParams(
  props: Record<string, { type?: string; items?: { enum?: string[] }; default?: unknown }>,
  gender: 'male' | 'female',
): [string, { type?: string; items?: { enum?: string[] }; default?: unknown }][] {
  return Object.entries(props).filter(([key]) => {
    if (isNoiseParam(key)) {
      return false
    }
    if (gender === 'male' && isFemaleSuggested(key)) {
      return false
    }
    if (gender === 'female' && isMaleSuggested(key)) {
      return false
    }
    return true
  })
}

/**
 * Get a display label for a DiceBear schema property key.
 * @param key
 * @returns The Chinese label.
 */
export function paramLabel(key: string): string {
  const labels: Record<string, string> = {
    top: '发型',
    clothing: '衣服',
    accessories: '配饰',
    hairColor: '发色',
    skinColor: '肤色',
    clothesColor: '衣服色',
    facialHair: '胡须',
    facialHairColor: '胡须色',
    accessoriesColor: '配饰色',
    hatColor: '帽子色',
    eyebrows: '眉毛',
    eyes: '眼睛',
    mouth: '嘴巴',
    nose: '鼻子',
    clothingGraphic: '图案',
    backgroundColor: '底色',
    lipColor: '唇色',
  }
  return labels[key] ?? key
}
