import { defineCollection } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

export const EXPERIENCE_DIR = "./src/content/experience";
export const PROJECTS_FILE = "./src/content/projects.yaml";

const experience = defineCollection({
  loader: glob({ base: EXPERIENCE_DIR, pattern: "**/*.md" }),
  schema: z.object({
    from: z.string(),
    to: z.optional(z.string()),
  }),
});

const projects = defineCollection({
  loader: file(PROJECTS_FILE),
  schema: z.object({
    name: z.string(),
    img: z.string(),
    rounded: z.optional(z.boolean()),
    link: z.string(),
    description: z.string(),
    stack: z.optional(z.string()),
    period: z.optional(
      z.object({
        start: z.string(),
        end: z.optional(z.string()),
      }),
    ),
  }),
});

export const collections = {
  experience,
  projects,
};
