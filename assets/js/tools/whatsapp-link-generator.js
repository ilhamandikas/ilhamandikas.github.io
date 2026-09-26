const { tk } = window;

const cc = document.querySelector('#wal-cc');
const phone = document.querySelector('#wal-phone');
const message = document.querySelector('#wal-message');
const output = document.querySelector('#wal-output');
const openLink = document.querySelector('#wal-open');
const status = document.querySelector('#wal-status');

// Keep only digits, drop a national leading zero, and add the country code
// unless the number already carries it.
function normalize(code, number) {
  const digits = number.replace(/\D/g, '').replace(/^0+/, '');
  const prefix = code.replace(/\D/g, '');
  if (!digits) return '';
  if (prefix && digits.startsWith(prefix)) return digits;
  return `${prefix}${digits}`;
}

function render() {
  const number = normalize(cc.value, phone.value);
  if (!number) {
    output.value = '';
    openLink.setAttribute('href', '#');
    tk.setStatus(status, '');
    return;
  }
  const link = `https://wa.me/${number}${message.value.trim() ? `?text=${encodeURIComponent(message.value)}` : ''}`;
  output.value = link;
  openLink.setAttribute('href', link);
  tk.setStatus(status, '');
}

tk.live([cc, phone, message], render);
