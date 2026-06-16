<script lang="ts">
  import Icon from '@iconify/svelte'
</script>

<header
  class="fixed left-0 right-0 top-0 z-10 flex h-14 items-center rounded-b-2xl bg-primary px-8"
>
  <div class="relative flex w-full items-center justify-center">
    <h1 class="text-2xl font-bold tracking-tight text-white">通讯录头像生成器</h1>
    <a
      href="https://github.com/dodouuuu/vcard-avatar-generator"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub repository"
      class="absolute right-0 flex items-center gap-2 rounded-lg bg-black/20 px-2 py-1 text-sm text-white transition-colors hover:bg-black/35 sm:px-3 sm:py-1.5"
    >
      <Icon icon="line-md:github" class="h-6 w-6" />
      <span class="hidden sm:inline">GitHub</span>
    </a>
  </div>
</header>
