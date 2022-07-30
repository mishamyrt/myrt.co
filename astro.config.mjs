import { defineConfig } from 'astro/config'
import typograf from 'astro-typograf-integration'

export default defineConfig({
  site: 'https://myrt.co',
  integrations: [
    typograf()
  ],
})
