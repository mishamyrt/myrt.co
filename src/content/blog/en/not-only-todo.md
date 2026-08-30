---
title: 'Maybe You Don’t Need a TODO'
description: "A quick guide to keywords used in code comments"
publishedAt: '12.01.2022'
tags: []
---

If you want to mark a piece of code as less than ideal, `TODO` isn’t always the right choice. There are several other keywords that may better describe what’s going on.

- `NOTE` — Provides additional context for code that works as intended.
- `HACK` — Explains code that relies on unusual or non-obvious behavior. Often paired with `FIXME`.
- `FIXME` — Marks code that works for now but should be fixed later. Common in MVPs and prototypes.
- `BUG` — Documents a known issue in the code. Useful for edge cases that are unlikely to occur during normal use but are still known to be incorrect.
- `TODO` — Marks something that still needs to be implemented or completed. Unlike `FIXME`, the existing code should be fully functional.
- `STOPSHIP` — Marks a critical issue that must be resolved before the product can be released. To enforce this automatically, you can use [checode](https://github.com/mishamyrt/checode) in your CI/CD pipeline.

Put these comments on their own line. If a comment needs more than one line, summarize the main point in the first line and make it a complete sentence.

This makes the comments easier to search for and helps developers understand their purpose at a glance.
