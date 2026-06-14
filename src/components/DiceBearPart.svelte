<script lang="ts">
  /**
   * DiceBear isolated component preview.
   *
   * Renders ONLY one specific facial feature by zooming into the
   * relevant region using CSS transform:scale + transform-origin.
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
   * Transform-origin for each component (percentage).
   * Controls which point of the avatar is centered when zoomed in.
   */
  const FOCUS: Record<string, string> = {
    eyebrows: '50% 28%',
    eyes: '50% 36%',
    nose: '50% 45%',
    mouth: '50% 52%',
    lips: '50% 52%',
    top: '50% 18%',
    hair: '50% 18%',
    head: '50% 40%',
    glasses: '50% 32%',
    earrings: '50% 35%',
    facialHair: '50% 58%',
    beard: '50% 58%',
    clothing: '50% 75%',
    shirt: '50% 75%',
    body: '50% 50%',
    face: '50% 40%',
    accessories: '50% 30%',
    features: '50% 40%',
    skinColor: '50% 40%',
    hairColor: '50% 25%',
    clothesColor: '50% 75%',
    hatColor: '50% 15%',
    accessoriesColor: '50% 30%',
    facialHairColor: '50% 58%',
  }

  let origin = $derived(FOCUS[component] ?? '50% 40%')

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
  Zoom trick: scale(2) with transform-origin pointing to the feature area.
  The container clips everything outside. This effectively shows ONLY
  the relevant facial region, not the full face.
-->
<div class="overflow-hidden" style="width:{size}px;height:{size}px">
  <img
    src={svgDataUri}
    alt={option}
    style="width:100%;height:100%;object-fit:cover;transform:scale(2);transform-origin:{origin}"
  />
</div>
