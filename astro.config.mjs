import { defineConfig } from 'astro/config'
import typograf from './scripts/typograf.integration.mjs'

export default defineConfig({
  site: 'https://myrt.co',
  integrations: [
    typograf()
  ],
})
