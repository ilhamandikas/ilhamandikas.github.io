// HTTP Request Tester — send a request from the browser, and move between the
// form and a curl command in both directions.
//
// There is no proxy here and no server of ours in the path: the browser talks to
// the address directly, so the target's CORS policy decides whether the reply can
// be read at all. That limit is stated in the page rather than worked around,
// because working around it would mean routing somebody's credentials and tokens
// through a server we run.
const { tk } = window;

const method = document.querySelector('#hrt-method');
const url = document.querySelector('#hrt-url');
const headers = document.querySelector('#hrt-headers');
const bodyType = document.querySelector('#hrt-body-type');
const bodyField = document.querySelector('#hrt-body');
const bodyWrap = document.querySelector('#hrt-body-field');
const timeout = document.querySelector('#hrt-timeout');
const credentials = document.querySelector('#hrt-credentials');
const sendButton = document.querySelector('#hrt-send');
const cancelButton = document.querySelector('#hrt-cancel');
const status = document.querySelector('#hrt-status');
const meta = document.querySelector('#hrt-meta');
const resHeaders = document.querySelector('#hrt-res-headers');
const resBody = document.querySelector('#hrt-res-body');
const curlIn = document.querySelector('#hrt-curl-in');
const curlOut = document.querySelector('#hrt-curl-out');
const curlStatus = document.querySelector('#hrt-curl-status');

const CONTENT_TYPES = { json: 'application/json', form: 'application/x-www-form-urlencoded', text: 'text/plain' };
const NO_BODY = new Set(['GET', 'HEAD']);

/* ---------- reading and writing the form ---------- */

// One `Name: value` per line. A line without a colon is a typo worth reporting
// rather than silently ignoring, because a header that never gets sent is the
// hardest kind of bug to see from the outside.
function readHeaders(text) {
  const list = [];
  const problems = [];
  for (const line of String(text).split('\n')) {
    if (line.trim() === '') continue;
    const at = line.indexOf(':');
    if (at < 1) {
      problems.push(line.trim());
      continue;
    }
    list.push([line.slice(0, at).trim(), line.slice(at + 1).trim()]);
  }
  return { list, problems };
}

const writeHeaders = (list) => list.map(([name, value]) => `${name}: ${value}`).join('\n');

// The header block wins over the Body dropdown, so a pasted Content-Type is never
// silently replaced by the one this page would have picked.
function effectiveContentType(list, type) {
  const explicit = list.find(([name]) => name.toLowerCase() === 'content-type');
  return explicit ? explicit[1] : CONTENT_TYPES[type] || null;
}

function readForm() {
  const { list, problems } = readHeaders(headers.value);
  const type = bodyType.value;
  const text = bodyField.value;
  const hasBody = type !== 'none' && text !== '';
  const outgoing = list.slice();
  if (hasBody && !list.some(([name]) => name.toLowerCase() === 'content-type')) {
    outgoing.push(['Content-Type', CONTENT_TYPES[type]]);
  }
  return { method: method.value, url: url.value.trim(), headers: outgoing, body: hasBody ? text : null, problems };
}

function writeForm({ method: verb, url: target, headers: list = [], body = null }) {
  if (verb) method.value = verb;
  url.value = target || '';
  headers.value = writeHeaders(list);
  if (body === null) {
    bodyType.value = 'none';
    bodyField.value = '';
  } else {
    const type = list.find(([name]) => name.toLowerCase() === 'content-type');
    const value = type ? type[1].split(';')[0].trim().toLowerCase() : '';
    bodyType.value = value === 'application/x-www-form-urlencoded' ? 'form' : value === 'text/plain' ? 'text' : 'json';
    bodyField.value = body;
  }
  syncBodyField();
}

const syncBodyField = () => {
  bodyWrap.hidden = bodyType.value === 'none';
};

/* ---------- curl ---------- */

