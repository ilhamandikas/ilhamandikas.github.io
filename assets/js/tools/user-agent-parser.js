// Lightweight User-Agent parser — enough to name the common browsers/engines/OS.
const { tk } = window;

const input = document.querySelector('#ua-input');

const BROWSERS = [
  ['Edge', /Edg(?:e|A|iOS)?\/([\d.]+)/],
  ['Opera', /(?:OPR|Opera)\/([\d.]+)/],
  ['Samsung Internet', /SamsungBrowser\/([\d.]+)/],
  ['Firefox', /(?:Firefox|FxiOS)\/([\d.]+)/],
  ['Chrome', /(?:Chrome|CriOS)\/([\d.]+)/],
  ['Safari', /Version\/([\d.]+).*Safari/],
  ['Internet Explorer', /(?:MSIE |rv:)([\d.]+).*Trident/],
];

const ENGINES = [
  ['Blink', /Chrome|Edg|OPR/],
  ['Gecko', /Gecko\/|Firefox/],
  ['WebKit', /AppleWebKit/],
  ['Trident', /Trident/],
];

const SYSTEMS = [
  ['Windows', /Windows NT ([\d.]+)/],
  ['macOS', /Mac OS X ([\d_]+)/],
  ['iOS', /(?:iPhone|iPad).*OS ([\d_]+)/],
  ['Android', /Android ([\d.]+)/],
  ['Linux', /Linux/],
];

function match(list, text) {
  for (const [name, regex] of list) {
    const found = text.match(regex);
    if (found) return found[1] ? `${name} ${found[1].replace(/_/g, '.')}` : name;
  }
  return 'Unknown';
}

tk.transform({
  watch: input,
  output: document.querySelector('#ua-output'),
  status: document.querySelector('#ua-status'),
  fn: () => {
    const ua = input.value.trim();
    if (ua === '') return '';
    return [
      `Browser: ${match(BROWSERS, ua)}`,
      `Engine:  ${match(ENGINES, ua)}`,
      `OS:      ${match(SYSTEMS, ua)}`,
      `Mobile:  ${/Mobile|Android|iPhone|iPad/.test(ua) ? 'yes' : 'no'}`,
      `Bot:     ${/bot|crawler|spider|crawling/i.test(ua) ? 'yes' : 'no'}`,
    ].join('\n');
  },
});

document.querySelector('#ua-here').addEventListener('click', () => {
  input.value = navigator.userAgent;
  input.dispatchEvent(new Event('input'));
});
