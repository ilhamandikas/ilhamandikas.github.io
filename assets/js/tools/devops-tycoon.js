// DevOps Tycoon — a server-infrastructure management game. Build capacity,
// survive incidents, stay profitable. Everything is a DOM grid: no canvas.
const { tk } = window;

const TICK_MS = 1000;
const REVENUE_PER_REQ = 50;   // rupiah earned per successful request
const BASE_CAPACITY = 150;    // req/s served by one server at level 0
const SERVER_UPKEEP = 200;    // rupiah per tick, per server
const DB_UPKEEP = 150;        // rupiah per tick for the database
const START_MONEY = 50000;
const START_TRAFFIC = 20;

const els = {
  money: document.querySelector('#dt-money'),
  traffic: document.querySelector('#dt-traffic'),
  capacity: document.querySelector('#dt-capacity'),
  cpu: document.querySelector('#dt-cpu'),
  cpuBar: document.querySelector('#dt-cpu-bar'),
  db: document.querySelector('#dt-db'),
  dbBar: document.querySelector('#dt-db-bar'),
  disk: document.querySelector('#dt-disk'),
  diskBar: document.querySelector('#dt-disk-bar'),
  latency: document.querySelector('#dt-latency'),
  error: document.querySelector('#dt-error'),
  sla: document.querySelector('#dt-sla'),
  satisfaction: document.querySelector('#dt-satisfaction'),
  uptime: document.querySelector('#dt-uptime'),
  servers: document.querySelector('#dt-servers'),
  event: document.querySelector('#dt-event'),
  play: document.querySelector('#dt-play'),
  step: document.querySelector('#dt-step'),
  reset: document.querySelector('#dt-reset'),
  shop: document.querySelector('#dt-shop'),
  incidents: document.querySelector('#dt-incidents'),
  log: document.querySelector('#dt-log'),
  status: document.querySelector('#dt-status'),
};

// The shop. `level: true` items can be bought repeatedly; the rest are one-off.
const SHOP = [
  { id: 'server', name: 'App server', desc: 'Add another application server.', base: 15000, growth: 1.6 },
  { id: 'cpu', name: 'CPU upgrade', desc: 'More throughput per server.', base: 9000, growth: 1.8, level: true },
  { id: 'ram', name: 'RAM upgrade', desc: 'More headroom, fewer crashes.', base: 8000, growth: 1.8, level: true },
  { id: 'disk', name: 'Disk upgrade', desc: 'More room for logs and data.', base: 7000, growth: 1.7, level: true },
  { id: 'bw', name: 'Bandwidth', desc: 'Higher network ceiling.', base: 10000, growth: 1.7, level: true },
  { id: 'db', name: 'Database upgrade', desc: 'More queries per second.', base: 20000, growth: 1.8, level: true },
  { id: 'redis', name: 'Redis cache', desc: 'Cuts database load by 30%.', base: 25000 },
  { id: 'cdn', name: 'CDN', desc: 'Serves 40% of traffic from the edge.', base: 40000 },
  { id: 'waf', name: 'WAF', desc: 'Filters bot traffic before it costs money.', base: 30000 },
  { id: 'lb', name: 'Load balancer', desc: 'Makes extra servers fully effective.', base: 35000 },
  { id: 'pooling', name: 'Connection pooling', desc: 'Fewer database connections.', base: 20000 },
  { id: 'monitoring', name: 'Monitoring', desc: 'Earlier warnings, faster recovery.', base: 20000 },
  { id: 'logrotation', name: 'Log rotation', desc: 'Disk grows 60% slower.', base: 15000 },
  { id: 'objectstorage', name: 'Object storage', desc: 'Offloads logs and media.', base: 30000 },
  { id: 'queue', name: 'Message queue', desc: 'Smooths spikes, lower latency.', base: 35000 },
  { id: 'autoscaling', name: 'Autoscaling', desc: 'Adds servers when CPU passes 85%.', base: 60000 },
  { id: 'backup', name: 'Backups', desc: 'Softens data-loss incidents.', base: 25000 },
  { id: 'replica', name: 'Read replica', desc: 'Offloads reads from the primary.', base: 45000 },
  { id: 'multiregion', name: 'Multi-region', desc: 'Big capacity and resilience.', base: 200000 },
];

