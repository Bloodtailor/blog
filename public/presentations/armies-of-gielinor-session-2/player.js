// Keyframe player: one narrated section at a time, screenshots advancing
// on fractions of the audio's duration. Each keyframe gets a slow
// Ken Burns drift (alternating directions) so the deck reads as motion,
// not a slideshow. Keyboard: space play/pause, arrows change section.

const stage = document.getElementById('stage');
const caption = document.getElementById('caption');
const chaptersEl = document.getElementById('chapters');
const audio = document.getElementById('narration');
const playBtn = document.getElementById('play');
const timeEl = document.getElementById('time');
const scrub = document.getElementById('scrub');
const scrubFill = document.getElementById('scrub-fill');
const titleEl = document.getElementById('slide-title');
const eyebrowEl = document.getElementById('slide-eyebrow');

let current = -1;
let activeKey = -1;
let started = false;

function fmt(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function buildChapters() {
  DECK.forEach((slide, i) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span class="num">${slide.n}</span>${slide.title}`;
    button.addEventListener('click', () => {
      showDeck();
      load(i, true);
    });
    li.appendChild(button);
    chaptersEl.appendChild(li);
  });
}

function markChapter() {
  [...chaptersEl.children].forEach((li, i) =>
    li.classList.toggle('active', i === current && !document.body.classList.contains('mode-appendix'))
  );
}

function load(index, autoplay) {
  current = Math.max(0, Math.min(DECK.length - 1, index));
  const slide = DECK[current];
  activeKey = -1;

  eyebrowEl.textContent = slide.eyebrow;
  titleEl.textContent = slide.title;

  // Fresh stack of keyframe layers; first one activates on timeupdate 0
  stage.innerHTML = '';
  slide.keys.forEach((key, i) => {
    const layer = document.createElement('div');
    // Synthetic frames (tables, ledgers) letterbox; photographs fill.
    layer.className = key.fit === 'contain' ? 'layer fit-contain' : 'layer';
    const img = document.createElement('img');
    img.src = key.img;
    img.alt = key.cap || slide.title;
    layer.appendChild(img);
    stage.appendChild(layer);
    void i;
  });

  audio.src = slide.audio;
  markChapter();
  showKey(0);
  if (autoplay && started) audio.play().catch(() => {});
}

function showKey(index) {
  const slide = DECK[current];
  if (index === activeKey || index >= slide.keys.length) return;
  activeKey = index;
  [...stage.children].forEach((layer, i) => {
    layer.classList.toggle('active', i === index);
    // Alternate the drift direction so consecutive frames feel distinct
    layer.classList.remove('kb-a', 'kb-b');
    if (i === index) layer.classList.add(index % 2 === 0 ? 'kb-a' : 'kb-b');
  });
  caption.textContent = slide.keys[index].cap || '';
  caption.classList.remove('pop');
  void caption.offsetWidth; // restart the caption animation
  caption.classList.add('pop');
}

function tick() {
  const dur = audio.duration || 0;
  const t = audio.currentTime || 0;
  timeEl.textContent = `${fmt(t)} / ${fmt(dur)}`;
  scrubFill.style.width = dur ? `${(t / dur) * 100}%` : '0%';
  if (!dur) return;
  const slide = DECK[current];
  const frac = t / dur;
  let next = 0;
  for (let i = 0; i < slide.keys.length; i += 1) {
    if (frac >= slide.keys[i].at) next = i;
  }
  showKey(next);
}

playBtn.addEventListener('click', () => {
  started = true;
  if (audio.paused) audio.play();
  else audio.pause();
});

audio.addEventListener('play', () => {
  playBtn.textContent = 'Pause';
  document.body.classList.add('playing');
});
audio.addEventListener('pause', () => {
  playBtn.textContent = 'Play';
  document.body.classList.remove('playing');
});
audio.addEventListener('timeupdate', tick);
audio.addEventListener('loadedmetadata', tick);
audio.addEventListener('ended', () => {
  if (current < DECK.length - 1) load(current + 1, true);
  else playBtn.textContent = 'Replay';
});

document.getElementById('prev').addEventListener('click', () => load(current - 1, true));
document.getElementById('next').addEventListener('click', () => load(current + 1, true));

scrub.addEventListener('click', (event) => {
  const rect = scrub.getBoundingClientRect();
  const frac = (event.clientX - rect.left) / rect.width;
  if (audio.duration) audio.currentTime = frac * audio.duration;
});

document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
    playBtn.click();
  } else if (event.key === 'ArrowRight') load(current + 1, true);
  else if (event.key === 'ArrowLeft') load(current - 1, true);
});

buildChapters();
load(0, false);

/* ---------------------------------------------------------------------
   The appendix: the same evidence the narration flies past, held still.
   Every captured frame at full size, and the bill as tables you can sort
   and scroll. Built from APPENDIX (appendix.js); which deck section used
   a given frame is derived from DECK rather than duplicated by hand.
   --------------------------------------------------------------------- */

const appendixEl = document.getElementById('appendix');
const appendixBtn = document.getElementById('appendix-btn');
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbFile = document.getElementById('lb-file');
const lbCap = document.getElementById('lb-cap');
const lbCount = document.getElementById('lb-count');

let lbIndex = -1;

const MODELS = ['opus-5', 'fable-5', 'sonnet-5', 'haiku'];
const num = (value) => value.toLocaleString('en-US');
const pct = (part, whole) => (whole ? `${((part / whole) * 100).toFixed(1)}%` : '—');
const hhmm = (minutes) => `${Math.floor(minutes / 60)}h ${String(Math.round(minutes % 60)).padStart(2, '0')}m`;

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

/** Section numbers in DECK that show a given screenshot. */
function usedBy(file) {
  return DECK.filter((slide) => slide.keys.some((key) => key.img === `shots/${file}`)).map((s) => s.n);
}

function modelTag(model) {
  return `<span class="model-tag m-${model}">${model}</span>`;
}

/* ---- sortable table ---- */

function table(columns, rows, footer) {
  const wrap = el('div', 'apx-scroll');
  const t = el('table', 'apx');
  const thead = el('thead');
  const tr = el('tr');
  columns.forEach((col, i) => {
    const th = el('th', col.n ? 'n' : '', col.label);
    th.title = 'Click to sort';
    th.addEventListener('click', () => sortBy(i));
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  const tbody = el('tbody');
  t.append(thead, tbody);
  if (footer) {
    const tfoot = el('tfoot');
    const ftr = el('tr');
    footer.forEach((cell, i) => ftr.appendChild(el('td', columns[i].n ? 'n' : '', cell)));
    tfoot.appendChild(ftr);
    t.appendChild(tfoot);
  }
  wrap.appendChild(t);

  let sortCol = -1;
  let desc = true;

  function paint() {
    const order = [...rows];
    if (sortCol >= 0) {
      const key = columns[sortCol].sort || ((row) => row[sortCol]);
      order.sort((a, b) => {
        const x = key(a);
        const y = key(b);
        const cmp = typeof x === 'number' ? x - y : String(x).localeCompare(String(y));
        return desc ? -cmp : cmp;
      });
    }
    tbody.innerHTML = '';
    order.forEach((row) => {
      const line = el('tr');
      columns.forEach((col, i) => line.appendChild(el('td', col.n ? 'n' : '', col.cell(row, i))));
      tbody.appendChild(line);
    });
    [...tr.children].forEach((th, i) => {
      if (i === sortCol) th.setAttribute('aria-sort', desc ? 'descending' : 'ascending');
      else th.removeAttribute('aria-sort');
    });
  }

  function sortBy(i) {
    if (i === sortCol) desc = !desc;
    else {
      sortCol = i;
      desc = true;
    }
    paint();
  }

  paint();
  return wrap;
}

/* ---- sections ---- */

function section(id, title, note) {
  const s = el('section', 'apx-section');
  s.id = id;
  s.appendChild(el('h2', '', `${title}${note ? `<small>${note}</small>` : ''}`));
  return s;
}

function gallerySection() {
  const s = section(
    'apx-shots',
    'Every captured frame',
    `${APPENDIX.shots.length} images — click any one for full screen`
  );
  const grid = el('div', 'apx-grid');
  APPENDIX.shots.forEach((shot, index) => {
    const tile = el('button', 'apx-tile');
    tile.type = 'button';
    const sections = usedBy(shot.file);
    tile.innerHTML =
      `<img src="shots/${shot.file}" alt="${shot.cap.replace(/"/g, '&quot;')}" loading="lazy" />` +
      '<div class="meta">' +
      `<div class="file">${shot.file}</div>` +
      `<div class="cap">${shot.cap}</div>` +
      `<div class="used">${sections.length ? `narrated in §${sections.join(' · §')}` : 'not in the narration'}</div>` +
      '</div>';
    tile.addEventListener('click', () => openLightbox(index));
    grid.appendChild(tile);
  });
  s.appendChild(grid);

  if (APPENDIX.text && APPENDIX.text.length) {
    s.appendChild(el('h2', '', 'Text evidence <small>raw command output, captured at the moment</small>'));
    const list = el('ul', 'apx-files');
    APPENDIX.text.forEach(([file, label]) => {
      const li = el('li');
      li.innerHTML = `<a href="shots/${file}" target="_blank" rel="noopener">${file}</a> <span>— ${label}</span>`;
      list.appendChild(li);
    });
    s.appendChild(list);
  }
  return s;
}

