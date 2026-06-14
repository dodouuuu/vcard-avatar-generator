<script lang="ts">
  import * as collection from '@dicebear/collection'
  import Icon from '@iconify/svelte'
  import { SvelteMap } from 'svelte/reactivity'

  import AvatarCfg from '../components/AvatarCfg.svelte'
  import AvatarImg from '../components/AvatarImg.svelte'
  import { buildGenderConfig, DEFAULT_COMMON } from '../config/dicebear'
  import { type Contact, Gender } from '../types'

  interface Props {
    data: { contacts: Contact[] } | null
    onNavigate: (page: string, data?: unknown) => void
  }

  let { data: pageData, onNavigate }: Props = $props()

  let contacts = $state<Contact[]>(pageData?.contacts ?? [])

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

  function showToast(msg: string) {
    toastMsg = msg
    toastVisible = true
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastVisible = false
    }, 2000)
  }

  // -- Build params for a contact --
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
    if (!key) return contacts
    return [...contacts].sort((a, b) => {
      const aVal = String(a[key] ?? '')
      const bVal = String(b[key] ?? '')
      const cmp = aVal.localeCompare(bVal, 'zh-CN')
      return sortDir === 'asc' ? cmp : -cmp
    })
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey = key
      sortDir = 'asc'
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return 'line-md:arrows-vertical'
    return sortDir === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'
  }

  // -- Avatar regeneration --
  let regenerationSeeds = new SvelteMap<number, string>()

  function getSeed(contactIdx: number): string {
    return regenerationSeeds.get(contactIdx) ?? contacts[contactIdx]?.fn ?? 'default'
  }

  function handleAvatarClick(contactIdx: number, contact: Contact) {
    const newSeed = `r${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const updated = new SvelteMap(regenerationSeeds)
    updated.set(contactIdx, newSeed)
    regenerationSeeds = updated
    showToast(`已重新生成 ${contact.fn} 的头像`)
  }

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

  function handleRegenerateAll() {
    const updated = new SvelteMap<number, string>()
    for (let i = 0; i < contacts.length; i++) {
      updated.set(i, `r${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    }
    regenerationSeeds = updated
    showToast(`已重新生成全部 ${contacts.length} 个头像`)
  }

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
        <p class="text-sm text-text/70">共 {pageData.contacts.length} 个联系人</p>
      {/if}
    </div>
  </div>

  <!-- DiceBear Style Bar -->
  <div class="mb-3 rounded-[18px] border-2 border-border bg-surface px-4 py-3">
    <div class="mb-2 flex items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wider text-text/60">🎨 头像风格</span>
      <span class="text-[10px] text-text/40">从 @dicebear/collection 动态读取</span>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-1">
      {#each styleKeys as key (key)}
        <button
          class="flex shrink-0 w-16 flex-col items-center gap-0.5 rounded-[18px] border-2 p-1.5 transition-all
            {key === currentStyle
            ? 'border-primary bg-primary/10'
            : 'border-transparent hover:border-text/20'}"
          onclick={() => (currentStyle = key)}
          title={key}
        >
          <div class="h-10 w-10 overflow-hidden border-2 border-border bg-surface">
            <AvatarImg style={key} params={{}} size={40} seed={key} />
          </div>
          <span class="w-full truncate text-center text-[10px] text-text/60">{key}</span>
        </button>
      {/each}
    </div>
    <div class="mt-1 flex items-center gap-2 border-t-2 border-border pt-1.5">
      <button class="btn btn-ghost btn-xs gap-1" onclick={handleBack}>
        <Icon icon="line-md:chevron-double-left-twotone" class="h-3 w-3" />
        重新上传
      </button>
      <button class="btn btn-ghost btn-xs gap-1" onclick={handleRegenerateAll}>
        <Icon icon="line-md:refresh-twotone" class="h-3 w-3" />
        重新生成
      </button>
      <span class="flex-1"></span>
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
              <input
                class="input-cartoon"
                bind:value={contact.familyName}
                placeholder="姓"
              />
            </td>
            <td class="min-w-20">
              <input
                class="input-cartoon"
                bind:value={contact.givenName}
                placeholder="名"
              />
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
                onclick={() => handleAvatarClick(contactIdx, contact)}
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

<!-- Toast -->
{#if toastVisible}
  <div class="toast toast-top toast-end">
    <div class="alert">
      <Icon icon="line-md:confirm-twotone" class="h-4 w-4" />
      <span>{toastMsg}</span>
    </div>
  </div>
{/if}
