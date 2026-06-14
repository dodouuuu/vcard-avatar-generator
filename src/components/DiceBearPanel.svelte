<script lang="ts">
  /**
   * DiceBear config panel modal.
   *
   * daisyUI `<dialog class="modal">` for configuring DiceBear avatar parameters.
   * All style-specific options are read from @dicebear/collection schemas at runtime.
   * Options are displayed as visual previews (mini avatars or color swatches).
   */
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'

  import {
    COMMON_OPTIONS,
    DEFAULT_COMMON,
    filterParams,
    paramLabel,
  } from '../config/dicebear'
  import DiceBearAvatar from './DiceBearAvatar.svelte'

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
      editCommon = { ...commonConfig }
      editMale = { ...maleConfig }
      editFemale = { ...femaleConfig }
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
    editMale = {}
    editFemale = {}
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

  /** Preview avatar size for option thumbnails. */
  const thumbSize = 36
  /** Preview avatar size for bottom previews. */
  const size = 48
</script>

<dialog class="modal" bind:this={dialogEl} onclose={onNativeClose}>
  <div class="modal-box w-11/12 max-w-4xl p-0">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
      <h3 class="text-lg font-bold flex items-center gap-2">
        <Icon icon="line-md:cog-twotone" class="h-5 w-5" />
        {currentStyle} 参数配置
      </h3>
      <button class="btn btn-sm btn-circle btn-ghost" onclick={handleCancel}>✕</button>
    </div>

    <!-- Common config -->
    <div class="border-b border-base-200 bg-base-200/30 px-6 py-4">
      <h4
        class="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1"
      >
        <Icon icon="line-md:cog-twotone" class="h-3.5 w-3.5" />
        公共配置
      </h4>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3">
        {#each COMMON_OPTIONS as opt (opt.key)}
          {@const val = editCommon[opt.key as string] ?? DEFAULT_COMMON[opt.key as string] ?? ''}
          <div>
            <div class="text-xs text-base-content/60 mb-1">{opt.label}</div>
            {#if opt.type === 'color'}
              <div class="flex flex-wrap gap-1">
                <span
                  class="w-6 h-6 rounded-full cursor-pointer border-2 {val === 'transparent'
                    ? 'border-amber-500'
                    : 'border-transparent'}"
                  style="background:transparent"
                  role="button"
                  tabindex="0"
                  onclick={() => setCommon(opt.key as string, 'transparent')}
                  onkeydown={(e) =>
                    e.key === 'Enter' && setCommon(opt.key as string, 'transparent')}
                  title="transparent"
                ></span>
                {#each ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] as color (color)}
                  <span
                    class="w-6 h-6 rounded-full cursor-pointer border-2 {val === color
                      ? 'border-amber-500'
                      : 'border-transparent'} hover:border-base-content/30"
                    style="background:{color}"
                    role="button"
                    tabindex="0"
                    onclick={() => setCommon(opt.key as string, color)}
                    onkeydown={(e) => e.key === 'Enter' && setCommon(opt.key as string, color)}
                  ></span>
                {/each}
              </div>
            {:else if opt.type === 'toggle'}
              <div class="flex gap-1">
                <button
                  class="btn btn-xs {val === 'false' ? 'btn-primary' : 'btn-ghost'}"
                  onclick={() => setCommon(opt.key as string, 'false')}>正常</button
                >
                <button
                  class="btn btn-xs {val === 'true' ? 'btn-primary' : 'btn-ghost'}"
                  onclick={() => setCommon(opt.key as string, 'true')}
                  ><Icon icon="line-md:arrow-left-right" class="h-3 w-3" /></button
                >
              </div>
            {:else}
              <div class="flex gap-1 flex-wrap">
                {#each opt.options ?? [] as o (o.value)}
                  <button
                    class="btn btn-xs {val === o.value ? 'btn-primary' : 'btn-ghost'}"
                    onclick={() => setCommon(opt.key as string, o.value)}>{o.label}</button
                  >
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Gender params — only shown when a gender has parameters -->
    {#if maleParams.length > 0 || femaleParams.length > 0}
      <div
        class="grid grid-cols-1 {maleParams.length > 0 && femaleParams.length > 0
          ? 'md:grid-cols-2'
          : ''} gap-4 p-6"
      >
        <!-- Male -->
        {#if maleParams.length > 0}
          <div class="rounded-lg border border-blue-200 bg-blue-50/40 p-4">
            <h4 class="text-sm font-bold text-blue-700 mb-3 flex items-center gap-1.5">
              <Icon icon="line-md:male" class="h-4 w-4" />
              男士参数
              <span class="text-xs text-blue-400 font-normal ml-auto">{maleParams.length} 项</span>
            </h4>
            {#each maleParams as [key, prop] (key)}
              {@const values = editMale[key] ?? []}
              {@const enumVals = prop.items?.enum ?? []}
              {@const isColorStyle = enumVals.length > 0 && isHexColor(enumVals[0]!)}
              <div class="mb-3">
                <div class="text-xs text-blue-600/70 mb-1.5 font-medium flex items-center gap-1">
                  {paramLabel(key)}
                  <span class="text-blue-300 text-[10px] font-normal">({enumVals.length} 选)</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  {#each isColorStyle ? enumVals : enumVals.slice(0, 8) as opt (opt)}
                    {@const selected = values.includes(opt)}
                    {#if isColorStyle}
                      <button
                        type="button"
                        class="w-7 h-7 rounded-full cursor-pointer border-2 transition-all
                          {selected
                          ? 'border-blue-600 ring-2 ring-blue-300 scale-110'
                          : 'border-blue-200 hover:border-blue-400'}"
                        style="background:{opt}"
                        onclick={() => toggleMale(key, opt)}
                        title={opt}
                      ></button>
                    {:else}
                      <button
                        class="flex flex-col items-center gap-0.5 cursor-pointer p-0.5 rounded-lg transition-all
                          {selected
                          ? 'bg-blue-100 ring-1 ring-blue-400'
                          : 'hover:bg-blue-50'}"
                        onclick={() => toggleMale(key, opt)}
                        title={opt}
                      >
                        <div
                          class="w-9 h-9 rounded overflow-hidden {selected
                            ? 'ring-2 ring-blue-600'
                            : 'ring-1 ring-blue-200'}"
                        >
                          <DiceBearAvatar
                            style={currentStyle}
                            params={{ ...editMale, [key]: [opt] }}
                            seed={`preview-${key}-${opt}`}
                            size={thumbSize}
                          />
                        </div>
                        <span
                          class="text-[9px] text-blue-700 truncate max-w-12 leading-tight"
                          >{opt}</span
                        >
                      </button>
                    {/if}
                  {/each}
                  {#if !isColorStyle && enumVals.length > 8}
                    <span
                      class="w-9 h-9 flex items-center justify-center text-xs text-blue-400 font-medium"
                    >
                      +{enumVals.length - 8}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Female -->
        {#if femaleParams.length > 0}
          <div class="rounded-lg border border-pink-200 bg-pink-50/40 p-4">
            <h4 class="text-sm font-bold text-pink-700 mb-3 flex items-center gap-1.5">
              <Icon icon="line-md:female" class="h-4 w-4" />
              女士参数
              <span class="text-xs text-pink-400 font-normal ml-auto">{femaleParams.length} 项</span>
            </h4>
            {#each femaleParams as [key, prop] (key)}
              {@const values = editFemale[key] ?? []}
              {@const enumVals = prop.items?.enum ?? []}
              {@const isColorStyle = enumVals.length > 0 && isHexColor(enumVals[0]!)}
              <div class="mb-3">
                <div class="text-xs text-pink-600/70 mb-1.5 font-medium flex items-center gap-1">
                  {paramLabel(key)}
                  <span class="text-pink-300 text-[10px] font-normal">({enumVals.length} 选)</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  {#each isColorStyle ? enumVals : enumVals.slice(0, 8) as opt (opt)}
                    {@const selected = values.includes(opt)}
                    {#if isColorStyle}
                      <button
                        type="button"
                        class="w-7 h-7 rounded-full cursor-pointer border-2 transition-all
                          {selected
                          ? 'border-pink-600 ring-2 ring-pink-300 scale-110'
                          : 'border-pink-200 hover:border-pink-400'}"
                        style="background:{opt}"
                        onclick={() => toggleFemale(key, opt)}
                        title={opt}
                      ></button>
                    {:else}
                      <button
                        class="flex flex-col items-center gap-0.5 cursor-pointer p-0.5 rounded-lg transition-all
                          {selected
                          ? 'bg-pink-100 ring-1 ring-pink-400'
                          : 'hover:bg-pink-50'}"
                        onclick={() => toggleFemale(key, opt)}
                        title={opt}
                      >
                        <div
                          class="w-9 h-9 rounded overflow-hidden {selected
                            ? 'ring-2 ring-pink-600'
                            : 'ring-1 ring-pink-200'}"
                        >
                          <DiceBearAvatar
                            style={currentStyle}
                            params={{ ...editFemale, [key]: [opt] }}
                            seed={`preview-${key}-${opt}`}
                            size={thumbSize}
                          />
                        </div>
                        <span
                          class="text-[9px] text-pink-700 truncate max-w-12 leading-tight"
                          >{opt}</span
                        >
                      </button>
                    {/if}
                  {/each}
                  {#if !isColorStyle && enumVals.length > 8}
                    <span
                      class="w-9 h-9 flex items-center justify-center text-xs text-pink-400 font-medium"
                    >
                      +{enumVals.length - 8}
                    </span>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Preview -->
    <div class="mx-6 mb-4 flex justify-center gap-8 p-3 bg-base-200 rounded-lg">
      <div class="text-center">
        <div class="text-xs text-base-content/60 mb-1">男士预览</div>
        <div
          class="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-blue-300 mx-auto"
        >
          <DiceBearAvatar style={currentStyle} params={editMale} seed="preview" {size} />
        </div>
      </div>
      <div class="text-center">
        <div class="text-xs text-base-content/60 mb-1">女士预览</div>
        <div
          class="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-pink-300 mx-auto"
        >
          <DiceBearAvatar style={currentStyle} params={editFemale} seed="preview" {size} />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between border-t border-base-300 px-6 py-4">
      <button class="btn btn-ghost btn-sm" onclick={resetDefaults}>
        <Icon icon="line-md:refresh-twotone" class="h-4 w-4" />
        恢复默认
      </button>
      <div class="flex gap-2">
        <button class="btn btn-ghost" onclick={handleCancel}>取消</button>
        <button class="btn btn-primary" onclick={handleApply}>
          <Icon icon="line-md:confirm-twotone" class="h-4 w-4" />
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
