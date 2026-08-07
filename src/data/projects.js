// Projects, hand-maintained — carried over from the homepage design.
// Add an object to add a project. `shot` is a screenshot path, or null: the card is
// designed for the missing state. `tier: "flagship"` puts it in the long-form section.
export const PROJECTS = [
  {
    name: 'Wordhord',
    tagline: 'a local-first AI language-learning platform',
    blurb: 'A per-word, per-skill, evidence-based map of what you actually know — and the classic techniques (graded reading, shadowing, cloze, Pimsleur-style audio) generated fresh against it, about things you actually care about. Japanese is fully built; Korean, German and Spanish generate their own materials on first start.',
    href: null,                      // ← paste the Wordhord repo URL here
    external: true,
    year: 2026,
    status: 'building',
    tier: 'flagship',
    tags: ['Python', 'DeepSeek', 'ElevenLabs', 'FSRS', 'local-first'],
    highlights: [
      ['The Chat', 'A teacher that remembers you and never interrupts. Every message earns a rewrite card — mistakes get fixed, clean messages get one reachable step above your level.'],
      ['The Hoard', 'Every word you master, with receipts: tap any word, anywhere, ever, and see what the app believes about it and why.'],
      ['Honest about failure', 'Where a capability failed its audit — pitch accent at 60% cross-model agreement against a 95% bar — the room says so instead of shipping unverified data.']
    ],
    runsOn: 'Runs on your machine · your keys · no cloud, no account, no telemetry',
    shot: null,
    post: null
  },
  {
    name: 'LLM Monster Hunter',
    tagline: 'every monster written, painted, and refereed at play time',
    blurb: 'The archetypal creature-catching adventure, except no creature exists before you meet it. The code only manages context and stores data — the AI does the storytelling, the balancing, and the refereeing. Where most games ship gigabytes of assets, this one ships two API keys.',
    href: 'https://github.com/Bloodtailor/LlmMonsterHunter',
    external: true,
    year: 2026,
    status: 'playable, all core mechanics in',
    tier: 'flagship',
    tags: ['Python', 'Flask', 'React', 'DeepSeek', 'Gemini', 'SSE'],
    highlights: [
      ['Word ladders, not HP', 'The one rule the whole architecture obeys: the LLM only ever picks words, Python owns every number. Combat state is a position on a ladder from fresh to incapacitated.'],
      ['Monsters that remember', 'Battles, conversations, defeats and journeys persist across runs — a monster you beat can come back hostile, friendly, or wary, and evolution repaints use the old art as reference so it stays recognizably itself.'],
      ['You can just say things', 'Type a free-text action in battle and the referee decides whether it is possible. Recruitment is negotiation: monsters join by their own will, or talk, plead, and flee on their own turns.']
    ],
    runsOn: 'Windows 10/11 · one double-click setup · bring a DeepSeek key',
    shot: null,
    post: null
  },
  {
    name: 'BLACKWATER',
    tagline: 'cave-diving zombies, built in a weekend',
    blurb: 'Black Ops zombies, except you are cave diving. Procedural cave graph, a full in-game level editor, and 58 commits across four days. All audio — sound design, voice lines, music — came out of the ElevenLabs API.',
    href: 'https://play.aaronorelup.com',
    external: true,
    year: 2026,
    status: 'proof of concept',
    tags: ['Three.js', 'gamedev', 'ElevenLabs', 'level editor'],
    post: 'blackwater-weekend',
    shot: null
  },
  {
    name: 'Grind & Grimoire',
    tagline: 'a Venice Beach wizard story',
    blurb: 'A skateboarding wizard with a 2 AM open-mic slot and no poem written. Grind anything with an edge, fireball the fiends, buy drip for compliments that inflate an EGO stat your wizard resents. One prompt, one evening, everything procedural.',
    href: '/games/grind-and-grimoire/',
    external: false,
    year: 2026,
    status: 'finished',
    tags: ['Three.js', 'one-shot', 'ElevenLabs'],
    post: 'grind-and-grimoire',
    shot: null
  }
];
