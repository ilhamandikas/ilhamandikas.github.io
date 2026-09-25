// IPv4 subnet calculator — pure integer math, no dependencies.
const { tk } = window;

const input = document.querySelector('#subnet-input');
const results = document.querySelector('#subnet-results');
const status = document.querySelector('#subnet-status');

function ipToInt(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IPv4 address');
  }
  return ((parts[0] * 2 ** 24) + (parts[1] * 2 ** 16) + (parts[2] * 2 ** 8) + parts[3]) >>> 0;
}

function intToIp(n) {
  const value = n >>> 0;
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255].join('.');
}

function render() {
  results.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') {
    tk.setStatus(status, '');
    return;
  }
  try {
    const [ipPart, bitsPart] = raw.split('/');
    const bits = bitsPart === undefined ? 32 : Number(bitsPart);
    if (!Number.isInteger(bits) || bits < 0 || bits > 32) throw new Error('Prefix must be 0–32');

    const ip = ipToInt(ipPart);
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = 2 ** (32 - bits);
    const usable = Math.max(0, total - 2);

    const rows = [
      ['Network', intToIp(network)],
      ['Broadcast', intToIp(broadcast)],
      ['Netmask', intToIp(mask)],
      ['Wildcard', intToIp(~mask >>> 0)],
      ['First host', intToIp(total > 2 ? network + 1 : network)],
      ['Last host', intToIp(total > 2 ? broadcast - 1 : broadcast)],
      ['Total addresses', String(total)],
      ['Usable hosts', String(usable)],
      ['CIDR', `${intToIp(network)}/${bits}`],
    ];

    results.replaceChildren(
      ...rows.map(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'tool-result-row';
        row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
        return row;
      }),
    );
    tk.setStatus(status, 'Valid CIDR', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live(input, render);
