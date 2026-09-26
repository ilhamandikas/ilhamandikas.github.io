const { tk } = window;

const upstream = document.querySelector('#xrg-upstream');
const command = document.querySelector('#xrg-command');
const n = document.querySelector('#xrg-n');
const p = document.querySelector('#xrg-p');
const replace = document.querySelector('#xrg-replace');
const replaceOn = document.querySelector('#xrg-replace-on');
const nullDelim = document.querySelector('#xrg-null');
const trace = document.querySelector('#xrg-trace');
const noRun = document.querySelector('#xrg-no-run');
const out = document.querySelector('#xrg-out');
const explain = document.querySelector('#xrg-explain');
const status = document.querySelector('#xrg-status');

function describe(notes) {
  explain.textContent = '';
  notes.forEach(([flag, text]) => {
    const item = document.createElement('li');
    const code = document.createElement('code');
    code.textContent = flag;
    item.append(code, document.createTextNode(` — ${text}`));
    explain.append(item);
  });
}

function build() {
  const source = upstream.value.trim();
  const target = command.value.trim();
  const nValue = n.value.trim();
  const pValue = p.value.trim();
  const replaceValue = replace.value.trim() || '{}';
  const touched = source || target || nValue || pValue || replaceOn.checked;

  if (!target) {
    out.textContent = '';
    describe([]);
    tk.setStatus(status, touched ? 'Enter the command xargs should run.' : '', touched ? 'err' : '');
    return;
  }

  const parts = ['xargs'];
  const notes = [];
  if (nullDelim.checked) {
    parts.push('-0');
    notes.push(['-0', 'Read a null-separated stream, so names with spaces or newlines survive.']);
  }
  if (noRun.checked) {
    parts.push('-r');
    notes.push(['-r', 'Run nothing when the input is empty instead of running once.']);
  }
  if (trace.checked) {
    parts.push('-t');
    notes.push(['-t', 'Print each command before running it.']);
  }
  if (replaceOn.checked) {
    // -I already means one item per command, so -n is dropped to avoid a clash.
    parts.push('-I', tk.shq(replaceValue));
    notes.push([`-I ${replaceValue}`, 'Put each item where the replace string appears, one command per item.']);
  } else if (nValue) {
    parts.push('-n', nValue);
    notes.push([`-n ${nValue}`, `Give each command at most ${nValue} item${nValue === '1' ? '' : 's'}.`]);
  }
  if (pValue) {
    parts.push('-P', pValue);
    notes.push([`-P ${pValue}`, `Run up to ${pValue} command${pValue === '1' ? '' : 's'} at the same time.`]);
  }
  parts.push(target);
  if (source) notes.unshift(['upstream', 'The command whose output is piped into xargs.']);
  notes.push(['command', 'The command each batch of items is passed to.']);

  const line = parts.join(' ');
  out.textContent = source ? `${source} | ${line}` : line;
  describe(notes);
  tk.setStatus(status, '');
}

tk.live([upstream, command, n, p, replace, replaceOn, nullDelim, trace, noRun], build);
