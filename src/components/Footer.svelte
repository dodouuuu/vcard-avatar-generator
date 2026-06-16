<script lang="ts">
  /** Build timestamp injected by Vite define (ISO 8601, e.g. "2026-06-16T06:30:00.000Z"). */
  declare const __BUILD_TIME__: string

  const year = new Date().getFullYear()
</script>

<div
  class="fixed bottom-0 left-0 right-0 z-10 flex h-14 items-center justify-between rounded-t-2xl bg-primary px-8 text-sm text-white"
>
  <div>&copy; {year}</div>
  <div>Updated at {__BUILD_TIME__}</div>
</div>
