// Appendix data for the Session 1 deck: every captured frame, and
// the bill. Figures are measured, not estimated — per-agent rows come from
// tools/measure-agents.mjs, session totals from tools/measure-usage.mjs.
// Regenerate rather than hand-edit; see the notes at the foot of the panel.
const APPENDIX = {
  "session": 1,
  "title": "The Prep — Arming the Gauntlet",
  "shots": [
    {
      "file": "00_the_assignment.png",
      "cap": "The brief: three sessions, each handing the next its prompt, with no shared memory between them."
    },
    {
      "file": "01_measure_usage_works.png",
      "cap": "measure-usage mining real token counts from Claude Code transcripts — tested on the session that wrote it."
    },
    {
      "file": "03_stub_game.png",
      "cap": "The stub: a deliberately ugly 5×5 skirmish that implements every contract the real game must honor."
    },
    {
      "file": "03_stub_editor_slice.png",
      "cap": "The stub’s editor slice — the vertical contract the harness gates on, before any real editor existed."
    },
    {
      "file": "06_stub_v2_game.png",
      "cap": "Stub v2 after the tool registry landed."
    },
    {
      "file": "06_stub_v2_editor_slice.png",
      "cap": "The vertical slice, live: edit a stat, see it in-game, export, reimport, identical hash."
    },
    {
      "file": "07_harness_first_green.png",
      "cap": "First full harness run: smoke, self-play, determinism, asset integrity, foundation — all green."
    },
    {
      "file": "08_harness_22_green.png",
      "cap": "22 green after the tool registry landed — undo/redo and jump-from-game are tested, not promised."
    },
    {
      "file": "09_reference_contact_sheet.png",
      "cap": "191 recovered references — unit tokens, official screenshots, campaign maps. Editorial copies; none ship."
    },
    {
      "file": "10_gauntlet_failure_modes.png",
      "cap": "The original gauntlet doctrine, recovered verbatim — including the failure modes it names for itself."
    },
    {
      "file": "11_spec_combat_matrix.png",
      "cap": "The damage matrix, rebuilt from worked examples — every unverified cell tagged and ledgered."
    },
    {
      "file": "12_handoff_reconciliation.png",
      "cap": "Every deviation from doctrine argued in the handoff prompt itself, with citations."
    },
    {
      "file": "13_ip_guard_amend.png",
      "cap": "The IP rule caught our own research agent: 14 copyrighted images amended out of git history."
    },
    {
      "file": "14_style_bible.png",
      "cap": "The style bible: the tier-3 standard for every asset with no surviving reference."
    },
    {
      "file": "15_run_log.png",
      "cap": "The run log records its own disaster: host process died, disk state survived, workflow resumed from cache."
    },
    {
      "file": "16_review_findings.png",
      "cap": "Seven adversarial reviewers against the finished deliverables — findings triaged and fixed."
    },
    {
      "file": "17_final_state.png",
      "cap": "The full kit: spec, standards, contracts, harness, logs — and one paste-ready prompt."
    },
    {
      "file": "18_per_agent_breakdown.png",
      "cap": "Per agent and per model — all Fable 5 this session; the crash billed 80k output tokens for work done twice."
    }
  ],
  "text": [
    [
      "01_measure_usage_works.txt",
      "measure-usage.mjs first successful run"
    ],
    [
      "02_harness_selftest_green.txt",
      "harness self-test, full output"
    ],
    [
      "04_blog_baseline_build_green.txt",
      "blog repo baseline build"
    ],
    [
      "05_harness_22_green_with_registry.txt",
      "22 green with the tool registry"
    ],
    [
      "18_per_agent_breakdown.txt",
      "per-agent + per-model table (source of the tables below)"
    ]
  ],
  "extra": [
    [
      "Workflow runs",
      "2 — research (8 agents, 237 tool uses) and adversarial review (7 agents, 235 tool uses, 59 findings)"
    ],
    [
      "Crash cost",
      "80,477 output tokens re-spent after the host process died mid-research; disk state survived, the workflow resumed from cache"
    ],
    [
      "Harness at close",
      "24 passed, 1 skipped (stub target)"
    ]
  ],
  "bill": {
    "perModel": [
      {
        "model": "opus-5",
        "agents": 0,
        "output": 0,
        "wall": 0
      },
      {
        "model": "fable-5",
        "agents": 21,
        "output": 812420,
        "wall": 293.7
      },
      {
        "model": "sonnet-5",
        "agents": 0,
        "output": 0,
        "wall": 0
      },
      {
        "model": "haiku",
        "agents": 0,
        "output": 0,
        "wall": 0
      }
    ],
    "perAgent": [
      [
        "main orchestrator",
        "fable-5",
        264769,
        193,
        304,
        117.1
      ],
      [
        "research: aog-mechanics",
        "fable-5",
        57140,
        39,
        53,
        14.2
      ],
      [
        "research: aog-visuals",
        "fable-5",
        51122,
        36,
        69,
        16.6
      ],
      [
        "research: aog-units",
        "fable-5",
        46712,
        32,
        44,
        12.8
      ],
      [
        "research: reference-images",
        "fable-5",
        44678,
        26,
        34,
        13.8
      ],
      [
        "review: instrumentation-robustness",
        "fable-5",
        33440,
        10,
        21,
        8
      ],
      [
        "review: foundation-vs-code",
        "fable-5",
        32389,
        22,
        39,
        10
      ],
      [
        "review: spec-buildability",
        "fable-5",
        30443,
        12,
        21,
        10.6
      ],
      [
        "review: chain-risk-generalist",
        "fable-5",
        29194,
        38,
        57,
        10.9
      ],
      [
        "research: aog-scenarios",
        "fable-5",
        28867,
        32,
        37,
        7.7
      ],
      [
        "review: content-model-vs-editor",
        "fable-5",
        27682,
        17,
        32,
        7.2
      ],
      [
        "review: handoff-executability",
        "fable-5",
        25397,
        24,
        30,
        6.5
      ],
      [
        "review: standards-executability",
        "fable-5",
        22931,
        18,
        35,
        8.7
      ],
      [
        "research: critique-literature",
        "fable-5",
        21389,
        10,
        29,
        6.8
      ],
      [
        "research: aog-mechanics (pre-crash, interrupted)",
        "fable-5",
        17847,
        32,
        46,
        7
      ],
      [
        "research: aog-scenarios (pre-crash, interrupted)",
        "fable-5",
        16499,
        29,
        34,
        6.2
      ],
      [
        "research: aog-visuals (pre-crash, interrupted)",
        "fable-5",
        16288,
        23,
        37,
        6.6
      ],
      [
        "research: aog-units (pre-crash, interrupted)",
        "fable-5",
        16261,
        30,
        38,
        7
      ],
      [
        "research: reference-images (pre-crash, interrupted)",
        "fable-5",
        13582,
        14,
        14,
        6.1
      ],
      [
        "research: judging-methods",
        "fable-5",
        8395,
        15,
        24,
        5.9
      ],
      [
        "research: gauntlet-skill",
        "fable-5",
        7395,
        8,
        11,
        4
      ]
    ],
    "totals": {
      "input": 20709,
      "output": 789690,
      "cacheCreate": 3350145,
      "cacheRead": 96963231,
      "transcripts": 23,
      "messages": 638,
      "wallMinutes": 77,
      "screenshots": 21
    },
    "agentTotal": 812420
  },
  "project": {
    "perModel": [
      {
        "model": "opus-5",
        "agents": 76,
        "output": 3885935,
        "wall": 1157.6
      },
      {
        "model": "fable-5",
        "agents": 22,
        "output": 1075637,
        "wall": 811.2
      },
      {
        "model": "sonnet-5",
        "agents": 4,
        "output": 162757,
        "wall": 39
      },
      {
        "model": "haiku",
        "agents": 0,
        "output": 0,
        "wall": 0
      }
    ],
    "totals": {
      "input": 41758,
      "output": 5098511,
      "cacheCreate": 15683110,
      "cacheRead": 678324514,
      "transcripts": 122,
      "messages": 4748,
      "wallMinutes": 593,
      "screenshots": 41
    },
    "agentTotal": 5124329,
    "sessions": [
      {
        "n": 1,
        "name": "Prep — Arming the Gauntlet",
        "input": 20709,
        "output": 789690,
        "cacheCreate": 3350145,
        "cacheRead": 96963231,
        "transcripts": 23,
        "messages": 638,
        "wallMinutes": 77,
        "screenshots": 21,
        "agents": 21,
        "agentOutput": 812420
      },
      {
        "n": 2,
        "name": "Build — Running the Gauntlet",
        "input": 21049,
        "output": 4308821,
        "cacheCreate": 12332965,
        "cacheRead": 581361283,
        "transcripts": 99,
        "messages": 4110,
        "wallMinutes": 516,
        "screenshots": 20,
        "agents": 81,
        "agentOutput": 4311909
      }
    ],
    "pending": 3
  },
  "pairs": null,
  "audio": null,
  "notes": [
    "Two instruments, two windows. <b>measure-usage.mjs</b> sums every assistant message in the transcript directory over a time window; <b>measure-agents.mjs</b> attributes each message to the agent that produced it. Session 1 differs by 22,730 output tokens (+2.9%) because the per-agent table was regenerated after the deck was built, outside the session window that measure-usage had already closed. Session 2 differs by 3,088 (+0.07%).",
    "Per-model rows come from the per-agent attribution, so they sum to the per-agent total, not the measure-usage total.",
    "Summed agent wall-clock exceeds real elapsed time: agents ran concurrently, capped at the workflow runtime’s parallelism limit. Session 2’s 1,157 opus-minutes fit inside 516 real minutes.",
    "Cache-read tokens dominate every other figure by two orders of magnitude and are billed at a fraction of output. They are shown because they are the honest measure of how much context this experiment moved.",
    "No Haiku agent ran in either session — the model policy (decision D22) routes orchestration to Fable, building to Opus, and mechanical work to Sonnet."
  ]
};
