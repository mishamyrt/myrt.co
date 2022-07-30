import { defineConfig } from 'astro/config'
import typograf from 'astro-typograf'

export default defineConfig({
  site: 'https://myrt.co',
  integrations: [
    typograf()
  ],
})
