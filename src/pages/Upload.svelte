<script lang="ts">
  import Icon from '@iconify/svelte'

  import FileUploader from '../components/FileUploader.svelte'
  import { adConfig } from '../config/ads'
  import { type Contact } from '../types'

  interface Props {
    onNavigate: (page: string, data?: unknown) => void
  }

  let { onNavigate }: Props = $props()

  /**
   *
   * @param contacts
   */
  function handleParsed(contacts: Contact[]) {
    onNavigate('editor', { contacts })
  }
</script>

<div class="flex flex-1 flex-col px-6 pb-6">
  <div class="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
    <!-- Left ad slot -->
    <aside class="flex-1">
      <div class="flex flex-row flex-wrap gap-4 lg:flex-col">
        {#each adConfig.left as ad, i (i)}
          {#if ad}
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              class="w-[calc(50%-0.5rem)] lg:w-full"
            >
              <img src={ad.img} alt={ad.alt} class="w-full rounded-lg" />
            </a>
          {:else}
            <div
              class="bg-base-300/30 flex h-32 w-[calc(50%-0.5rem)] items-center justify-center rounded-lg lg:w-full"
            >
              <span class="text-sm text-base-content/30">广告位</span>
            </div>
          {/if}
        {/each}
      </div>
    </aside>

    <!-- Center: main content -->
    <div class="flex flex-[2] flex-col">
      <!-- Privacy notice - top -->
      <div
        class="bg-error/10 border-2 border-error/20 flex w-full flex-col items-start gap-2 rounded-md py-6 mt-6"
      >
        <div class="flex items-start gap-2">
          <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0" />
          <span>所有数据仅在本地处理，不会上传到任何服务器。</span>
        </div>
        <div class="flex items-start gap-2">
          <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0" />
          <span>我们不会存储你的个人信息，关闭页面后不会保留任何痕迹，请放心使用。</span>
        </div>
      </div>

      <!-- Upload area -->
      <div class="flex flex-1 flex-col">
        <FileUploader onParsed={handleParsed} />
      </div>
    </div>

    <!-- Right ad slot -->
    <aside class="flex-1">
      <div class="flex flex-row flex-wrap gap-4 lg:flex-col">
        {#each adConfig.right as ad, i (i)}
          {#if ad}
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              class="w-[calc(50%-0.5rem)] lg:w-full"
            >
              <img src={ad.img} alt={ad.alt} class="w-full rounded-lg" />
            </a>
          {:else}
            <div
              class="bg-base-300/30 flex h-32 w-[calc(50%-0.5rem)] items-center justify-center rounded-lg lg:w-full"
            >
              <span class="text-sm text-base-content/30">广告位</span>
            </div>
          {/if}
        {/each}
      </div>
    </aside>
  </div>
</div>
