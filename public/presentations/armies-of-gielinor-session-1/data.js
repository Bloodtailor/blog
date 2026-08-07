// Session 1 deck — The Prep: Arming the Gauntlet
const DECK = [
  {
    n: '01',
    eyebrow: 'The assignment',
    title: 'Three sessions, zero shared memory',
    audio: 'audio/01.mp3',
    keys: [
      { img: 'shots/00_the_assignment.png', at: 0, cap: 'The brief: prep, gauntlet, workflow — each session hands the next its prompt.' },
    ],
  },
  {
    n: '02',
    eyebrow: 'Instrumentation',
    title: 'Instruments first',
    audio: 'audio/02.mp3',
    keys: [
      { img: 'shots/01_measure_usage_works.png', at: 0, cap: 'measure-usage mining real token counts from Claude Code transcripts — tested on this very session.' },
    ],
  },
  {
    n: '03',
    eyebrow: 'Adversity',
    title: 'The crash',
    audio: 'audio/03.mp3',
    keys: [
      { img: 'shots/15_run_log.png', at: 0, cap: 'The run log records its own disaster: host process died, disk state survived, workflow resumed from cache.' },
    ],
  },
  {
    n: '04',
    eyebrow: 'Technique research',
    title: 'Research the weapon before firing it',
    audio: 'audio/04.mp3',
    keys: [
      { img: 'shots/10_gauntlet_failure_modes.png', at: 0, cap: 'The original doctrine, recovered verbatim — including the failure modes it names for itself.' },
    ],
  },
  {
    n: '05',
    eyebrow: 'Game research',
    title: 'Resurrecting a dead game from paper',
    audio: 'audio/05.mp3',
    keys: [
      { img: 'shots/09_reference_contact_sheet.png', at: 0, cap: '191 recovered references — unit tokens, official screenshots, campaign maps. Editorial copies; none ship.' },
    ],
  },
  {
    n: '06',
    eyebrow: 'Executable validation',
    title: 'A harness with a stub heart',
    audio: 'audio/06.mp3',
    keys: [
      { img: 'shots/03_stub_game.png', at: 0, cap: 'The stub: a deliberately ugly 5×5 skirmish that implements every contract the real game must honor.' },
      { img: 'shots/07_harness_first_green.png', at: 0.5, cap: 'First full run: smoke, self-play, determinism, asset integrity, foundation — all green.' },
    ],
  },
  {
    n: '07',
    eyebrow: 'The foundation',
    title: 'The contract you can run',
    audio: 'audio/07.mp3',
    keys: [
      { img: 'shots/06_stub_v2_editor_slice.png', at: 0, cap: 'The vertical slice, live: edit a stat, see it in-game, export, reimport, identical hash.' },
      { img: 'shots/08_harness_22_green.png', at: 0.55, cap: '22 green after the tool registry landed — undo/redo and jump-from-game are tested, not promised.' },
    ],
  },
  {
    n: '08',
    eyebrow: 'The documents',
    title: 'Writing the game back down',
    audio: 'audio/08.mp3',
    keys: [
      { img: 'shots/11_spec_combat_matrix.png', at: 0, cap: 'The damage matrix, rebuilt from worked examples — every unverified cell tagged and ledgered.' },
      { img: 'shots/14_style_bible.png', at: 0.5, cap: 'The style bible: the tier-3 standard for every asset with no surviving reference.' },
    ],
  },
  {
    n: '09',
    eyebrow: 'The handoff',
    title: 'The gauntlet, reforged',
    audio: 'audio/09.mp3',
    keys: [
      { img: 'shots/12_handoff_reconciliation.png', at: 0, cap: 'Every deviation from doctrine is argued in the prompt itself, with citations.' },
    ],
  },
  {
    n: '10',
    eyebrow: 'Quality control',
    title: 'The near-miss and the audit',
    audio: 'audio/10.mp3',
    keys: [
      { img: 'shots/13_ip_guard_amend.png', at: 0, cap: 'The IP rule caught our own research agent: 14 copyrighted images amended out of git history.' },
      { img: 'shots/16_review_findings.png', at: 0.45, cap: 'Seven adversarial reviewers against the finished deliverables — findings triaged and fixed.' },
    ],
  },
  {
    n: '11',
    eyebrow: 'The handover',
    title: 'What Session 2 inherits',
    audio: 'audio/11.mp3',
    keys: [
      { img: 'shots/17_final_state.png', at: 0, cap: 'The full kit: spec, standards, contracts, harness, logs — and one paste-ready prompt.' },
    ],
  },
  {
    n: '12',
    eyebrow: 'Cost and time',
    title: 'The bill',
    audio: 'audio/12.mp3',
    keys: [
      { img: 'shots/18_per_agent_breakdown.png', at: 0, cap: '~810k output tokens per agent and per model — all Fable 5 this session; the crash billed 80k for work done twice.' },
      { img: 'shots/18_per_agent_breakdown.png', at: 0.55, cap: 'The lesson in the model column: from Session 2 on, Fable orchestrates while Opus builds and Sonnet does the easy work.' },
    ],
  },
];
