<script lang="ts">
  /**
   * DiceBear isolated component preview.
   *
   * Renders a DiceBear avatar with ONLY one specific param set,
   * then modifies the SVG viewBox to crop to the relevant facial region.
   * This shows ONLY the relevant body part, not the full face.
   */
  import * as collection from '@dicebear/collection'
  import { createAvatar } from '@dicebear/core'

  interface Props {
    style: string
    component: string
    option: string
    size?: number
  }

  let { style, component, option, size = 32 }: Props = $props()

  /**
   * Crop regions for each component in viewBox coordinates.
   * Format: { x, y, width, height } — the area to show.
   * Based on the component transforms from each style's base component.
   */
  const CROPS: Record<string, { x: number; y: number; w: number; h: number }> = {
    eyebrows: { x: 66, y: 72, w: 80, h: 32 },
    eyes: { x: 66, y: 82, w: 80, h: 40 },
    nose: { x: 94, y: 112, w: 60, h: 36 },
    mouth: { x: 68, y: 126, w: 76, h: 44 },
    lips: { x: 68, y: 126, w: 76, h: 44 },
    top: { x: 0, y: 0, w: 200, h: 70 },
    hair: { x: 0, y: 0, w: 200, h: 70 },
    head: { x: 40, y: 30, w: 200, h: 200 },
    glasses: { x: 60, y: 78, w: 90, h: 36 },
    earrings: { x: 50, y: 80, w: 100, h: 40 },
    facialHair: { x: 40, y: 140, w: 120, h: 60 },
    beard: { x: 40, y: 140, w: 120, h: 60 },
    clothing: { x: 20, y: 160, w: 160, h: 120 },
    shirt: { x: 20, y: 160, w: 160, h: 120 },
    body: { x: 20, y: 100, w: 160, h: 160 },
    face: { x: 40, y: 60, w: 200, h: 140 },
    accessories: { x: 50, y: 30, w: 110, h: 100 },
    features: { x: 40, y: 60, w: 200, h: 140 },
    skinColor: { x: 40, y: 40, w: 200, h: 200 },
    hairColor: { x: 0, y: 0, w: 200, h: 60 },
    clothesColor: { x: 20, y: 160, w: 160, h: 120 },
    hatColor: { x: 0, y: 0, w: 200, h: 60 },
    accessoriesColor: { x: 50, y: 30, w: 110, h: 100 },
    facialHairColor: { x: 40, y: 140, w: 120, h: 60 },
  }

  let crop = $derived(CROPS[component])

  function renderPart(): string {
    try {
      const styleFn = (collection as Record<string, object>)[style]
      if (!styleFn || typeof styleFn !== 'object') {
        return fallback('?')
      }

      // Generate full avatar with only this one param
      const avatar = createAvatar(styleFn as never, {
        seed: `part-${component}-${option}`,
        size: 280,
        [component]: [option],
      })

      const svg = avatar.toString()

      if (!crop) {
        // No crop defined for this component, show full avatar
        return avatar.toDataUri()
      }

      // Replace viewBox with crop region
      const cropped = svg.replace(
        /viewBox="[^"]+"/,
        `viewBox="${crop.x} ${crop.y} ${crop.w} ${crop.h}"`,
      )

      return `data:image/svg+xml,${encodeURIComponent(cropped)}`
    } catch {
      return fallback('✕')
    }
  }

  let svgDataUri = $derived(renderPart())

  function fallback(symbol: string): string {
    return (
      `data:image/svg+xml,` +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
          `<rect fill="#e9ecef" width="${size}" height="${size}" rx="4"/>` +
          `<text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10" fill="#999">${symbol}</text>` +
          `</svg>`,
      )
    )
  }
</script>

<img
  src={svgDataUri}
  alt={option}
  style="width:{size}px;height:{size}px"
  class="block"
/>
