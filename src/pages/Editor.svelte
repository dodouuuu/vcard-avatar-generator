<script lang="ts">
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'
  import { SvelteMap } from 'svelte/reactivity'

  import AvatarCfg from '../components/AvatarCfg.svelte'
  import AvatarImg from '../components/AvatarImg.svelte'
  import { buildGenderConfig, DEFAULT_COMMON } from '../config/dicebear'
  import { type Contact, Gender } from '../types'
  import { generateVcf } from '../utils/contact-writer'

  interface Props {
    data: { contacts: Contact[] } | null
    onNavigate: (page: string, data?: unknown) => void
  }

  let { data: pageData, onNavigate }: Props = $props()

  let contacts = $state<Contact[]>(pageData?.contacts ?? [])

  /**
   *
   */
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

  /**
   * Build DiceBear params for a given gender
   * @param gender
   * @returns merged config object for avatar rendering
   */
  function configForGender(gender: Gender): Record<string, string | string[] | boolean | number> {
    const genderCfg = gender === Gender.F ? femaleConfig : maleConfig
    const common: Record<string, unknown> = { ...commonConfig }
    for (const key of Object.keys(common)) {
      const val = common[key]
      if (key === 'flip' || key === 'clip') {
        common[key] = val === 'true'
      } else if (key === 'rotate' || key === 'scale' || key === 'radius') {
        common[key] = Number(val)
      } else if (key === 'backgroundColor' || key === 'backgroundType') {
        common[key] = [val]
      }
    }
    return { ...common, ...genderCfg } as Record<string, string | string[] | boolean | number>
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
   * Get current seed for a contact avatar
   * @param contactIdx
   * @returns seed string
   */
  function getSeed(contactIdx: number): string {
    return regenerationSeeds.get(contactIdx) ?? contacts[contactIdx]?.fn ?? 'default'
  }

  /**
   *
   * @param contactIdx
   */
  function handleAvatarClick(contactIdx: number) {
    const newSeed = `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const updated = new SvelteMap(regenerationSeeds)
    updated.set(contactIdx, newSeed)
    regenerationSeeds = updated
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
</script>

<div class="flex flex-1 flex-col p-6">
  <!-- Header + Style Bar: sticky -->
  <div class="sticky-top mb-6 rounded-[18px] border-2 border-border bg-surface">
    <!-- Title row: back + title + count, flush left -->
    <div class="flex items-center gap-1 pt-4 pb-3 pl-0 pr-4">
      <button
        class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-text/60 hover:text-text"
        onclick={handleBack}
        aria-label="返回上传"
      >
        <Icon icon="line-md:arrow-left-twotone" class="h-4 w-4" />
      </button>
      <h2 class="text-lg font-bold">联系人编辑</h2>
      {#if pageData?.contacts}
        <span class="text-sm text-text/50">共 {pageData.contacts.length} 个联系人</span>
      {/if}
    </div>

    <!-- Style bar (no label) -->
    <div class="px-4 pb-3">
      <div class="flex gap-2 overflow-x-auto pb-1">
        {#each styleKeys as key (key)}
          <button
            class="flex shrink-0 flex-col items-center border-2 transition-all cursor-pointer
              {key === currentStyle
              ? 'border-primary bg-primary/10'
              : 'border-transparent hover:border-text/20'}"
            onclick={() => (currentStyle = key)}
            title={key}
          >
            <div class="h-10 w-10 overflow-hidden rounded-none">
              <AvatarImg style={key} params={{}} size={40} seed={key} />
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Divider -->
    <div class="mx-4 border-t-2 border-border"></div>

    <!-- Button row: left group + right "风格配置" -->
    <div class="flex items-center justify-between px-4 pb-4 pt-3">
      <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-xs gap-1" onclick={handleBack}>
          <Icon icon="line-md:chevron-double-left-twotone" class="h-3 w-3" />
          重新上传
        </button>
        <button class="btn btn-ghost btn-xs gap-1" onclick={handleRegenerateAll}>
          <Icon icon="line-md:refresh-twotone" class="h-3 w-3" />
          重新生成
        </button>
        <button class="btn btn-ghost btn-xs" onclick={handleDownload}> 下载通讯录 </button>
      </div>
      <button class="btn btn-ghost btn-xs gap-1" onclick={() => (showPanel = true)}>
        <Icon icon="line-md:cog-twotone" class="h-3 w-3" />
        风格配置
      </button>
    </div>
  </div>

  <!-- Table -->
  <div class="table-cartoon">
    <table class="w-full">
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
          <th class="sticky right-0 z-[1] bg-surface shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)]"
            >头像</th
          >
        </tr>
      </thead>
      <tbody>
        {#each sortedContacts as contact, contactIdx (contactIdx)}
          <tr>
            <td class="min-w-20">
              <input class="input-cartoon" bind:value={contact.familyName} placeholder="姓" />
            </td>
            <td class="min-w-20">
              <input class="input-cartoon" bind:value={contact.givenName} placeholder="名" />
            </td>
            <td class="min-w-28">
              <input class="input-cartoon" bind:value={contact.fn} placeholder="姓名" />
            </td>
            <td class="min-w-20">
              <select class="select-cartoon" bind:value={contact.gender}>
                <option value={Gender.M}>男</option>
                <option value={Gender.F}>女</option>
                <option value={Gender.U}>未知</option>
              </select>
            </td>
            <td class="min-w-28">
              <input class="input-cartoon" bind:value={contact.org} placeholder="单位" />
            </td>
            <td class="min-w-36">
              {#if contact.tel.length === 0}
                <span class="text-text/40">—</span>
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

<!-- Avatar Config Panel -->
<AvatarCfg
  {currentStyle}
  {commonConfig}
  {maleConfig}
  {femaleConfig}
  bind:showPanel
  onApply={handleApplyConfig}
  onClose={handleClosePanel}
/>