// Incident templates. Each option either buys a shop item, applies a quick fix,
// or is ignored. `error` is added to the error rate while it is active.
const INCIDENTS = {
  cpu: {
    title: 'CPU Overload', severity: 'critical', error: 0.08, ttl: 25,
    detail: () => `CPU is at ${Math.round(state.lastCpu)}% while serving ${Math.round(state.traffic)} req/s.`,
    options: [
      { label: 'Restart service', cost: 0, note: 'Quick fix, short outage', apply: () => tempFix(0.03, 5) },
      { label: 'Add a server', buy: 'server', note: 'Permanent capacity' },
      { label: 'Upgrade CPU', buy: 'cpu', note: 'More per-server throughput' },
      { label: 'Enable Redis', buy: 'redis', note: 'Takes pressure off the database' },
      { label: 'Ignore', ignore: true, note: 'Reputation will suffer' },
    ],
  },
  disk: {
    title: 'Disk Full', severity: 'warning', error: 0.02, ttl: 30,
    detail: () => `Disk is at ${Math.round(state.disk)}%. Logs are filling the volume.`,
    options: [
      { label: 'Delete old logs', cost: 0, note: 'Frees space now', apply: () => { state.disk = Math.max(0, state.disk - 35); } },
      { label: 'Enable log rotation', buy: 'logrotation', note: 'Permanent: slower growth' },
      { label: 'Increase disk', buy: 'disk', note: 'More room' },
      { label: 'Move logs to object storage', buy: 'objectstorage', note: 'Offloads storage' },
      { label: 'Ignore', ignore: true, note: 'Risk a crash' },
    ],
  },
  db: {
    title: 'Database Overload', severity: 'critical', error: 0.1, ttl: 25,
    detail: () => `Database is at ${Math.round(state.lastDb)}% with slow queries.`,
    options: [
      { label: 'Add an index', cost: 5000, note: 'Speeds up reads for a while', apply: () => tempFix(0.04, 10) },
      { label: 'Upgrade database', buy: 'db', note: 'More capacity' },
      { label: 'Add read replica', buy: 'replica', note: 'Offloads reads' },
      { label: 'Enable connection pooling', buy: 'pooling', note: 'Fewer connections' },
      { label: 'Restart database', cost: 0, note: 'Brief outage', apply: () => tempFix(0.05, 5) },
    ],
  },
  spike: {
    title: 'Traffic Spike', severity: 'warning', error: 0.05, ttl: 20,
    detail: () => `Traffic jumped to ${Math.round(state.traffic)} req/s.`,
    options: [
      { label: 'Enable CDN', buy: 'cdn', note: 'Serve more from the edge' },
      { label: 'Add a server', buy: 'server', note: 'More capacity' },
      { label: 'Enable autoscaling', buy: 'autoscaling', note: 'Adds servers automatically' },
      { label: 'Ride it out', ignore: true, note: 'Free, but risky' },
    ],
  },
  crash: {
    title: 'Service Down', severity: 'critical', error: 0.3, ttl: 15,
    detail: () => 'An application server has failed and stopped serving traffic.',
    options: [
      { label: 'Restart service', cost: 0, note: 'Back online, brief downtime', apply: () => { state.satisfaction -= 1; } },
      { label: 'Add a spare server', buy: 'server', note: 'More redundancy' },
      { label: 'Enable monitoring', buy: 'monitoring', note: 'Catch the next one earlier' },
      { label: 'Ignore', ignore: true, note: 'Downtime continues' },
    ],
  },
  ssl: {
    title: 'SSL Certificate Expired', severity: 'critical', error: 0.2, ttl: 20,
    detail: () => 'Browsers reject the certificate, so users see warnings.',
    options: [
      { label: 'Renew certificate', cost: 10000, note: 'Fix it now', apply: () => { state.satisfaction += 1; } },
      { label: 'Ignore', ignore: true, note: 'Users keep seeing warnings' },
    ],
  },
  memory: {
    title: 'Memory Leak', severity: 'warning', error: 0.04, ttl: 30,
    detail: () => 'RAM keeps climbing and the process will eventually be killed.',
    options: [
      { label: 'Restart service', cost: 0, note: 'Resets memory, brief outage', apply: () => tempFix(0.02, 8) },
      { label: 'Upgrade RAM', buy: 'ram', note: 'More headroom' },
      { label: 'Enable monitoring', buy: 'monitoring', note: 'Alert earlier next time' },
      { label: 'Ignore', ignore: true, note: 'It will crash eventually' },
    ],
  },
};

