function singleLine(value, label, required = true) {
  const text = String(value ?? '').trim();
  if ((required && !text) || /[\x00-\x1f\x7f]/.test(String(value ?? ''))) {
    throw new Error(`${label}: enter a single line without control characters.`);
  }
  if (text.length > 4096) throw new Error(`${label}: maximum 4,096 characters.`);
  return text;
}
function path(value, label, required = true) {
  const text = singleLine(value, label, required);
  if (text && (!text.startsWith('/') || text.split('/').some((part) => ['.', '..'].includes(part)))) {
    throw new Error(`${label}: use an absolute path without . or .. segments, such as /opt/example-app.`);
  }
  if (text.includes('\\')) throw new Error(`${label}: backslashes in paths are not supported. Use forward slashes.`);
  return text;
}
function account(value, label, required = true) {
  const text = singleLine(value, label, required);
  if (text && !/^[a-z_][a-z0-9_-]{0,31}$/.test(text)) throw new Error(`${label}: use a conventional Linux account name (lowercase letters, digits, underscores, or hyphens; maximum 32 characters).`);
  if (label === 'User' && text === 'root') throw new Error('User: choose an existing non-root service account. This builder is for unprivileged application services.');
  return text;
}
// systemd unit quoting is not shell quoting. Escape specifiers everywhere,
// and dollar expansion only for ExecStart arguments.
function quote(text, commandArgument = false) {
  let escaped = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/%/g, '%%');
  if (commandArgument) escaped = escaped.replace(/\$/g, '$$$$');
  return `"${escaped}"`;
}
function seconds(value, label) {
  const text = String(value);
  if (!/^\d+$/.test(text) || Number(text) < 1 || Number(text) > 3600) throw new Error(`${label}: enter a whole number from 1 to 3,600 seconds.`);
  return Number(text);
}

export function buildService(settings) {
  const name = singleLine(settings.name, 'Service name');
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(name)) throw new Error('Service name: start with a lowercase letter and use only lowercase letters, digits, and hyphens (maximum 64 characters). Do not include .service.');
  const description = singleLine(settings.description, 'Description');
  if (description.includes('\\')) throw new Error('Description: use plain text without backslashes.');
  const executable = path(settings.executable, 'Executable');
  if (executable.includes('$')) throw new Error('Executable: dollar signs are not supported in the executable path.');
  const directory = path(settings.directory, 'Working directory');
  const user = account(settings.user, 'User');
  const group = account(settings.group, 'Group', false);
  const envFile = path(settings.envFile, 'Environment file', false);
  if (/[?*\[\]]/.test(envFile)) throw new Error('Environment file: enter a literal filename, not a wildcard expression.');
  const restart = settings.restart;
  if (!['on-failure', 'always', 'no'].includes(restart)) throw new Error('Choose a supported restart policy.');
  const restartSec = seconds(settings.restartSec, 'Restart delay');
  const stopSec = seconds(settings.stopSec, 'Stop timeout');
  const rawArgs = String(settings.args ?? '');
  if (rawArgs.length > 32000) throw new Error('Arguments: maximum 32,000 characters.');
  const args = rawArgs.split(/\r\n|\n|\r/).filter((arg) => arg !== '');
  if (args.length > 100) throw new Error('Arguments: maximum 100 non-empty lines.');
  for (const arg of args) {
    if (/[\x00-\x1f\x7f]/.test(arg)) throw new Error('Arguments: each line must contain one literal argument without control characters.');
    if (arg === ';') throw new Error('Arguments: a standalone semicolon is not supported because systemd uses it as a command separator.');
  }
  const unit = [
    '[Unit]', `Description=${description.replace(/%/g, '%%')}`,
    ...(settings.network ? ['Wants=network-online.target', 'After=network-online.target'] : []),
    '', '[Service]', 'Type=simple', `User=${user}`,
    ...(group ? [`Group=${group}`] : []), `WorkingDirectory=${directory.replace(/%/g, '%%')}`,
    ...(envFile ? [`EnvironmentFile=${settings.envOptional ? '-' : ''}${envFile.replace(/%/g, '%%')}`] : []),
    `ExecStart=${[quote(executable), ...args.map((arg) => quote(arg, true))].join(' ')}`,
    `Restart=${restart}`, ...(restart !== 'no' ? [`RestartSec=${restartSec}s`] : []),
    `TimeoutStopSec=${stopSec}s`, 'StandardOutput=journal', 'StandardError=journal',
    ...(settings.harden ? ['NoNewPrivileges=true', 'PrivateTmp=true'] : []),
    '', '[Install]', 'WantedBy=multi-user.target', '',
  ].join('\n');
  const filename = `${name}.service`;
  const commands = [
    '# Review the unit, create the service account, and deploy the application first.',
    '# Verify checks syntax and local references; it does not prove the app works.',
    `systemd-analyze verify ./${filename}`,
    `sudo install -m 0644 ./${filename} /etc/systemd/system/${filename}`,
    'sudo systemctl daemon-reload',
    '# This next command enables startup at boot AND starts the service now.',
    `sudo systemctl enable --now ${filename}`,
    `systemctl status ${filename} --no-pager`,
    `journalctl -u ${filename} -n 100 --no-pager`,
    '# After deploying a new application version:',
    `sudo systemctl restart ${filename}`,
  ].join('\n');
  return { unit, commands, filename };
}
