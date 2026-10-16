import { defineConfig, fontProviders } from "astro/config";
import { satteri } from '@astrojs/markdown-satteri';
import { imageCaption } from "./plugins/md-hast/imageCaption";
import { imageSizeSetter } from "./plugins/md-hast/imageSize";
import { honeymateLoader } from "./plugins/md-hast/imageHoneymate";

import compressor from "astro-compressor";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://myrt.co/",
  markdown: {
      processor: satteri({
        hastPlugins: [
          imageCaption({
            containerClass: 'img-container',
            captionClass: 'img-caption'
          }),
          imageSizeSetter({
            publicPath: 'public',
            wrapperClass: 'img-wrapper'
          }),
          honeymateLoader()
        ],
        features: { directive: true },
      }),
    },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "IBMPlexSerif",
      cssVariable: "--typography-font-family-serif",
      options: {
        variants: [
          {
            src: [
              "./node_modules/@ibm/plex-serif/fonts/complete/woff2/IBMPlexSerif-Regular.woff2",
            ],
            weight: "normal",
            style: "normal",
          },
          {
            src: [
              "./node_modules/@ibm/plex-serif/fonts/complete/woff2/IBMPlexSerif-Italic.woff2",
            ],
            weight: "normal",
            style: "italic",
          },
          {
            src: [
              "./node_modules/@ibm/plex-serif/fonts/complete/woff2/IBMPlexSerif-SemiBold.woff2",
            ],
            weight: "bold",
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.npm({remote: false}),
      name: "Golos Text",
      cssVariable: "--typography-font-family-sans-serif",
      options: {
        package: '@fontsource/golos-text',
        file: '500.css'
      },
    },
    {
      provider: fontProviders.local(),
      name: "Lilex",
      cssVariable: "--typography-font-family-monospace",
      options: {
        variants: [
          {
            src: [
              "./node_modules/lilex-font/Lilex/webfonts/Lilex-Regular.woff2",
            ],
            weight: "normal",
            style: "normal",
          },
        ],
      },
    },
  ],
  integrations: [compressor(), sitemap()],
});
