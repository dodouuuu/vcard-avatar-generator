<script lang="ts">
  import 'virtual:icon-collection'

  import Footer from './components/Footer.svelte'
  import Header from './components/Header.svelte'
  import Editor from './pages/Editor.svelte'
  import Upload from './pages/Upload.svelte'
  import type { Contact } from './types'

  let page = $state<'upload' | 'editor'>('upload')
  let sharedData = $state<{ contacts: Contact[] } | null>(null)

  /**
   *
   * @param target
   * @param data
   */
  function navigateTo(target: string, data?: unknown) {
    sharedData = (data as { contacts: Contact[] } | null) ?? null
    page = target as 'upload' | 'editor'
  }
</script>

<div class="flex min-h-screen flex-col bg-base-100 font-sans">
  <Header />
  <main class="flex flex-1 flex-col pt-14 pb-14">
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
