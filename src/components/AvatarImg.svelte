<script lang="ts">
  /**
   * DiceBear SVG avatar renderer.
   *
   * Renders a DiceBear avatar via the DiceBear HTTP API
   * instead of bundling @dicebear/collection.
   */
  import { dicebearUrl } from '../config/styles'

  interface Props {
    style: string
    params: Record<string, string | string[] | boolean | number>
    seed?: string
    size?: number
  }

  let { style, params, seed = 'default', size = 120 }: Props = $props()

  let src = $derived(dicebearUrl(style, seed, size, params))
</script>

<img {src} alt="头像" class="object-cover w-full h-full" width={size} height={size} />