// Shell words, so a value with spaces survives. Single quotes are literal, double
// quotes allow the four escapes the shell does allow inside them, and a backslash
// before a newline is a continuation — which is how most curl commands in
// documentation are written.
function tokenize(text) {
  const source = String(text).replace(/\\\r?\n/g, ' ');
  const words = [];
  let word = null;
  let quote = null;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quote === "'") {
      if (char === "'") quote = null;
      else word += char;
      continue;
    }
    if (quote === '"') {
      if (char === '"') quote = null;
      else if (char === '\\' && /["\\$`]/.test(source[i + 1] || '')) {
        word += source[i + 1];
        i += 1;
      } else word += char;
      continue;
    }
    if (char === "'" || char === '"') {
      quote = char;
      if (word === null) word = '';
      continue;
    }
    if (char === '\\' && i + 1 < source.length) {
      word = (word ?? '') + source[i + 1];
      i += 1;
      continue;
    }
    if (/\s/.test(char)) {
      if (word !== null) {
        words.push(word);
        word = null;
      }
      continue;
    }
    word = (word ?? '') + char;
  }
  if (word !== null) words.push(word);
  return words;
}

// Options curl accepts that have no browser equivalent. Naming them is the honest
// move: a silently dropped `-F` would send a request that is not the one asked for.
const UNSUPPORTED = {
  '-F': 'multipart form uploads',
  '--form': 'multipart form uploads',
  '-T': 'file uploads',
  '--upload-file': 'file uploads',
  '--connect-timeout': 'a separate connection timeout',
  '-o': 'writing the reply to a file',
  '--output': 'writing the reply to a file',
  '-x': 'a proxy',
  '--proxy': 'a proxy',
  '--cert': 'a client certificate',
  '--key': 'a client certificate',
  '--cacert': 'a custom CA bundle',
  '-c': 'a cookie jar',
  '--cookie-jar': 'a cookie jar',
  '--resolve': 'a pinned address',
  '--interface': 'binding to an interface',
  '--retry': 'automatic retries',
  '-w': 'a custom write-out format',
  '--write-out': 'a custom write-out format',
  '--http1.1': 'forcing an HTTP version',
  '--http2': 'forcing an HTTP version',
  '--limit-rate': 'throttling the transfer',
  '--cert-type': 'a client certificate',
  '--key-type': 'a client certificate',
  // The one that matters: a browser cannot be told to accept a bad certificate,
  // so a command that needs this will fail here and the reason is not obvious.
  '-k': 'skipping certificate checks — a browser refuses a bad certificate and cannot be told otherwise',
  '--insecure': 'skipping certificate checks — a browser refuses a bad certificate and cannot be told otherwise',
};

// Flags that ask for something this page does anyway, or that only affect a
// terminal. Listing these as "left out" would be false — nothing was lost — and it
// would train people to skim the list that actually matters.
const HARMLESS = {
  '-s': 'quiet mode',
  '--silent': 'quiet mode',
  '-S': 'showing errors, which this page always does',
  '--show-error': 'showing errors, which this page always does',
  '-L': 'redirects, which this page always follows',
  '--location': 'redirects, which this page always follows',
  '-i': 'response headers, which are always shown here',
  '--include': 'response headers, which are always shown here',
  '-f': 'failing on an error status — the status is shown here instead',
  '--fail': 'failing on an error status — the status is shown here instead',
  '--compressed': 'compressed replies, which the browser negotiates on its own',
  '-N': 'unbuffered output',
  '--no-buffer': 'unbuffered output',
  '-v': 'the raw traffic log, which a page cannot see',
  '--verbose': 'the raw traffic log, which a page cannot see',
};

// Long options that take a value, and the short letters that do.
const LONG_VALUE = new Set([
  'request', 'header', 'data', 'data-raw', 'data-binary', 'data-ascii', 'data-urlencode',
  'json', 'user', 'cookie', 'user-agent', 'referer', 'url', 'max-time', 'connect-timeout',
  'form', 'upload-file', 'output', 'proxy', 'cert', 'key', 'cacert', 'cookie-jar', 'resolve',
  'interface', 'retry', 'write-out',
]);
const SHORT_VALUE = new Set(['X', 'H', 'd', 'b', 'u', 'A', 'e', 'T', 'm', 'o', 'x', 'F', 'c', 'w']);

// `a=1&b=2` stays two pairs; the names and the values are what get encoded.
function encodePairs(text) {
  return String(text)
    .split('&')
    .map((pair) => {
      const at = pair.indexOf('=');
      return at < 0 ? encodeURIComponent(pair) : `${encodeURIComponent(pair.slice(0, at))}=${encodeURIComponent(pair.slice(at + 1))}`;
    })
    .join('&');
}

