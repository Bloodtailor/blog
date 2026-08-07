#!/usr/bin/env node
// Finds post files added in the current push and emails each one to the OpenClaw agent,
// which decides on its own whether to post it anywhere, where, in what words, and whether
// Aaron should review it first. This script's only job is the hand-off — it does not
// publish anything to dev.to, Bluesky, X or anywhere else.
//
// Required env vars: SMTP_HOST, SMTP_USER, SMTP_PASS.
// Optional: SMTP_PORT (default 465), SMTP_SECURE (default true), NOTIFY_TO, NOTIFY_FROM.
//
// Run with --dry-run to print exactly what would be sent without connecting to SMTP.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';
import nodemailer from 'nodemailer';

const SITE = 'https://aaronorelup.com';
const POSTS_DIR = 'src/content/posts';
const STATE_FILE = '.syndicated.json';
const TO = process.env.NOTIFY_TO || 'goobie.orelup@gmail.com';
const DRY_RUN = process.argv.includes('--dry-run');

// git always reports forward slashes; path.join on Windows does not. The state file is
// keyed by path, so everything gets normalised or an already-handled post looks new —
// which here means a stray email to an agent that can post publicly.
const norm = (p) => p.split(path.sep).join('/');

function getChangedPostFiles() {
  try {
    const before = process.env.GITHUB_EVENT_BEFORE;
    const range = before && !/^0+$/.test(before) ? `${before}..HEAD` : 'HEAD~1..HEAD';
    const out = execSync(`git diff --name-only --diff-filter=A ${range} -- ${POSTS_DIR}`, {
      encoding: 'utf8',
    });
    const files = out.split('\n').map((f) => f.trim()).filter(Boolean);
    if (files.length > 0) return files;
  } catch {
    // fall through
  }
  // No post was added in this push. In CI that means there is nothing to do — the old
  // "scan everything" fallback would mail the agent about every post on the site the
  // first time an unrelated push touched the posts directory.
  if (process.env.GITHUB_ACTIONS) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => norm(path.join(POSTS_DIR, f)));
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { synced: [] };
  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  state.synced = (state.synced || []).map(norm);
  return state;
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

// Everything the agent needs to make its own call, in one plain-text body: the framing
// up top, the metadata, then the post itself verbatim.
function buildEmail(post) {
  const { data, body, url, slug } = post;
  const subject = `New ledger post: ${data.id} — ${data.title}`;
  const text = [
    'A new post just went live on aaronorelup.com.',
    '',
    'You decide whether this is worth posting anywhere, which platforms suit it, how to',
    'word it for each, and whether to check with Aaron before posting. Nothing has been',
    'published to any social account — this email is the only notification that went out.',
    '',
    '--- metadata ---',
    `id:      ${data.id}`,
    `title:   ${data.title}`,
    `summary: ${data.summary}`,
    `date:    ${data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date}`,
    `status:  ${data.status || 'note'}`,
    `tags:    ${(data.tags || []).join(', ') || '(none)'}`,
    `slug:    ${slug}`,
    `url:     ${url}`,
    '',
    '--- full post (markdown) ---',
    '',
    body.trim(),
  ].join('\n');
  return { subject, text };
}

async function main() {
  const files = getChangedPostFiles();
  const state = loadState();
  const alreadySent = new Set(state.synced);

  const newFiles = files.filter((f) => !alreadySent.has(f));
  if (newFiles.length === 0) {
    console.log('No new posts to hand off.');
    return;
  }

  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  let transport = null;
  if (!DRY_RUN) {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('SMTP_HOST, SMTP_USER and SMTP_PASS must all be set. Nothing sent.');
      process.exit(1);
    }
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }

  for (const file of newFiles) {
    if (!fs.existsSync(file)) continue; // e.g. deleted before this ran
    const parsed = matter(fs.readFileSync(file, 'utf8'));
    const slug = path.basename(file, '.md');
    const post = { data: parsed.data, body: parsed.content, slug, url: `${SITE}/ledger/${slug}/` };

    if (post.data.draft) {
      console.log(`Skipping draft: ${file}`);
      continue;
    }

    const { subject, text } = buildEmail(post);
    if (DRY_RUN) {
      console.log(`\n=== would send to ${TO} ===`);
      console.log(`Subject: ${subject}`);
      console.log(text.slice(0, 700) + (text.length > 700 ? '\n… [truncated in dry run]' : ''));
      state.synced.push(file);
      continue;
    }

    console.log(`Handing off ${file} (${post.data.id}: ${post.data.title})`);
    try {
      await transport.sendMail({
        from: process.env.NOTIFY_FROM || SMTP_USER,
        to: TO,
        subject,
        text,
      });
      console.log(`  [email] sent to ${TO}`);
      state.synced.push(file);
    } catch (e) {
      // Leave it out of the state file so the next run tries again.
      console.error('  [email] FAILED:', e.message);
    }
  }

  if (!DRY_RUN) saveState(state);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
