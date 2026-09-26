const { tk } = window;

const mode = document.querySelector('#sth-mode');
const bind = document.querySelector('#sth-bind');
const port = document.querySelector('#sth-port');
const portLabel = document.querySelector('#sth-port-label');
const destHost = document.querySelector('#sth-dest-host');
const destPort = document.querySelector('#sth-dest-port');
const destHostField = document.querySelector('#sth-dest-host-field');
const destPortField = document.querySelector('#sth-dest-port-field');
const user = document.querySelector('#sth-user');
const host = document.querySelector('#sth-host');
const sshPort = document.querySelector('#sth-ssh-port');
const identity = document.querySelector('#sth-identity');
const bg = document.querySelector('#sth-bg');
const nc = document.querySelector('#sth-nc');
const keepalive = document.querySelector('#sth-keepalive');
const exitFailure = document.querySelector('#sth-exit-failure');
const compress = document.querySelector('#sth-compress');
const verbose = document.querySelector('#sth-verbose');
const out = document.querySelector('#sth-out');
const status = document.querySelector('#sth-status');

// -D takes no destination, so hide those two fields and relabel the port.
function syncMode() {
  const dynamic = mode.value === 'D';
  destHostField.hidden = dynamic;
  destPortField.hidden = dynamic;
  portLabel.textContent = dynamic ? 'SOCKS port' : mode.value === 'R' ? 'Remote port' : 'Local port';
}

function build() {
  const type = mode.value;
  const bindValue = bind.value.trim();
  const portValue = port.value.trim();
  const farHost = destHost.value.trim();
  const farPort = destPort.value.trim();
  const sshUser = user.value.trim();
  const sshHost = host.value.trim();
  const sshPortValue = sshPort.value.trim();
  const identityValue = identity.value.trim();

  const started = sshHost || sshUser || portValue || farHost || farPort;
  if (!started) {
    out.textContent = '';
    tk.setStatus(status, '');
    return;
  }
  if (!sshHost) {
    out.textContent = '';
    tk.setStatus(status, 'Enter the SSH host to connect to.', 'err');
    return;
  }
  if (!portValue) {
    out.textContent = '';
    tk.setStatus(status, type === 'D' ? 'Enter the SOCKS port.' : 'Enter the port to forward.', 'err');
    return;
  }
  if (type !== 'D' && (!farHost || !farPort)) {
    out.textContent = '';
    tk.setStatus(status, 'A forward needs a destination host and port.', 'err');
    return;
  }

  const target = type === 'D' ? portValue : `${portValue}:${farHost}:${farPort}`;
  const spec = bindValue ? `${bindValue}:${target}` : target;

  const parts = ['ssh'];
  if (verbose.checked) parts.push('-v');
  if (compress.checked) parts.push('-C');
  if (sshPortValue && sshPortValue !== '22') parts.push('-p', sshPortValue);
  if (identityValue) parts.push('-i', tk.shq(identityValue));
  if (bg.checked) parts.push('-f');
  if (nc.checked) parts.push('-N');
  if (keepalive.checked) parts.push('-o', 'ServerAliveInterval=60', '-o', 'ServerAliveCountMax=3');
  if (exitFailure.checked) parts.push('-o', 'ExitOnForwardFailure=yes');
  parts.push(`-${type}`, tk.shq(spec));
  parts.push(tk.shq(sshUser ? `${sshUser}@${sshHost}` : sshHost));

  out.textContent = parts.join(' ');
  tk.setStatus(status, '');
}

mode.addEventListener('change', syncMode);
syncMode();
tk.live(
  [mode, bind, port, destHost, destPort, user, host, sshPort, identity, bg, nc, keepalive, exitFailure, compress, verbose],
  build,
);