function perModelSection() {
  const { perModel, agentTotal } = APPENDIX.bill;
  const s = section(
    'apx-model',
    `Session ${APPENDIX.session}: output tokens by model`,
    'from tools/measure-agents.mjs'
  );
  const columns = [
    { label: 'model', cell: (r) => modelTag(r.model), sort: (r) => MODELS.indexOf(r.model) },
    { label: 'agents', n: true, cell: (r) => num(r.agents), sort: (r) => r.agents },
    { label: 'output tokens', n: true, cell: (r) => num(r.output), sort: (r) => r.output },
    { label: 'share', n: true, cell: (r) => pct(r.output, agentTotal), sort: (r) => r.output },
    {
      label: '',
      cell: (r) =>
        r.output ? `<span class="bar m-${r.model}" style="width:${Math.max(2, (r.output / agentTotal) * 220)}px"></span>` : '',
      sort: (r) => r.output,
    },
    { label: 'summed agent wall-clock', n: true, cell: (r) => (r.wall ? `${r.wall.toFixed(1)} min` : '—'), sort: (r) => r.wall },
  ];
  s.appendChild(
    table(columns, perModel, [
      'all models',
      num(perModel.reduce((a, r) => a + r.agents, 0)),
      num(agentTotal),
      '100.0%',
      '',
      `${perModel.reduce((a, r) => a + r.wall, 0).toFixed(1)} min`,
    ])
  );
  return s;
}

