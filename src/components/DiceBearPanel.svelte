<script lang="ts">
  /**
   * DiceBear config panel modal.
   *
   * daisyUI `<dialog class="modal">` for configuring DiceBear avatar parameters.
   * All style-specific options are read from @dicebear/collection schemas at runtime.
   * Options are displayed as visual previews (mini avatars or color swatches).
   * Gender-based defaults are auto-generated from the style's schema.
   */
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'

  import {
    COMMON_OPTIONS,
    DEFAULT_COMMON,
    filterParams,
    buildGenderConfig,
    paramLabel,
    categoryLabel,
    PARAM_CATEGORIES,
    isColorParam,
  } from '../config/dicebear'
  import DiceBearAvatar from './DiceBearAvatar.svelte'
  import DiceBearPart from './DiceBearPart.svelte'

  interface Props {
    /** Currently selected style key. */
    currentStyle: string
    /** Common config (backgroundColor, radius, scale, etc.). */
    commonConfig: Record<string, string>
    /** Male-specific parameter values. */
    maleConfig: Record<string, string[]>
    /** Female-specific parameter values. */
    femaleConfig: Record<string, string[]>
    /** Whether the modal is visible. */
    showPanel: boolean
    /** Called when the user saves config. */
    onApply: (
      common: Record<string, string>,
      male: Record<string, string[]>,
      female: Record<string, string[]>,
    ) => void
    /** Called when the panel is dismissed. */
    onClose: () => void
  }

  let {
    currentStyle,
    commonConfig,
    maleConfig,
    femaleConfig,
    showPanel = $bindable(false),
    onApply,
    onClose,
  }: Props = $props()

  // --- Local edit copies ---
  let editCommon = $state<Record<string, string>>({})
  let editMale = $state<Record<string, string[]>>({})
  let editFemale = $state<Record<string, string[]>>({})

  let dialogEl: HTMLDialogElement | undefined = $state()
  let schemaProps = $derived.by(() => {
    const entry = (
      collection as Record<string, { schema?: { properties?: Record<string, unknown> } }>
    )[currentStyle]
    if (!entry?.schema?.properties) {
      return {}
    }
    return entry.schema.properties as Record<
      string,
      { type?: string; items?: { enum?: string[] }; default?: unknown }
    >
  })

  let maleParams = $derived(filterParams(schemaProps, 'male'))
  let femaleParams = $derived(filterParams(schemaProps, 'female'))

  $effect(() => {
    if (!dialogEl) {
      return
    }
    if (showPanel) {
      // Start from saved config, fall back to gender-based schema defaults
      editCommon = { ...commonConfig }
      editMale = Object.keys(maleConfig).length > 0
        ? { ...maleConfig }
        : buildGenderConfig(schemaProps, 'male')
      editFemale = Object.keys(femaleConfig).length > 0
        ? { ...femaleConfig }
        : buildGenderConfig(schemaProps, 'female')
      dialogEl.showModal()
    } else {
      dialogEl.close()
    }
  })

  function handleCancel() {
    onClose()
  }

  function handleApply() {
    onApply({ ...editCommon }, { ...editMale }, { ...editFemale })
    onClose()
  }

  function toggleMulti(
    map: Record<string, string[]>,
    key: string,
    value: string,
    setter: (v: Record<string, string[]>) => void,
  ) {
    const current = map[key] ?? []
    const idx = current.indexOf(value)
    const next = idx === -1 ? [...current, value] : current.filter((v) => v !== value)
    setter({ ...map, [key]: next })
  }

  function toggleMale(key: string, value: string) {
    toggleMulti(editMale, key, value, (v) => (editMale = v))
  }

  function toggleFemale(key: string, value: string) {
    toggleMulti(editFemale, key, value, (v) => (editFemale = v))
  }

  function setCommon(key: string, value: string) {
    editCommon = { ...editCommon, [key]: value }
  }

  function resetDefaults() {
    editCommon = { ...DEFAULT_COMMON }
    editMale = buildGenderConfig(schemaProps, 'male')
    editFemale = buildGenderConfig(schemaProps, 'female')
  }

  function onNativeClose() {
    if (showPanel) {
      onClose()
    }
  }

  /** Check if an enum value is a hex color code. */
  function isHexColor(val: string): boolean {
    return /^#[0-9a-f]{3,8}$/i.test(val)
  }

  /** Group params by category. */
  function groupByCategory(
    params: [string, { type?: string; items?: { enum?: string[] }; default?: unknown }][],
  ): Map<string, [string, { type?: string; items?: { enum?: string[] }; default?: unknown }][]> {
    const groups = new Map<string, typeof params>()
    for (const entry of params) {
      const [key] = entry
      const cat = PARAM_CATEGORIES[key] || 'components'
      if (!groups.has(cat)) groups.set(cat, [])
      groups.get(cat)!.push(entry)
    }
    return groups
  }

  /** Preview avatar size for option thumbnails. */
  const thumbSize = 32
</script>

