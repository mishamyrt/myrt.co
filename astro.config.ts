import { defineConfig, fontProviders } from "astro/config";
import { satteri } from '@astrojs/markdown-satteri';
import { imageCaption } from "./plugins/md-hast/imageCaption";
import { imageSizeSetter } from "./plugins/md-hast/imageSize";
import { honeymateLoader } from "./plugins/md-hast/imageHoneymate";

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
      provider: fontProviders.local(),
      name: "Inter",
      cssVariable: "--typography-font-family-sans-serif",
      options: {
        variants: [
          {
            src: [
              "./node_modules/inter-ui/web/Inter-SemiBold.woff2",
            ],
            weight: "600",
            style: "normal",
          },
          {
            src: [
              "./node_modules/inter-ui/web/Inter-Regular.woff2",
            ],
            weight: "400",
            style: "normal",
          },
        ],
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
  integrations: [
    // typograf(),
  ],
});
