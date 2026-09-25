// Text <-> binary, 8 bits per UTF-8 byte.
const { tk } = window;

const input = document.querySelector('#bin-input');
const decode = document.querySelector('#bin-decode');

tk.transform({
  watch: [input, decode],
  output: document.querySelector('#bin-output'),
  status: document.querySelector('#bin-status'),
  fn: () => {
    if (decode.checked) {
      const bits = input.value.replace(/[^01]/g, '');
      if (bits.length % 8 !== 0) throw new Error('Binary length must be a multiple of 8');
      const bytes = new Uint8Array(bits.length / 8);
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
      return new TextDecoder().decode(bytes);
    }
    return [...new TextEncoder().encode(input.value)].map((b) => b.toString(2).padStart(8, '0')).join(' ');
  },
});
