<script lang="ts">
  /**
   * DiceBear config panel modal.
   *
   * daisyUI `<dialog class="modal">` for configuring DiceBear avatar parameters.
   * All style-specific options are read from @dicebear/collection schemas at runtime.
   * The UI is entirely schema-driven — no hardcoded param lists or duplicate gender templates.
   */
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'

  import type { SchemaProp } from '../config/dicebear'
  import {
    buildGenderConfig,
    classifyParam,
    COMMON_OPTIONS,
    DEFAULT_COMMON,
    filterParams,
  } from '../config/dicebear'
  import AvatarImg from './AvatarImg.svelte'
  import AvatarOpt from './AvatarOpt.svelte'

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

  /** Extract schema properties from the current style. */
  let schemaProps = $derived.by(() => {
    const entry = (
      collection as Record<string, { schema?: { properties?: Record<string, unknown> } }>
    )[currentStyle]
    if (!entry?.schema?.properties) {
      return {}
    }
    return entry.schema.properties as Record<string, SchemaProp>
  })

  /** Male and female filtered params (derived from schema). */
  let maleParams = $derived(filterParams(schemaProps, 'male'))
  let femaleParams = $derived(filterParams(schemaProps, 'female'))

  /** All component-type param keys from the current style schema.
   *  Used to render isolated part previews by emptying other components. */
  let allComponentKeys = $derived.by(() => {
    const keys: string[] = []
    for (const [key, prop] of Object.entries(schemaProps)) {
      if (classifyParam(key, prop as SchemaProp) === 'component') {
        keys.push(key)
      }
    }
    return keys
  })

  /** Initialize edit copies when dialog opens. */
  $effect(() => {
    if (!dialogEl || !showPanel) {
      return
    }

    editCommon = { ...commonConfig }
    editMale =
      Object.keys(maleConfig).length > 0
        ? { ...maleConfig }
        : buildGenderConfig(schemaProps, 'male')
    editFemale =
      Object.keys(femaleConfig).length > 0
        ? { ...femaleConfig }
        : buildGenderConfig(schemaProps, 'female')
  })

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
    onApply({ ...editCommon }, { ...editMale }, { ...editFemale })
    onClose()
  }

  /**
   * Toggle a value in a multi-select param for a given gender.
   * @param gender
   * @param key
   * @param value
   */
  function toggleGender(gender: 'male' | 'female', key: string, value: string) {
    const source = gender === 'male' ? editMale : editFemale
    const current = source[key] ?? []
    const idx = current.indexOf(value)
    const next = idx === -1 ? [...current, value] : current.filter((v) => v !== value)
    const updated = { ...source, [key]: next }
    if (gender === 'male') {
      editMale = updated
    } else {
      editFemale = updated
    }
  }

  /**
   *
   * @param key
   * @param value
   */
  function setCommon(key: string, value: string) {
    editCommon = { ...editCommon, [key]: value }
  }

  /**
   *
   */
  function resetDefaults() {
    editCommon = { ...DEFAULT_COMMON }
    editMale = buildGenderConfig(schemaProps, 'male')
    editFemale = buildGenderConfig(schemaProps, 'female')
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

<dialog class="modal" bind:this={dialogEl} onclose={onNativeClose}>
  <div class="modal-box w-11/12 max-w-5xl p-0">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-base-300 px-6 py-4">
      <h3 class="text-lg font-bold flex items-center gap-2">
        <AvatarImg style={currentStyle} params={{}} seed="panel-header" size={32} />
        <span class="ml-1">{currentStyle}</span>
      </h3>
      <button class="btn btn-circle btn-ghost btn-sm" onclick={handleCancel}>✕</button>
    </div>

    <!-- Body -->
    <div class="max-h-[70vh] space-y-6 overflow-y-auto p-6">
      <!-- Common Config Section -->
      <section>
        <h4 class="mb-3 flex items-center gap-2 text-sm font-bold text-base-content/80">
          <Icon icon="line-md:cog-twotone" class="h-4 w-4 text-amber-500" />
          外观配置
          <span class="ml-1 text-xs font-normal text-base-content/40">底色/形状/裁切</span>
        </h4>
        <div
          class="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-base-200 bg-base-200/40 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {#each COMMON_OPTIONS as opt (opt.key)}
            {@const key = opt.key as string}
            {@const val = editCommon[key] ?? DEFAULT_COMMON[key] ?? ''}
            <div>
              <div class="mb-1.5 text-xs font-medium text-base-content/60">{opt.label}</div>
              {#if opt.type === 'color'}
                <div class="flex flex-wrap gap-1">
                  {#each opt.options ?? [] as o (o.value)}
                    {@const isTransparent = o.value === 'transparent'}
                    <button
                      type="button"
                      class="h-7 w-7 cursor-pointer rounded-full border-2 transition-all
                        {val === o.value
                        ? 'border-primary scale-110'
                        : 'border-base-content/15 hover:border-base-content/40'}"
                      style={isTransparent
                        ? 'background-image: repeating-conic-gradient(var(--color-base-300) 0% 25%, transparent 0% 50%); background-size: 8px 8px'
                        : `background:${o.value}`}
                      onclick={() => setCommon(key, o.value)}
                      title={o.label}
                    ></button>
                  {/each}
                </div>
              {:else if opt.type === 'toggle'}
                <div class="flex gap-1">
                  <button
                    class="btn btn-xs {val === 'false' ? 'btn-primary' : 'btn-ghost btn-outline'}"
                    onclick={() => setCommon(key, 'false')}
                  >
                    关闭
                  </button>
                  <button
                    class="btn btn-xs {val === 'true' ? 'btn-primary' : 'btn-ghost btn-outline'}"
                    onclick={() => setCommon(key, 'true')}
                  >
                    开启
                  </button>
                </div>
              {:else}
                <div class="flex flex-wrap gap-1">
                  {#each opt.options ?? [] as o (o.value)}
                    <button
                      class="btn btn-xs {val === o.value ? 'btn-primary' : 'btn-ghost btn-outline'}"
                      onclick={() => setCommon(key, o.value)}>{o.label}</button
                    >
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>

      <!-- Gender Config Sections (schema-driven, no duplication) -->
      {#snippet genderSection(
        label: string,
        icon: string,
        params: [string, SchemaProp][],
        edit: Record<string, string[]>,
        genderKey: 'male' | 'female',
      )}
        <section>
          <h4 class="mb-3 flex items-center gap-2 text-sm font-bold">
            <Icon {icon} class="h-4 w-4" />
            <span>{label}</span>
            <span class="ml-auto text-xs font-normal text-base-content/40">
              {params.length} 项
            </span>
          </h4>
          <div class="space-y-3">
            {#each params as [key, prop] (key)}
              <AvatarOpt
                style={currentStyle}
                paramKey={key}
                schemaProp={prop}
                selected={edit[key] ?? []}
                {allComponentKeys}
                onToggle={(k: string, v: string) => toggleGender(genderKey, k, v)}
              />
            {/each}
          </div>
        </section>
      {/snippet}

      {#if maleParams.length > 0 || femaleParams.length > 0}
        <div
          class="grid grid-cols-1 gap-6 {maleParams.length > 0 && femaleParams.length > 0
            ? 'md:grid-cols-2'
            : ''}"
        >
          {#if maleParams.length > 0}
            {@render genderSection('男士', 'line-md:male', maleParams, editMale, 'male')}
          {/if}
          {#if femaleParams.length > 0}
            {@render genderSection('女士', 'line-md:female', femaleParams, editFemale, 'female')}
          {/if}
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
    <button>close</button>
  </form>
</dialog>
