const { tk } = window;

const input = document.querySelector('#typ-input');
const informal = document.querySelector('#typ-informal');
const output = document.querySelector('#typ-output');
const status = document.querySelector('#typ-status');

const RULES = [
  { re: / {2,}/g, label: (m) => `double space (${m.length} spaces)` },
  { re: /\s+([,.!?;:])/g, label: () => 'space before punctuation' },
  { re: /([,.!?;:])(?=[A-Za-z])/g, label: () => 'missing space after punctuation' },
  { re: /\b(\p{L}+)\s+\1\b/giu, label: (m, word) => `repeated word "${word} ${word}"` },
  { re: /([!?])\1+/g, label: (m) => `repeated punctuation "${m}"` },
  { re: /\(\s+/g, label: () => 'space after an opening bracket' },
  { re: /\s+\)/g, label: () => 'space before a closing bracket' },
  { re: /[ \t]+$/gm, label: () => 'trailing space' },
];

// Short forms that are fine in chat but usually rewritten in formal writing.
const INFORMAL = {
  yg: 'yang', tdk: 'tidak', gk: 'tidak', ga: 'tidak', dgn: 'dengan',
  utk: 'untuk', krn: 'karena', jd: 'jadi', bs: 'bisa', sdh: 'sudah',
  blm: 'belum', diatas: 'di atas', dibawah: 'di bawah', kedalam: 'ke dalam',
  kedepan: 'ke depan', kalo: 'kalau', gimana: 'bagaimana', udh: 'sudah',
};

function locate(text, index) {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  const col = index - before.lastIndexOf('\n');
  return { line, col };
}

function scan(text, checkInformal) {
  const findings = [];
  RULES.forEach((rule) => {
    rule.re.lastIndex = 0;
    let match = rule.re.exec(text);
    while (match) {
      const { line, col } = locate(text, match.index);
      findings.push({ index: match.index, text: `Line ${line}, col ${col}: ${rule.label(match[0], match[1])}` });
      if (match[0] === '') rule.re.lastIndex += 1;
      match = rule.re.exec(text);
    }
  });

  if (checkInformal) {
    const words = /\p{L}+/gu;
    let match = words.exec(text);
    while (match) {
      const suggestion = INFORMAL[match[0].toLowerCase()];
      if (suggestion) {
        const { line, col } = locate(text, match.index);
        findings.push({
          index: match.index,
          text: `Line ${line}, col ${col}: informal "${match[0]}" — usually "${suggestion}"`,
        });
      }
      match = words.exec(text);
    }
  }

  findings.sort((a, b) => a.index - b.index);
  return findings;
}

function render() {
  if (!input.value.trim()) {
    output.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  const findings = scan(input.value, informal.checked);
  if (!findings.length) {
    output.textContent = 'No obvious typos found.';
    tk.setStatus(status, 'Nothing to flag.');
    return;
  }
  output.textContent = findings.map((finding) => finding.text).join('\n');
  tk.setStatus(status, `${findings.length} finding${findings.length === 1 ? '' : 's'}.`);
}

tk.live([input, informal], render);
