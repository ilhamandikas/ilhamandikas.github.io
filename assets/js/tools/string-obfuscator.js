// Mask the middle of a string while keeping a leading/trailing slice visible.
const { tk } = window;

const input = document.querySelector('#obf-input');
const start = document.querySelector('#obf-start');
const end = document.querySelector('#obf-end');
const mask = document.querySelector('#obf-char');

tk.transform({
  watch: [input, start, end, mask],
  output: document.querySelector('#obf-output'),
  status: document.querySelector('#obf-status'),
  fn: () => {
    const chars = [...input.value];
    const keepStart = Math.max(0, Number(start.value) || 0);
    const keepEnd = Math.max(0, Number(end.value) || 0);
    const mark = mask.value || '*';
    return chars
      .map((ch, i) => {
        if (/\s/.test(ch)) return ch;
        if (i < keepStart || i >= chars.length - keepEnd) return ch;
        return mark;
      })
      .join('');
  },
});
