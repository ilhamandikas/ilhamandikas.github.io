// A small glossary so the detail panel can explain every flag it finds in a
// command, instead of repeating the same flag text in all 170-odd entries.
export const FLAG_GLOSSARY: Record<string, string> = {
  '-a': 'all: include entries that are normally hidden (all interfaces, all files, all users).',
  '-A': 'all: show all entries, including the ones usually filtered out.',
  '-b': 'batch: run without an interactive screen, suitable for piping.',
  '-c': 'count: print a count instead of the full list.',
  '-C': 'change directory first, or use the given column set, depending on the tool.',
  '-d': 'directory: act on the directory itself, not its contents; or debug/dry-run mode.',
  '-e': 'everything: show every entry, including empty ones; or a regular expression follows.',
  '-f': 'follow: keep the output open and print new lines as they arrive; also "force" or "full".',
  '-F': 'follow: like -f but retries when the file is rotated or replaced.',
  '-g': 'global or group: show global settings, or filter by group.',
  '-h': 'human-readable sizes, or help depending on the tool.',
  '-H': 'hostname/headers: show hostnames, or print HTTP headers.',
  '-i': 'inodes or interfaces: show inode usage, or the given network interface.',
  '-I': 'ignore case, or include a pattern.',
  '-k': 'keep going, or sizes in kilobytes.',
  '-l': 'long format: more columns and detail.',
  '-L': 'follow links, or list the links held open by a process.',
  '-m': 'mount point, or machine-readable output.',
  '-n': 'numeric: do not resolve names; or print a number of lines.',
  '-N': 'do not resolve service names (ss), or no newline.',
  '-o': 'only: show only the interesting lines, or a custom output format.',
  '-p': 'process: show the process using each resource, or the given PID.',
  '-P': 'do not resolve port names, or preserve attributes.',
  '-q': 'quiet: suppress headers and warnings.',
  '-r': 'reverse: show the oldest first, or recursive.',
  '-R': 'recursive, or show the full call tree.',
  '-s': 'summary: one line per group instead of every entry.',
  '-S': 'sort descending, or sizes instead of counts.',
  '-t': 'type: filter by the given type (TCP, file type, unit type).',
  '-T': 'timestamp: print times; also "show all threads".',
  '-u': 'user: filter by user, or show UDP sockets.',
  '-U': 'do not resolve user names.',
  '-v': 'verbose: more detail; in some tools the inverse (invert match).',
  '-V': 'version, or verify.',
  '-w': 'wide output: do not truncate long lines.',
  '-x': 'extended: include extended statistics; also "one filesystem".',
  '-z': 'display zeros and skipped samples, or gzip.',
  '--all': 'include every entry, not just the active or interesting ones.',
  '--no-pager': 'print straight to standard output instead of opening a pager.',
  '--since': 'only include entries newer than the given time or relative expression.',
  '--until': 'only include entries older than the given time.',
  '--tail': 'start with the last N lines.',
  '--follow': 'keep printing new output as it appears.',
  '--type': 'restrict to the given object type.',
  '--state': 'restrict to the given state.',
  '--max-depth': 'do not descend more than N directory levels.',
  '--exclude-dir': 'skip the given directory names.',
  '--sort': 'order the output by the given key.',
  '--no-stream': 'take a single sample and exit instead of streaming.',
  '--prune': 'remove stale remote-tracking references.',
};

/** Extract the flags from a command so the UI can explain each one. */
export function flagsIn(command: string): string[] {
  const tokens = command.split(/\s+/);
  const seen = new Set<string>();
  const flags: string[] = [];
  for (const token of tokens) {
    // Long flags first (--foo), then a cluster of short flags (-tulpn).
    if (/^--[a-z][a-z-]*$/i.test(token)) {
      const key = token.split('=')[0];
      if (!seen.has(key)) {
        seen.add(key);
        flags.push(key);
      }
      continue;
    }
    if (/^-[A-Za-z]{1,6}$/.test(token)) {
      for (const letter of token.slice(1)) {
        const key = `-${letter}`;
        if (!seen.has(key)) {
          seen.add(key);
          flags.push(key);
        }
      }
    }
  }
  return flags;
}
