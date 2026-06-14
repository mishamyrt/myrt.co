import { defineConfig } from "astro/config";
import typograf from "astro-typograf";
import fontSubset from "./integrations/astro-subset.mjs";

export default defineConfig({
  site: "https://myrt.co/",
  integrations: [
    // typograf(),
    fontSubset([
      {
        // Source font file.
        input: "node_modules/inter-ui/variable/InterVariable.woff2",

        // Generated subset font file.
        output: "public/fonts/inter.woff2",

        // Unicode ranges included into the subset.
        unicodeRanges: [
          [0x0020, 0x007e], // Basic Latin
          [0x00a0, 0x00ff], // Latin-1 Supplement
          [0x0100, 0x024f], // Latin Extended-A/B
          [0x0400, 0x052f], // Cyrillic + Cyrillic Supplement
          [0x221e, 0x221e], // Infinity
        ],

        // Variable font axes kept in the subset.
        variationAxes: {
          wght: {
            min: 400,
            max: 600,
            default: 400,
          },
        },
      },
    ]),
  ],
});
