<script lang="ts">
  /**
   * Schema-driven option renderer for a single DiceBear avatar param.
   *
   * Renders the appropriate UI control based on the JSON Schema shape:
   * - Component params (string enum) → isolated part thumbnails
   * - Color params (hex pattern) → color swatches
   */
  import type { SchemaProp } from '../config/dicebear'
  import { classifyParam, getEnumValues, paramLabel } from '../config/dicebear'
  import AvatarImg from './AvatarImg.svelte'

  interface Props {
    style: string
    paramKey: string
    schemaProp: SchemaProp
    selected: string[]
    allComponentKeys: string[]
    onToggle: (key: string, value: string) => void
  }

  let { style, paramKey, schemaProp, selected, allComponentKeys, onToggle }: Props = $props()

  const kind = $derived(classifyParam(paramKey, schemaProp))
  const enumVals = $derived(getEnumValues(schemaProp))
  const colorVals = $derived(kind === 'color' ? enumVals : [])
  const thumbSize = 48

  const thumbBg = '#d4d4d4'

  /**
   * Build params that only set the given component, for isolated preview
   * @param targetKey
   * @param targetValue
   * @returns params with only the target component enabled
   */
  function isolateParams(targetKey: string, targetValue: string): Record<string, string[]> {
    const params: Record<string, string[]> = {}
    for (const k of allComponentKeys) {
      params[k] = k === targetKey ? [targetValue] : []
    }
    params.backgroundColor = [thumbBg]
    return params
  }

  /**
   * Convert a color value to hex string
   * @param val
   * @returns hex color string
   */
  function hexColor(val: string): string {
    if (val === 'transparent') {
      return 'transparent'
    }
    return val.startsWith('#') ? val : '#' + val
  }
</script>

{#if kind === 'component' && enumVals.length > 0}
  <div>
    <div class="mb-1.5 flex items-center gap-1 text-sm font-medium text-text/80">
      {paramLabel(paramKey)}
      <span class="text-[10px] font-normal opacity-50">({enumVals.length})</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,52px)] justify-center gap-1.5">
      {#each enumVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        <button
          class="cursor-pointer border-2 transition-all
            {isSelected
            ? 'border-primary bg-primary/10'
            : 'border-transparent hover:border-text/20'}"
          onclick={() => onToggle(paramKey, opt)}
          title={opt}
        >
          <div class="h-12 w-12 overflow-hidden">
            <AvatarImg
              {style}
              params={isolateParams(paramKey, opt)}
              size={thumbSize}
              seed={`opt-${paramKey}-${opt}`}
            />
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if kind === 'color' && colorVals.length > 0}
  <div>
    <div class="mb-1.5 flex items-center gap-1 text-sm font-medium text-text/80">
      {paramLabel(paramKey)}
      <span class="text-[10px] font-normal opacity-50">({colorVals.length})</span>
    </div>
    <div class="grid grid-cols-[repeat(auto-fill,40px)] justify-center gap-1">
      {#each colorVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        {@const color = hexColor(opt)}
        <button
          type="button"
          class="h-9 w-9 cursor-pointer rounded-full border-2 transition-all
            {isSelected ? 'scale-110 border-primary' : 'border-border/40 hover:border-border'}"
          style="background:{color}"
          onclick={() => onToggle(paramKey, opt)}
          title={color}
        ></button>
      {/each}
    </div>
  </div>
{/if}
