// Text statistics — counts, timings and a few word-frequency highlights.
const { tk } = window;

const input = document.querySelector('#stats-input');
const results = document.querySelector('#stats-results');

function analyse(text) {
  const chars = [...text];
  const words = text.match(/[\p{L}\p{N}'’-]+/gu) || [];
  const sentences = text.split(/[.!?…]+/).filter((s) => s.trim().length > 0);
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim().length > 0);
  const lines = text === '' ? [] : text.split('\n');

  const freq = new Map();
  words.forEach((word) => {
    const key = word.toLowerCase();
    freq.set(key, (freq.get(key) || 0) + 1);
  });
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const readingMinutes = words.length / 200;
  const speakingMinutes = words.length / 130;

  const rows = [
    ['Characters', chars.length],
    ['Characters (no spaces)', chars.filter((c) => !/\s/.test(c)).length],
    ['Words', words.length],
    ['Unique words', freq.size],
    ['Sentences', sentences.length],
    ['Paragraphs', paragraphs.length],
    ['Lines', lines.length],
    ['Avg. word length', words.length ? (words.reduce((n, w) => n + [...w].length, 0) / words.length).toFixed(1) : '0'],
    ['Reading time', `${readingMinutes < 1 ? '<1' : Math.round(readingMinutes)} min`],
    ['Speaking time', `${speakingMinutes < 1 ? '<1' : Math.round(speakingMinutes)} min`],
    ['Top words', top.map(([w, n]) => `${w} (${n})`).join(', ') || '—'],
  ];
  return rows;
}

function render() {
  const rows = analyse(input.value);
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${value}</dd>`;
      return row;
    }),
  );
}

tk.live(input, render);
