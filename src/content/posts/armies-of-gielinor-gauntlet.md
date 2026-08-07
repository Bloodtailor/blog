---
id: "AO-005"
title: "I rebuilt a dead Jagex game with a critic loop. The real references failed hardest."
summary: "Every judged item was tagged with the kind of standard it was judged against. Items with a real surviving screenshot took more rounds (1.61 vs 1.33), produced every single stall in the run, and leaked 79% of the escaped defects — because a rubric can only confirm the builder did what the rubric said."
date: 2026-08-07
status: "shipped"
tags: ["claude-code", "gauntlet-loop", "gamedev", "agents", "lessons"]
draft: true
---

Armies of Gielinor was a turn-based strategy game Jagex shipped on FunOrb. FunOrb shut
down in 2018 and took it with it — no servers, no client, no asset dump. What survives is
a couple of wiki pages and a fistful of screenshots at whatever resolution someone
happened to grab them at.

So I rebuilt it. **[You can play it here.](/games/armies-of-gielinor/)**

![The recreation running live on the site, mid-match on Misthalin](/media/armies-of-gielinor/live-on-site.png)

This is a fan tribute, not affiliated with or endorsed by Jagex — zero original assets,
every pixel and every sample generated from scratch, and I kept the name because the game
has been dead since the 2018 shutdown and calling it something else would just obscure
what it is.

The recreation isn't really the point, though. The point was a question about how you
judge AI output at all, and a dead game is an unusually honest place to ask it.

## The bet

The gauntlet loop goes like this. A builder agent makes the thing. A fresh critic — one
that has never seen the builder's reasoning, effort story, or list of changes — compares
it against a fixed standard in a randomized blind A/B against the real reference, and
returns a binary verdict. Fail, and a fixer gets the findings while a *new* critic
re-judges. The builder never judges its own work, and you loop until you win.

The loop isn't mine. It's Matt Shumer's original prompt, packaged as RoboNuggets'
gauntlet-loop skill. I changed two things and this whole run exists to find out whether
those changes hold up.

The first: the original demands a *fetchable* reference for every judged item. For a dead
game, that's not available for everything, so I relaxed it into three standard tiers —
assigned and logged **before** the builder started, never revised after:

