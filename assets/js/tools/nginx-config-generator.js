// nginx config generator — build a server block from the answers in the form.
//
// The output is a plain string from a plain function of the settings, so what the
// page shows is exactly what a test can assert on. No template engine, no network.
const { tk } = window;

const els = {
  names: document.querySelector('#ngx-names'),
  mode: document.querySelector('#ngx-mode'),
  tls: document.querySelector('#ngx-tls'),
  hsts: document.querySelector('#ngx-hsts'),
  root: document.querySelector('#ngx-root'),
  proxy: document.querySelector('#ngx-proxy'),
  php: document.querySelector('#ngx-php'),
  cert: document.querySelector('#ngx-cert'),
  key: document.querySelector('#ngx-key'),
  www: document.querySelector('#ngx-www'),
  body: document.querySelector('#ngx-body'),
  gzip: document.querySelector('#ngx-gzip'),
  headers: document.querySelector('#ngx-headers'),
  cache: document.querySelector('#ngx-cache'),
  tokens: document.querySelector('#ngx-tokens'),
  logs: document.querySelector('#ngx-logs'),
  out: document.querySelector('#ngx-out'),
  meta: document.querySelector('#ngx-meta'),
  notes: document.querySelector('#ngx-notes'),
  status: document.querySelector('#ngx-status'),
  presetStatus: document.querySelector('#ngx-preset-status'),
};

const rows = {
  root: document.querySelector('#ngx-root-row'),
  proxy: document.querySelector('#ngx-proxy-row'),
  php: document.querySelector('#ngx-php-row'),
  tls: document.querySelector('#ngx-tls-row'),
};