const EVENTS = [
  { text: 'Your app went viral on social media.', trafficMul: 2.5, ttl: 30, kind: 'good' },
  { text: 'A marketing campaign launched.', trafficMul: 1.8, ttl: 40, kind: 'good' },
  { text: 'Bot traffic detected.', trafficMul: 1.6, ttl: 30, kind: 'bad' },
  { text: 'The cloud provider raised prices.', costMul: 1.15, ttl: 60, kind: 'bad' },
  { text: 'A deploy improved efficiency.', trafficMul: 0.9, ttl: 30, kind: 'good' },
];

const state = {};
let timer = null;
let incidentSeq = 0;
const shopRefs = {};
let incidentSignature = '';
let logSignature = '';

const money = (value) => `Rp ${Math.round(value).toLocaleString('id-ID')}`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function addLog(text) {
  state.log.unshift(`[t${state.tick}] ${text}`);
  if (state.log.length > 9) state.log.pop();
}

function tempFix(amount, ttl) {
  state.tempFixes.push({ amount, ttl });
}

const shopItem = (id) => SHOP.find((item) => item.id === id);
const level = (id) => state.levels[id] || 0;

function costOf(item) {
  if (item.id === 'server') return Math.round(item.base * item.growth ** (state.servers - 1));
  if (item.level) return Math.round(item.base * item.growth ** level(item.id));
  return item.base;
}

function owned(item) {
  return !item.level && item.id !== 'server' && Boolean(state.upgrades[item.id]);
}

function buy(id) {
  const item = shopItem(id);
  if (!item) return 'unknown';
  if (owned(item)) return 'owned';
  const cost = costOf(item);
  if (state.money < cost) return 'poor';
  state.money -= cost;
  if (item.id === 'server') state.servers += 1;
  else if (item.level) {
    state.levels[item.id] += 1;
    if (item.id === 'disk') state.disk = Math.max(0, state.disk - 25);
  } else state.upgrades[item.id] = true;
  addLog(`Bought ${item.name} for ${money(cost)}.`);
  render();
  return 'ok';
}

// --- simulation -----------------------------------------------------------

