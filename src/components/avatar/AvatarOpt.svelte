<script lang="ts">
  /**
   * Schema-driven option renderer for a single DiceBear v10 field.
   *
   * Renders based on {@link OptionsDescriptor} field types:
   * - Component variant fields → isolated part thumbnails
   * - Color fields → color swatches
   */
  import type { Style } from '@dicebear/core'

  import type { StoredOptions } from '../../types'
  import AvatarImg from './AvatarImg.svelte'

  /** Simplified field descriptor matching OptionsDescriptor output. */
  interface OptField {
    type: string
    values?: string[]
    list?: boolean
    weighted?: boolean
  }

  interface Props {
    styleName: string
    style: Style
    fieldKey: string
    field: OptField
    selected: string[]
    /** All component name→Variant descriptor keys for isolation. */
    allVariantKeys: string[]
    onToggle: (key: string, value: string) => void
  }

  let { styleName, style, fieldKey, field, selected, allVariantKeys, onToggle }: Props = $props()

  const thumbSize = 72
  const thumbBg = '#d4d4d4'

  /** Build params that isolate a single component + variant for thumbnail preview.
   *
   * @param targetKey
   * @param targetValue
   * @returns Options object for isolated rendering.
   */
  function isolateParams(targetKey: string, targetValue: string): StoredOptions {
    const params: StoredOptions = {}

    for (const k of allVariantKeys) {
      if (k === targetKey) {
        params[k] = [targetValue]
      } else {
        params[k] = []
      }
    }

    // Disable all component probabilities except the target
    for (const k of allVariantKeys) {
      const probKey = k.replace(/Variant$/, 'Probability')
      if (k === targetKey) {
        params[probKey] = 100
      } else {
        params[probKey] = 0
      }
    }

    params.backgroundColor = [thumbBg]
    return params
  }

  /** Convert a color value to a valid CSS hex string.
   *
   * @param val
   * @returns CSS hex color string.
   */
  function hexColor(val: string): string {
    if (val === 'transparent') {
      return 'transparent'
    }
    return val.startsWith('#') ? val : '#' + val
  }

  // Component variant fields
  let isComponent = $derived(fieldKey.endsWith('Variant') && field.type === 'enum')
  // Color fields
  let isColor = $derived(field.type === 'color')

  let enumVals = $derived(isComponent && 'values' in field ? (field.values as string[]) : [])

  // Pull color palette from the style
  let colorVals = $derived.by(() => {
    if (!isColor) {
      return []
    }
    const name = fieldKey.replace(/Color$/, '')
    const colorDef = style.colors().get(name)
    return colorDef ? [...colorDef.values()] : []
  })
</script>

{#if isComponent && enumVals.length > 0}
  <div>
    <div class="grid grid-cols-[repeat(auto-fill,68px)] justify-center gap-1.5">
      {#each enumVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        <button
          class="cursor-pointer border transition-all
            {isSelected
            ? 'border-primary bg-primary/10'
            : 'border-transparent hover:border-text/20'}"
          onclick={() => onToggle(fieldKey, opt)}
          title={opt}
        >
          <div class="h-16 w-16 overflow-hidden">
            <AvatarImg
              {styleName}
              options={isolateParams(fieldKey, opt)}
              size={thumbSize}
              seed={`opt-${fieldKey}-${opt}`}
            />
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if isColor && colorVals.length > 0}
  <div>
    <div class="grid grid-cols-[repeat(auto-fill,40px)] justify-center gap-1">
      {#each colorVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        {@const color = hexColor(opt)}
        <button
          type="button"
          class="h-9 w-9 cursor-pointer rounded-full border transition-all
            {isSelected ? 'scale-110 border-primary' : 'border-base-300/40 hover:border-base-300'}"
          style="background:{color}"
          onclick={() => onToggle(fieldKey, opt)}
          title={color}
        ></button>
      {/each}
    </div>
  </div>
{/if}