- **Tier 1** — a real surviving screenshot or extracted token from the dead game.
- **Tier 2** — a named comparable the model knows but cannot fetch ("Advance Wars
  campaign AI").
- **Tier 3** — a written rubric only. The style bible, no image at all.

The second: the original forbids round limits, because its second exit condition is "the
user stops the run." In an autonomous overnight session there is no user, so an unwinnable
comparison loops forever. I added stop rules — `win`, `diminishing` (two rounds with no
material improvement), and a five-round `ceiling` as backstop.

Relaxing the reference requirement is exactly the thing the skill warns you not to do: an
unfetchable bar makes the critic invent a comparison and approve everything. That's the
hypothesis the tier column was built to test.

## Three sessions, no shared memory

The run was a relay: three Claude Code sessions, each handed the next a prompt it wrote
itself, and none of them could see the others' context. Session 1 (77 minutes) did prep —
research, spec, the style bible, the standards ledger, the test harness. Session 2 (8h36m)
built the game and ran the gauntlet. Session 3 shipped everything.

The separation turned out to be load-bearing. The session that *wrote* the tier-3 rubrics
had zero memory of writing them by the time another session judged against them. That gap
is the only reason tier-3 items had anything to fail against at all.

The editor deliberately never entered the gauntlet. There's no original editor to
compare it to, and functional quality is a thing tests check, not a thing taste checks.
Don't gauntlet what a harness can gate.

## What the loop actually did

36 distinct judged items across three rounds, covering about 120 individually judged
artefacts — 76 unit sprites, 20 icons, 9 maps and boards, 5 UI surfaces, 5 music tracks,
15 SFX, 2 behavioural probes.

**The board themes won outright.** `board.misthalin` fooled its blind critic on *both*
randomized pairs, with zero findings, in round one — the strongest result in the run.

<div style="display:flex;gap:8px;flex-wrap:wrap;margin:1.5rem 0">
  <figure style="flex:1 1 280px;margin:0">
    <img src="/media/armies-of-gielinor/board-pair-original.jpg" alt="The real Armies of Gielinor board" style="max-width:100%;height:auto" />
    <figcaption><strong>The real board</strong>, normalised for blind comparison. The critic called this one the recreation.</figcaption>
  </figure>
  <figure style="flex:1 1 280px;margin:0">
    <img src="/media/armies-of-gielinor/board-pair-ours.jpg" alt="Our recreated Misthalin board" style="max-width:100%;height:auto" />
    <figcaption><strong>Ours</strong>, at matched scale. The critic picked this one as the original.</figcaption>
  </figure>
</div>

Three of four board themes did that. The critic on the Kharidian desert went furthest: it
cited *our* oasis and mesas as the authentic features, then wrote prescriptive corrections
for the real screenshot.

**The UI lost every single time.** Zero of five UI and menu items ever won a blind pass, at
any round. The reason is worth sitting with: the round-1 HUD critic identified the original
by its *richer* chrome — heraldic crests, a chat pill, an hourglass. It wasn't spotting our
defects. It was spotting their surplus.

<div style="display:flex;gap:8px;flex-wrap:wrap;margin:1.5rem 0">
  <figure style="flex:1 1 200px;margin:0">
    <img src="/media/armies-of-gielinor/menu-first-build.jpg" alt="Our title screen before any critic saw it" style="max-width:100%;height:auto" />
    <figcaption><strong>Ours, round zero</strong> — before any critic: wrong crest, wrong frame, wrong menu order.</figcaption>
  </figure>
  <figure style="flex:1 1 200px;margin:0">
    <img src="/media/armies-of-gielinor/menu-original.jpg" alt="The original FunOrb title screen" style="max-width:100%;height:auto" />
    <figcaption><strong>The original</strong> FunOrb title screen, shown low-res for editorial comparison.</figcaption>
  </figure>
  <figure style="flex:1 1 200px;margin:0">
    <img src="/media/armies-of-gielinor/menu-ours.jpg" alt="Our title screen after three critic rounds" style="max-width:100%;height:auto" />
    <figcaption><strong>Ours, round three</strong> — at the reference's exact width, lockup at 47% vs the original's 48%.</figcaption>
  </figure>
</div>

When the critics were good, they were extremely specific. My favourite rejection, filed as
a major against the barbarian sprite: *"Weapon is a floating grey hammer head with no
haft/hand contact ('reads as a grey rock'); original has a long vertical sword."* That is a
better art note than I would have written.

**The logo is where the method's limits showed.** The round-1 critic called our mixed-case
`GielinoR` wordmark a blocker. A fresh critic in round 2, zooming the same 308-pixel
reference, judged that terminal capital R a *deliberate flourish* of the original — meaning
our "fix" may have shipped a small fidelity regression. Then the two critics read the
sword's orientation opposite ways, up versus down, off the same pixelated mark. The stop
rule fired on the log's own words: two critics disagreeing on a 308px image means there is
no measurable improvement direction to spend a fourth round on.

**And the audio passed, which is the part I trust least.** All five music tracks cleared
round one as a "plausible match"; the SFX set passed in band. Then the audio critic caught
that its own evidence pack was broken — spectrograms rendered on a linear frequency axis
while labelled logarithmic, plus column decimation aliasing that contaminated the tempo
reads it had used to corroborate itself. The hard gates still stand, because those are
measurements: ≥90s length, −16±2 LUFS, RMS-verified loop seams, 0.81 LU spread across the
set, no clipping. The aesthetic verdicts don't. Six of the eight tier-3 escaped defects are
mood judgments now parked for my own ears.

## The headline finding

![Three bar charts comparing the three standard tiers on mean rounds to exit, escaped defects per item, and stall rate](/media/armies-of-gielinor/tier-chart.svg)

I expected tier 3 to be the weak link, and I expected tier-1 items to sail through on the
strength of having a real target. Both wrong, and wrong in the same direction.

**Tier-1 items didn't converge faster. They converged harder.** Tier 1 averaged **1.61
rounds** to exit against tier 3's **1.33** — the well-referenced tier was the *slower* one.
All **eight** `diminishing` stalls in the entire run are tier-1 items. Tier 3 stalled zero
times. And tier 1 produced **46 of the 58** escaped defects (79%) and 11 of the 14 majors,
while tier 3 went **6 for 6 wins** with 8 defects.

That inversion is the whole result. A rubric cannot tell you that your centaur's torso sits
on the horse like a rider, or that your class icons are drawn near full-bleed where the
reference insets them to 55–65%, or that a faction ring band is three times too thick. A
rubric can only tell you whether you did what the rubric said — and the artefact and the
standard were authored against the same description, so of course it passes, and passes
fast.

> A tier-3 win and a tier-1 win are not the same event. Tier 3's 6/6 record isn't evidence
> of quality; it's evidence that nothing was there to contradict the builder.

The loudest row in the table is the one with n=2. Both tier-2 items — the AI's tactical
behaviour and the game's input feel, judged against remembered Advance Wars — **passed
round one and exited `win`**, and then leaked four defects including two majors: the AI has
no standing capture objective (one capture in 15 turns, two free villages never
approached), and a cheapest-unit feeding loop where 13 of 26 kills went to the same two
units. That's 2.00 escaped defects per item and a 50% major rate, the worst of any tier,
from items that passed on the first look. The critic's own summary: better tactical
hygiene, materially worse strategic game. **A remembered comparable certifies that you're
in the right genre and nothing about whether you're any good at it.**

Two caveats I can't wave away. Tier was never randomly assigned — an item got tier 1
*because* a reference survived, so tier correlates hard with asset class, and this is
observational, not an experiment. And two of those eight tier-1 stalls are protocol
failures wearing a design-failure label: `ui.overlays` was judged against a zoomed crop and
`ui.forecast` against a 3× upscale of a 270px capture. Both were unwinnable blind *before
the first agent ran* — the critic separates them on framing and source resolution, not
design — and both got filed `diminishing` because the exit taxonomy had no word for "the
test was unrunnable."

## What it cost

| session | output tokens | wall clock |
|---|---|---|
| 1 — prep | 789,690 | 77 min |
| 2 — gauntlet build | 4,308,821 | 516 min |
| **total** | **5,098,511** | **9h53m** |

Session 1 includes a host-process crash that cost about ten minutes and 80,477 output
tokens — 10% of that session's output. All disk state survived and the workflow resumed
from cache, so it's a cost line, not a data loss.

Session 2's model split held the policy I set after session 1 burned a third of my weekly
Fable budget in one night: Opus 5 across 76 agents for 3,885,935 tokens (90.1%), Fable 5 as
orchestrator only at 262,720 (6.1%), Sonnet 5 on four mechanical stages at 162,757 (3.8%),
Haiku zero.

That's roughly **35.9k output tokens per judged item** all-in, which is generous to the
loop since it includes building the entire game, and about **15.3k per item** for the
gauntlet phases alone.

Were the marginal rounds worth it? Round 2 was, outright — all 20 binary sprite failures
reversed to passes with every prior finding resolved. Round 3 was not, on the loop's own
terms: it bought real measured convergence and **flipped zero blind verdicts** across five
items. Round 2 is where a gauntlet earns its tokens. Round 3 is where it stops being a
gauntlet and becomes a defect-mining tool — which is fine, as long as you know that's what
you're buying.

## The defects became the editor

Ships later today, same bundle: a full content editor at
[/games/armies-of-gielinor/](/games/armies-of-gielinor/) — units, maps, assets, AI tuning,
scenarios — public, with the deployed game itself read-only. Its spec is
the defect log. All 58 escaped defects were written as editor requirements rather than a
scoreboard, on one test: can you jump from a running game into the editor, change the thing
the critic complained about, and be back in the match in under a minute?

<!-- editor-capture: added in phase 6 -->

## What I'd change

Screen references for blind viability *before* assigning tier 1 — record source
resolution, crop, upscale factor. A crop is a tier-1.5: fine for measurement, disqualified
from blind A/B. Add two exit types, `unverifiable` and `accepted-routed`, so good outcomes
stop borrowing the stall label.

Never accept on a fixer's compliance report. Four sprites shipped at session close on the
fixer's own self-report because there was no budget for a final judge — that's a builder
judging its own work, which is the exact thing the method exists to prevent.

Adversarially review the *evidence protocol* before running judgments through it. The audio
critic catching its own mislabeled axis was luck, not design.

Two critics — or a measurement — for anything judged against a sub-500px reference. And
give tier 2 a real n. Two items is an anecdote, and it's the anecdote with the highest
escaped-defect rate in the run.

Last one, and the one I'd generalize furthest: judge behaviour where the player
experiences it. The gauntlet judged stills brilliantly and sessions barely at all. Both
tier-2 items passed on capture pairs and a self-play log, and the two majors they leaked
are things you only see by actually playing five turns.

## Play it, break it

The game is at [/games/armies-of-gielinor/](/games/armies-of-gielinor/). If you find
something the critics missed, that's the honest outcome — there are 58 known ones already.

The sessions documented themselves as they went, so there are voiced decks of both:
[session 1, the prep](/presentations/armies-of-gielinor-session-1/) and
[session 2, the gauntlet](/presentations/armies-of-gielinor-session-2/).
