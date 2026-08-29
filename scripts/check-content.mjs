import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parse, stringify } from "yaml";

const repositoryRoot = process.cwd();
const experienceDirectory = join(repositoryRoot, "src/content/experience");
const englishExperienceDirectory = join(experienceDirectory, "en");
const projectsFile = join(repositoryRoot, "src/content/projects.yaml");
const lockFile = join(repositoryRoot, "src/content/translations.lock.yaml");
const updateLock = process.argv.includes("--update");

function sourceHash(value) {
  return createHash("sha256")
    .update(value.replaceAll("\r\n", "\n").trim())
    .digest("hex")
    .slice(0, 16);
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => entry.name)
    .toSorted();
}

function frontmatter(markdown, file) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`${file}: missing YAML frontmatter`);
  }
  return parse(match[1]);
}

function sameValue(left, right) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

const errors = [];
const expectedLock = {
  en: {
    experience: {},
    projects: {},
  },
};

const russianExperience = await markdownFiles(experienceDirectory);
const englishExperience = await markdownFiles(englishExperienceDirectory);
const russianSet = new Set(russianExperience);
const englishSet = new Set(englishExperience);

for (const file of russianExperience) {
  if (!englishSet.has(file)) {
    errors.push(`Missing English experience translation: ${file}`);
    continue;
  }

  const russianMarkdown = await readFile(join(experienceDirectory, file), "utf8");
  const englishMarkdown = await readFile(
    join(englishExperienceDirectory, file),
    "utf8",
  );
  const russianData = frontmatter(russianMarkdown, file);
  const englishData = frontmatter(englishMarkdown, `en/${file}`);

  for (const field of ["from", "to"]) {
    if (!sameValue(russianData[field], englishData[field])) {
      errors.push(
        `Experience metadata differs for ${file}: ${field} must match`,
      );
    }
  }

  expectedLock.en.experience[file.slice(0, -3)] = sourceHash(russianMarkdown);
}

for (const file of englishExperience) {
  if (!russianSet.has(file)) {
    errors.push(`English experience has no Russian source: ${file}`);
  }
}

const projects = parse(await readFile(projectsFile, "utf8"));
const projectIds = new Set();

for (const project of projects) {
  if (!project.id || projectIds.has(project.id)) {
    errors.push(`Project id is missing or duplicated: ${project.id ?? "<empty>"}`);
    continue;
  }
  projectIds.add(project.id);

  for (const locale of ["ru", "en"]) {
    if (!project.content?.[locale]?.description?.trim()) {
      errors.push(`Project ${project.id} is missing content.${locale}.description`);
    }
  }

  if (project.content?.ru) {
    expectedLock.en.projects[project.id] = sourceHash(
      JSON.stringify(project.content.ru),
    );
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

if (updateLock) {
  await writeFile(lockFile, stringify(expectedLock), "utf8");
  console.log("Updated src/content/translations.lock.yaml");
  process.exit(0);
}

let actualLock;
try {
  actualLock = parse(await readFile(lockFile, "utf8"));
} catch {
  console.error(
    "Translation lock is missing. Run `pnpm content:ack` after reviewing translations.",
  );
  process.exit(1);
}

for (const [group, entries] of Object.entries(expectedLock.en)) {
  for (const [id, hash] of Object.entries(entries)) {
    if (actualLock?.en?.[group]?.[id] !== hash) {
      errors.push(`English translation is outdated: ${group}/${id}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  console.error(
    "Review the English translations, then run `pnpm content:ack`.",
  );
  process.exit(1);
}

console.log("Shared content translations are complete and up to date.");