function computeLoad() {
  const eventMul = state.event && state.event.trafficMul ? state.event.trafficMul : 1;
  const traffic = state.traffic * eventMul;
  const botShare = state.upgrades.waf ? 0.05 : 0.15;
  const paying = traffic * (1 - botShare);
  const origin = paying * (state.upgrades.cdn ? 0.6 : 1);

  const perServer = BASE_CAPACITY * (1 + level('cpu') * 0.5) * (1 + level('ram') * 0.25) * (1 + level('bw') * 0.15);
  const effectiveServers = state.servers === 1 ? 1 : (state.upgrades.lb ? state.servers : 1 + (state.servers - 1) * 0.4);
  const capacity = perServer * effectiveServers * (state.upgrades.multiregion ? 1.5 : 1);
  const cpu = capacity > 0 ? (origin / capacity) * 100 : 999;

  const dbCapacity = 200 * (1 + level('db') * 0.8) * (state.upgrades.multiregion ? 1.5 : 1);
  let dbLoad = origin;
  if (state.upgrades.redis) dbLoad *= 0.7;
  if (state.upgrades.replica) dbLoad *= 0.6;
  if (state.upgrades.pooling) dbLoad *= 0.9;
  const dbPct = (dbLoad / dbCapacity) * 100;

  let latency = 30;
  if (cpu > 60) latency += (cpu - 60) * 3;
  if (dbPct > 60) latency += (dbPct - 60) * 4;
  if (state.upgrades.redis) latency *= 0.8;
  if (state.upgrades.queue) latency *= 0.9;
  if (state.upgrades.pooling) latency *= 0.85;
  if (state.upgrades.multiregion) latency *= 0.8;

  let error = 0;
  if (cpu > 90) error += (cpu - 90) * 0.01;
  if (dbPct > 90) error += (dbPct - 90) * 0.008;
  for (const inc of state.incidents) error += inc.error;
  for (const fix of state.tempFixes) error -= fix.amount;
  error = clamp(error, 0, 1);

  return { traffic, paying, origin, capacity, cpu, dbPct, latency, error };
}

function tick() {
  if (state.gameOver) return;
  state.tick += 1;

  const load = computeLoad();
  const successRate = load.paying > 0 ? 1 - load.error : 1;
  const success = load.paying * (1 - load.error);

  const costMul = state.event && state.event.costMul ? state.event.costMul : 1;
  const upkeep = (state.servers + state.autoServers) * SERVER_UPKEEP + DB_UPKEEP
    + (state.upgrades.cdn ? 300 : 0) + (state.upgrades.redis ? 200 : 0)
    + (state.upgrades.monitoring ? 150 : 0) + (state.upgrades.multiregion ? 2000 : 0);
  state.money += success * REVENUE_PER_REQ - upkeep * costMul;

  state.traffic *= 1.02 + (state.upgrades.cdn ? 0.002 : 0);
  const diskRate = (state.upgrades.logrotation ? 0.3 : 0.8) * (state.upgrades.objectstorage ? 0.5 : 1);
  state.disk = clamp(state.disk + diskRate, 0, 100);

  state.slaHistory.push(successRate);
  if (state.slaHistory.length > 60) state.slaHistory.shift();
  state.satisfaction = clamp(state.satisfaction + (successRate - 0.995) * 5, 0, 100);

  if (load.error < 0.2) state.uptime += 1;
  else state.down += 1;

  state.tempFixes = state.tempFixes.filter((fix) => { fix.ttl -= 1; return fix.ttl > 0; });
  for (const inc of state.incidents) inc.ttl -= 1;
  expireIncidents();
  maybeSpawnIncident();

  if (state.event) {
    state.event.ttl -= 1;
    if (state.event.ttl <= 0) {
      addLog(`Event ended: ${state.event.text}`);
      state.event = null;
    }
  } else maybeEvent();

  if (state.upgrades.autoscaling && load.cpu > 85 && state.autoServers < 3) {
    state.autoServers += 1;
    addLog('Autoscaling added a temporary server.');
  } else if (state.autoServers > 0 && load.cpu < 60) state.autoServers -= 1;

  state.lastCpu = load.cpu;
  state.lastDb = load.dbPct;
  state.lastLatency = load.latency;
  state.lastError = load.error;
  state.lastCapacity = load.capacity;
  state.lastTraffic = load.traffic;

  if (state.money < -100000) endGame('Bankrupt: the bills outran the revenue.');
  else if (state.satisfaction <= 0) endGame('Reputation ruined: too many users gave up.');

  render();
}

// --- incidents ------------------------------------------------------------

