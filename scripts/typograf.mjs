import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import Typograf from "typograf";
import { isScalar, parseDocument, stringify } from "yaml";

const blogDirectory = join(process.cwd(), "src/content/blog");
const projectsFile = join(process.cwd(), "src/content/projects.yaml");

const typografs = {
  en: new Typograf({ locale: "en-US" }),
  ru: new Typograf({
    locale: ["ru", "en-US"],
    disableRule: "ru/typo/switchingKeyboardLayout",
  }),
};

function formatText(value, typograf) {
  const [, leading, text, trailing] = /^(\s*)([\s\S]*?)(\s*)$/.exec(value);
  return leading + (text ? typograf.execute(text) : "") + trailing;
}

function applyReplacements(source, replacements) {
  return replacements
    .toSorted((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        result.slice(0, replacement.start) +
        replacement.value +
        result.slice(replacement.end),
      source,
    );
}

function formatMarkdown(markdown, typograf) {
  const replacements = [];

  function visit(node) {
    if (
      node.type === "text" &&
      node.position?.start.offset !== undefined &&
      node.position?.end.offset !== undefined
    ) {
      const start = node.position.start.offset;
      const end = node.position.end.offset;
      replacements.push({
        start,
        end,
        value: formatText(markdown.slice(start, end), typograf),
      });
    }

    for (const child of node.children ?? []) {
      visit(child);
    }
  }

  visit(
    fromMarkdown(markdown, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    }),
  );
  return applyReplacements(markdown, replacements);
}

function formatScalar(node, typograf) {
  const value = formatText(node.value, typograf);

  if (node.type === "QUOTE_SINGLE") {
    return `'${value.replaceAll("'", "''")}'`;
  }

  if (node.type === "QUOTE_DOUBLE") {
    return JSON.stringify(value);
  }

  return stringify(value).trimEnd();
}

function formatFrontmatter(frontmatter, typograf) {
  const document = parseDocument(frontmatter);
  const replacements = [];

  for (const key of ["title", "description"]) {
    const node = document.get(key, true);
    if (!isScalar(node) || typeof node.value !== "string" || !node.range) {
      continue;
    }

    replacements.push({
      start: node.range[0],
      end: node.range[1],
      value: formatScalar(node, typograf),
    });
  }

  return applyReplacements(frontmatter, replacements);
}

function formatArticle(source, typograf, file) {
  const match = /^---\r?\n(?<frontmatter>[\s\S]*?)\r?\n---(?:\r?\n|$)/d.exec(
    source,
  );
  if (!match?.groups?.frontmatter || !match.indices?.groups?.frontmatter) {
    throw new Error(`${file}: missing YAML frontmatter`);
  }

  const [frontmatterStart, frontmatterEnd] = match.indices.groups.frontmatter;
  return (
    source.slice(0, frontmatterStart) +
    formatFrontmatter(match.groups.frontmatter, typograf) +
    source.slice(frontmatterEnd, match[0].length) +
    formatMarkdown(source.slice(match[0].length), typograf)
  );
}

function formatBlockScalar(source, typograf) {
  const contentStart = source.indexOf("\n") + 1;
  return (
    source.slice(0, contentStart) +
    formatText(source.slice(contentStart), typograf)
  );
}

async function formatProjects() {
  const source = await readFile(projectsFile, "utf8");
  const document = parseDocument(source);
  const replacements = [];

  for (let index = 0; index < document.contents.items.length; index += 1) {
    for (const locale of ["ru", "en"]) {
      const node = document.getIn([index, "description", locale], true);
      if (!isScalar(node) || typeof node.value !== "string" || !node.range) {
        continue;
      }

      const scalar = source.slice(node.range[0], node.range[1]);
      replacements.push({
        start: node.range[0],
        end: node.range[1],
        value: node.type.startsWith("BLOCK_")
          ? formatBlockScalar(scalar, typografs[locale])
          : formatScalar(node, typografs[locale]),
      });
    }
  }

  const formatted = applyReplacements(source, replacements);
  if (formatted !== source) {
    await writeFile(projectsFile, formatted, "utf8");
  }

  return formatted !== source;
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(path)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path);
    }
  }

  return files;
}

let changed = 0;

for (const file of await markdownFiles(blogDirectory)) {
  const locale = file.startsWith(join(blogDirectory, "en")) ? "en" : "ru";
  const source = await readFile(file, "utf8");
  const formatted = formatArticle(source, typografs[locale], file);

  if (formatted !== source) {
    await writeFile(file, formatted, "utf8");
    changed += 1;
  }
}

if (await formatProjects()) {
  changed += 1;
}

console.log(`Typograf updated ${changed} file${changed === 1 ? "" : "s"}.`);
