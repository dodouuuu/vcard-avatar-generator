<script lang="ts">
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'
  import { SvelteMap } from 'svelte/reactivity'

  import DiceBearAvatar from '../components/DiceBearAvatar.svelte'
  import DiceBearPanel from '../components/DiceBearPanel.svelte'
  import { DEFAULT_COMMON, buildGenderConfig } from '../config/dicebear'
  import { type Contact, Gender } from '../types'

  interface Props {
    data: { contacts: Contact[] } | null
    onNavigate: (page: string, data?: unknown) => void
  }

  let { data: pageData, onNavigate }: Props = $props()

  let contacts = $state<Contact[]>(pageData?.contacts ?? [])

  /** Navigates back to the upload page. */
  function handleBack() {
    onNavigate('upload')
  }

  // -- Style list from @dicebear/collection --
  let styleKeys = $derived(
    Object.keys(collection).filter(
      (k) => typeof (collection as Record<string, unknown>)[k] === 'object',
    ),
  )

  // -- DiceBear state --
  let currentStyle = $state(styleKeys[0] ?? 'avataaars')
  let commonConfig = $state<Record<string, string>>({ ...DEFAULT_COMMON })
  let maleConfig = $state<Record<string, string[]>>({})
  let femaleConfig = $state<Record<string, string[]>>({})
  let showPanel = $state(false)

  // Initialize gender defaults when style changes
  $effect(() => {
    const style = currentStyle
    const entry = (
      collection as Record<string, { schema?: { properties?: Record<string, unknown> } }>
    )[style]
    const props = (entry?.schema?.properties ?? {}) as Record<
      string,
      { type?: string; items?: { enum?: string[] }; default?: unknown }
    >
    maleConfig = buildGenderConfig(props, 'male')
    femaleConfig = buildGenderConfig(props, 'female')
  })

  // -- Toast --
  let toastMsg = $state('')
  let toastVisible = $state(false)
  let toastTimer: ReturnType<typeof setTimeout> | undefined = $state()

  /**
   *
   * @param msg
   */
  function showToast(msg: string) {
    toastMsg = msg
    toastVisible = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible = false
    }, 2000)
  }

  /**
   * Get params for a contact based on gender.
   * @param gender
   */
  function configForGender(gender: Gender): Record<string, string | string[]> {
    if (gender === Gender.F) {
      return femaleConfig
    }
    return maleConfig
  }

  // -- table sorting --
  type SortKey = 'familyName' | 'givenName' | 'fn' | 'gender' | 'org' | null
  let sortKey = $state<SortKey>(null)
  let sortDir = $state<'asc' | 'desc'>('asc')

  const sortedContacts = $derived.by(() => {
    const key = sortKey
    if (!key) {
      return contacts
    }
    return [...contacts].sort((a, b) => {
      const aVal = String(a[key] ?? '')
      const bVal = String(b[key] ?? '')
      const cmp = aVal.localeCompare(bVal, 'zh-CN')
      return sortDir === 'asc' ? cmp : -cmp
    })
  })

  /**
   *
   * @param key
   */
  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDir = 'asc'
    }
  }

  /**
   *
   * @param key
   */
  function sortIcon(key: SortKey) {
    if (sortKey !== key) {
      return 'line-md:arrows-vertical'
    }
    return sortDir === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'
  }

  // -- Avatar regeneration --
  let regenerationSeeds = new SvelteMap<number, string>()

  /**
   *
   * @param contactIdx
   */
  function getSeed(contactIdx: number): string {
    return regenerationSeeds.get(contactIdx) ?? contacts[contactIdx]?.fn ?? 'default'
  }

  /**
   *
   * @param contactIdx
   * @param contact
   */
  function handleAvatarClick(contactIdx: number, contact: Contact) {
    const newSeed = `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const updated = new SvelteMap(regenerationSeeds)
    updated.set(contactIdx, newSeed)
    regenerationSeeds = updated
    showToast(`已重新生成 ${contact.fn} 的头像`)
  }

  /**
   *
   * @param common
   * @param male
   * @param female
   */
  function handleApplyConfig(
    common: Record<string, string>,
    male: Record<string, string[]>,
    female: Record<string, string[]>,
  ) {
    commonConfig = common
    maleConfig = male
    femaleConfig = female
    showToast('配置已保存')
  }

  /**
   * Regenerate all contact avatars with new random seeds.
   */
  function handleRegenerateAll() {
    const updated = new SvelteMap<number, string>()
    for (let i = 0; i < contacts.length; i++) {
      updated.set(i, `r${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    }
    regenerationSeeds = updated
    showToast(`已重新生成全部 ${contacts.length} 个头像`)
  }

  /**
   *
   */
  function handleClosePanel() {
    showPanel = false
  }


</script>

