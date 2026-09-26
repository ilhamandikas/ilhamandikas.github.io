// Turn a `docker run` command into a docker-compose service.
const { tk } = window;

const input = document.querySelector('#drc-input');

// Flags that consume a value.
const VALUE_FLAGS = new Set([
  '-p', '--publish', '-v', '--volume', '-e', '--env', '--name', '--restart', '--network',
  '--net', '-w', '--workdir', '--entrypoint', '-u', '--user', '--hostname', '-h',
  '--add-host', '--label', '-l', '--log-driver', '--memory', '-m', '--cpus', '--env-file',
  '--mount', '--cap-add', '--cap-drop', '--device', '--dns', '--expose', '--link', '--tmpfs',
]);

function tokenize(command) {
  const tokens = [];
  let current = '';
  let quote = null;
  for (const ch of command.trim()) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) { tokens.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function parse(command) {
  const tokens = tokenize(command);
  if (tokens[0] !== 'docker' || tokens[1] !== 'run') {
    throw new Error('Expected a command that starts with “docker run”');
  }
  const service = { ports: [], volumes: [], environment: [], extra: [] };
  let i = 2;
  let image = null;
  let cmd = [];

  while (i < tokens.length) {
    const token = tokens[i];
    if (image) { cmd.push(token); i += 1; continue; }

    const [flag, inline] = token.startsWith('--') && token.includes('=')
      ? [token.slice(0, token.indexOf('=')), token.slice(token.indexOf('=') + 1)]
      : [token, null];

    const take = () => {
      if (inline !== null) return inline;
      i += 1;
      return tokens[i];
    };

    if (token === '-d' || token === '--detach') { i += 1; continue; }

    if (VALUE_FLAGS.has(flag)) {
      const value = take();
      i += 1;
      switch (flag) {
        case '-p': case '--publish': service.ports.push(value); break;
        case '-v': case '--volume': case '--mount': service.volumes.push(value); break;
        case '-e': case '--env': service.environment.push(value); break;
        case '--name': service.name = value; break;
        case '--restart': service.restart = value; break;
        case '--network': case '--net': service.network = value; break;
        case '-w': case '--workdir': service.working_dir = value; break;
        case '--entrypoint': service.entrypoint = value; break;
        case '-u': case '--user': service.user = value; break;
        case '-h': case '--hostname': service.hostname = value; break;
        default: service.extra.push([flag.replace(/^--?/, '').replace(/-/g, '_'), value]);
      }
      continue;
    }

    if (token.startsWith('-')) { i += 1; continue; }
    image = token;
    i += 1;
  }

  if (!image) throw new Error('No image found in the command');
  service.image = image;
  service.command = cmd;
  return service;
}

function toYaml(service) {
  const name = (service.name || service.image.split(/[/:]/).pop()).replace(/[^\w.-]/g, '-');
  const lines = ['services:', `  ${name}:`, `    image: ${service.image}`];
  if (service.name) lines.push(`    container_name: ${service.name}`);
  if (service.restart) lines.push(`    restart: ${service.restart}`);
  if (service.network) lines.push(`    network_mode: ${service.network}`);
  if (service.working_dir) lines.push(`    working_dir: ${service.working_dir}`);
  if (service.entrypoint) lines.push(`    entrypoint: ${JSON.stringify(service.entrypoint)}`);
  if (service.user) lines.push(`    user: ${service.user}`);
  if (service.hostname) lines.push(`    hostname: ${service.hostname}`);
  if (service.ports.length) lines.push('    ports:', ...service.ports.map((p) => `      - "${p}"`));
  if (service.volumes.length) lines.push('    volumes:', ...service.volumes.map((v) => `      - "${v}"`));
  if (service.environment.length) lines.push('    environment:', ...service.environment.map((e) => `      - ${e}`));
  for (const [key, value] of service.extra) lines.push(`    ${key}: ${JSON.stringify(value)}`);
  if (service.command.length) lines.push(`    command: ${service.command.join(' ')}`);
  return `${lines.join('\n')}\n`;
}

tk.transform({
  watch: input,
  output: document.querySelector('#drc-output'),
  status: document.querySelector('#drc-status'),
  ok: 'Converted',
  fn: () => toYaml(parse(input.value)),
});
