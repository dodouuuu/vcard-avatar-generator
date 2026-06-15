<script lang="ts">
  import { addCollection } from '@iconify/svelte'
  // 注册 line-md 图标到本地存储，不走远程请求
  import lineMdIcons from '@iconify-json/line-md/icons.json'
  addCollection(lineMdIcons)
  import Footer from './components/Footer.svelte'
  import Header from './components/Header.svelte'
  import Editor from './pages/Editor.svelte'
  import Upload from './pages/Upload.svelte'

  // 注册 line-md 图标到本地存储，不请求 iconify.design
  addCollection(lineMdIcons)

  let page = $state<'upload' | 'editor'>('upload')
  let sharedData = $state<unknown>(null)

  /**
   *
   * @param target
   * @param data
   */
  function navigateTo(target: string, data?: unknown) {
    sharedData = data ?? null
    page = target as 'upload' | 'editor'
  }
</script>

<div class="flex min-h-screen flex-col bg-surface font-sans">
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
