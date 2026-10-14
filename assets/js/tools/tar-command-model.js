import { line, lines, integer, explicitPath } from './file-command-inputs.js';

const compressors = { none: null, gzip: '--gzip', bzip2: '--bzip2', xz: '--xz', zstd: '--zstd' };
export function buildTar(settings) {
  const mode = settings.mode;
  if (!['create', 'list', 'extract'].includes(mode)) throw new Error('Choose create, list, or extract.');
  const archive = line(settings.archive, 'Archive filename');
  if (archive === '-' || archive.startsWith('~')) throw new Error('Archive filename: use a file path, not - or a tilde path.');
  const argv = [`--${mode}`, '--force-local', '--file', archive];
  const explanations = ['--force-local treats a colon in the archive filename as local text, not a remote archive.', '--file selects the archive. A relative archive path is relative to your terminal directory, not --directory.'];
  const warnings = [];
  let members = [];
  if (settings.verbose) { argv.push('--verbose'); explanations.push('--verbose lists filenames while tar works.'); }
  if (mode === 'create') {
    if (!Object.hasOwn(compressors, settings.compression)) throw new Error('Choose a supported compression method.');
    const compressor = compressors[settings.compression];
    if (compressor) argv.push(compressor);
    const directory = explicitPath(settings.directory, 'Source base directory');
    argv.push('--directory', directory);
    members = lines(settings.members, 'Source paths');
    if (!members.length) throw new Error('Source paths: enter at least one relative path, or . for the whole base directory.');
    for (const member of members) {
      if (member.startsWith('/') || member.split('/').includes('..')) throw new Error('Source paths: use paths relative to the base directory, without .. segments.');
    }
    for (const pattern of lines(settings.excludes, 'Exclude patterns')) argv.push('--exclude', pattern);
    explanations.push('--directory changes the base for the relative source paths. Excludes use GNU tar patterns, not regex.');
    warnings.push('Creating an archive can overwrite an existing archive file. Keep the archive outside the source tree; this is not a dry-run command.');
    if (compressor) explanations.push(`${compressor} requires the corresponding compression program on the machine running tar.`);
  } else {
    explanations.push('GNU tar detects compression when reading an archive file; the create-mode compression setting is not used.');
    if (mode === 'extract') {
      const directory = explicitPath(settings.directory, 'Extraction directory');
      const strip = integer(settings.strip, 'Strip components', 0, 99);
      argv.push('--directory', directory, '--no-same-owner', '--no-same-permissions');
      if (settings.keepOld) argv.push('--keep-old-files');
      if (strip) argv.push(`--strip-components=${strip}`);
      explanations.push('--no-same-owner avoids restoring archive ownership. --no-same-permissions applies the normal umask rather than requesting exact archived permissions.');
      if (settings.keepOld) explanations.push('--keep-old-files refuses to replace existing files and reports conflicts as errors.');
      else warnings.push('Existing files may be overwritten during extraction. Inspect the archive and destination first.');
      if (strip) warnings.push(`Removing ${strip} leading path component(s) changes output paths; entries with too few components are skipped. Listing shows the original archive paths.`);
      warnings.push('Extract into an existing empty directory, without root privileges. These options do not make an untrusted archive safe.');
    }
  }
  if (members.length) argv.push('--', ...members);
  const previewArgv = mode === 'extract' ? ['--list', '--verbose', '--force-local', '--file', archive] : null;
  return { argv, previewArgv, explanations, warnings };
}
