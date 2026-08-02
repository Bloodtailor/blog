#!/usr/bin/env node
// Finds markdown post files added in the current push (or the whole posts dir on
// manual/local runs) and syndicates each new one to dev.to, Bluesky, and X.
// Required env vars: DEVTO_API_KEY, BLUESKY_HANDLE, BLUESKY_APP_PASSWORD,
// X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';
import matter from 'gray-matter';
import OAuth from 'oauth-1.0a';
import { AtpAgent, RichText } from '@atproto/api';

const SITE = 'https://aaronorelup.com';
const POSTS_DIR = 'src/content/posts';
const STATE_FILE = '.syndicated.json';

function getChangedPostFiles() {
  // In GitHub Actions on push, compare against the previous commit.
  // Falls back to "every post" for a local/manual run.
  try {
    const before = process.env.GITHUB_EVENT_BEFORE;
    const range = before && !/^0+$/.test(before) ? `${before}..HEAD` : 'HEAD~1..HEAD';
    const out = execSync(`git diff --name-only --diff-filter=A ${range} -- ${POSTS_DIR}`, {
      encoding: 'utf8',
    });
    const files = out.split('\n').map((f) => f.trim()).filter(Boolean);
    if (files.length > 0) return files;
  } catch {
    // fall through to full-scan fallback below
  }
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md')).map((f) => path.join(POSTS_DIR, f));
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { synced: [] };
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

async function postToDevTo(post) {
  const key = process.env.DEVTO_API_KEY;
  if (!key) return console.log('  [dev.to] skipped — DEVTO_API_KEY not set');

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      article: {
        title: post.data.title,
        body_markdown: post.body,
        published: true,
        canonical_url: post.url,
        tags: post.data.tags.slice(0, 4),
      },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`dev.to: ${res.status} ${JSON.stringify(json)}`);
  console.log(`  [dev.to] posted: ${json.url}`);
}

async function postToBluesky(post) {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !appPassword) return console.log('  [bluesky] skipped — credentials not set');

  const agent = new AtpAgent({ service: 'https://bsky.social' });
  await agent.login({ identifier: handle, password: appPassword });

  const text = `${post.data.title}\n\n${post.data.summary}\n\n${post.url}`;
  const rt = new RichText({ text });
  await rt.detectFacets(agent);

  await agent.post({
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  });
  console.log('  [bluesky] posted');
}

async function postToX(post) {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return console.log('  [x] skipped — credentials not set');
  }

  const oauth = new OAuth({
    consumer: { key: apiKey, secret: apiSecret },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    },
  });

  const url = 'https://api.twitter.com/2/tweets';
  const requestData = { url, method: 'POST' };
  const token = { key: accessToken, secret: accessTokenSecret };
  const headers = oauth.toHeader(oauth.authorize(requestData, token));

  // Keep it under X's character limit; the link + title + hook usually fits.
  let text = `${post.data.title} — ${post.data.summary}\n\n${post.url}`;
  if (text.length > 280) {
    const budget = 280 - post.url.length - 5;
    text = `${post.data.title}`.slice(0, budget) + `…\n\n${post.url}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`X: ${res.status} ${JSON.stringify(json)}`);
  console.log(`  [x] posted: ${json.data?.id}`);
}

async function main() {
  const files = getChangedPostFiles();
  const state = loadState();
  const alreadySynced = new Set(state.synced);

  const newFiles = files.filter((f) => !alreadySynced.has(f));
  if (newFiles.length === 0) {
    console.log('No new posts to syndicate.');
    return;
  }

  for (const file of newFiles) {
    if (!fs.existsSync(file)) continue; // e.g. deleted before this ran
    const raw = fs.readFileSync(file, 'utf8');
    const parsed = matter(raw);
    const slug = path.basename(file, '.md');
    const post = {
      data: parsed.data,
      body: parsed.content,
      url: `${SITE}/posts/${slug}/`,
    };

    if (post.data.draft) {
      console.log(`Skipping draft: ${file}`);
      continue;
    }

    console.log(`Syndicating ${file} (${post.data.id}: ${post.data.title})`);
    try {
      await postToDevTo(post);
    } catch (e) {
      console.error('  [dev.to] FAILED:', e.message);
    }
    try {
      await postToBluesky(post);
    } catch (e) {
      console.error('  [bluesky] FAILED:', e.message);
    }
    try {
      await postToX(post);
    } catch (e) {
      console.error('  [x] FAILED:', e.message);
    }

    state.synced.push(file);
  }

  saveState(state);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