function spawnIncident(type) {
  const template = INCIDENTS[type];
  if (!template) return null;
  const incident = {
    id: `inc${++incidentSeq}`,
    type,
    title: template.title,
    severity: template.severity,
    error: template.error,
    ttl: template.ttl + (state.upgrades.monitoring ? 5 : 0),
    detail: template.detail(),
    options: template.options,
  };
  state.incidents.push(incident);
  addLog(`${template.severity === 'critical' ? 'CRITICAL' : 'WARNING'}: ${template.title}`);
  render();
  return incident;
}

function forceIncident(type) {
  return spawnIncident(type);
}

function closeIncident(id) {
  state.incidents = state.incidents.filter((inc) => inc.id !== id);
}

function resolveIncident(id, index) {
  const incident = state.incidents.find((inc) => inc.id === id);
  if (!incident) return;
  const option = incident.options[index];
  if (option.ignore) {
    state.satisfaction = clamp(state.satisfaction - 6, 0, 100);
    addLog(`Ignored ${incident.title}; users noticed.`);
    closeIncident(id);
    render();
    return;
  }
  if (option.buy) {
    const result = buy(option.buy);
    if (result === 'poor') { tk.setStatus(els.status, 'Not enough money for that.', ''); return; }
    if (result === 'owned') { tk.setStatus(els.status, 'Already owned.', ''); closeIncident(id); render(); return; }
    addLog(`Resolved ${incident.title} with ${shopItem(option.buy).name}.`);
    closeIncident(id);
    render();
    return;
  }
  if (option.cost && state.money < option.cost) {
    tk.setStatus(els.status, 'Not enough money for that.', '');
    return;
  }
  if (option.cost) state.money -= option.cost;
  if (option.apply) option.apply();
  addLog(`Resolved ${incident.title}.`);
  tk.setStatus(els.status, `${incident.title} handled.`, 'ok');
  closeIncident(id);
  render();
}

function expireIncidents() {
  const expired = state.incidents.filter((inc) => inc.ttl <= 0);
  if (!expired.length) return;
  for (const inc of expired) {
    state.satisfaction = clamp(state.satisfaction - 8, 0, 100);
    state.money -= 5000;
    addLog(`${inc.title} went unresolved; users were affected.`);
  }
  state.incidents = state.incidents.filter((inc) => inc.ttl > 0);
}

function maybeSpawnIncident() {
  if (state.incidents.length >= 3) return;
  const risk = Math.min(0.02 + state.servers * 0.004 + (state.upgrades.multiregion ? 0.01 : 0), 0.09);
  if (Math.random() > risk) return;
  const pool = [];
  if (state.lastCpu > 80) pool.push('cpu');
  if (state.disk > 75) pool.push('disk');
  if (state.lastDb > 80) pool.push('db');
  if (state.lastError > 0.05) pool.push('crash');
  pool.push('spike', 'ssl', 'memory');
  spawnIncident(pool[Math.floor(Math.random() * pool.length)]);
}

function maybeEvent() {
  if (Math.random() > 0.008) return;
  const template = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  state.event = { ...template };
  addLog(`Event: ${template.text}`);
}

// --- rendering ------------------------------------------------------------

let incidentTtlRefs = {};

function bar(el, pct) {
  if (!el) return;
  el.style.width = `${clamp(pct, 0, 100)}%`;
  el.className = `dt-bar-fill${pct > 90 ? ' is-critical' : pct > 70 ? ' is-warn' : ''}`;
}

