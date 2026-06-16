<script lang="ts">
  import Icon from '@iconify/svelte'
  import { onMount } from 'svelte'
  import { SvelteMap } from 'svelte/reactivity'

  import AvatarImg from '../components/avatar/AvatarImg.svelte'
  import AvatarPanel from '../components/avatar/AvatarPanel.svelte'
  import { DEFAULT_BASE } from '../config/dicebear'
  import dicebearHeader from '../generated/dicebear-header.svg?raw'
  import { STYLE_NAMES } from '../generated/dicebear-styles'
  import { type Contact, Gender, type StoredOptions } from '../types'
  import { generateVcf } from '../utils/contact-writer'

  interface Props {
    data: { contacts: Contact[] } | null
    onNavigate: (page: string, data?: unknown) => void
  }

  let { data: pageData, onNavigate }: Props = $props()

  let contacts = $derived(pageData?.contacts ?? [])

  /**
   *
   */
  function handleBack() {
    onNavigate('upload')
  }

  // -- Style list --
  let styleKeys = STYLE_NAMES

  // -- DiceBear state --
  let currentStyle = $state(styleKeys[0] ?? 'avataaars')
  let baseOptions = $state<StoredOptions>({ ...DEFAULT_BASE })
  let maleOverrides = $state<StoredOptions>({})
  let femaleOverrides = $state<StoredOptions>({})
  let showPanel = $state(false)

  /**
   * Merge base options with gender-specific overrides for rendering.
   *
   * @param gender
   * @returns Merged StoredOptions for the given gender.
   */
  function configForGender(gender: Gender): StoredOptions {
    const overrides = gender === Gender.F ? femaleOverrides : maleOverrides
    return { ...baseOptions, ...overrides }
  }

  // -- table sorting --
  type SortKey = 'familyName' | 'givenName' | 'fn' | 'gender' | 'org' | null
  let sortKey = $state<SortKey>(null)
  let sortDir = $state<'asc' | 'desc'>('asc')

  /**
   * Sorted contacts with cached sort state
   * @returns sorted contacts array
   */
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
   * Get sort direction icon
   * @param key
   * @returns icon name string
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
   * Get seed for a contact avatar
   * @param contactIdx - contact index
   * @returns seed string
   */
  function getSeed(contactIdx: number): string {
    return regenerationSeeds.get(contactIdx) ?? contacts[contactIdx]?.fn ?? 'default'
  }

  /**
   * Regenerate avatar for a contact
   * @param contactIdx - contact index
   * @returns void
   */
  function handleAvatarClick(contactIdx: number) {
    const newSeed = `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const updated = new SvelteMap(regenerationSeeds)
    updated.set(contactIdx, newSeed)
    regenerationSeeds = updated
  }

  /**
   * Apply config changes from the panel
   * @param common
   * @param base
   * @param male
   * @param female
   * @returns void
   */
  function handleApplyConfig(base: StoredOptions, male: StoredOptions, female: StoredOptions) {
    baseOptions = base
    maleOverrides = male
    femaleOverrides = female
  }

  /**
   *
   */
  function handleRegenerateAll() {
    const updated = new SvelteMap<number, string>()
    for (let i = 0; i < contacts.length; i++) {
      updated.set(i, `r${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    }
    regenerationSeeds = updated
  }

  /**
   *
   */
  function handleClosePanel() {
    showPanel = false
  }

  /**
   *
   */
  function handleDownload() {
    const vcf = generateVcf(contacts)
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts.vcf'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Inject the DiceBear SVG sprite into the DOM for <use> references
  onMount(() => {
    const wrapper = document.createElement('div')
    wrapper.style.display = 'none'
    wrapper.innerHTML = dicebearHeader
    document.body.appendChild(wrapper)
    return () => wrapper.remove()
  })
</script>

<div class="flex flex-1 flex-col p-6">
  <!-- Header + Style Bar: sticky -->
  <div class="sticky top-0 z-20 mb-6 rounded-box border border-base-300 bg-base-100">
    <!-- Title row: title + count, flush left -->
    <div class="flex items-center gap-1 pt-4 pb-3 pl-4 pr-4">
      <h2 class="text-lg font-bold">联系人编辑</h2>
      {#if pageData?.contacts}
        <span class="text-sm text-base-content/50">共 {pageData.contacts.length} 个联系人</span>
      {/if}
    </div>

    <!-- Style bar (no label) -->
    <div class="px-4 pb-3">
      <div class="flex gap-2 overflow-x-auto pb-1">
        {#each styleKeys as key (key)}
          <button
            class="flex shrink-0 flex-col items-center border transition-all cursor-pointer
              {key === currentStyle
              ? 'border-primary bg-primary/10'
              : 'border-transparent hover:border-base-content/20'}"
            onclick={() => (currentStyle = key)}
            title={key}
          >
            <div class="h-10 w-10 overflow-hidden rounded-none">
              <svg width="40" height="40">
                <use href="#{key.replace(/[^a-zA-Z0-9-]/g, '-')}" />
              </svg>
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-4 border-t border-base-300"></div>

    <!-- Button row: left group + right "风格配置" -->
    <div class="flex items-center justify-between px-4 pb-4 pt-3">
      <div class="flex items-center gap-2">
        <button class="btn btn-outline btn-xs" onclick={handleBack}> 重新上传 </button>
        <button class="btn btn-outline btn-xs" onclick={handleRegenerateAll}> 重新生成 </button>
        <button class="btn btn-outline btn-xs" onclick={handleDownload}> 下载通讯录 </button>
      </div>
      <button class="btn btn-outline btn-xs" onclick={() => (showPanel = true)}> 风格配置 </button>
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-x-auto rounded-box border border-base-300">
    <table class="table table-xs table-zebra">
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
              <input class="input input-xs" bind:value={contact.familyName} placeholder="姓" />
            </td>
            <td class="min-w-20">
              <input class="input input-xs" bind:value={contact.givenName} placeholder="名" />
            </td>
            <td class="min-w-28">
              <input class="input input-xs" bind:value={contact.fn} placeholder="姓名" />
            </td>
            <td class="min-w-20">
              <select class="select select-xs" bind:value={contact.gender}>
                <option value={Gender.M}>男</option>
                <option value={Gender.F}>女</option>
                <option value={Gender.U}>未知</option>
              </select>
            </td>
            <td class="min-w-28">
              <input class="input input-xs" bind:value={contact.org} placeholder="单位" />
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
                class="cursor-pointer border-none bg-transparent p-0"
                title="点击重新生成头像"
                aria-label="重新生成头像"
                onclick={() => handleAvatarClick(contactIdx)}
              >
                <div class="w-10">
                  <AvatarImg
                    styleName={currentStyle}
                    options={configForGender(contact.gender)}
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

<!-- Avatar Config Panel -->
<AvatarPanel
  {currentStyle}
  {baseOptions}
  {maleOverrides}
  {femaleOverrides}
  bind:showPanel
  onApply={handleApplyConfig}
  onClose={handleClosePanel}
/>
