<script lang="ts">
  /**
   * DiceBear SVG avatar renderer.
   *
   * Renders a DiceBear avatar using @dicebear/core + @dicebear/collection.
   * Re-renders reactively when props change.
   * @returns SVG data URI string.
   */
  import * as collection from '@dicebear/collection'
  import { createAvatar } from '@dicebear/core'

  interface Props {
    /** Style key matching an export name in @dicebear/collection. */
    style: string
    /** Parameter dictionary passed to createAvatar options. */
    params: Record<string, string | string[]>
    /** Random seed; change to get a different avatar. */
    seed?: string
    /** Avatar size in pixels. */
    size?: number
  }

  let { style, params, seed = 'default', size = 120 }: Props = $props()

  /**
   *
   */
  function renderSvg(): string {
    try {
      const styleFn = (collection as Record<string, object>)[style]
      if (!styleFn || typeof styleFn !== 'object') {
        return fallbackDataUri('?')
      }
      const avatar = createAvatar(styleFn as never, {
        seed,
        size,
        ...params,
      })
      return avatar.toDataUri()
    } catch {
      return fallbackDataUri('✕')
    }
  }

  let svgDataUri = $derived(renderSvg())

  /**
   * @param symbol
   * @returns Fallback SVG data URI.
   */
  function fallbackDataUri(symbol: string): string {
    const s = size / 2
    return (
      `data:image/svg+xml,` +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
          `<rect fill="#e9ecef" width="${size}" height="${size}" rx="8"/>` +
          `<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="${s}" fill="#999">${symbol}</text>` +
          `</svg>`,
      )
    )
  }
</script>

<img
  src={svgDataUri}
  alt="头像"
  class="object-cover w-full h-full rounded-full"
  width={size}
  height={size}
/>
