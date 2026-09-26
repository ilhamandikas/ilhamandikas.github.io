// Estimate password strength from the search space and obvious weaknesses.
const { tk } = window;

const COMMON = ['password', '123456', 'qwerty', 'letmein', 'admin', 'welcome', 'iloveyou', 'monkey', 'dragon', 'abc123'];

const input = document.querySelector('#pw-input');
const results = document.querySelector('#pw-results');

function humanTime(seconds) {
  if (seconds < 1) return 'instantly';
  const units = [
    ['century', 3155760000], ['year', 31557600], ['month', 2629800], ['day', 86400],
    ['hour', 3600], ['minute', 60], ['second', 1],
  ];
  for (const [name, size] of units) {
    if (seconds >= size) {
      const value = Math.round(seconds / size);
      return `${value.toLocaleString()} ${name}${value === 1 ? '' : 's'}`;
    }
  }
  return 'instantly';
}

function analyse(password) {
  const sets = [
    [/[a-z]/, 26, 'lowercase'],
    [/[A-Z]/, 26, 'uppercase'],
    [/\d/, 10, 'digits'],
    [/[^A-Za-z0-9]/, 33, 'symbols'],
  ];
  let pool = 0;
  const present = [];
  for (const [regex, size, name] of sets) {
    if (regex.test(password)) { pool += size; present.push(name); }
  }
  const length = [...password].length;
  const entropy = length && pool ? length * Math.log2(pool) : 0;

  // Rough guess rate: 10 billion guesses per second.
  const guesses = 2 ** entropy;
  const seconds = guesses / 1e10;

  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 15) score += 1;
  if (present.length >= 2) score += 1;
  if (present.length >= 3) score += 1;
  if (COMMON.some((c) => password.toLowerCase().includes(c))) score = Math.min(score, 1);
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'];

  return { length, pool, present, entropy, seconds, label: labels[Math.min(score, 5)] };
}

function render() {
  const password = input.value;
  if (password === '') { results.replaceChildren(); return; }
  const info = analyse(password);
  const rows = [
    ['Strength', info.label],
    ['Length', info.length],
    ['Character sets', info.present.join(', ') || 'none'],
    ['Search space', `2^${info.entropy.toFixed(1)}`],
    ['Entropy', `${info.entropy.toFixed(1)} bits`],
    ['Time to crack', humanTime(info.seconds)],
  ];
  results.replaceChildren(
    ...rows.map(([key, value]) => {
      const row = document.createElement('div');
      row.className = 'tool-result-row';
      row.innerHTML = `<dt>${key}</dt><dd>${String(value)}</dd>`;
      return row;
    }),
  );
}

tk.live(input, render);