function totalsSection() {
  const t = APPENDIX.bill.totals;
  const s = section(
    'apx-session',
    `Session ${APPENDIX.session}: the whole bill`,
    'window totals from tools/measure-usage.mjs'
  );
  const rows = [
    ['Wall clock', `${hhmm(t.wallMinutes)} (${t.wallMinutes} minutes)`],
    ['Output tokens', `${num(t.output)} <span style="color:#6a789c">— per-agent attribution sums to ${num(APPENDIX.bill.agentTotal)}</span>`],
    ['Input tokens', num(t.input)],
    ['Cache creation', num(t.cacheCreate)],
    ['Cache read', `${num(t.cacheRead)} <span style="color:#6a789c">— ${(t.cacheRead / t.output).toFixed(0)}× the output</span>`],
    ['Transcript files', num(t.transcripts)],
    ['Assistant messages', num(t.messages)],
    [
      'Frames in the appendix',
      `${num(APPENDIX.shots.length)} on disk — metrics.json logs ${num(t.screenshots)} captured during the session itself`,
    ],
    ...(APPENDIX.extra || []),
  ];
  const kv = el('div', 'apx-kv');
  rows.forEach(([k, v]) => {
    kv.appendChild(el('div', 'k', k));
    kv.appendChild(el('div', 'v', v));
  });
  s.appendChild(kv);
  return s;
}

function perAgentSection() {
  const rows = APPENDIX.bill.perAgent;
  const s = section(
    'apx-agents',
    `Session ${APPENDIX.session}: every agent`,
    `${rows.length} agents — click a column header to sort`
  );
  const columns = [
    { label: 'agent', cell: (r) => r[0], sort: (r) => r[0] },
    { label: 'model', cell: (r) => modelTag(r[1]), sort: (r) => MODELS.indexOf(r[1]) },
    { label: 'output tokens', n: true, cell: (r) => num(r[2]), sort: (r) => r[2] },
    { label: 'messages', n: true, cell: (r) => num(r[3]), sort: (r) => r[3] },
    { label: 'tool uses', n: true, cell: (r) => num(r[4]), sort: (r) => r[4] },
    { label: 'wall-clock', n: true, cell: (r) => `${r[5].toFixed(1)} min`, sort: (r) => r[5] },
  ];
  s.appendChild(
    table(columns, rows, [
      `${rows.length} agents`,
      '',
      num(APPENDIX.bill.agentTotal),
      num(rows.reduce((a, r) => a + r[3], 0)),
      num(rows.reduce((a, r) => a + r[4], 0)),
      `${rows.reduce((a, r) => a + r[5], 0).toFixed(1)} min`,
    ])
  );
  return s;
}

