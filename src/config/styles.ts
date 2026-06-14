/**
 * Curated DiceBear style list.
 *
 * Instead of importing the entire @dicebear/collection (3.8MB),
 * we maintain a curated list of well-known styles.
 * The config panel lazy-loads schemas on demand.
 */
export const STYLE_NAMES: string[] = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'avataaars-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'bottts',
  'croodles',
  'dylan',
  'fun-emoji',
  'glass',
  'identicon',
  'initials',
  'lorelei',
  'lorelei-neutral',
  'micah',
  'miniavs',
  'notionists',
  'notionists-neutral',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'rings',
  'shapes',
  'thumbs',
]

/** DiceBear HTTP API base URL */
export const DICEBEAR_API = 'https://api.dicebear.com/9.x'

/**
 * Build a DiceBear SVG URL from style + params.
 * Converts boolean/number/array params to URL query format.
 * @param style
 * @param seed
 * @param size
 * @param params
 * @returns DiceBear API SVG URL string
 */
export function dicebearUrl(
  style: string,
  seed: string,
  size: number,
  params: Record<string, string | string[] | boolean | number>,
): string {
  const usp = new URLSearchParams()
  usp.set('seed', seed)
  usp.set('size', String(size))

  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) {
      continue
    }
    if (Array.isArray(val)) {
      if (val.length > 0) {
        usp.set(key, val.join(','))
      }
    } else if (typeof val === 'boolean') {
      usp.set(key, val ? 'true' : 'false')
    } else {
      usp.set(key, String(val))
    }
  }

  return `${DICEBEAR_API}/${style}/svg?${usp.toString()}`
}