// A server_name is a host, a wildcard, an IP or `_`. Anything else is a typo, and
// nginx refuses to start on a typo rather than ignoring it.
const NAME = /^(\*\.)?[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$|^_$|^\d{1,3}(\.\d{1,3}){3}$/;

// A block pushed as one multi-line string is still a block: splitting on newlines
// here is what keeps a comment or a nested location inside the block it belongs to.
// Padding only the first line leaves the rest at column 0, which is valid nginx and
// looks like an accident — and a config that looks machine-pasted gets read as one.
const indented = (lines, pad = '    ') =>
  lines
    .filter((line) => line !== null)
    .flatMap((line) => String(line).split('\n'))
    .map((line) => (line === '' ? '' : pad + line));

function settings() {
  // Commas as well as spaces: `example.com, www.example.com` is how people paste a
  // name list, and splitting on spaces alone turns that into the server name
  // "example.com," — a config nginx refuses to start with.
  const names = els.names.value.split(/[\s,]+/).filter(Boolean);
  return {
    names,
    mode: els.mode.value,
    tls: els.tls.checked,
    hsts: els.hsts.checked,
    root: els.root.value.trim() || '/var/www/html',
    proxy: els.proxy.value.trim() || 'http://127.0.0.1:3000',
    php: els.php.value.trim() || 'unix:/run/php/php-fpm.sock',
    cert: els.cert.value.trim() || '/etc/letsencrypt/live/example.com/fullchain.pem',
    key: els.key.value.trim() || '/etc/letsencrypt/live/example.com/privkey.pem',
    www: els.www.value,
    body: Math.max(1, Number(els.body.value) || 16),
    gzip: els.gzip.checked,
    headers: els.headers.checked,
    cache: els.cache.checked,
    tokens: els.tokens.checked,
    logs: els.logs.checked,
  };
}

const upstreamName = (names) => {
  const base = (names[0] || 'app').replace(/^\*\./, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  return `${base || 'app'}-app`;
};

// Pair up the names that have to be redirected away from. Doing this per name
// rather than with one catch-all is what makes `return 301` able to name its
// target literally — nginx has no variable for "this host without www".
function redirectPairs(s) {
  if (s.www === 'to-apex') {
    return s.names.filter((name) => name.startsWith('www.')).map((name) => [name, name.slice(4)]);
  }
  if (s.www === 'to-www') {
    return s.names.filter((name) => !name.startsWith('www.') && name.includes('.')).map((name) => [name, `www.${name}`]);
  }
  return [];
}

function proxyBlock(s) {
  // Keepalive to the program behind nginx is what stops every request opening a
  // fresh connection. It only works over plain http/1.1, so an https target is
  // proxied directly instead of pretending.
  const target = new URL(s.proxy);
  if (target.protocol === 'https:') {
    return [
      '# The target is https, so nginx cannot reuse connections to it the way it can',
      '# over plain http/1.1. That is one handshake per request — consider terminating',
      '# TLS on the app and proxying over the loopback instead.',
      'location / {',
      ...indented([
        `proxy_pass ${s.proxy};`,
        'proxy_http_version 1.1;',
        'proxy_set_header Host $host;',
        'proxy_set_header X-Real-IP $remote_addr;',
        'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
        'proxy_set_header X-Forwarded-Proto $scheme;',
        'proxy_set_header X-Forwarded-Host $host;',
        'proxy_read_timeout 60s;',
        'proxy_buffering off;',
      ]),
      '}',
    ].join('\n');
  }
  return [
    'location / {',
    ...indented([
      `proxy_pass http://${upstreamName(s.names)};`,
      'proxy_http_version 1.1;',
      'proxy_set_header Host $host;',
      'proxy_set_header X-Real-IP $remote_addr;',
      'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;',
      'proxy_set_header X-Forwarded-Proto $scheme;',
      'proxy_set_header X-Forwarded-Host $host;',
      '',
      '# WebSockets and Server-Sent Events need the upgrade handshake passed through.',
      '# $connection_upgrade is set by the map block at the top of this file.',
      'proxy_set_header Upgrade $http_upgrade;',
      'proxy_set_header Connection $connection_upgrade;',
      '',
      'proxy_read_timeout 60s;',
      'proxy_send_timeout 60s;',
      'proxy_buffering off;',
    ]),
    '}',
  ].join('\n');
}

function phpBlock(s) {
  return [
    '# Static files come straight off disk; only .php reaches the pool.',
    'location / {',
    ...indented(['try_files $uri $uri/ /index.php?$query_string;']),
    '}',
    '',
    'location ~ \\.php$ {',
    ...indented([
      'try_files $uri =404;',
      'include fastcgi_params;',
      'fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;',
      'fastcgi_param PATH_INFO $fastcgi_path_info;',
      `fastcgi_pass ${s.php};`,
      'fastcgi_read_timeout 60s;',
    ]),
    '}',
  ].join('\n');
}

function fileBlock(s) {
  if (s.mode === 'spa') {
    return [
      '# A single-page app owns its own routes, so a path that is not a real file has',
      '# to fall back to the shell instead of 404ing.',
      'location / {',
      ...indented(['try_files $uri $uri/ /index.html;']),
      '}',
    ].join('\n');
  }
  return ['location / {', ...indented(['try_files $uri $uri/ =404;']), '}'].join('\n');
}

function cacheBlock(security) {
  return [
    '# Fingerprinted assets can be cached hard. If your build does not hash file',
    '# names, drop this block — a year-long cache on style.css is how stale sites',
    '# happen.',
    'location ~* \\.(?:css|js|mjs|jpg|jpeg|png|gif|ico|svg|webp|avif|woff2?|ttf|otf|mp4|webm|wasm)$ {',
    ...indented([
      'expires 1y;',
      'add_header Cache-Control "public, immutable";',
      // nginx does not inherit add_header into a location that sets its own, so
      // the security headers have to be repeated or they vanish from every asset.
      ...(security ? security : []),
      'access_log off;',
    ]),
    '}',
  ].join('\n');
}

function securityHeaders(s) {
  const lines = [
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
    'add_header X-Frame-Options "SAMEORIGIN" always;',
  ];
  if (s.tls && s.hsts) {
    lines.push(
      '# HSTS only once HTTPS works everywhere: a browser that has seen this will',
      '# refuse plain http to this host for a year.',
      'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
    );
  }
  return lines;
}

function generate(s, problems = []) {
  const pairs = redirectPairs(s);
  const bounced = new Set(pairs.map(([from]) => from));
  const mainNames = s.names.filter((name) => !bounced.has(name));
  const main = mainNames.length > 0 ? mainNames.join(' ') : s.names.join(' ');
  const out = [];

  out.push(
    `# ${s.names.join(' ') || 'default server'}`,
    '#',
    '# Generated by https://ilham.dev/tools/nginx-config-generator/',
    '# Check it before you rely on it:  nginx -t && systemctl reload nginx',
    '#',
    '# This file goes inside the http block, which is what sites-enabled does for you.',
    '',
  );

  // A config that will not load is worse than no config, so anything the page has
  // already spotted is written into the file itself and not only into the status line.
  if (problems.length > 0) out.push(...problems.map((problem) => `# !! ${problem}`), '');

  if (s.mode === 'proxy') {
    const target = new URL(s.proxy);
    if (target.protocol !== 'https:') {
      out.push(
        `upstream ${upstreamName(s.names)} {`,
        ...indented([`server ${target.host};`, 'keepalive 32;']),
        '}',
        '',
        '# nginx cannot choose between "upgrade" and "close" inline, so the choice is',
        '# mapped once here and used by the proxy block below.',
        'map $http_upgrade $connection_upgrade {',
        ...indented(['default upgrade;', "''      close;"]),
        '}',
        '',
      );
    }
  }

  // The redirect servers come first, so the reader meets the rule before the block
  // it points at.
  for (const [from, to] of pairs) {
    out.push(
      'server {',
      ...indented([
        'listen 80;',
        'listen [::]:80;',
        `server_name ${from};`,
        '',
        '# Keep the path and the query; only the host changes.',
        `return 301 $scheme://${to}$request_uri;`,
      ]),
      '}',
      '',
    );
    if (s.tls) {
      out.push(
        'server {',
        ...indented([
          'listen 443 ssl;',
          'listen [::]:443 ssl;',
          'http2 on;',
          `server_name ${from};`,
          '',
          `ssl_certificate     ${s.cert};`,
          `ssl_certificate_key ${s.key};`,
          '',
          `return 301 $scheme://${to}$request_uri;`,
        ]),
        '}',
        '',
      );
    }
  }

  if (s.tls) {
    out.push(
      'server {',
      ...indented([
        'listen 80;',
        'listen [::]:80;',
        `server_name ${main};`,
        '',
        '# Certbot validates a renewal over plain http, so this has to be answered',
        '# here rather than redirected away.',
        'location /.well-known/acme-challenge/ { root /var/www/html; }',
        '',
        'location / {',
        ...indented(['return 301 https://$host$request_uri;'], '    '),
        '}',
      ]),
      '}',
      '',
    );
  }

  const server = [];
  server.push(...(s.tls ? ['listen 443 ssl;', 'listen [::]:443 ssl;', 'http2 on;'] : ['listen 80;', 'listen [::]:80;']));
  server.push(`server_name ${main};`, '');

  if (s.tokens) {
    server.push('# Do not advertise the version in error pages and the Server header.', 'server_tokens off;', '');
  }

  if (s.tls) {
    server.push(
      `ssl_certificate     ${s.cert};`,
      `ssl_certificate_key ${s.key};`,
      '',
      '# TLS 1.2 is still needed for older Android and Safari; 1.3 is negotiated first.',
      'ssl_protocols TLSv1.2 TLSv1.3;',
      'ssl_prefer_server_ciphers off;',
      'ssl_session_cache shared:SSL:10m;',
      'ssl_session_timeout 1d;',
      '',
      '# Stapling saves the client a round trip. Drop these two lines if the',
      '# certificate is not from a public CA.',
      'ssl_stapling on;',
      'ssl_stapling_verify on;',
      '',
    );
  }

  if (s.mode !== 'proxy') {
    server.push(`root ${s.root};`, `index ${s.mode === 'php' ? 'index.php index.html' : 'index.html'};`, '');
  }

  server.push(`client_max_body_size ${s.body}m;`, '');

  if (s.logs) {
    const label = (s.names[0] || 'site').replace(/^\*\./, '').replace(/[^a-z0-9.-]/gi, '-');
    server.push(`access_log /var/log/nginx/${label}.access.log;`, `error_log  /var/log/nginx/${label}.error.log warn;`, '');
  }

  const security = s.headers ? securityHeaders(s) : [];
  if (security.length > 0) server.push(...security, '');

  if (s.gzip) {
    server.push(
      '# gzip is off by default in nginx and its type list is empty, so both have to',
      '# be set. Brotli compresses better where the module is installed, but it is not',
      '# part of a stock nginx.',
      'gzip on;',
      'gzip_vary on;',
      'gzip_min_length 1024;',
      'gzip_comp_level 5;',
      'gzip_types text/plain text/css text/xml application/javascript application/json',
      '           application/xml application/rss+xml image/svg+xml application/wasm;',
      '',
    );
  }

  server.push(s.mode === 'proxy' ? proxyBlock(s) : s.mode === 'php' ? phpBlock(s) : fileBlock(s), '');

  // A location that denies dotfiles has to come last, because the first matching
  // regular expression wins and these are all regular expressions.
  if (s.mode === 'proxy') server.push('# Dotfiles are never a page. This has to come after the proxy block above.', 'location ~ /\\. { deny all; }', '');

  if (s.cache) server.push(cacheBlock(s.headers ? securityHeaders(s) : []), '');

  while (server.length > 0 && server[server.length - 1] === '') server.pop();

  out.push('server {', ...indented(server), '}');
  return `${out.join('\n')}\n`;
}

/* ---------- notes that depend on the answers ---------- */

function notesFor(s) {
  const notes = [
    'http2 on; needs nginx 1.25.1 or newer. On anything older, use listen 443 ssl http2; instead.',
  ];
  if (s.headers && s.cache) {
    notes.push(
      'nginx does not merge add_header from an outer block into a location that sets its own, so the security headers are repeated inside the asset-cache block rather than being silently dropped there.',
    );
  }
  if (s.mode === 'proxy') {
    notes.push('proxy_buffering off suits a stream or an event feed. For an ordinary JSON API, turning it back on lets nginx absorb a slow client.');
  }
  if (s.mode === 'spa') {
    notes.push('The fallback answers 200 for every unknown path. If a missing file should be a real 404, put a location for your API prefix above it.');
  }
  if (s.mode === 'php') {
    notes.push('Check the pool socket against the PHP you actually have — php8.3-fpm.sock is a placeholder, not a guess.');
  }
  if (!s.tls) {
    notes.push('Plain HTTP only. That is right behind a load balancer that terminates TLS, and wrong on the open internet.');
  }
  return notes;
}

/* ---------- wiring ---------- */

const PRESETS = {
  static: { mode: 'static', root: '/var/www/example.com', tls: true, cache: true, gzip: true, headers: true, www: 'to-apex', body: 16 },
  spa: { mode: 'spa', root: '/var/www/example.com/dist', tls: true, cache: true, gzip: true, headers: true, www: 'to-apex', body: 16 },
  proxy: { mode: 'proxy', proxy: 'http://127.0.0.1:3000', tls: true, cache: false, gzip: true, headers: true, www: 'to-apex', body: 64 },
  php: { mode: 'php', root: '/var/www/example.com/public', php: 'unix:/run/php/php8.3-fpm.sock', tls: true, cache: true, gzip: true, headers: true, www: 'to-apex', body: 64 },
};

const syncRows = () => {
  const mode = els.mode.value;
  rows.root.hidden = mode === 'proxy';
  rows.proxy.hidden = mode !== 'proxy';
  rows.php.hidden = mode !== 'php';
  rows.tls.hidden = !els.tls.checked;
};

function render() {
  syncRows();
  const s = settings();
  const bad = s.names.filter((name) => !NAME.test(name));
  const badProxy = s.mode === 'proxy' && !/^https?:\/\/[^\s/]+/.test(s.proxy);
  const problems = [];
  if (bad.length > 0) problems.push(`not a valid server name: ${bad.join(', ')} — nginx refuses to start on a name like that`);
  if (badProxy) problems.push(`the forward address "${s.proxy}" is not http://host:port, so proxy_pass will not load`);
  els.out.value = generate(s, problems);
  els.meta.textContent = `${s.names.length} name${s.names.length === 1 ? '' : 's'} · ${s.tls ? 'HTTPS' : 'HTTP only'} · ${s.mode}`;
  els.notes.textContent = notesFor(s).join(' ');
  if (bad.length > 0) tk.setStatus(els.status, `Not a valid server name: ${bad.join(', ')}`, 'err');
  else if (s.names.length === 0) tk.setStatus(els.status, 'Add a server name, or nginx treats this as the default server', 'err');
  else if (badProxy) tk.setStatus(els.status, 'The forward address needs to look like http://127.0.0.1:3000', 'err');
  else tk.setStatus(els.status, '');
}

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => {
    for (const [name, value] of Object.entries(PRESETS[button.dataset.preset])) {
      const el = els[name];
      if (el.type === 'checkbox') el.checked = value;
      else el.value = value;
    }
    render();
    tk.flash(els.presetStatus, `${button.textContent.trim()} preset applied`, 'ok');
  });
}

document.querySelector('#ngx-copy').addEventListener('click', async () => {
  await navigator.clipboard?.writeText(els.out.value);
  tk.flash(els.status, 'Config copied', 'ok');
});

document.querySelector('#ngx-download').addEventListener('click', () => {
  const label = (settings().names[0] || 'site').replace(/[^a-z0-9.-]/gi, '-');
  tk.download(`${label}.conf`, els.out.value);
});

const WATCHED = ['names', 'mode', 'tls', 'hsts', 'root', 'proxy', 'php', 'cert', 'key', 'www', 'body', 'gzip', 'headers', 'cache', 'tokens', 'logs'];
tk.live(WATCHED.map((name) => els[name]), render);
render();