function renderStats() {
  const load = computeLoad();
  const sla = state.slaHistory.length
    ? (state.slaHistory.reduce((a, b) => a + b, 0) / state.slaHistory.length) * 100 : 100;
  const uptime = state.uptime + state.down > 0
    ? (state.uptime / (state.uptime + state.down)) * 100 : 100;
  els.money.textContent = money(state.money);
  els.traffic.textContent = `${Math.round(load.traffic)} req/s`;
  els.capacity.textContent = `${Math.round(load.capacity)} req/s`;
  els.cpu.textContent = `${Math.round(load.cpu)}%`;
  els.db.textContent = `${Math.round(load.dbPct)}%`;
  els.disk.textContent = `${Math.round(state.disk)}%`;
  els.latency.textContent = `${Math.round(load.latency)} ms`;
  els.error.textContent = `${(load.error * 100).toFixed(1)}%`;
  els.sla.textContent = `${sla.toFixed(2)}%`;
  els.satisfaction.textContent = `${Math.round(state.satisfaction)}%`;
  els.uptime.textContent = `${uptime.toFixed(2)}%`;
  els.servers.textContent = String(state.servers + state.autoServers);
  els.event.textContent = state.event ? state.event.text : 'No active event.';
  els.event.className = `dt-event${state.event ? (state.event.kind === 'bad' ? ' is-bad' : ' is-good') : ''}`;
  bar(els.cpuBar, load.cpu);
  bar(els.dbBar, load.dbPct);
  bar(els.diskBar, state.disk);
}

function renderTopology() {
  const on = {
    'dt-node-cdn': state.upgrades.cdn,
    'dt-node-waf': state.upgrades.waf,
    'dt-node-lb': state.upgrades.lb,
    'dt-node-redis': state.upgrades.redis,
    'dt-node-replica': state.upgrades.replica,
    'dt-node-queue': state.upgrades.queue,
    'dt-node-objectstorage': state.upgrades.objectstorage,
  };
  for (const [id, active] of Object.entries(on)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('is-on', Boolean(active));
  }
}

function buildShop() {
  els.shop.replaceChildren();
  for (const item of SHOP) {
    const card = document.createElement('div');
    card.className = 'dt-shop-item';
    const name = document.createElement('strong');
    name.textContent = item.name;
    const desc = document.createElement('span');
    desc.className = 'dt-shop-desc';
    desc.textContent = item.desc;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.type = 'button';
    btn.dataset.dtBuy = item.id;
    btn.addEventListener('click', () => {
      const result = buy(item.id);
      if (result === 'poor') tk.setStatus(els.status, `Need ${money(costOf(item))} for ${item.name}.`, '');
      else if (result === 'owned') tk.setStatus(els.status, `${item.name} is already owned.`, '');
      else tk.setStatus(els.status, `Bought ${item.name}.`, 'ok');
    });
    card.append(name, desc, btn);
    els.shop.append(card);
    shopRefs[item.id] = { btn, item };
  }
}

function renderShop() {
  for (const item of SHOP) {
    const ref = shopRefs[item.id];
    if (!ref) continue;
    if (owned(item)) {
      ref.btn.textContent = 'Owned';
      ref.btn.disabled = true;
    } else {
      const cost = costOf(item);
      ref.btn.textContent = `${money(cost)}${item.level ? ` · Lv ${level(item.id)}` : ''}`;
      ref.btn.disabled = state.money < cost;
    }
  }
}

function renderIncidents() {
  const signature = state.incidents.map((inc) => inc.id).join(',');
  if (signature === incidentSignature) return;
  incidentSignature = signature;
  incidentTtlRefs = {};
  els.incidents.replaceChildren();
  if (!state.incidents.length) {
    const p = document.createElement('p');
    p.className = 'tool-note';
    p.textContent = 'All systems normal. No active incidents.';
    els.incidents.append(p);
    return;
  }
  for (const inc of state.incidents) {
    const card = document.createElement('div');
    card.className = `dt-incident${inc.severity === 'critical' ? ' is-critical' : ''}`;
    const title = document.createElement('h3');
    title.textContent = `${inc.severity === 'critical' ? 'CRITICAL' : 'WARNING'} · ${inc.title}`;
    const detail = document.createElement('p');
    detail.className = 'dt-incident-detail';
    detail.textContent = inc.detail;
    const ttl = document.createElement('p');
    ttl.className = 'dt-incident-ttl';
    const options = document.createElement('div');
    options.className = 'dt-incident-options';
    inc.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.type = 'button';
      const cost = option.buy ? costOf(shopItem(option.buy)) : option.cost || 0;
      btn.textContent = cost ? `${option.label} (${money(cost)})` : option.label;
      btn.title = option.note || '';
      btn.addEventListener('click', () => resolveIncident(inc.id, index));
      options.append(btn);
    });
    card.append(title, detail, ttl, options);
    els.incidents.append(card);
    incidentTtlRefs[inc.id] = ttl;
  }
}

