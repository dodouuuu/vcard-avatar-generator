<script lang="ts">
  /**
   * DiceBear v10 config panel modal with accordion layout.
   *
   * Each component and color gets its own collapsible panel with a
   * badge showing selected/total count — matching the DiceBear playground.
   */
  import type { Style } from '@dicebear/core'
  import { OptionsDescriptor } from '@dicebear/core'
  import Icon from '@iconify/svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { fly } from 'svelte/transition'

  import { buildFemaleDefaults, buildMaleDefaults, DEFAULT_BASE } from '../../config/dicebear'
  import type { StoredOptions } from '../../types'
  import AvatarImg from './AvatarImg.svelte'
  import AvatarOpt from './AvatarOpt.svelte'
  import { loadStyle } from './styles'

  /** Build OptionsDescriptor for a loaded style.
   *
   * @param style
   * @returns JSON-serializable descriptor object.
   */
  function buildDesc(style: Style) {
    return new OptionsDescriptor(style).toJSON()
  }

  /** Classify a descriptor key by suffix.
   *
   * @param key
   * @returns 'component' | 'color' | 'core'.
   */
  function fieldKind(key: string): string {
    if (key.endsWith('Variant') || key.endsWith('Probability')) {
      return 'component'
    }
    if (key.endsWith('Color')) {
      return 'color'
    }
    return 'core'
  }

  /** Convert a camelCase key to a readable label (e.g. "facialHair" → "Facial Hair").
   *
   * @param key
   * @returns Human-readable label string.
   */
  function readableKey(key: string): string {
    const base = key
      .replace(/Variant$/, '')
      .replace(/Probability$/, '')
      .replace(/Color$/, '')

    return base
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  interface Props {
    currentStyle: string
    baseOptions: StoredOptions
    maleOverrides: StoredOptions
    femaleOverrides: StoredOptions
    showPanel: boolean
    onApply: (base: StoredOptions, male: StoredOptions, female: StoredOptions) => void
    onClose: () => void
  }

  let {
    currentStyle,
    baseOptions,
    maleOverrides,
    femaleOverrides,
    showPanel = $bindable(false),
    onApply,
    onClose,
  }: Props = $props()

  let editBase = $state<StoredOptions>({})
  let editMale = $state<StoredOptions>({})
  let editFemale = $state<StoredOptions>({})

  let dialogEl: HTMLDialogElement | undefined = $state()

  let loadedStyle: Style | null = $state(null)
  let loading = $state(false)

  // Accordion open state — keyed by panel id. All panels open by default.
  let openPanels = new SvelteSet<string>()

  // Active gender tab
  let activeTab = $state<'male' | 'female'>('male')

  /**
   *
   * @param id
   */
  function togglePanel(id: string) {
    const next = new SvelteSet(openPanels)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    openPanels = next
  }

  /** Check if a panel is open.
   *
   * @param id
   * @returns Whether the panel is expanded.
   */
  function isPanelOpen(id: string): boolean {
    return openPanels.has(id)
  }

  // Load style when panel opens
  $effect(() => {
    if (!showPanel) {
      return
    }
    loading = true
    loadStyle(currentStyle)
      .then((s) => {
        loadedStyle = s
        loading = false
        editBase = { ...baseOptions }
        editMale =
          Object.keys(maleOverrides).length > 0 ? { ...maleOverrides } : buildMaleDefaults(s)
        editFemale =
          Object.keys(femaleOverrides).length > 0 ? { ...femaleOverrides } : buildFemaleDefaults(s)
        // Open all panels for the new style
        openPanels = new SvelteSet()
      })
      .catch((err) => {
        console.error('Failed to load style:', err)
        loading = false
      })
  })

  // Dialog open/close
  $effect(() => {
    if (!dialogEl) {
      return
    }
    if (showPanel) {
      dialogEl.showModal()
    } else {
      dialogEl.close()
    }
  })

  // Component variant fields from descriptor
  let componentFields = $derived.by(() => {
    if (!loadedStyle) {
      return [] as { key: string; label: string; values: string[] }[]
    }
    const desc = buildDesc(loadedStyle)
    const result: { key: string; label: string; values: string[] }[] = []
    for (const [key, field] of Object.entries(desc)) {
      if (fieldKind(key) !== 'component') {
        continue
      }
      if (!key.endsWith('Variant')) {
        continue
      }
      if (field.type === 'enum' && field.values) {
        result.push({ key, label: readableKey(key), values: field.values as string[] })
      }
    }
    return result
  })

  // All variant keys for isolation
  let allVariantKeys = $derived(componentFields.map((f) => f.key))

  // Color fields from descriptor
  let colorFields = $derived.by(() => {
    if (!loadedStyle) {
      return [] as { key: string; label: string; values: string[] }[]
    }
    const desc = buildDesc(loadedStyle)
    const result: { key: string; label: string; values: string[] }[] = []
    for (const [key] of Object.entries(desc)) {
      if (fieldKind(key) !== 'color') {
        continue
      }
      const name = key.replace(/Color$/, '')
      const colorDef = loadedStyle.colors().get(name)
      result.push({
        key,
        label: readableKey(name),
        values: colorDef ? [...colorDef.values()] : [],
      })
    }
    return result
  })

  // --- Core option presets ---
  const bgPresets = [
    { value: 'transparent', label: '透明' },
    { value: '#d4d4d8', label: '浅灰' },
    { value: '#a1a1aa', label: '中灰' },
    { value: '#52525b', label: '深灰' },
    { value: '#18181b', label: '暗黑' },
  ]

  const borderRadiusPresets = [
    { value: 50, label: '圆形' },
    { value: 20, label: '圆角' },
    { value: 0, label: '方形' },
  ]

  const scalePresets = [
    { value: 80, label: '80%' },
    { value: 100, label: '100%' },
    { value: 120, label: '120%' },
  ]

  const flipOptions = [
    { value: 'none', label: '无' },
    { value: 'horizontal', label: '水平' },
    { value: 'vertical', label: '垂直' },
    { value: 'both', label: '双向' },
  ]

  // --- Actions ---
  /**
   *
   * @param key
   * @param value
   */
  function setBase(key: string, value: unknown) {
    if (value === undefined) {
      const copy = { ...editBase }
      delete copy[key]
      editBase = copy
    } else {
      editBase = { ...editBase, [key]: value }
    }
  }

  /**
   *
   * @param key
   * @returns Current value as string.
   */
  function getBaseStr(key: string): string {
    const val = editBase[key]
    if (Array.isArray(val)) {
      return String(val[0] ?? '')
    }
    return String(val ?? '')
  }

  /**
   *
   * @param key
   * @returns Current value as number, or undefined.
   */
  function getBaseNum(key: string): number | undefined {
    const val = editBase[key]
    if (typeof val === 'number') {
      return val
    }
    if (typeof val === 'string') {
      const n = Number(val)
      return Number.isNaN(n) ? undefined : n
    }
    return undefined
  }

  /** Toggle a component variant selection.
   * @param edit
   * @param key
   * @param value
   * @returns {void} Nothing returned.
   */
  function toggleGender(edit: StoredOptions, key: string, value: string) {
    const current = (edit[key] as string[]) ?? []
    const idx = current.indexOf(value)
    const next = idx === -1 ? [...current, value] : current.filter((v) => v !== value)
    const updated = { ...edit, [key]: next }
    if (edit === editMale) {
      editMale = updated
    } else {
      editFemale = updated
    }
  }

  /** Toggle a color selection.
   * @param gender
   * @param key
   * @param value
   * @returns {void} Nothing returned.
   */
  function setColor(gender: 'male' | 'female', key: string, value: string) {
    const source = gender === 'male' ? editMale : editFemale
    const current = (source[key] as string[]) ?? []
    const idx = current.indexOf(value)
    const next = idx === -1 ? [...current, value] : current.filter((v) => v !== value)
    const updated = { ...source, [key]: next }
    if (gender === 'male') {
      editMale = updated
    } else {
      editFemale = updated
    }
  }

  /** Count of selected variants for a component, or total variants if none selected.
   *
   * @param edit
   * @param fieldKey
   * @param total
   * @returns Selected count number.
   */
  function componentSelectedCount(edit: StoredOptions, fieldKey: string, total: number): number {
    const val = edit[fieldKey]
    if (val === undefined || !Array.isArray(val)) {
      return total
    }
    if (val.length === 0) {
      return total
    }
    return val.length
  }

  /** Count of selected colors, or total palette size if none selected.
   *
   * @param edit
   * @param fieldKey
   * @param total
   * @returns Selected count number.
   */
  function colorSelectedCount(edit: StoredOptions, fieldKey: string, total: number): number {
    const val = edit[fieldKey]
    if (val === undefined || !Array.isArray(val)) {
      return total
    }
    if (val.length === 0) {
      return total
    }
    return val.length
  }

  /**
   *
   */
  function handleCancel() {
    onClose()
  }

  /**
   *
   */
  function handleApply() {
    onApply({ ...editBase }, { ...editMale }, { ...editFemale })
    onClose()
  }

  /**
   *
   */
  function resetDefaults() {
    editBase = { ...DEFAULT_BASE }
    if (loadedStyle) {
      editMale = buildMaleDefaults(loadedStyle)
      editFemale = buildFemaleDefaults(loadedStyle)
    }
    openPanels = new SvelteSet()
  }

  /**
   *
   */
  function onNativeClose() {
    if (showPanel) {
      onClose()
    }
  }
</script>

<dialog class="modal" class:modal-open={showPanel} bind:this={dialogEl} onclose={onNativeClose}>
  <div class="p-0">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
      <h3 class="flex items-center gap-2 text-lg font-bold">
        <AvatarImg styleName={currentStyle} options={{}} size={32} seed="panel-header" />
        <span class="ml-1">{currentStyle}</span>
      </h3>
      <button class="btn btn-ghost btn-sm btn-square" onclick={handleCancel}>✕</button>
    </div>

    <!-- Body -->
    <div class="max-h-[70vh] space-y-5 overflow-y-auto p-5">
      {#if loading}
        <div class="flex items-center justify-center py-8 text-base-content/50">
          加载风格配置中...
        </div>
      {:else if loadedStyle}
        <!-- Core Options -->
        <div class="rounded-box border border-base-300 bg-base-100/50 p-4">
          <h4 class="mb-3 text-xs font-bold uppercase tracking-wider text-base-content/40">外观</h4>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <!-- Background color -->
            <div>
              <div class="mb-1.5 text-xs font-medium text-base-content/60">底色</div>
              <div class="flex flex-wrap gap-1">
                {#each bgPresets as p (p.value)}
                  {@const current = getBaseStr('backgroundColor')}
                  {@const isTransparent = p.value === 'transparent'}
                  <button
                    type="button"
                    class="h-7 w-7 cursor-pointer rounded-full border transition-all
                      {current === p.value
                      ? 'scale-110 border-primary'
                      : 'border-base-300/40 hover:border-base-300'}"
                    style={isTransparent
                      ? 'background-image: repeating-conic-gradient(var(--color-base-300) 0% 25%, transparent 0% 50%); background-size: 8px 8px'
                      : `background:${p.value}`}
                    onclick={() =>
                      setBase(
                        'backgroundColor',
                        p.value === 'transparent' ? ['transparent'] : [p.value],
                      )}
                    title={p.label}
                  ></button>
                {/each}
              </div>
            </div>

            <!-- Border radius -->
            <div>
              <div class="mb-1.5 text-xs font-medium text-base-content/60">形状</div>
              <div class="flex flex-wrap gap-1">
                {#each borderRadiusPresets as p (p.value)}
                  {@const current = getBaseNum('borderRadius')}
                  <button
                    class="btn btn-xs {current === p.value ? 'btn-primary' : 'btn-ghost'}"
                    onclick={() => setBase('borderRadius', p.value)}>{p.label}</button
                  >
                {/each}
              </div>
            </div>

            <!-- Scale -->
            <div>
              <div class="mb-1.5 text-xs font-medium text-base-content/60">缩放</div>
              <div class="flex flex-wrap gap-1">
                {#each scalePresets as p (p.value)}
                  {@const current =
                    getBaseNum('scale') !== undefined ? getBaseNum('scale')! * 100 : 100}
                  <button
                    class="btn btn-xs {current === p.value ? 'btn-primary' : 'btn-ghost'}"
                    onclick={() => setBase('scale', p.value / 100)}>{p.label}</button
                  >
                {/each}
              </div>
            </div>

            <!-- Flip -->
            <div>
              <div class="mb-1.5 text-xs font-medium text-base-content/60">翻转</div>
              <div class="flex flex-wrap gap-1">
                {#each flipOptions as o (o.value)}
                  {@const current = getBaseStr('flip') || 'none'}
                  <button
                    class="btn btn-xs {current === o.value ? 'btn-primary' : 'btn-ghost'}"
                    onclick={() => setBase('flip', o.value)}>{o.label}</button
                  >
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Gender Tabs -->
        {#snippet genderContent(editRecord: StoredOptions, genderKey: 'male' | 'female')}
          <!-- Component accordion -->
          {#if componentFields.length > 0}
            <div class="mb-3 rounded-box border border-base-300 overflow-hidden">
              {#each componentFields as comp (comp.key)}
                {@const panelId = `${genderKey}-cmp-${comp.key}`}
                {@const open = isPanelOpen(panelId)}
                <div class="border-b border-base-300 last:border-b-0">
                  <!-- Header -->
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-base-100/60"
                    onclick={() => togglePanel(panelId)}
                  >
                    <!-- Chevron -->
                    <span
                      class="flex h-4 w-4 shrink-0 items-center justify-center text-base-content/30 transition-transform {open
                        ? 'rotate-90'
                        : ''}"
                    >
                      <Icon icon="line-md:chevron-right" class="h-3.5 w-3.5" />
                    </span>
                    <!-- Label -->
                    <span class="flex-1 text-sm font-semibold">{comp.label}</span>
                    <!-- Badge -->
                    <span
                      class="rounded-full bg-base-content/10 px-1.5 py-0.5 text-[11px] font-medium text-base-content/50"
                    >
                      {componentSelectedCount(editRecord, comp.key, comp.values.length)}/{comp
                        .values.length}
                    </span>
                  </button>
                  <!-- Content -->
                  {#if open}
                    <div class="px-3 pb-3">
                      <AvatarOpt
                        styleName={currentStyle}
                        style={loadedStyle!}
                        fieldKey={comp.key}
                        field={{ type: 'enum', values: comp.values, weighted: true }}
                        selected={(editRecord[comp.key] as string[]) ?? []}
                        {allVariantKeys}
                        onToggle={(k: string, v: string) => toggleGender(editRecord, k, v)}
                      />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <!-- Color accordion -->
          {#if colorFields.length > 0}
            <div class="rounded-box border border-base-300 overflow-hidden">
              {#each colorFields as color (color.key)}
                {@const panelId = `${genderKey}-clr-${color.key}`}
                {@const open = isPanelOpen(panelId)}
                <div class="border-b border-base-300 last:border-b-0">
                  <!-- Header -->
                  <button
                    class="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-base-100/60"
                    onclick={() => togglePanel(panelId)}
                  >
                    <span
                      class="flex h-4 w-4 shrink-0 items-center justify-center text-base-content/30 transition-transform {open
                        ? 'rotate-90'
                        : ''}"
                    >
                      <Icon icon="line-md:chevron-right" class="h-3.5 w-3.5" />
                    </span>
                    <span class="flex-1 text-sm font-semibold">{color.label}</span>
                    <span
                      class="rounded-full bg-base-content/10 px-1.5 py-0.5 text-[11px] font-medium text-base-content/50"
                    >
                      {colorSelectedCount(editRecord, color.key, color.values.length)}/{color.values
                        .length}
                    </span>
                  </button>
                  {#if open}
                    <div class="px-3 pb-3">
                      <AvatarOpt
                        styleName={currentStyle}
                        style={loadedStyle!}
                        fieldKey={color.key}
                        field={{ type: 'color', list: true }}
                        selected={(editRecord[color.key] as string[]) ?? []}
                        allVariantKeys={[]}
                        onToggle={(k: string, v: string) => setColor(genderKey, k, v)}
                      />
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        {/snippet}

        <!-- Gender Tabs box -->
        <div class="rounded-box border border-base-300 overflow-hidden">
          <!-- Tab buttons -->
          <div class="flex border-b border-base-300 bg-base-100/50">
            <button
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors
                {activeTab === 'male'
                ? 'text-primary border-b-2 border-primary -mb-0.5'
                : 'text-base-content/40 hover:text-base-content/60'}"
              style="margin-bottom:-2px"
              onclick={() => (activeTab = 'male')}
            >
              <Icon icon="line-md:male" class="h-4 w-4" />
              男士
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors
                {activeTab === 'female'
                ? 'text-primary border-b-2 border-primary -mb-0.5'
                : 'text-base-content/40 hover:text-base-content/60'}"
              style="margin-bottom:-2px"
              onclick={() => (activeTab = 'female')}
            >
              <Icon icon="line-md:female" class="h-4 w-4" />
              女士
            </button>
          </div>

          <!-- Tab content with slide animation -->
          {#key activeTab}
            <div in:fly={{ x: 12, duration: 200 }} class="p-4">
              {#if activeTab === 'male'}
                {@render genderContent(editMale, 'male')}
              {:else}
                {@render genderContent(editFemale, 'female')}
              {/if}
            </div>
          {/key}
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex justify-between border-t border-base-300 bg-base-100 px-6 py-4">
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
    <button class="hidden" onclick={handleCancel}>close</button>
  </form>
</dialog>
