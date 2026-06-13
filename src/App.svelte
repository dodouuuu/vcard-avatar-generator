<script lang="ts">
  import Icon from '@iconify/svelte'

  import Footer from './lib/components/Footer.svelte'
  import Header from './lib/components/Header.svelte'

  let dragOver = $state(false)
  let uploadedFile = $state<File | null>(null)

  /**
   * Toggles visual feedback when a file is dragged over the upload zone.
   * @param e - The drag event from the upload zone.
   */
  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    dragOver = true
  }

  /**
   * Removes the drag visual feedback when the dragged file leaves the zone.
   */
  function handleDragLeave() {
    dragOver = false
  }

  /**
   * Processes a file dropped onto the upload zone.
   * @param e - The drop event containing the file data.
   */
  function handleFileDrop(e: DragEvent) {
    e.preventDefault()
    dragOver = false
    const files = e.dataTransfer?.files
    if (files?.[0]) {
      uploadedFile = files[0]
    }
  }

  /**
   * Processes a file selected via the file picker dialog.
   * @param e - The change event from the file input element.
   */
  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      uploadedFile = file
    }
  }

  /** Clears the uploaded file and resets the upload area. */
  function handleRemoveFile() {
    uploadedFile = null
  }
</script>

<div class="flex min-h-screen flex-col bg-base-200 font-sans">
  <Header />

  <div class="flex flex-1 flex-col">
    <!-- Privacy notice - top -->
    <div
      class="bg-error/10 border-2 border-error/20 flex w-full max-w-md mx-auto flex-col items-start gap-2 rounded-box max-sm:rounded-none p-6 mt-6"
    >
      <div class="flex items-start gap-2">
        <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0" />
        <span>所有数据仅在本地处理，不会上传到任何服务器。</span>
      </div>
      <div class="flex items-start gap-2">
        <Icon icon="line-md:alert-circle-twotone" class="mt-0.5 h-5 w-5 shrink-0" />
        <span>我们不会存储你的任何个人信息，关闭页面后不会保留任何痕迹，请放心使用。</span>
      </div>
    </div>

    <!-- Upload area & button - centered -->
    <div class="flex flex-1 flex-col items-center justify-center gap-6">
      <!-- File upload area -->
      {#if uploadedFile}
        <!-- Uploaded state -->
        <div
          class="border-success bg-success/10 flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-box max-sm:rounded-none border-2 border-dashed px-8 h-56"
        >
          <Icon icon="line-md:clipboard-check-twotone" class="h-10 w-10 text-success" />
          <span class="text-success font-bold">
            {uploadedFile.name}
          </span>
          <span class="text-sm font-bold text-base-content/70">
            {uploadedFile.size.toLocaleString()} 字节
          </span>
        </div>
      {:else}
        <!-- Upload prompt -->
        <label
          for="vcf-upload"
          class="border-base-300 bg-base-100 flex w-full max-w-md cursor-pointer flex-col items-center justify-center gap-3 rounded-box max-sm:rounded-none border-2 border-dashed px-8 h-56 {dragOver
            ? 'border-primary bg-primary/10'
            : ''}"
          ondragover={handleDragOver}
          ondragleave={handleDragLeave}
          ondrop={handleFileDrop}
        >
          <Icon icon="line-md:file-upload-twotone" class="h-10 w-10" />
          <span> 点击或拖拽上传 .vcf / .xlsx 文件 </span>
          <span>
            <a
              href="/template/vcard-template.xlsx"
              download
              class="text-sm font-bold link link-primary"
            >
              下载 xlsx 模板
            </a>
          </span>
        </label>
      {/if}
      <input
        id="vcf-upload"
        type="file"
        accept=".vcf,.xlsx"
        class="hidden"
        onchange={handleFileSelect}
      />

      <!-- Action buttons -->
      <div class="flex gap-4">
        <button
          class="btn btn-soft btn-secondary"
          onclick={handleRemoveFile}
          disabled={!uploadedFile}
        >
          重新上传
        </button>
        <button class="btn btn-soft btn-primary" disabled={!uploadedFile}> 解析文件 </button>
      </div>
    </div>
  </div>

  <Footer />
</div>
