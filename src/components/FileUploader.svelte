<script lang="ts">
  import Icon from '@iconify/svelte'

  import { type Contact } from '../types'
  import { readContact } from '../utils/contact-reader'

  interface Props {
    onParsed: (contacts: Contact[]) => void
  }

  let { onParsed }: Props = $props()

  let dragOver = $state(false)
  let uploadedFile = $state<File | null>(null)
  let parsing = $state(false)
  let parseError = $state('')

  /**
   * Handles drag-over event on the upload area.
   * @param e - The drag event.
   */
  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    dragOver = true
  }

  /** Resets drag state when cursor leaves the upload area. */
  function handleDragLeave() {
    dragOver = false
  }

  /**
   * Processes the dropped file and stores it for parsing.
   * @param e - The drag event containing the dropped file.
   */
  function handleFileDrop(e: DragEvent) {
    e.preventDefault()
    dragOver = false
    const files = e.dataTransfer?.files
    if (files?.[0]) {
      uploadedFile = files[0]
      parseError = ''
    }
  }

  /**
   * Captures the selected file from the file input.
   * @param e - The file input change event.
   */
  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      uploadedFile = file
      parseError = ''
    }
  }

  /** Clears the currently uploaded file and any parse error. */
  function handleRemoveFile() {
    uploadedFile = null
    parseError = ''
  }

  /** Reads the uploaded file and parses contacts from it. */
  async function handleParse() {
    if (!uploadedFile) {
      return
    }
    parsing = true
    parseError = ''

    try {
      const contacts = await readContact(uploadedFile)
      if (contacts.length === 0) {
        parseError = '文件中未解析到任何联系人'
        return
      }
      onParsed(contacts)
    } catch (e) {
      parseError = e instanceof Error ? e.message : '解析文件失败'
    } finally {
      parsing = false
    }
  }
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-6">
  {#if uploadedFile}
    <!-- Uploaded state -->
    <div
      class="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-box border border-dashed border-primary bg-primary/10 px-8"
    >
      <Icon icon="line-md:clipboard-check-twotone" class="h-10 w-10 text-primary" />
      <span class="font-bold text-primary">{uploadedFile.name}</span>
      <span class="text-sm font-bold text-base-content/70">
        {uploadedFile.size.toLocaleString()} 字节
      </span>
    </div>
  {:else}
    <!-- Upload prompt -->
    <label
      for="vcf-upload"
      class="flex h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-box border border-dashed border-base-300 bg-base-100 px-8 {dragOver
        ? 'border-primary bg-primary/10'
        : ''}"
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      ondrop={handleFileDrop}
    >
      <Icon icon="line-md:file-upload-twotone" class="h-10 w-10" />
      <span>点击或拖拽上传 .vcf / .xlsx 文件</span>
      <span>
        <a
          href="/vcard-template.xlsx"
          download
          class="text-sm font-bold text-primary underline hover:text-primary-dark"
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

  {#if parseError}
    <p class="text-sm font-bold text-error">{parseError}</p>
  {/if}
  <div class="flex gap-4">
    <button class="btn btn-outline" onclick={handleRemoveFile} disabled={!uploadedFile || parsing}>
      重新上传
    </button>
    <button class="btn btn-primary" onclick={handleParse} disabled={!uploadedFile || parsing}>
      {#if parsing}
        <Icon icon="line-md:loading-twotone-loop" class="h-5 w-5" />
        解析中...
      {:else}
        解析文件
      {/if}
    </button>
  </div>
</div>
