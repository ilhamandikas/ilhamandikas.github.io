// Dockerfile builder: fill a form, get a Dockerfile. No data leaves the page.
const { tk } = window;

const els = {
  preset: document.querySelector('#df-preset'),
  multistage: document.querySelector('#df-multistage'),
  build: document.querySelector('#df-build'),
  arg: document.querySelector('#df-arg'),
  builderImage: document.querySelector('#df-builder-image'),
  builderWorkdir: document.querySelector('#df-builder-workdir'),
  builderCopy: document.querySelector('#df-builder-copy'),
  builderRun: document.querySelector('#df-builder-run'),
  artifact: document.querySelector('#df-artifact'),
  base: document.querySelector('#df-base'),
  stage: document.querySelector('#df-stage'),
  workdir: document.querySelector('#df-workdir'),
  env: document.querySelector('#df-env'),
  copy: document.querySelector('#df-copy'),
  run: document.querySelector('#df-run'),
  label: document.querySelector('#df-label'),
  expose: document.querySelector('#df-expose'),
  volume: document.querySelector('#df-volume'),
  user: document.querySelector('#df-user'),
  healthcheck: document.querySelector('#df-healthcheck'),
  healthInterval: document.querySelector('#df-health-interval'),
  entrypoint: document.querySelector('#df-entrypoint'),
  cmd: document.querySelector('#df-cmd'),
  extra: document.querySelector('#df-extra'),
  runJoin: document.querySelector('#df-run-join'),
  comments: document.querySelector('#df-comments'),
  output: document.querySelector('#df-output'),
  meta: document.querySelector('#df-meta'),
  status: document.querySelector('#df-status'),
};

const PRESETS = {
  node: {
    multistage: true,
    builderImage: 'node:20-alpine', builderWorkdir: '/app',
    builderCopy: 'package*.json ./', builderRun: 'npm ci\nnpm run build',
    artifact: '/app/dist ./dist',
    base: 'node:20-alpine', workdir: '/app', copy: 'package*.json ./',
    run: 'npm ci --omit=dev', env: 'NODE_ENV=production', expose: '3000',
    user: 'node', cmd: '["node","dist/server.js"]',
  },
  python: {
    base: 'python:3.12-slim', workdir: '/app',
    copy: 'requirements.txt ./\n.', run: 'pip install --no-cache-dir -r requirements.txt',
    env: 'PYTHONUNBUFFERED=1', expose: '8000', cmd: 'python app.py',
  },
  go: {
    multistage: true,
    builderImage: 'golang:1.22-alpine', builderWorkdir: '/src',
    builderCopy: 'go.mod go.sum ./\n.', builderRun: 'go mod download\nCGO_ENABLED=0 go build -o /app/server .',
    artifact: '/app/server /usr/local/bin/server',
    base: 'gcr.io/distroless/static-debian12', expose: '8080',
    entrypoint: '["/usr/local/bin/server"]',
  },
  nginx: {
    base: 'nginx:alpine', copy: 'dist /usr/share/nginx/html', expose: '80',
  },
  php: {
    base: 'php:8.3-apache', workdir: '/var/www/html', copy: '. /var/www/html',
    run: 'docker-php-ext-install pdo_mysql', expose: '80',
  },
  java: {
    multistage: true,
    builderImage: 'maven:3.9-eclipse-temurin-17', builderWorkdir: '/app',
    builderCopy: 'pom.xml .\n.', builderRun: 'mvn -q -DskipTests package',
    artifact: '/app/target/*.jar /app/app.jar',
    base: 'eclipse-temurin:17-jre-alpine', workdir: '/app',
    entrypoint: '["java","-jar","app.jar"]',
  },
};

const FIELDS = ['arg', 'builderImage', 'builderWorkdir', 'builderCopy', 'builderRun', 'artifact', 'base', 'stage', 'workdir', 'env', 'copy', 'run', 'label', 'expose', 'volume', 'user', 'healthcheck', 'entrypoint', 'cmd', 'extra'];

const lines = (value) => String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const tokens = (value) => String(value).split(/[\s,]+/).map((token) => token.trim()).filter(Boolean);
const instruction = (value) => (value.trim().startsWith('[') ? value.trim() : value.trim());

