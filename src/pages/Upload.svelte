<script lang="ts">
  import Icon from '@iconify/svelte'

  import FileUploader from '../components/FileUploader.svelte'
  import { spotCardConfig } from '../config/spotcard'
  import { type Contact } from '../types'

  /** Build timestamp in Asia/Shanghai timezone, injected by Vite define (e.g. "2026/6/16 14:30:00 (UTC+8)"). */
  declare const __BUILD_TIME__: string

  interface Props {
    onNavigate: (page: string, data?: unknown) => void
  }

  let { onNavigate }: Props = $props()

  /**
   * Navigates to the editor page with parsed contacts.
   * @param contacts - The parsed contacts from the uploaded file.
   */
  function handleParsed(contacts: Contact[]) {
    onNavigate('editor', { contacts })
  }
</script>

<div class="flex flex-1 flex-col gap-6 p-6">
  <div class="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
    <!-- Left ad slot -->
    <aside class="flex-1">
      <div class="flex flex-row flex-wrap gap-4 lg:flex-col">
        {#each spotCardConfig.slice(0, 2) as card, i (i)}
          <a
            href={card.link}
            target="_blank"
            rel="noopener noreferrer"
            class="w-[calc(50%-0.5rem)] lg:w-full"
          >
            <img src={card.img} alt={card.alt} class="w-full rounded-box" />
          </a>
        {/each}
      </div>
    </aside>

    <!-- Center: main content -->
    <div class="flex flex-[2] flex-col gap-6">
      <!-- Privacy notice -->
      <div class="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-6">
        <div class="flex items-start gap-3">
          <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span class="text-sm text-justify break-all text-error"
            >所有数据仅在本地处理，不会上传到任何服务器</span
          >
        </div>
        <div class="flex items-start gap-3">
          <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span class="text-sm text-justify break-all text-error"
            >关闭页面后不会保留任何个人数据，请放心使用</span
          >
        </div>
        <div class="flex items-start gap-3">
          <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <span class="text-sm text-justify break-all text-error">构建于 {__BUILD_TIME__}</span>
        </div>
      </div>

      <!-- Upload area -->
      <FileUploader onParsed={handleParsed} />
    </div>

    <!-- Right ad slot -->
    <aside class="flex-1">
      <div class="flex flex-row flex-wrap gap-4 lg:flex-col">
        {#each spotCardConfig.slice(2) as card, i (i)}
          <a
            href={card.link}
            target="_blank"
            rel="noopener noreferrer"
            class="w-[calc(50%-0.5rem)] lg:w-full"
          >
            <img src={card.img} alt={card.alt} class="w-full rounded-box" />
          </a>
        {/each}
      </div>
    </aside>
  </div>
</div>