<div class="flex flex-1 flex-col px-6 pb-6">
  <!-- Header -->
  <div class="mb-3 flex items-center gap-4 pt-6">
    <button class="btn btn-ghost btn-square" onclick={handleBack} aria-label="返回上传">
      <Icon icon="line-md:arrow-left-twotone" class="h-6 w-6" />
    </button>
    <div>
      <h2 class="text-2xl font-bold">联系人编辑</h2>
      {#if pageData?.contacts}
        <p class="text-sm text-base-content/70">共 {pageData.contacts.length} 个联系人</p>
      {/if}
    </div>
  </div>

  <!-- DiceBear Style Bar (avatar thumbnails) -->
  <div class="mb-3 rounded-lg border border-base-300 bg-base-200/30 px-4 py-3">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs font-semibold text-base-content/60 uppercase tracking-wider"
        >🎨 头像风格</span
      >
      <span class="text-[10px] text-base-content/40">从 @dicebear/collection 动态读取</span>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-1">
      {#each styleKeys as key (key)}
        <button
          class="flex flex-col items-center gap-0.5 p-1.5 rounded-xl border-2 transition-all shrink-0 w-16
            {key === currentStyle
            ? 'border-primary bg-primary/10'
            : 'border-transparent hover:border-base-content/20'}"
          onclick={() => (currentStyle = key)}
          title={key}
        >
          <div class="w-10 h-10 rounded-full overflow-hidden bg-base-100 border border-base-300">
            <DiceBearAvatar style={key} params={{}} size={40} seed={key} />
          </div>
          <span class="text-[10px] text-base-content/60 truncate w-full text-center">{key}</span>
        </button>
      {/each}
    </div>
    <div class="mt-1 flex items-center gap-2 border-t border-base-300 pt-1.5">
      <button class="btn btn-xs btn-ghost gap-1" onclick={handleBack}>
        <Icon icon="line-md:chevron-double-left-twotone" class="h-3 w-3" />
        重新上传
      </button>
      <button class="btn btn-xs btn-ghost gap-1" onclick={handleRegenerateAll}>
        <Icon icon="line-md:refresh-twotone" class="h-3 w-3" />
        重新生成
      </button>
      <span class="flex-1"></span>
      <button class="btn btn-xs btn-ghost gap-1" onclick={() => (showPanel = true)}>
        <Icon icon="line-md:cog-twotone" class="h-3 w-3" />
        风格配置
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-x-auto border-base-300 rounded-md border-2 bg-base-100">
    <table class="table table-pin-rows table-xs table-zebra">
      <thead>
        <tr>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('familyName')}>
            <span class="flex items-center gap-1"
              >姓<Icon icon={sortIcon('familyName')} class="h-4 w-4 opacity-60" /></span
            >
          </th>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('givenName')}>
            <span class="flex items-center gap-1"
              >名<Icon icon={sortIcon('givenName')} class="h-4 w-4 opacity-60" /></span
            >
          </th>
          <th class="min-w-28 cursor-pointer select-none" onclick={() => toggleSort('fn')}>
            <span class="flex items-center gap-1"
              >姓名<Icon icon={sortIcon('fn')} class="h-4 w-4 opacity-60" /></span
            >
          </th>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('gender')}>
            <span class="flex items-center gap-1"
              >性别<Icon icon={sortIcon('gender')} class="h-4 w-4 opacity-60" /></span
            >
          </th>
          <th class="min-w-28 cursor-pointer select-none" onclick={() => toggleSort('org')}>
            <span class="flex items-center gap-1"
              >单位<Icon icon={sortIcon('org')} class="h-4 w-4 opacity-60" /></span
            >
          </th>
          <th class="min-w-36">手机号</th>
          <th class="sticky right-0 z-[1] bg-base-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)]"
            >头像</th
          >
        </tr>
      </thead>
      <tbody>
        {#each sortedContacts as contact, contactIdx (contactIdx)}
          <tr>
            <td class="min-w-20">
              <input
                class="input input-xs w-full"
                bind:value={contact.familyName}
                placeholder="姓"
              />
            </td>
            <td class="min-w-20">
              <input
                class="input input-xs w-full"
                bind:value={contact.givenName}
                placeholder="名"
              />
            </td>
            <td class="min-w-28">
              <input class="input input-xs w-full" bind:value={contact.fn} placeholder="姓名" />
            </td>
            <td class="min-w-20">
              <select class="select select-xs w-full" bind:value={contact.gender}>
                <option value={Gender.M}>男</option>
                <option value={Gender.F}>女</option>
                <option value={Gender.U}>未知</option>
              </select>
            </td>
            <td class="min-w-28">
              <input class="input input-xs w-full" bind:value={contact.org} placeholder="单位" />
            </td>
            <td class="min-w-36">
              {#if contact.tel.length === 0}
                <span class="text-base-content/40">—</span>
              {:else}
                <div class="flex flex-wrap gap-x-2">
                  {#each contact.tel as phone (phone.number)}
                    <span class="font-mono">{phone.number}</span>
                  {/each}
                </div>
              {/if}
            </td>
            <td class="sticky right-0 z-[1] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)]">
              <button
                class="avatar cursor-pointer bg-transparent border-none p-0"
                title="点击重新生成头像"
                aria-label="重新生成头像"
                onclick={() => handleAvatarClick(contactIdx, contact)}
              >
                <div class="w-10 rounded-full">
                  <DiceBearAvatar
                    style={currentStyle}
                    params={configForGender(contact.gender)}
                    seed={getSeed(contactIdx)}
                    size={80}
                  />
                </div>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<!-- DiceBear Config Panel -->
<DiceBearPanel
  {currentStyle}
  {commonConfig}
  {maleConfig}
  {femaleConfig}
  bind:showPanel
  onApply={handleApplyConfig}
  onClose={handleClosePanel}
/>

<!-- Toast -->
{#if toastVisible}
  <div class="toast toast-top toast-end z-50">
    <div class="alert alert-success">
      <Icon icon="line-md:confirm-twotone" class="h-4 w-4" />
      <span>{toastMsg}</span>
    </div>
  </div>
{/if}

<style>
  :global(.table-zebra thead tr th.sticky) {
    background: var(--color-base-100);
  }
  :global(.table-zebra tbody tr td.sticky) {
    background: var(--color-base-100);
  }
  :global(.table-zebra tbody tr:nth-child(even) td.sticky) {
    background: var(--color-base-200);
  }
</style>
