// Identify the vendor behind a MAC address from a bundled OUI list.
const { tk } = window;

// A small selection of well-known OUI prefixes.
const OUI = {
  '000C29': 'VMware', '005056': 'VMware', '001C42': 'Parallels',
  '080027': 'Oracle VirtualBox', '525400': 'QEMU / KVM',
  '00155D': 'Microsoft Hyper-V', '0050F2': 'Microsoft',
  '001B63': 'Apple', '001451': 'Apple', '3C0754': 'Apple', 'F0DBF8': 'Apple',
  'A4C361': 'Apple', 'D83062': 'Apple', 'AC87A3': 'Apple',
  '001A11': 'Google', '3C5AB4': 'Google', 'F4F5D8': 'Google',
  '0018E7': 'Raspberry Pi', 'B827EB': 'Raspberry Pi', 'DCA632': 'Raspberry Pi',
  'E45F01': 'Raspberry Pi', '2CCF67': 'Raspberry Pi',
  '001E58': 'D-Link', '1CBDB9': 'D-Link', '340804': 'D-Link',
  '001CDF': 'Belkin', '944452': 'Belkin', '08863B': 'Belkin',
  '000FB5': 'NETGEAR', '204E7F': 'NETGEAR', 'A040A0': 'NETGEAR', '9C3DCF': 'NETGEAR',
  '001839': 'Cisco-Linksys', 'C0C1C0': 'Cisco-Linksys', '48F8B3': 'Cisco-Linksys',
  '00000C': 'Cisco', '001A2F': 'Cisco', '0024C4': 'Cisco', 'F02929': 'Cisco',
  '0018F3': 'ASUSTek', '2C56DC': 'ASUSTek', '04D4C4': 'ASUSTek', 'AC220B': 'ASUSTek',
  '001E10': 'Huawei', '283152': 'Huawei', '48DB50': 'Huawei', '781DBA': 'Huawei',
  '0016E0': 'Xiaomi', '286C07': 'Xiaomi', '64CC2E': 'Xiaomi', '8CBEBE': 'Xiaomi',
  '0017D1': 'Nokia', 'D0DB32': 'Nokia', 'E8E5D6': 'Nokia',
  '002454': 'Samsung', '5001BB': 'Samsung', 'E8508B': 'Samsung', '8425DB': 'Samsung',
  '0012FB': 'Samsung', '5C0A5B': 'Samsung',
  '001A79': 'Dell', 'B8AC6F': 'Dell', 'D067E5': 'Dell', 'F8B156': 'Dell',
  '001C25': 'Intel', '34E12D': 'Intel', '7C5CF8': 'Intel', 'A0A8CD': 'Intel',
  '001B21': 'Intel', '3C58C2': 'Intel',
  '001E37': 'HP', '3464A9': 'HP', '9457A5': 'HP', 'B0D5CC': 'HP',
  '0021CC': 'Flextronics', '0019E3': 'Sagemcom', '8C1ABF': 'Sagemcom',
  '001CC5': '3Com', '0090A9': 'Western Digital',
  '0014EE': 'Western Digital', '000D93': 'Apple', '001DE5': 'Cisco',
  '24A43C': 'Ubiquiti',
  '687251': 'Ubiquiti', '788A20': 'Ubiquiti', '0418D6': 'Ubiquiti',
  '0009B0': 'Onkyo', '0080F0': 'Panasonic', '00E091': 'Sony', 'FCF152': 'Sony',
  '0013A9': 'Sony', '045D4B': 'Sony', '30F9ED': 'Sony',
  '00D0F1': 'Sony', '001D0D': 'Sony', '001A8F': 'Nintendo', '98B6E9': 'Nintendo',
  '58BDA3': 'Nintendo', '001656': 'Nintendo', '8CCDE8': 'Nintendo',
};

const input = document.querySelector('#mac-input');
const results = document.querySelector('#mac-results');
const status = document.querySelector('#mac-status');

function parse(raw) {
  const hex = raw.replace(/[^0-9a-fA-F]/g, '').toUpperCase();
  if (hex.length !== 12) throw new Error('A MAC address needs 12 hexadecimal digits');
  const bytes = hex.match(/.{2}/g);
  const first = parseInt(bytes[0], 16);
  const prefix = bytes.slice(0, 3).join('');
  const vendor = OUI[prefix];
  return {
    normalised: bytes.join(':'),
    dashed: bytes.join('-'),
    dotted: `${bytes.slice(0, 2).join('')}.${bytes.slice(2, 4).join('')}.${bytes.slice(4, 6).join('')}`,
    oui: `${bytes.slice(0, 3).join(':')} (${prefix})`,
    nic: bytes.slice(3).join(':'),
    vendor: vendor || 'Unknown / not in the local list',
    unicast: (first & 1) === 0 ? 'unicast' : 'multicast',
    scope: (first & 2) === 0 ? 'globally administered (OUI)' : 'locally administered (randomised)',
  };
}

function render() {
  results.replaceChildren();
  const raw = input.value.trim();
  if (raw === '') { tk.setStatus(status, ''); return; }
  try {
    const info = parse(raw);
    const rows = [
      ['Normalised', info.normalised],
      ['Dashed', info.dashed],
      ['Cisco style', info.dotted],
      ['OUI', info.oui],
      ['NIC', info.nic],
      ['Vendor', info.vendor],
      ['Transmission', info.unicast],
      ['Scope', info.scope],
    ];
    results.replaceChildren(
      ...rows.map(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'tool-result-row';
        row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
        return row;
      }),
    );
    tk.setStatus(status, info.vendor.startsWith('Unknown') ? 'Format valid' : 'Vendor found', 'ok');
  } catch (error) {
    tk.setStatus(status, error.message, 'err');
  }
}

tk.live(input, render);