function parseCurl(text) {
  const words = tokenize(text);
  if (words.length === 0) throw new Error('Nothing to import — paste a curl command first');
  if (!/^(curl|\/.*\/curl|curl\.exe)$/i.test(words[0])) {
    throw new Error(`That does not start with curl — it starts with "${words[0]}"`);
  }

  // Two lists, because they are not the same thing: `notes` is what the command
  // asked for and this page will not do, and `adjustments` is what was understood
  // but written down differently. Calling the second kind "left out" is a lie that
  // trains people to ignore the first kind.
  const result = { method: null, url: '', headers: [], body: null, get: false, notes: [], adjustments: [] };
  // Each chunk remembers whether curl would percent-encode it in a -G query string.
  // `-d` is encoded, `--data-raw` and `--data-binary` are not, and `--data-urlencode`
  // has already been encoded here.
  const data = [];
  let urlencoded = false;
  let rawBinary = false;

  for (let i = 1; i < words.length; i += 1) {
    let word = words[i];
    let value = null;
    let name = word;

    if (word.startsWith('--')) {
      const at = word.indexOf('=');
      if (at > 0) {
        name = word.slice(0, at);
        value = word.slice(at + 1);
      } else if (LONG_VALUE.has(word.slice(2))) {
        value = words[++i];
        if (value === undefined) throw new Error(`${word} needs a value`);
      }
    } else if (word.startsWith('-') && word.length > 1) {
      // A cluster such as -sSL is several flags; the first letter that takes a
      // value swallows the rest of the cluster, which is how -dfoo works.
      let at = 1;
      let taken = false;
      while (at < word.length) {
        const letter = word[at];
        if (SHORT_VALUE.has(letter)) {
          const rest = word.slice(at + 1);
          value = rest === '' ? words[++i] : rest;
          if (value === undefined) throw new Error(`-${letter} needs a value`);
          name = `-${letter}`;
          taken = true;
          break;
        }
        at += 1;
      }
      if (!taken) {
        for (const letter of word.slice(1)) {
          if (UNSUPPORTED[`-${letter}`]) result.notes.push(`-${letter} (${UNSUPPORTED[`-${letter}`]})`);
          else if (HARMLESS[`-${letter}`]) result.adjustments.push(HARMLESS[`-${letter}`]);
          else if (letter === 'G') result.get = true;
          else if (letter === 'I') result.method = 'HEAD';
        }
        continue;
      }
    } else {
      if (result.url === '') result.url = word;
      else result.adjustments.push(`ignored the extra argument "${word}"`);
      continue;
    }

    if (UNSUPPORTED[name]) {
      result.notes.push(`${name} (${UNSUPPORTED[name]})`);
      continue;
    }
    if (HARMLESS[name]) {
      result.adjustments.push(HARMLESS[name]);
      continue;
    }

    switch (name) {
      case '-X':
      case '--request':
        result.method = String(value).toUpperCase();
        break;
      case '-H':
      case '--header': {
        const at = String(value).indexOf(':');
        if (at < 1) throw new Error(`"${value}" is not a header — it needs a colon`);
        result.headers.push([value.slice(0, at).trim(), value.slice(at + 1).trim()]);
        break;
      }
      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-ascii':
        // curl sends these as application/x-www-form-urlencoded unless told
        // otherwise, so the form has to remember that or the re-exported command
        // asks for a different request than the one that was pasted in.
        urlencoded = true;
        if (/^[@<]/.test(String(value))) {
          result.notes.push('the @file and <file forms read a file from disk, which a page cannot do — the reference is sent as literal text');
        }
        data.push({ text: String(value), encode: name !== '--data-raw' });
        break;
      case '--data-binary':
        // Raw bytes, and curl adds no Content-Type of its own for this one.
        rawBinary = true;
        if (/^[@<]/.test(String(value))) {
          result.notes.push('the @file and <file forms read a file from disk, which a page cannot do — the reference is sent as literal text');
        }
        data.push({ text: String(value), encode: false });
        break;
      case '--data-urlencode':
        urlencoded = true;
        data.push({ text: encodeURIComponent(String(value)), encode: false });
        result.adjustments.push('--data-urlencode encoded the value as a whole; curl encodes only the part after the first =');
        break;
      case '--json': {
        data.push({ text: String(value), encode: false });
        result.headers.push(['Content-Type', 'application/json'], ['Accept', 'application/json']);
        break;
      }
      case '-u':
      case '--user': {
        // btoa needs one byte per character, so a non-ASCII password would throw.
        // Encoding to UTF-8 first keeps it honest instead of failing.
        const bytes = new TextEncoder().encode(String(value));
        let binary = '';
        for (const byte of bytes) binary += String.fromCharCode(byte);
        result.headers.push(['Authorization', `Basic ${btoa(binary)}`]);
        break;
      }
      case '-b':
      case '--cookie':
        result.headers.push(['Cookie', String(value)]);
        break;
      case '-A':
      case '--user-agent':
        result.headers.push(['User-Agent', String(value)]);
        break;
      case '-e':
      case '--referer':
        result.headers.push(['Referer', String(value)]);
        break;
      case '-m':
      case '--max-time': {
        const seconds = Number(value);
        if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('--max-time needs a number of seconds');
        timeout.value = String(Math.round(seconds * 1000));
        break;
      }
      case '--url':
        result.url = String(value);
        break;
      default:
        if (name.startsWith('-')) result.notes.push(`${name} (not recognised, left out)`);
        break;
    }
  }

  if (result.url === '') throw new Error('No URL in that command');
  if (!/^https?:\/\//i.test(result.url)) {
    if (/^wss?:\/\//i.test(result.url)) throw new Error('That is a WebSocket address — use the WebSocket Tester');
    if (/^[a-z][a-z0-9+.-]*:/i.test(result.url)) throw new Error(`This page can only send http and https, not ${result.url.split(':')[0]}`);
    result.url = `https://${result.url}`;
    result.adjustments.push('no scheme in the command, so https was assumed');
  }

  if (data.length > 0) {
    const joined = data.map((chunk) => chunk.text).join('&');
    if (result.get) {
      // curl percent-encodes -d data before moving it into the query string, which is
      // why `-d 'q=hello world'` becomes q=hello%20world. Appending the raw text puts
      // a literal space in the URL and breaks at the first & or = inside a value.
      // The separators stay: only what is around them is encoded.
      const query = data.map((chunk) => (chunk.encode ? encodePairs(chunk.text) : chunk.text)).join('&');
      const [path, existing] = result.url.split('?');
      result.url = existing ? `${path}?${existing}&${query}` : `${path}?${query}`;
      result.adjustments.push('-G moved the data into the query string');
    } else {
      result.body = joined;
      if (urlencoded && !result.headers.some(([name]) => name.toLowerCase() === 'content-type')) {
        result.headers.push(['Content-Type', 'application/x-www-form-urlencoded']);
        result.adjustments.push('curl sends -d as application/x-www-form-urlencoded, so that Content-Type was filled in');
      } else if (rawBinary && !result.headers.some(([name]) => name.toLowerCase() === 'content-type')) {
        result.adjustments.push('curl sends no Content-Type at all with --data-binary, and this form always sends one — set the header yourself if the server cares');
      }
      if (!result.method) result.method = 'POST';
    }
  }
  if (!result.method) result.method = 'GET';
  return result;
}

// Single quotes, with the one escape a single-quoted shell word has.
const quote = (value) => (/^[A-Za-z0-9._:/@%+=-]+$/.test(value) ? value : `'${String(value).replace(/'/g, "'\\''")}'`);

function buildCurl({ method: verb, url: target, headers: list, body }) {
  const lines = [`curl -X ${verb} ${quote(target)}`];
  for (const [name, value] of list) lines.push(`  -H ${quote(`${name}: ${value}`)}`);
  if (body !== null && body !== '') lines.push(`  -d ${quote(body)}`);
  return lines.join(' \\\n');
}

/* ---------- sending ---------- */

let running = null;

function showResponse(response, elapsed, text) {
  const size = new TextEncoder().encode(text).length;
  meta.textContent = `${response.status} ${response.statusText} · ${Math.round(elapsed)} ms · ${size.toLocaleString()} bytes`;
  const lines = [];
  response.headers.forEach((value, name) => lines.push(`${name}: ${value}`));
  resHeaders.value = lines.join('\n');

  try {
    resBody.value = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    resBody.value = text;
  }
}

async function send() {
  const request = readForm();
  if (request.url === '') {
    tk.setStatus(status, 'Type an address first', 'err');
    return;
  }
  if (request.problems.length > 0) {
    tk.setStatus(status, `These header lines have no colon, so they were left out: ${request.problems.join(' | ')}`, 'err');
    return;
  }
  let target;
  try {
    target = new URL(request.url);
  } catch {
    tk.setStatus(status, `"${request.url}" is not a complete address — it needs http:// or https://`, 'err');
    return;
  }
  if (!/^https?:$/.test(target.protocol)) {
    tk.setStatus(status, `This page can only send http and https, not ${target.protocol.replace(':', '')}`, 'err');
    return;
  }
  if (NO_BODY.has(request.method) && request.body !== null) {
    tk.setStatus(status, `A ${request.method} request cannot carry a body, so it was left off`, 'err');
    return;
  }

  const controller = new AbortController();
  const limit = Number(timeout.value) || 15000;
  const timer = setTimeout(() => controller.abort(), limit);
  running = controller;
  sendButton.disabled = true;
  cancelButton.hidden = false;
  resHeaders.value = '';
  resBody.value = '';
  meta.textContent = '';
  tk.setStatus(status, 'Sending…');

  const started = performance.now();
  try {
    const response = await fetch(target.href, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      signal: controller.signal,
      // `include` is the only value that sends cookies, and it also asks the
      // browser for a stricter CORS reply — which is why it is a checkbox.
      credentials: credentials.checked ? 'include' : 'same-origin',
      redirect: 'follow',
      cache: 'no-store',
    });
    const text = await response.text();
    showResponse(response, performance.now() - started, text);
    tk.setStatus(status, response.ok ? 'Done' : 'The server answered with an error status', response.ok ? 'ok' : 'err');
  } catch (error) {
    const elapsed = Math.round(performance.now() - started);
    meta.textContent = `no reply · ${elapsed} ms`;
    tk.setStatus(
      status,
      error.name === 'AbortError'
        ? `Gave up after ${limit} ms — the request was still open`
        : 'No reply reached the page. Either the address does not resolve, or the server did not send Access-Control-Allow-Origin, which the browser requires before any page may read a cross-origin reply.',
      'err',
    );
  } finally {
    clearTimeout(timer);
    running = null;
    sendButton.disabled = false;
    cancelButton.hidden = true;
  }
}

