# Handoff: deploy "The Keeper and the Beacon" (post AO-004 + presentation)

Prepared by the LLM Monster Hunter playthrough session (Aug 5 2026).
Everything below is **committed locally on `main` but NOT pushed** — pushing
is the deploy, and it has side effects (see the syndication warning).
Delete this file in the deploy commit or right after.

## What's in the local commit

- `src/content/posts/keeper-and-the-beacon.md` — post AO-004, Aaron's-voice
  draft written by the agent that did the playthrough. **Have Aaron skim it
  before it goes out** — it speaks as him (first person) about what he loved
  about the presentation workflow, and it quotes the agent's verdict line.
- `public/presentations/keeper-and-the-beacon/` — the full presentation,
  self-contained static files (16MB: 12 ElevenLabs mp3s + 42 screenshots +
  ~300 lines of vanilla JS). Same player as in the game repo's
  `playthrough_presentation/`, plus two web-only additions: a responsive
  stacked layout under 900px, and a "← back to the post" link pointing at
  `/posts/keeper-and-the-beacon/`.

Verified locally: `npm run build` passes; `/posts/keeper-and-the-beacon/`
renders with both inline screenshots; `dist/presentations/keeper-and-the-beacon/`
ships all assets (26MB total dist — fine for Cloudflare Pages, largest file
~1MB, nowhere near the 25MB per-file limit).

## ⚠️ Before you push

`git push` on main does TWO things:

1. Cloudflare Pages rebuilds and deploys the site (~3 min).
2. `.github/workflows/syndicate.yml` fires because a new file appeared under
   `src/content/posts/` — it posts to **dev.to, Bluesky, and X**. The X post
   contains a URL, which bills roughly **$0.20**. If Aaron wants to review the
   post live on the site before it syndicates, either:
   - temporarily add `draft: true` to the frontmatter (check how the ledger
     and syndicate script treat drafts before relying on this), or
   - push, let it syndicate, and treat the blog post as final — the copy was
     written to be publishable as-is.

## Deploy steps

```bash
cd "C:\Users\soulo\Organized\Personal\My Projects\My Blog\blog"
git log -1        # confirm the local commit is the AO-004 one
git push
```

Then verify (allow a few minutes for Pages):

- https://aaronorelup.com/posts/keeper-and-the-beacon/ — post renders, both
  images load
- https://aaronorelup.com/presentations/keeper-and-the-beacon/ — press Play:
  audio starts, screenshots advance and drift, chapter rail jumps work,
  scrubbing seeks (Pages serves Range requests, so seeking should just work)
- Same presentation URL on a phone — stacked layout, page scrolls
- /ledger and / list AO-004
- If syndication ran: confirm dev.to + Bluesky posts exist and the X charge
  (~$0.20) shows in the developer dashboard

## Not included (decide later)

- The **1h53m full session recording** (340MB webm) exceeds the Pages
  per-file limit by an order of magnitude. It lives in the game repo at
  `playthrough_presentation/recording/full_session.webm` (gitignored).
  Options if it should be public: Cloudflare R2 behind the same domain, or
  YouTube (unlisted) embedded in the post. The post currently says "if people
  want it I'll put it somewhere," so nothing is broken by deferring.
- The presentation's source of truth stays in the game repo
  (`playthrough_presentation/`, PR #183). If the deck is ever regenerated,
  re-copy index/app/player/data + audio/ + shots/ here and re-apply the two
  web-only tweaks (responsive CSS block at the end of app.css, rail-back
  link in index.html).