function runBlock(commands, join) {
  if (!commands.length) return null;
  if (join && commands.length > 1) {
    return `RUN ${commands.map((cmd, index) => (index === 0 ? cmd : `    && ${cmd}`)).join(' \\\n')}`;
  }
  return commands.map((cmd) => `RUN ${cmd}`).join('\n');
}

function build() {
  const base = els.base.value.trim();
  if (!base) return '';
  const out = [];
  const note = (text) => { if (els.comments.checked) out.push(`# ${text}`); };

  out.push('# syntax=docker/dockerfile:1');
  const args = lines(els.arg.value);
  if (args.length) {
    note('Build arguments');
    args.forEach((arg) => out.push(`ARG ${arg}`));
    out.push('');
  }

  if (els.multistage.checked && els.builderImage.value.trim()) {
    note('Build stage');
    out.push(`FROM ${els.builderImage.value.trim()} AS build`);
    if (els.builderWorkdir.value.trim()) out.push(`WORKDIR ${els.builderWorkdir.value.trim()}`);
    lines(els.builderCopy.value).forEach((copy) => out.push(`COPY ${copy}`));
    const builderRun = runBlock(lines(els.builderRun.value), els.runJoin.checked);
    if (builderRun) out.push(builderRun);
    out.push('');
  }

  note('Runtime stage');
  out.push(`FROM ${base}${els.stage.value.trim() ? ` AS ${els.stage.value.trim()}` : ''}`);
  lines(els.label.value).forEach((label) => out.push(`LABEL ${label}`));
  lines(els.env.value).forEach((env) => out.push(`ENV ${env}`));
  if (els.workdir.value.trim()) out.push(`WORKDIR ${els.workdir.value.trim()}`);
  lines(els.copy.value).forEach((copy) => out.push(`COPY ${copy}`));
  if (els.multistage.checked) lines(els.artifact.value).forEach((artifact) => out.push(`COPY --from=build ${artifact}`));
  const runtimeRun = runBlock(lines(els.run.value), els.runJoin.checked);
  if (runtimeRun) out.push(runtimeRun);
  const expose = tokens(els.expose.value);
  if (expose.length) out.push(`EXPOSE ${expose.join(' ')}`);
  const volume = tokens(els.volume.value);
  if (volume.length) out.push(`VOLUME [${volume.map((v) => JSON.stringify(v)).join(', ')}]`);
  if (els.user.value.trim()) out.push(`USER ${els.user.value.trim()}`);
  if (els.healthcheck.value.trim()) {
    out.push(`HEALTHCHECK --interval=${Number(els.healthInterval.value) || 30}s --timeout=5s --retries=3 CMD ${els.healthcheck.value.trim()}`);
  }
  if (els.entrypoint.value.trim()) out.push(`ENTRYPOINT ${instruction(els.entrypoint.value)}`);
  if (els.cmd.value.trim()) out.push(`CMD ${instruction(els.cmd.value)}`);
  lines(els.extra.value).forEach((extra) => out.push(extra));

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function render() {
  els.build.hidden = !els.multistage.checked;
  const text = build();
  els.output.value = text;
  els.meta.textContent = text ? `${text.split('\n').filter(Boolean).length} lines` : '';
  tk.setStatus(els.status, text ? '' : 'Pick a base image');
}

function clearFields() {
  FIELDS.forEach((key) => { els[key].value = ''; });
  els.multistage.checked = false;
  els.runJoin.checked = false;
  els.healthInterval.value = '30';
}

function applyPreset() {
  const preset = PRESETS[els.preset.value];
  if (!preset) return;
  clearFields();
  for (const [key, value] of Object.entries(preset)) {
    if (key === 'multistage') els.multistage.checked = value;
    else if (els[key]) els[key].value = value;
  }
  render();
}

els.preset.addEventListener('change', applyPreset);
document.querySelector('#df-reset').addEventListener('click', () => {
  clearFields();
  els.preset.value = '';
  render();
});

tk.live([
  els.multistage, els.arg, els.builderImage, els.builderWorkdir, els.builderCopy, els.builderRun,
  els.artifact, els.base, els.stage, els.workdir, els.env, els.copy, els.run, els.label,
  els.expose, els.volume, els.user, els.healthcheck, els.healthInterval, els.entrypoint,
  els.cmd, els.extra, els.runJoin, els.comments,
], render);
