import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({
      // Gera um site 100% estático (HTML/CSS/JS), sem precisar de servidor
      // Node — funciona em hospedagem compartilhada comum (ex: Hostinger).
      spa: { enabled: true },
    }),
    viteReact(),
  ],
})

export default config
