import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'

import { dicebearStylesPlugin } from './plugin/vite-plugin-dicebear-styles'
import { iconCollectionPlugin } from './plugin/vite-plugin-icon-collection'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [tailwindcss(), svelte(), dicebearStylesPlugin(), iconCollectionPlugin()],
    base: env.VITE_BASE || '/',
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