function projectSection() {
  const p = APPENDIX.project;
  const s = section(
    'apx-project',
    'The project so far',
    `sessions 1–${p.sessions.length} of ${p.pending} — running tally`
  );

  const modelColumns = [
    { label: 'model', cell: (r) => modelTag(r.model), sort: (r) => MODELS.indexOf(r.model) },
    { label: 'agents', n: true, cell: (r) => num(r.agents), sort: (r) => r.agents },
    { label: 'output tokens', n: true, cell: (r) => num(r.output), sort: (r) => r.output },
    { label: 'share', n: true, cell: (r) => pct(r.output, p.agentTotal), sort: (r) => r.output },
    {
      label: '',
      cell: (r) =>
        r.output ? `<span class="bar m-${r.model}" style="width:${Math.max(2, (r.output / p.agentTotal) * 220)}px"></span>` : '',
      sort: (r) => r.output,
    },
    { label: 'summed agent wall-clock', n: true, cell: (r) => (r.wall ? `${r.wall.toFixed(1)} min` : '—'), sort: (r) => r.wall },
  ];
  s.appendChild(
    table(modelColumns, p.perModel, [
      'project total',
      num(p.perModel.reduce((a, r) => a + r.agents, 0)),
      num(p.agentTotal),
      '100.0%',
      '',
      `${p.perModel.reduce((a, r) => a + r.wall, 0).toFixed(1)} min`,
    ])
  );

  s.appendChild(el('h2', '', 'Session by session <small>each row is one working session</small>'));
  const sessionColumns = [
    { label: 'session', cell: (r) => `${r.n} — ${r.name}`, sort: (r) => r.n },
    { label: 'agents', n: true, cell: (r) => num(r.agents), sort: (r) => r.agents },
    { label: 'output tokens', n: true, cell: (r) => num(r.output), sort: (r) => r.output },
    { label: 'cache read', n: true, cell: (r) => num(r.cacheRead), sort: (r) => r.cacheRead },
    { label: 'wall clock', n: true, cell: (r) => hhmm(r.wallMinutes), sort: (r) => r.wallMinutes },
    { label: 'transcripts', n: true, cell: (r) => num(r.transcripts), sort: (r) => r.transcripts },
    { label: 'shots', n: true, cell: (r) => num(r.screenshots), sort: (r) => r.screenshots },
  ];
  const pendingRows = [];
  for (let n = p.sessions.length + 1; n <= p.pending; n += 1) {
    pendingRows.push({ n, name: 'not yet run', agents: 0, output: 0, cacheRead: 0, wallMinutes: 0, transcripts: 0, screenshots: 0 });
  }
  s.appendChild(
    table(sessionColumns, [...p.sessions, ...pendingRows], [
      `${p.sessions.length} of ${p.pending} run`,
      num(p.perModel.reduce((a, r) => a + r.agents, 0)),
      num(p.totals.output),
      num(p.totals.cacheRead),
      hhmm(p.totals.wallMinutes),
      num(p.totals.transcripts),
      num(p.totals.screenshots),
    ])
  );

  s.appendChild(el('h2', '', 'Project totals <small>summed measure-usage windows</small>'));
  const kv = el('div', 'apx-kv');
  [
    ['Wall clock', `${hhmm(p.totals.wallMinutes)} across ${p.sessions.length} sessions`],
    ['Output tokens', `${num(p.totals.output)} <span style="color:#6a789c">— per-agent attribution sums to ${num(p.agentTotal)}</span>`],
    ['Input tokens', num(p.totals.input)],
    ['Cache creation', num(p.totals.cacheCreate)],
    ['Cache read', num(p.totals.cacheRead)],
    ['Agents run', num(p.perModel.reduce((a, r) => a + r.agents, 0))],
    ['Transcript files', num(p.totals.transcripts)],
    ['Assistant messages', num(p.totals.messages)],
    ['Frames logged during sessions', num(p.totals.screenshots)],
  ].forEach(([k, v]) => {
    kv.appendChild(el('div', 'k', k));
    kv.appendChild(el('div', 'v', v));
  });
  s.appendChild(kv);

  s.appendChild(el('h2', '', 'How to read these numbers'));
  const notes = el('ol', 'apx-notes');
  APPENDIX.notes.forEach((note) => notes.appendChild(el('li', '', note)));
  s.appendChild(notes);
  return s;
}

