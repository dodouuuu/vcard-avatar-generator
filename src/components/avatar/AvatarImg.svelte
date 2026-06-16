<script lang="ts">
  /**
   * DiceBear v10 avatar renderer — local generation.
   *
   * Uses `new Avatar(style, options).toDataUri()` to render SVG
   * entirely in the browser, no HTTP API calls.
   */
  import { Avatar, type Style } from '@dicebear/core'

  import { loadStyle } from '../../generated/dicebear-styles'

  interface Props {
    styleName: string
    options: Record<string, unknown>
    seed?: string
    size?: number
  }

  let { styleName, options, seed = 'default', size = 120 }: Props = $props()

  let loadedStyle: Style | null = $state(null)
  let dataUri = $state('')

  $effect(() => {
    loadStyle(styleName)
      .then((s) => {
        loadedStyle = s
      })
      .catch((err) => {
        console.error('Failed to load style:', styleName, err)
      })
  })

  $effect(() => {
    if (!loadedStyle) {
      return
    }
    try {
      const avatar = new Avatar(loadedStyle, {
        ...options,
        seed,
        size,
      })
      dataUri = avatar.toDataUri()
    } catch (err) {
      console.error('Avatar render error:', err)
    }
  })
</script>

<img src={dataUri} alt="头像" class="object-cover w-full h-full" width={size} height={size} />
