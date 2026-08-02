#!/usr/bin/env node
// Usage: npm run new-post "My Post Title"
// Creates src/content/posts/<slug>.md with the next AO-### id pre-filled.

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src', 'content', 'posts');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post "Post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR) : [];
let maxNum = 0;
for (const file of files) {
  if (!file.endsWith('.md')) continue;
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  const { data } = matter(raw);
  const match = /AO-(\d+)/.exec(data.id || '');
  if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
}
const nextId = `AO-${String(maxNum + 1).padStart(3, '0')}`;
const today = new Date().toISOString().slice(0, 10);

const filePath = path.join(POSTS_DIR, `${slug}.md`);
if (fs.existsSync(filePath)) {
  console.error(`Already exists: ${filePath}`);
  process.exit(1);
}

const content = `---
id: "${nextId}"
title: "${title.replace(/"/g, '\\"')}"
summary: "One line for the ledger list and the syndicated posts."
date: ${today}
status: "note"
tags: []
---

Start writing here.
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filePath, content);
console.log(`Created ${filePath} as ${nextId}`);