/* ---------------------------------------------------------------------
   Judge it yourself: the two panels where the deck stops summarising.
   Every judged asset beside the artifact it was judged against, and every
   audio file playable beside the brief that produced it.
   --------------------------------------------------------------------- */

function pairsSection() {
  const groups = [...new Set(APPENDIX.pairs.map((p) => p.group))];
  const withRef = APPENDIX.pairs.filter((p) => !p.tier3).length;
  const s = section(
    'apx-pairs',
    'Judge it yourself',
    `${withRef} assets beside the 2009 artifact they were judged against, and ${APPENDIX.pairs.length - withRef} that had none`
  );
  s.appendChild(
    el(
      'p',
      'apx-lede',
      'The critics saw exactly this: two images, one size, no labels, no idea which was which. ' +
        'Where a defect was logged it is printed under the pair, so you can look at the claim and the pixels together. ' +
        'Click any pair to open both at full size.'
    )
  );

  const bar = el('div', 'apx-filter');
  const grid = el('div', 'apx-pairgrid');

  function paint(group) {
    grid.innerHTML = '';
    APPENDIX.pairs
      .filter((p) => !group || p.group === group)
      .forEach((p) => {
        const card = el('button', `pair${p.tier3 ? ' t3' : ''}`);
        card.type = 'button';
        card.innerHTML =
          '<div class="duo">' +
          (p.tier3
            ? '<div class="slot none">no reference<br>exists</div>'
            : `<div class="slot ref"><img src="pairs/${p.id}-ref.png" alt="2009 original, ${p.id}" loading="lazy"><span>original</span></div>`) +
          `<div class="slot our"><img src="pairs/${p.id}-ours.png" alt="our recreation, ${p.id}" loading="lazy"><span>ours</span></div>` +
          '</div>' +
          `<div class="pair-name">${p.id.replace(/-/g, ' ')}</div>` +
          (p.defect ? `<div class="pair-note">${p.defect}</div>` : '');
        card.addEventListener('click', () => openPair(p));
        grid.appendChild(card);
      });
  }

  [['All', ''], ...groups.map((g) => [g, g])].forEach(([label, group], i) => {
    const b = el('button', `chip${i === 0 ? ' on' : ''}`, label);
    b.type = 'button';
    b.addEventListener('click', () => {
      [...bar.children].forEach((c) => c.classList.remove('on'));
      b.classList.add('on');
      paint(group);
    });
    bar.appendChild(b);
  });
  s.append(bar, grid);
  paint('');
  return s;
}

/** The lightbox, in two-up mode. */
function openPair(p) {
  lbIndex = -1;
  lightbox.classList.add('open', 'duo');
  document.getElementById('lb-duo').innerHTML = p.tier3
    ? `<figure><figcaption>no reference exists — judged on a written rubric</figcaption>
         <div class="none">tier 3</div></figure>
       <figure><figcaption>ours</figcaption><img src="pairs/${p.id}-ours.png" alt=""></figure>`
    : `<figure><figcaption>the 2009 original</figcaption><img src="pairs/${p.id}-ref.png" alt=""></figure>
       <figure><figcaption>ours</figcaption><img src="pairs/${p.id}-ours.png" alt=""></figure>`;
  lbFile.textContent = p.id;
  lbCap.textContent = p.defect || (p.tier3 ? 'Tier 3 — no artifact survives.' : 'No defect was logged against this pair.');
  lbCount.textContent = p.group;
}

