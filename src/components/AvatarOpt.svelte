<script lang="ts">
  /**
   * Schema-driven option renderer for a single DiceBear avatar param.
   *
   * Renders the appropriate UI control based on the JSON Schema shape:
   * - Component params (string enum) → isolated part thumbnails
   * - Color params (hex pattern) → color swatches (always visible border)
   * - Probability params are not rendered (auto-managed by buildGenderConfig).
   */
  import type { SchemaProp } from '../config/dicebear'
  import { classifyParam, getEnumValues, paramLabel } from '../config/dicebear'
  import AvatarImg from './AvatarImg.svelte'

  interface Props {
    /** The style key (e.g. 'avataaars'). */
    style: string
    /** The param key from the schema. */
    paramKey: string
    /** The schema property definition. */
    schemaProp: SchemaProp
    /** Currently selected values for this param. */
    selected: string[]
    /** All component-type param keys in the style, used to isolate part previews. */
    allComponentKeys: string[]
    /** Called to toggle an option value on/off. */
    onToggle: (key: string, value: string) => void
  }

  let { style, paramKey, schemaProp, selected, allComponentKeys, onToggle }: Props = $props()

  const kind = $derived(classifyParam(paramKey, schemaProp))
  const enumVals = $derived(getEnumValues(schemaProp))
  const colorVals = $derived(kind === 'color' ? enumVals : [])
  const thumbSize = 32

  /** Neutral gray background for isolated part thumbnails — visible on any theme. */
  const thumbBg = '#d4d4d4'

  /**
   * Build params that isolate a single component.
   * Also sets a neutral backgroundColor so thumbnails are visible on dark themes.
   *
   * @param targetKey - The component key to show.
   * @param targetValue - The enum value for the target component.
   * @returns Params object with all other components set to [].
   */
  function isolateParams(targetKey: string, targetValue: string): Record<string, string[]> {
    const params: Record<string, string[]> = {}
    for (const k of allComponentKeys) {
      params[k] = k === targetKey ? [targetValue] : []
    }
    // Ensure a visible background behind the isolated part
    params.backgroundColor = [thumbBg]
    return params
  }

  /**
   * Ensure a hex color has a # prefix.
   * Schema colors are bare hex (e.g. "262e33") without #.
   *
   * @param val - Raw color value from schema.
   * @returns Hex color string with # prefix.
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
    <div class="text-base-content/70 text-xs mb-1 font-medium flex items-center gap-1">
      {paramLabel(paramKey)}
      <span class="text-[9px] font-normal opacity-50">({enumVals.length})</span>
    </div>
    <div class="flex flex-wrap gap-1">
      {#each enumVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        <button
          class="cursor-pointer rounded-xl border-2 p-0.5 shrink-0 transition-all
            {isSelected
            ? 'border-primary bg-primary/10'
            : 'border-transparent hover:border-base-content/20'}"
          onclick={() => onToggle(paramKey, opt)}
          title={opt}
        >
          <div class="h-8 w-8 overflow-hidden">
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
    <div class="text-base-content/70 text-xs mb-1 font-medium flex items-center gap-1">
      {paramLabel(paramKey)}
      <span class="text-[9px] font-normal opacity-50">({colorVals.length})</span>
    </div>
    <div class="flex flex-wrap gap-1">
      {#each colorVals as opt (opt)}
        {@const isSelected = selected.includes(opt)}
        {@const color = hexColor(opt)}
        <button
          type="button"
          class="h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 transition-all
            {isSelected
            ? 'border-primary scale-110'
            : 'border-base-content/15 hover:border-base-content/40'}"
          style="background:{color}"
          onclick={() => onToggle(paramKey, opt)}
          title={color}
        ></button>
      {/each}
    </div>
  </div>
{/if}
