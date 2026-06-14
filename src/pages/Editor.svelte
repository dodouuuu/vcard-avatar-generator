<script lang="ts">
  import Icon from '@iconify/svelte'

  import { type Contact, Gender } from '../types'

  interface Props {
    data: { contacts: Contact[] } | null
    onNavigate: (page: string, data?: unknown) => void
  }

  let { data, onNavigate }: Props = $props()

  let contacts = $state<Contact[]>(data?.contacts ?? [])

  /** Navigates back to the upload page. */
  function handleBack() {
    onNavigate('upload')
  }

  // -- table sorting --
  type SortKey = 'familyName' | 'givenName' | 'fn' | 'gender' | 'org' | null
  let sortKey = $state<SortKey>(null)
  let sortDir = $state<'asc' | 'desc'>('asc')

  const sortedContacts = $derived.by(() => {
    if (!sortKey) {
      return contacts
    }
    return [...contacts].sort((a, b) => {
      const aVal = String(a[sortKey] ?? '')
      const bVal = String(b[sortKey] ?? '')
      const cmp = aVal.localeCompare(bVal, 'zh-CN')
      return sortDir === 'asc' ? cmp : -cmp
    })
  })

  /**
   * Toggles or sets the sort key/direction for the table.
   * Clicking the same column toggles asc/desc; clicking a different column resets to asc.
   * @param key - The column key to sort by.
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
   * Returns the icon name for the current sort state of a given column.
   * @param key - The sort key to check.
   * @returns The line-md icon name for the sort state.
   */
  function sortIcon(key: SortKey) {
    if (sortKey !== key) {
      return 'line-md:arrows-vertical'
    }
    return sortDir === 'asc' ? 'line-md:arrow-up' : 'line-md:arrow-down'
  }
</script>

<div class="flex flex-1 flex-col px-6 pb-6">
  <!-- Header -->
  <div class="mb-6 flex items-center gap-4 pt-6">
    <button class="btn btn-ghost btn-square" onclick={handleBack} aria-label="返回上传">
      <Icon icon="line-md:arrow-left-twotone" class="h-6 w-6" />
    </button>
    <div>
      <h2 class="text-2xl font-bold">联系人编辑</h2>
      {#if data?.contacts}
        <p class="text-sm text-base-content/70">
          共 {data.contacts.length} 个联系人
        </p>
      {/if}
    </div>
  </div>

  <!-- Table -->
  <div class="overflow-x-auto border-base-300 rounded-md border-2 bg-base-100">
    <table class="table table-pin-rows table-xs table-zebra">
      <thead>
        <tr>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('familyName')}>
            <span class="flex items-center gap-1">
              姓
              <Icon icon={sortIcon('familyName')} class="h-4 w-4 opacity-60" />
            </span>
          </th>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('givenName')}>
            <span class="flex items-center gap-1">
              名
              <Icon icon={sortIcon('givenName')} class="h-4 w-4 opacity-60" />
            </span>
          </th>
          <th class="min-w-28 cursor-pointer select-none" onclick={() => toggleSort('fn')}>
            <span class="flex items-center gap-1">
              姓名
              <Icon icon={sortIcon('fn')} class="h-4 w-4 opacity-60" />
            </span>
          </th>
          <th class="min-w-20 cursor-pointer select-none" onclick={() => toggleSort('gender')}>
            <span class="flex items-center gap-1">
              性别
              <Icon icon={sortIcon('gender')} class="h-4 w-4 opacity-60" />
            </span>
          </th>
          <th class="min-w-28 cursor-pointer select-none" onclick={() => toggleSort('org')}>
            <span class="flex items-center gap-1">
              单位
              <Icon icon={sortIcon('org')} class="h-4 w-4 opacity-60" />
            </span>
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
            <!-- Family name -->
            <td class="min-w-20">
              <input
                class="input input-xs w-full"
                bind:value={contact.familyName}
                placeholder="姓"
              />
            </td>

            <!-- Given name -->
            <td class="min-w-20">
              <input
                class="input input-xs w-full"
                bind:value={contact.givenName}
                placeholder="名"
              />
            </td>

            <!-- Formatted name -->
            <td class="min-w-28">
              <input class="input input-xs w-full" bind:value={contact.fn} placeholder="姓名" />
            </td>

            <!-- Gender -->
            <td class="min-w-20">
              <select class="select select-xs w-full" bind:value={contact.gender}>
                <option value={Gender.M}>男</option>
                <option value={Gender.F}>女</option>
                <option value={Gender.U}>未知</option>
              </select>
            </td>

            <!-- Organization -->
            <td class="min-w-28">
              <input class="input input-xs w-full" bind:value={contact.org} placeholder="单位" />
            </td>

            <!-- Phone numbers -->
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

            <!-- Avatar -->
            <td class="sticky right-0 z-[1] shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.15)]">
              <div class="avatar">
                {#if contact.photo}
                  <div class="w-10 rounded-full">
                    <img src={contact.photo} alt="头像" class="object-cover" />
                  </div>
                {:else}
                  <div class="bg-base-200 flex w-10 items-center justify-center rounded-full">
                    <Icon icon="line-md:emoji-frown-filled" class="h-5 w-5 text-base-content/40" />
                  </div>
                {/if}
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

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
