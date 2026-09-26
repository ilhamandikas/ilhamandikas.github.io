// IPv6 expander: normalise an address and explain what kind of address it is.
const { tk } = window;

const els = {
  input: document.querySelector('#ipv6-input'),
  out: document.querySelector('#ipv6-out'),
  status: document.querySelector('#ipv6-status'),
};

function parseIPv6(raw) {
  let text = String(raw).trim();
  if (!text) return null;
  let prefix = null;
  let zone = null;
  if (text.includes('/')) {
    const [address, bits] = text.split('/');
    text = address;
    prefix = Number(bits);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 128) return null;
  }
  if (text.includes('%')) {
    const [address, ...rest] = text.split('%');
    text = address;
    zone = rest.join('%') || null;
  }
  if (text.includes('.')) {
    const cut = text.lastIndexOf(':');
    if (cut === -1) return null;
    const parts = text.slice(cut + 1).split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
    text = `${text.slice(0, cut)}:${((parts[0] << 8) | parts[1]).toString(16)}:${((parts[2] << 8) | parts[3]).toString(16)}`;
  }
  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const valid = (g) => /^[0-9a-f]{1,4}$/i.test(g);
  if (!head.every(valid) || !tail.every(valid)) return null;
  const missing = 8 - head.length - tail.length;
  if (halves.length === 2 && missing < 1) return null;
  if (halves.length === 1 && (head.length !== 8 || missing !== 0)) return null;
  const groups = [...head, ...Array(halves.length === 2 ? missing : 0).fill('0'), ...tail];
  if (groups.length !== 8) return null;
  return { nums: groups.map((g) => parseInt(g, 16)), prefix, zone };
}

function compress(nums) {
  let bestStart = -1;
  let bestLen = 0;
  let runStart = -1;
  let runLen = 0;
  for (let i = 0; i < 8; i += 1) {
    if (nums[i] === 0) {
      if (runStart === -1) runStart = i;
      runLen += 1;
      if (runLen > bestLen) { bestLen = runLen; bestStart = runStart; }
    } else {
      runStart = -1;
      runLen = 0;
    }
  }
  const hex = (list) => list.map((n) => n.toString(16)).join(':');
  if (bestLen < 2) return hex(nums);
  return `${hex(nums.slice(0, bestStart))}::${hex(nums.slice(bestStart + bestLen))}`;
}

function classify(nums) {
  const [a, b, , , e] = nums;
  if (nums.every((n) => n === 0)) return 'Unspecified (::)';
  if (nums.slice(0, 7).every((n) => n === 0) && nums[7] === 1) return 'Loopback (::1)';
  if ((a & 0xffc0) === 0xfe80) return 'Link-local unicast (fe80::/10)';
  if ((a & 0xffc0) === 0xfec0) return 'Site-local (fec0::/10, deprecated)';
  if ((a & 0xfe00) === 0xfc00) return 'Unique local (fc00::/7)';
  if ((a & 0xff00) === 0xff00) return 'Multicast (ff00::/8)';
  if (a === 0x2001 && b === 0x0db8) return 'Documentation (2001:db8::/32)';
  if (nums.slice(0, 5).every((n) => n === 0) && e === 0xffff) return 'IPv4-mapped (::ffff:0:0/96)';
  if (a === 0x0064 && b === 0xff9b && nums.slice(2, 6).every((n) => n === 0)) return 'IPv4-embedded (64:ff9b::/96, NAT64)';
  if ((a & 0xe000) === 0x2000) return 'Global unicast (2000::/3)';
  return 'Other / reserved';
}

function row(dt, dd) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-result-row';
  const key = document.createElement('dt');
  const value = document.createElement('dd');
  key.textContent = dt;
  value.textContent = dd;
  wrap.append(key, value);
  return wrap;
}

function render() {
  const raw = els.input.value.trim();
  els.out.replaceChildren();
  if (!raw) {
    tk.setStatus(els.status, '');
    return;
  }
  const parsed = parseIPv6(raw);
  if (!parsed) {
    tk.setStatus(els.status, 'That does not look like a valid IPv6 address.', 'err');
    return;
  }
  const expanded = parsed.nums.map((n) => n.toString(16).padStart(4, '0')).join(':');
  const binary = parsed.nums.map((n) => n.toString(2).padStart(16, '0')).join('');
  els.out.append(
    row('Compressed', compress(parsed.nums)),
    row('Expanded', expanded),
    row('Prefix', parsed.prefix === null ? '—' : `/${parsed.prefix}`),
    row('Zone', parsed.zone || '—'),
    row('Type', classify(parsed.nums)),
    row('Binary', binary.replace(/(.{16})/g, '$1 ').trim()),
  );
  tk.setStatus(els.status, 'Parsed locally — nothing left your browser.', 'ok');
}

tk.live(els.input, render);