function renderIncidentTimers() {
  for (const inc of state.incidents) {
    const el = incidentTtlRefs[inc.id];
    if (el) el.textContent = `${Math.max(0, inc.ttl)}s before users are affected`;
  }
}

function renderLog() {
  const signature = state.log.join('|');
  if (signature === logSignature) return;
  logSignature = signature;
  els.log.replaceChildren();
  for (const line of state.log) {
    const row = document.createElement('div');
    row.className = 'dt-log-line';
    row.textContent = line;
    els.log.append(row);
  }
}

function render() {
  renderStats();
  renderTopology();
  renderShop();
  renderIncidents();
  renderIncidentTimers();
  renderLog();
}

// --- controls -------------------------------------------------------------

function updatePlayButton() {
  els.play.textContent = state.running ? 'Pause' : 'Play';
}

function schedule() {
  if (timer) clearInterval(timer);
  timer = null;
  if (state.running && !state.gameOver) {
    timer = setInterval(() => {
      tick();
      if (!state.running) schedule();
    }, Math.round(TICK_MS / state.speed));
  }
}

function setRunning(value) {
  if (state.gameOver) return;
  state.running = value;
  updatePlayButton();
  schedule();
}

function setSpeed(value) {
  state.speed = value;
  document.querySelectorAll('[data-dt-speed]').forEach((btn) => {
    btn.classList.toggle('is-active', Number(btn.dataset.dtSpeed) === value);
  });
  schedule();
}

function endGame(reason) {
  state.gameOver = true;
  state.running = false;
  if (timer) clearInterval(timer);
  timer = null;
  updatePlayButton();
  addLog(reason);
  tk.setStatus(els.status, reason, 'err');
}

function reset() {
  Object.assign(state, {
    money: START_MONEY,
    traffic: START_TRAFFIC,
    servers: 1,
    autoServers: 0,
    levels: { cpu: 0, ram: 0, disk: 0, bw: 0, db: 0 },
    upgrades: {},
    disk: 20,
    satisfaction: 95,
    slaHistory: [],
    uptime: 0,
    down: 0,
    incidents: [],
    tempFixes: [],
    event: null,
    log: [],
    tick: 0,
    running: false,
    speed: state.speed || 1,
    gameOver: false,
    lastCpu: 0,
    lastDb: 0,
    lastLatency: 0,
    lastError: 0,
    lastCapacity: 0,
    lastTraffic: START_TRAFFIC,
  });
  if (timer) clearInterval(timer);
  timer = null;
  incidentSignature = '';
  logSignature = '';
  addLog('Welcome to DevOps Tycoon. Press Play, or Step to advance one tick.');
  render();
}

els.play.addEventListener('click', () => setRunning(!state.running));
els.step.addEventListener('click', () => tick());
els.reset.addEventListener('click', () => {
  reset();
  setSpeed(1);
  updatePlayButton();
  tk.setStatus(els.status, '');
});
document.querySelectorAll('[data-dt-speed]').forEach((btn) => {
  btn.addEventListener('click', () => setSpeed(Number(btn.dataset.dtSpeed)));
});
window.addEventListener('pagehide', () => { if (timer) clearInterval(timer); });

buildShop();
reset();
setSpeed(1);
updatePlayButton();

// A small hook so the DOM tests can drive the simulation deterministically.
window.__devopsTycoon = { tick, forceIncident, buy, reset, getState: () => state };
