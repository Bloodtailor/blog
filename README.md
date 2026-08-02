# aaronorelup.com

A ledger of what I'm learning about AI. Astro static site, hosted on Cloudflare Pages,
syndicated automatically to dev.to, Bluesky, and X on every push.

## Writing a post

```bash
npm run new-post "Title of the post"
```

This creates `src/content/posts/<slug>.md` with the next sequential ID (`AO-002`, etc.)
and today's date pre-filled. Open it, write, then:

```bash
git add .
git commit -m "AO-002: title of the post"
git push
```

That's the entire publish step. Pushing to `main`:

1. Triggers a Cloudflare Pages build — the post goes live on the site.
2. Triggers the `syndicate` GitHub Action, which detects the new file(s) under
   `src/content/posts/` and posts to dev.to, Bluesky, and X, each linking back to the
   canonical URL on the site.

## Frontmatter fields

| Field     | Meaning                                                              |
|-----------|-----------------------------------------------------------------------|
| `id`      | Ledger reference, e.g. `AO-003`. Auto-assigned by `new-post`.         |
| `title`   | Post title.                                                           |
| `summary` | One-liner — shown on the homepage and used as the syndicated hook.    |
| `date`    | Publish date.                                                         |
| `status`  | `note`, `in-progress`, or `shipped`.                                  |
| `tags`    | Array of tags. First 4 are sent to dev.to (their limit).              |
| `draft`   | Set `true` to keep a post out of the site and out of syndication.     |

## Local development

```bash
npm install
npm run dev
```

## Required GitHub repo secrets (Settings → Secrets and variables → Actions)

- `DEVTO_API_KEY`
- `BLUESKY_HANDLE` (e.g. `aaronorelup.bsky.social` or your custom domain handle)
- `BLUESKY_APP_PASSWORD`
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

Without a secret set, that platform's step is skipped (logged, not failed) — so you can
add credentials one platform at a time and everything else keeps working.

## Cloudflare Pages setup (one-time)

1. Cloudflare dashboard → Workers & Pages → Create → Connect to Git → this repo.
2. Framework preset: **Astro**. Build command `npm run build`, output directory `dist`.
3. Deploy. Attach `aaronorelup.com` as a custom domain in the project's Domains tab.

## Syndication state

`.syndicated.json` (committed by the Action itself) tracks which post files have already
been syndicated, so re-runs never double-post — which matters most for X, since
re-posting means re-paying.
