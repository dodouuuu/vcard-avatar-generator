<script lang="ts">
  /**
   * DiceBear isolated component preview.
   *
   * Renders a DiceBear avatar with ONLY one specific param set,
   * then uses CSS zoom to show JUST that facial region.
   * The trick: render the SVG at 2x container size,
   * then `object-fit: cover` crops to the relevant area.
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

  let { style, component, option, size = 32 }: Props = $props()

  /**
   * Focus positions for each component, as percentage for object-position.
   */
  const FOCUS: Record<string, string> = {
    eyebrows: '50% 31%',
    eyes: '50% 36%',
    nose: '50% 44%',
    mouth: '50% 52%',
    lips: '50% 52%',
    top: '50% 18%',
    hair: '50% 18%',
    head: '50% 38%',
    glasses: '50% 33%',
    earrings: '50% 36%',
    facialHair: '50% 58%',
    beard: '50% 58%',
    clothing: '50% 72%',
    shirt: '50% 72%',
    body: '50% 48%',
    face: '50% 40%',
    accessories: '50% 30%',
    features: '50% 38%',
    skinColor: '50% 42%',
    hairColor: '50% 28%',
    clothesColor: '50% 72%',
  }

  let focus = $derived(FOCUS[component] ?? '50% 40%')

  /** Internal render size (larger = better zoom quality). */
  const renderSize = 280

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

<!--
  Zoom trick: img is rendered at 2x container size,
  object-fit:cover crops it, object-position controls the focus area.
  This effectively zooms into the facial region.
-->
<div class="overflow-hidden" style="width:{size}px;height:{size}px">
  <img
    src={svgDataUri}
    alt={option}
    style="width:{size * 2}px;height:{size * 2}px;object-fit:cover;object-position:{focus};max-width:none"
  />
</div>