function audioSection() {
  const { assets, post } = APPENDIX.audio;
  const s = section(
    'apx-listen',
    'Listening station',
    `${assets.length} files — the one judgement no agent in this project could make`
  );
  s.appendChild(
    el(
      'p',
      'apx-lede',
      'Nothing of the original soundtrack survives, so every one of these is tier 3 by force: the brief <i>is</i> the standard. ' +
        'It was written and frozen before generation. Read it, press play, and decide whether the file matches the words.'
    )
  );

  ['music', 'sfx'].forEach((kind) => {
    const mine = assets.filter((a) => a.kind === kind);
    s.appendChild(
      el(
        'h2',
        '',
        `${kind === 'music' ? 'Music' : 'Effects'} <small>${mine.length} files · ${
          kind === 'music'
            ? 'one per board theme, plus the title screen'
            : 'each bound to one game event in settings/core.json'
        }</small>`
      )
    );
    const list = el('div', 'apx-audio');
    mine.forEach((a) => {
      const row = el('div', 'track');
      row.innerHTML =
        `<div class="head"><div class="id">${a.id}</div><div class="purpose">${a.purpose}</div>` +
        (a.when ? `<div class="when">${a.when}</div>` : '') +
        `<audio controls preload="none" src="${a.file}"></audio>
         <div class="specs">${
           kind === 'music'
             ? `${(a.params.music_length_ms / 1000).toFixed(0)}s requested · ${a.kb} KB`
             : `${a.params.duration_seconds}s · influence ${a.params.prompt_influence} · ${a.kb} KB`
         }</div></div>` +
        `<div class="brief"><b>The brief, verbatim — this is the standard:</b> ${a.brief}</div>` +
        (a.verdict ? `<div class="verdict">${a.verdict}</div>` : '');
      list.appendChild(row);
    });
    s.appendChild(list);
  });

  s.appendChild(el('h2', '', 'What was measured rather than judged'));
  const kv = el('div', 'apx-kv');
  [
    ['Music mastering', post.music],
    ['Effect mastering', post.sfx],
    [
      'Gates that passed',
      'Every track ≥90s. Integrated loudness −16 LUFS ±2. No clipping. Loop seams RMS-verified. The effect set inside a 0.81 LU spread, true peak ≤ −1.5 dBTP.',
    ],
    [
      'Gate that failed',
      'sfx.select came back as a rumble rather than a click — the only thing a critic without ears caught in the whole audio rung. The file above is the re-roll, attempt 2, transient verified.',
    ],
    [
      'The protocol problem',
      'Mood and instrumentation were judged from spectrograms rendered on a <b>linear</b> frequency axis while labelled logarithmic, with column decimation aliasing the tempo reads — found by the critic that had just used them (KI-7 / DF-52). The hard gates above are arithmetic and unaffected; the mood verdicts are not.',
    ],
  ].forEach(([k, v]) => {
    kv.appendChild(el('div', 'k', k));
    kv.appendChild(el('div', 'v', v));
  });
  s.appendChild(kv);
  return s;
}

/* ---- lightbox ---- */

function openLightbox(index) {
  lbIndex = (index + APPENDIX.shots.length) % APPENDIX.shots.length;
  const shot = APPENDIX.shots[lbIndex];
  lbImg.src = `shots/${shot.file}`;
  lbImg.alt = shot.cap;
  lbFile.textContent = shot.file;
  lbCap.textContent = shot.cap;
  lbCount.textContent = `${lbIndex + 1} / ${APPENDIX.shots.length}`;
  lightbox.classList.remove('duo');
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open', 'duo');
  lbIndex = -1;
}

document.getElementById('lb-prev').addEventListener('click', () => openLightbox(lbIndex - 1));
document.getElementById('lb-next').addEventListener('click', () => openLightbox(lbIndex + 1));
document.getElementById('lb-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.classList.contains('lb-stage')) closeLightbox();
});

/* ---- mode switching ---- */

function showAppendix() {
  if (!appendixEl.dataset.built) {
    appendixEl.append(gallerySection());
    // Only Session 2 judged assets against references and shipped audio.
    if (APPENDIX.pairs) appendixEl.appendChild(pairsSection());
    if (APPENDIX.audio) appendixEl.appendChild(audioSection());
    appendixEl.append(perModelSection(), totalsSection(), perAgentSection(), projectSection());
    appendixEl.dataset.built = '1';
  }
  audio.pause();
  document.body.classList.add('mode-appendix');
  markChapter();
  appendixEl.scrollTop = 0;
}

function showDeck() {
  document.body.classList.remove('mode-appendix');
  markChapter();
}

appendixBtn.addEventListener('click', () => {
  if (document.body.classList.contains('mode-appendix')) showDeck();
  else showAppendix();
});

/* Keys belong to whichever layer is on top: lightbox, then appendix,
   then the deck's own handler in the player above. */
document.addEventListener(
  'keydown',
  (event) => {
    if (lbIndex >= 0) {
      if (event.key === 'Escape') closeLightbox();
      else if (event.key === 'ArrowRight') openLightbox(lbIndex + 1);
      else if (event.key === 'ArrowLeft') openLightbox(lbIndex - 1);
      else if (event.key !== ' ') return;
      event.preventDefault();
      event.stopImmediatePropagation();
    } else if (document.body.classList.contains('mode-appendix')) {
      if (event.key === 'Escape') {
        showDeck();
        event.stopImmediatePropagation();
      } else if (event.key === ' ' || event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        // the appendix scrolls; it does not drive the narration
        event.stopImmediatePropagation();
      }
    }
  },
  true
);