<dialog class="modal" bind:this={dialogEl} onclose={onNativeClose}>
  <div class="modal-box w-11/12 max-w-5xl p-0">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
      <h3 class="text-lg font-bold flex items-center gap-2">
        <DiceBearAvatar style={currentStyle} params={{}} seed="panel-header" size={32} />
        <span class="ml-1">{currentStyle}</span>
      </h3>
      <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}>✕</button>
    </div>

    <!-- Body -->
    <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
      <!-- Common Config Section -->
      <section>
        <h4
          class="text-sm font-bold text-base-content/80 mb-3 flex items-center gap-2"
        >
          <Icon icon="line-md:cog-twotone" class="h-4 w-4 text-amber-500" />
          公共配置
          <span class="text-xs font-normal text-base-content/40 ml-1">缩放/翻转/底色</span>
        </h4>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg bg-base-200/40 border border-base-200">
          {#each COMMON_OPTIONS as opt (opt.key)}
            {@const val = editCommon[opt.key as string] ?? DEFAULT_COMMON[opt.key as string] ?? ''}
            <div>
              <div class="text-xs text-base-content/60 mb-1.5 font-medium">{opt.label}</div>
              {#if opt.type === 'color'}
                <div class="flex flex-wrap gap-1">
                  <button
                    type="button"
                    class="w-7 h-7 rounded-full cursor-pointer border-2 transition-all {val === 'transparent'
                      ? 'border-amber-500 ring-2 ring-amber-200'
                      : 'border-base-300 hover:border-amber-400'}"
                    style="background:transparent; background-image: repeating-conic-gradient(#ddd 0% 25%, transparent 0% 50%); background-size: 8px 8px"
                    onclick={() => setCommon(opt.key as string, 'transparent')}
                    title="透明"
                  ></button>
                  {#each ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6'] as color (color)}
                    <button
                      type="button"
                      class="w-7 h-7 rounded-full cursor-pointer border-2 transition-all {val === color
                        ? 'border-amber-500 ring-2 ring-amber-200 scale-110'
                        : 'border-base-300 hover:border-amber-400'}"
                      style="background:{color}"
                      onclick={() => setCommon(opt.key as string, color)}
                      title={color}
                    ></button>
                  {/each}
                </div>
              {:else if opt.type === 'toggle'}
                <div class="flex gap-1">
                  <button
                    class="btn btn-xs {val === 'false' ? 'btn-primary' : 'btn-ghost btn-outline'}"
                    onclick={() => setCommon(opt.key as string, 'false')}>
                    <Icon icon="line-md:close" class="h-3 w-3" />
                    正常
                  </button>
                  <button
                    class="btn btn-xs {val === 'true' ? 'btn-primary' : 'btn-ghost btn-outline'}"
                    onclick={() => setCommon(opt.key as string, 'true')}>
                    <Icon icon="line-md:arrow-left-right" class="h-3 w-3" />
                    翻转
                  </button>
                </div>
              {:else}
                <div class="flex gap-1 flex-wrap">
                  {#each opt.options ?? [] as o (o.value)}
                    <button
                      class="btn btn-xs {val === o.value ? 'btn-primary' : 'btn-ghost btn-outline'}"
                      onclick={() => setCommon(opt.key as string, o.value)}>{o.label}</button
                    >
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>

      <!-- Gender Config Sections -->
      {#if maleParams.length > 0 || femaleParams.length > 0}
        <div
          class="grid grid-cols-1 {maleParams.length > 0 && femaleParams.length > 0
            ? 'md:grid-cols-2'
            : ''} gap-6"
        >
          <!-- Male -->
          {#if maleParams.length > 0}
            <section>
              <h4
                class="text-sm font-bold mb-3 flex items-center gap-2"
              >
                <Icon icon="line-md:male" class="h-4 w-4 text-blue-500" />
                <span class="text-blue-700">男士</span>
                <span class="text-xs font-normal text-base-content/40 ml-auto">{maleParams.length} 项</span>
              </h4>
              <div class="space-y-4">
                {#each [...groupByCategory(maleParams)] as [cat, entries] (cat)}
                  <div class="p-3 rounded-lg bg-blue-50/30 border border-blue-100">
                    <div class="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">{categoryLabel(cat)}</div>
                    {#each entries as [key, prop] (key)}
                      {@const values = editMale[key] ?? []}
                      {@const enumVals = prop.items?.enum ?? []}
                      {@const isColorStyle = enumVals.length > 0 && isHexColor(enumVals[0]!)}
                      <div class="mb-2 last:mb-0">
                        <div class="text-xs text-blue-600/70 mb-1 font-medium flex items-center gap-1">
                          {paramLabel(key)}
                          <span class="text-blue-300 text-[9px] font-normal">({enumVals.length})</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {#each isColorStyle ? enumVals : enumVals.slice(0, 8) as opt (opt)}
                            {@const selected = values.includes(opt)}
                            {#if isColorStyle}
                              <button
                                type="button"
                                class="w-6 h-6 rounded-full cursor-pointer border transition-all shrink-0 {selected ? 'border-blue-500 ring-2 ring-blue-200 scale-110' : 'border-blue-200 hover:border-blue-400'}"
                                style="background:{opt}"
                                onclick={() => toggleMale(key, opt)}
                                title={opt}
                              ></button>
                            {:else}
                              <button
                                class="flex flex-col items-center gap-0.5 cursor-pointer p-0.5 rounded-lg transition-all shrink-0 {selected ? 'bg-blue-100 ring-1 ring-blue-300' : 'hover:bg-blue-50'}"
                                onclick={() => toggleMale(key, opt)}
                                title={opt}
                              >
                                <div class="w-8 h-8 rounded overflow-hidden {selected ? 'ring-2 ring-blue-500' : 'ring-1 ring-blue-100'}">
                                  <DiceBearPart
                                    style={currentStyle}
                                    component={key}
                                    option={opt}
                                    size={thumbSize}
                                  />
                                </div>
                                <span class="text-[8px] text-blue-600 truncate max-w-10 leading-tight">{opt}</span>
                              </button>
                            {/if}
                          {/each}
                          {#if !isColorStyle && enumVals.length > 8}
                            <span class="w-8 h-8 flex items-center justify-center text-xs text-blue-300 font-medium shrink-0">
                              +{enumVals.length - 8}
                            </span>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            </section>
          {/if}

          <!-- Female -->
          {#if femaleParams.length > 0}
            <section>
              <h4
                class="text-sm font-bold mb-3 flex items-center gap-2"
              >
                <Icon icon="line-md:female" class="h-4 w-4 text-pink-500" />
                <span class="text-pink-700">女士</span>
                <span class="text-xs font-normal text-base-content/40 ml-auto">{femaleParams.length} 项</span>
              </h4>
              <div class="space-y-4">
                {#each [...groupByCategory(femaleParams)] as [cat, entries] (cat)}
                  <div class="p-3 rounded-lg bg-pink-50/30 border border-pink-100">
                    <div class="text-[10px] font-semibold text-pink-400 uppercase tracking-wider mb-2">{categoryLabel(cat)}</div>
                    {#each entries as [key, prop] (key)}
                      {@const values = editFemale[key] ?? []}
                      {@const enumVals = prop.items?.enum ?? []}
                      {@const isColorStyle = enumVals.length > 0 && isHexColor(enumVals[0]!)}
                      <div class="mb-2 last:mb-0">
                        <div class="text-xs text-pink-600/70 mb-1 font-medium flex items-center gap-1">
                          {paramLabel(key)}
                          <span class="text-pink-300 text-[9px] font-normal">({enumVals.length})</span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                          {#each isColorStyle ? enumVals : enumVals.slice(0, 8) as opt (opt)}
                            {@const selected = values.includes(opt)}
                            {#if isColorStyle}
                              <button
                                type="button"
                                class="w-6 h-6 rounded-full cursor-pointer border transition-all shrink-0 {selected ? 'border-pink-500 ring-2 ring-pink-200 scale-110' : 'border-pink-200 hover:border-pink-400'}"
                                style="background:{opt}"
                                onclick={() => toggleFemale(key, opt)}
                                title={opt}
                              ></button>
                            {:else}
                              <button
                                class="flex flex-col items-center gap-0.5 cursor-pointer p-0.5 rounded-lg transition-all shrink-0 {selected ? 'bg-pink-100 ring-1 ring-pink-300' : 'hover:bg-pink-50'}"
                                onclick={() => toggleFemale(key, opt)}
                                title={opt}
                              >
                                <div class="w-8 h-8 rounded overflow-hidden {selected ? 'ring-2 ring-pink-500' : 'ring-1 ring-pink-100'}">
                                  <DiceBearPart
                                    style={currentStyle}
                                    component={key}
                                    option={opt}
                                    size={thumbSize}
                                  />
                                </div>
                                <span class="text-[8px] text-pink-600 truncate max-w-10 leading-tight">{opt}</span>
                              </button>
                            {/if}
                          {/each}
                          {#if !isColorStyle && enumVals.length > 8}
                            <span class="w-8 h-8 flex items-center justify-center text-xs text-pink-300 font-medium shrink-0">
                              +{enumVals.length - 8}
                            </span>
                          {/if}
                        </div>
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            </section>
          {/if}
        </div>
      {/if}

    </div>

    <!-- Footer -->
    <div class="flex justify-between border-t border-base-300 px-6 py-4 bg-base-100">
      <button class="btn btn-ghost btn-sm gap-1" onclick={resetDefaults}>
        <Icon icon="line-md:refresh-twotone" class="h-3.5 w-3.5" />
        恢复默认
      </button>
      <div class="flex gap-2">
        <button class="btn btn-ghost btn-sm" onclick={handleCancel}>取消</button>
        <button class="btn btn-primary btn-sm gap-1" onclick={handleApply}>
          <Icon icon="line-md:confirm-twotone" class="h-3.5 w-3.5" />
          保存配置
        </button>
      </div>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<!-- Inline style for <style> is intentionally omitted — all styling uses Tailwind + daisyUI classes -->
