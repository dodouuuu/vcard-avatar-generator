<script lang="ts">
  import Footer from './components/Footer.svelte'
  import Header from './components/Header.svelte'
  import Editor from './pages/Editor.svelte'
  import Upload from './pages/Upload.svelte'

  /** Current page identifier. */
  let page = $state<'upload' | 'editor'>('upload')
  /** Data shared between pages. */
  let sharedData = $state<unknown>(null)

  /**
   * Navigates to the specified page with optional data.
   * @param target - The target page name.
   * @param data - Optional data to pass to the target page.
   */
  function navigateTo(target: string, data?: unknown) {
    sharedData = data ?? null
    page = target as 'upload' | 'editor'
  }
</script>

<div class="flex h-screen flex-col bg-base-200 font-sans">
  <Header />

  <main class="flex flex-1 flex-col overflow-y-auto">
    <div class="mx-auto flex w-full max-w-5xl flex-1 flex-col">
      {#if page === 'upload'}
        <Upload onNavigate={navigateTo} />
      {:else if page === 'editor'}
        <Editor data={sharedData} onNavigate={navigateTo} />
      {/if}
    </div>
  </main>

  <Footer />
</div>
