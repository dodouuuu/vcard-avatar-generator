<script lang="ts">
  /**
   * DiceBear isolated component preview.
   *
   * Renders a DiceBear avatar with ONLY one specific param set,
   * then uses CSS zoom/clip to show JUST that facial region.
   */
  import * as collection from '@dicebear/collection'
  import { createAvatar } from '@dicebear/core'

  interface Props {
    /** Style key. */
    style: string
    /** Component group name (e.g. 'eyes', 'eyebrows', 'mouth'). */
    component: string
    /** Specific option variant name. */
    option: string
    /** Display size in pixels. */
    size?: number
  }

  let { style, component, option, size = 36 }: Props = $props()

  /**
   * Focus positions for each component, as percentage for object-position.
   * Format: { x% y% } — where to center the crop on the full avatar.
   */
  const FOCUS: Record<string, string> = {
    // Face features (upper → lower)
    eyebrows: '50% 31%',
    eyes: '50% 36%',
    nose: '50% 42%',
    mouth: '50% 50%',
    lips: '50% 50%',
    // Hair/top
    top: '50% 15%',
    hair: '50% 15%',
    head: '50% 40%',
    // Accessories
    glasses: '50% 33%',
    earrings: '50% 35%',
    facialHair: '50% 55%',
    beard: '50% 55%',
    // Clothing/body
    clothing: '50% 70%',
    shirt: '50% 70%',
    body: '50% 50%',
    face: '50% 40%',
    // General
    accessories: '50% 30%',
    features: '50% 40%',
  }

  let focus = $derived(FOCUS[component] ?? '50% 40%')

  /** Rendering size (generated SVG size). Larger = better crop quality. */
  const renderSize = 200

  function renderSvg(): string {
    try {
      const styleFn = (collection as Record<string, object>)[style]
      if (!styleFn || typeof styleFn !== 'object') {
        return fallback('?')
      }
      const avatar = createAvatar(styleFn as never, {
        seed: `part-${component}-${option}`,
        size: renderSize,
        [component]: [option],
      })
      return avatar.toDataUri()
    } catch {
      return fallback('✕')
    }
  }

  let svgDataUri = $derived(renderSvg())

  function fallback(symbol: string): string {
    const s = size
    return (
      `data:image/svg+xml,` +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}">` +
          `<rect fill="#e9ecef" width="${s}" height="${s}" rx="4"/>` +
          `<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="#999">${symbol}</text>` +
          `</svg>`,
      )
    )
  }
</script>

<div
  class="overflow-hidden rounded"
  style="width:{size}px;height:{size}px"
>
  <img
    src={svgDataUri}
    alt={option}
    style="width:100%;height:100%;object-fit:cover;object-position:{focus}"
  />
</div>