/* ---------- wiring ---------- */

document.querySelector('#hrt-send').addEventListener('click', send);
cancelButton.addEventListener('click', () => running?.abort());
bodyType.addEventListener('change', syncBodyField);

document.querySelector('#hrt-import').addEventListener('click', () => {
  try {
    const parsed = parseCurl(curlIn.value);
    writeForm(parsed);
    // The form was filled in by code, so no input event fires and the export panel
    // would keep showing the request that was there before the import.
    refreshCurl();
    const parts = [];
    if (parsed.notes.length > 0) parts.push(`Left out: ${[...new Set(parsed.notes)].join(', ')}.`);
    // A flag cluster can repeat an option, and saying the same thing twice reads
    // like two separate problems.
    const adjustments = [...new Set(parsed.adjustments)];
    if (adjustments.length > 0) parts.push(`${adjustments.join('; ')}.`);
    tk.setStatus(curlStatus, `Imported. ${parts.join(' ')}`.trim(), parsed.notes.length > 0 ? 'err' : 'ok');
  } catch (error) {
    tk.setStatus(curlStatus, error.message, 'err');
  }
});

const refreshCurl = () => {
  curlOut.value = buildCurl(readForm());
};
document.querySelector('#hrt-copy-curl').addEventListener('click', async () => {
  refreshCurl();
  await tk.flash(curlStatus, 'curl copied', 'ok');
});

// Copying the body is what people actually want nine times out of ten, so it gets
// its own button rather than making them select 40 kB of textarea by hand.
document.querySelector('#hrt-copy-body').addEventListener('click', () => {
  navigator.clipboard?.writeText(resBody.value);
  tk.flash(status, 'Body copied', 'ok');
});
document.querySelector('#hrt-copy-headers').addEventListener('click', () => {
  navigator.clipboard?.writeText(resHeaders.value);
  tk.flash(status, 'Headers copied', 'ok');
});

// Keep the curl view in step with the form, but only once somebody has shown they
// care about it — the command is not worth building on every keystroke otherwise.
tk.live([method, url, headers, bodyType, bodyField], () => {
  syncBodyField();
  if (curlOut.value !== '') refreshCurl();
});

syncBodyField();
refreshCurl();
