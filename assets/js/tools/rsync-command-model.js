import { line, lines, integer, explicitPath } from './file-command-inputs.js';

const normalized = (path) => (path.startsWith('/') ? '/' : './') + path.split('/').filter((part) => part && part !== '.').join('/');
const directoryPath = (path) => path.replace(/\/+$/, '') + '/';
export function buildRsync(settings) {
  const mode = settings.mode;
  if (!['local', 'upload', 'download'].includes(mode)) throw new Error('Choose local copy, SSH upload, or SSH download.');
  const source = explicitPath(settings.source, 'Source directory');
  const destination = explicitPath(settings.destination, 'Destination directory');
  if (normalized(source) === '/') throw new Error('Source directory: choose a specific directory, not the filesystem root.');
  if (mode === 'local' && normalized(source) === normalized(destination)) throw new Error('Source and destination must be different directories. Symlink aliases cannot be checked here.');
  if (settings.delete && ['/', './'].includes(normalized(destination))) throw new Error('Deletion is not generated for / or the current directory. Choose a specific destination directory.');
  const needsDeleteConfirmation = !!(settings.delete && !settings.dryRun && !settings.ackDelete);
  if (!settings.contents && normalized(source) === './') throw new Error('Source directory: use copy contents for ./, or choose a named directory.');
  let from = settings.contents ? directoryPath(normalized(source)) : normalized(source);
  let to = directoryPath(normalized(destination));
  const argv = ['--archive', '--itemize-changes', '--human-readable'];
  const explanations = ['--archive recursively copies directories and preserves symlinks, permissions, times, owners, groups, and device/special files where permitted. It does not imply ACL, xattr, or hard-link preservation.', '--itemize-changes describes changes. --human-readable makes size output easier to scan.', 'The destination always ends with / so it is treated as a directory, not a file-renaming target.'];
  const warnings = ['This tool checks text, not the filesystem. It cannot detect symlink aliases, overlapping trees, missing mounts, permissions, or an incorrect destination.'];
  explanations.push(settings.contents ? 'Source ends with /: copy the contents of the source directory into the destination.' : 'Source has no trailing /: copy the named source directory under the destination.');
  if (mode !== 'local') {
    const host = line(settings.host, 'SSH host');
    if (host.length > 253 || !host.split('.').every((part) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(part))) throw new Error('SSH host: use a hostname or IPv4 address without a scheme, port, or IPv6 notation.');
    const user = line(settings.user, 'SSH user', false);
    if (user && !/^[a-z_][a-z0-9_-]{0,63}$/i.test(user)) throw new Error('SSH user: use letters, digits, underscores, or hyphens, beginning with a letter or underscore.');
    const port = integer(settings.port, 'SSH port', 1, 65535);
    const identity = line(settings.identity, 'SSH identity path', false);
    if (identity && (!/^(?:\/|\.\/)[A-Za-z0-9_./-]+$/.test(identity) || identity.split('/').includes('..'))) throw new Error('SSH identity path: use an absolute or ./ path containing only letters, digits, underscores, hyphens, dots, and slashes.');
    const remote = `${user ? `${user}@` : ''}${host}:`;
    if (mode === 'upload') {
      if (!to.startsWith('/')) throw new Error('Remote destination: use an absolute path beginning with /.');
      to = remote + to;
    } else {
      if (!from.startsWith('/')) throw new Error('Remote source: use an absolute path beginning with /.');
      from = remote + from;
    }
    argv.push('-s', '--rsh', `ssh -p ${port}${identity ? ` -i ${identity}` : ''}`);
    explanations.push('-s sends path arguments through the rsync protocol instead of letting the remote shell reinterpret them. Requires rsync 3.0+ on both sides. SSH identity is a local key-file path, not private-key contents.');
    if (user === 'root') warnings.push('The remote account is root. Review whether an unprivileged account would be sufficient.');
  }
  if (settings.compress) { argv.push('--compress'); explanations.push('--compress compresses transferred data; it can cost CPU without helping already-compressed files.'); }
  if (settings.checksum) { argv.push('--checksum'); warnings.push('--checksum reads file contents to decide which files need transfer instead of relying on size and modification time; this can be expensive.'); }
  if (settings.delete) {
    argv.push('--delete');
    warnings.push('--delete removes destination-only entries in synchronized directories. Excluded entries are normally protected; --delete-excluded is not generated. Verify source, destination, and missing mounts before running.');
  }
  const bandwidth = line(settings.bandwidth, 'Bandwidth limit', false);
  if (bandwidth) argv.push(`--bwlimit=${integer(bandwidth, 'Bandwidth limit (KiB/s)', 1, 1000000000)}`);
  for (const pattern of lines(settings.excludes, 'Exclude patterns')) argv.push('--exclude', pattern);
  explanations.push('Exclude patterns are rsync filter patterns, not regex. Literal paths cannot contain wildcard characters in this builder.');
  const previewArgv = [...argv, '--dry-run', '--', from, to];
  if (settings.dryRun) argv.push('--dry-run');
  else warnings.push('Dry-run is OFF: this command can write files and overwrite changed destination files, even without --delete.');
  argv.push('--', from, to);
  return { argv: needsDeleteConfirmation ? null : argv, previewArgv, explanations, warnings, needsDeleteConfirmation };
}
