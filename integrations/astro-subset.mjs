import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @typedef {Record<string, number | {
 *   min?: number,
 *   max?: number,
 *   default?: number
 * }>} VariationAxes
 */

/**
 * @typedef {[number, number]} UnicodeRange
 */

/**
 * @typedef {object} FontSubset
 * @property {string} input
 * @property {string} output
 * @property {UnicodeRange[]} unicodeRanges
 * @property {VariationAxes} variationAxes
 */

/**
 * @param {Array<[number, number]>} ranges
 * @returns {string}
 */
function charsFromRanges(ranges) {
  let text = "";

  for (const [start, end] of ranges) {
    for (let codePoint = start; codePoint <= end; codePoint++) {
      text += String.fromCodePoint(codePoint);
    }
  }

  return text;
}

function fail(message) {
  throw new Error(`[font-subset] ${message}`);
}

function requireValue(value, path) {
  if (value === undefined || value === null || value === "") {
    fail(`Missing required option: ${path}`);
  }
}

function requireArray(value, path) {
  if (!Array.isArray(value) || value.length === 0) {
    fail(`Missing required non-empty array: ${path}`);
  }
}

/**
 * Minimal runtime validation.
 * Detailed shape validation is intentionally left to JSDoc/IDE.
 *
 * @param {FontSubset[]} subsets
 */
function assertConfig(subsets) {
  requireArray(subsets, "subsets");

  subsets.forEach((subset, subsetIndex) => {
    const subsetPath = `subsets[${subsetIndex}]`;

    requireValue(subset.input, `${subsetPath}.input`);
    requireValue(subset.output, `${subsetPath}.output`);
    requireArray(subset.unicodeRanges, `${subsetPath}.unicodeRanges`);
    requireValue(subset.variationAxes, `${subsetPath}.variationAxes`);
  });
}

/**
 * @param {object} params
 * @param {string} params.root
 * @param {FontSubset} params.subset
 * @param {import("astro").AstroIntegrationLogger} params.logger
 */
async function buildSubset({ root, subset, logger }) {
  const inputPath = resolve(root, subset.input);
  const outputPath = resolve(root, subset.output);

  const sourceBuffer = await readFile(inputPath);

  const subsetFontModule = await import("subset-font");
  const subsetFont = subsetFontModule.default ?? subsetFontModule;

  const subsetBuffer = await subsetFont(
    sourceBuffer,
    charsFromRanges(subset.unicodeRanges),
    {
      targetFormat: "woff2",
      variationAxes: subset.variationAxes,
    },
  );

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, subsetBuffer);

  const sizeKiB = (subsetBuffer.byteLength / 1024).toFixed(1);
  logger.info(`Generated font subset: ${subset.output} (${sizeKiB} KiB)`);
}

/**
 * @param {FontSubset[]} subsets
 * @returns {import("astro").AstroIntegration}
 */
export default function fontSubset(subsets) {
  assertConfig(subsets);

  return {
    name: "font-subset",

    hooks: {
      "astro:config:setup": async ({ config, addWatchFile, logger }) => {
        const root = fileURLToPath(config.root);

        for (const subset of subsets) {
          addWatchFile(resolve(root, subset.input));
        }

        addWatchFile(fileURLToPath(import.meta.url));

        for (const subset of subsets) {
          await buildSubset({ root, subset, logger });
        }
      },
    },
  };
}
