// Paste-output analyzer. It recognises the common diagnostic outputs and turns
// them into findings plus a short list of next commands. Everything is regex
// and arithmetic: there is no model and no network call.

export type Severity = 'info' | 'warn' | 'crit';

export interface Finding {
  severity: Severity;
  title: string;
  detail: string;
}

export interface Analysis {
  kind: string;
  label: string;
  summary: string;
  findings: Finding[];
  next: string[];
}

const SIZE_UNITS: Record<string, number> = {
  B: 1,
  K: 1024,
  M: 1024 ** 2,
  G: 1024 ** 3,
  T: 1024 ** 4,
  P: 1024 ** 5,
};

/** Parse "12Gi", "9.8G", "1024" into bytes. Returns NaN when unparseable. */
function parseSize(input: string): number {
  const match = input.match(/^([\d.]+)\s*([BKMGT P]?)i?B?$/i);
  if (!match) return Number.NaN;
  const value = Number.parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  return value * (SIZE_UNITS[unit] ?? 1);
}

function human(bytes: number): string {
  if (!Number.isFinite(bytes)) return 'unknown';
  const units = ['B', 'K', 'M', 'G', 'T', 'P'];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)}${units[index]}`;
}

function detect(text: string): string {
  if (/^Filesystem\s+Size\s+Used\s+Avail/m.test(text) || /\bUse%/.test(text)) return 'df';
  if (/^\s*Mem:\s+/m.test(text) && /Swap:/i.test(text)) return 'free';
  if (/Netid\s+State|^tcp\s+LISTEN|^udp\s+UNCONN/m.test(text) || /\bLISTEN\b/.test(text)) return 'ss';
  if (/^CONTAINER ID\s+IMAGE/m.test(text)) return 'docker-ps';
  if (/syntax is ok|test is successful/i.test(text)) return 'nginx-test';
  if (/Active:\s+(active|failed|inactive|activating|deactivating)/.test(text)) return 'systemctl';
  if (/^\s*NAME\s+MAJ:MIN/m.test(text)) return 'lsblk';
  if (/On branch |Changes not staged|nothing to commit|Changes to be committed/i.test(text)) return 'git-status';
  if (/client_addr|replay_lsn|sent_lsn/i.test(text)) return 'pg-replication';
  if (/^\s*Id\s+User\s+Host\s+db\s+Command/m.test(text) || /Command:\s+Query/i.test(text)) return 'mysql-processlist';
  if (/^\s*PV\s+VG\s+Fmt/m.test(text)) return 'pvs';
  if (/^\s*USER\s+PID\s+%CPU\s+%MEM/m.test(text)) return 'ps';
  if (/load average:/i.test(text)) return 'top';
  return 'generic';
}

function analyzeDf(text: string): Analysis {
  const findings: Finding[] = [];
  const re = /^(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\d+)%\s+(\S+)/gm;
  let match: RegExpExecArray | null;
  let full = 0;
  while ((match = re.exec(text)) !== null) {
    const [, filesystem, , used, , percent, mount] = match;
    const value = Number(percent);
    if (value >= 100) {
      full += 1;
      findings.push({
        severity: 'crit',
        title: `${mount} is completely full`,
        detail: `${filesystem} is at ${value}% (${used} used). Nothing can be written until space is freed.`,
      });
    } else if (value >= 90) {
      findings.push({
        severity: 'warn',
        title: `${mount} is nearly full`,
        detail: `${filesystem} is at ${value}% (${used} used). Plan a cleanup before it reaches 100%.`,
      });
    }
  }
  if (!findings.length) {
    findings.push({ severity: 'info', title: 'No filesystem is over 90%', detail: 'Every filesystem in the output has headroom.' });
  }
  return {
    kind: 'df',
    label: 'Filesystem usage (df)',
    summary: `${full} filesystem${full === 1 ? '' : 's'} at 100%.`,
    findings,
    next: ['disk-du', 'disk-deleted-open', 'disk-df-inodes'],
  };
}

function analyzeFree(text: string): Analysis {
  const findings: Finding[] = [];
  const mem = text.match(/^Mem:\s+(.+)$/m);
  const swap = text.match(/^Swap:\s+(.+)$/m);
  if (mem) {
    const cols = mem[1].trim().split(/\s+/);
    const total = cols[0];
    const used = cols[1];
    const available = cols[6] ?? cols[3];
    const totalBytes = parseSize(total);
    const availableBytes = parseSize(available);
    if (Number.isFinite(totalBytes) && Number.isFinite(availableBytes)) {
      const usedPercent = Math.round(((totalBytes - availableBytes) / totalBytes) * 100);
      findings.push({
        severity: usedPercent >= 95 ? 'crit' : usedPercent >= 85 ? 'warn' : 'info',
        title: `Memory is ${usedPercent}% committed`,
        detail: `${used} used of ${total}, with ${available} available. Linux counts cache as available, so judge pressure by this number, not by free.`,
      });
    }
  }
  if (swap) {
    const cols = swap[1].trim().split(/\s+/);
    const totalBytes = parseSize(cols[0]);
    const usedBytes = parseSize(cols[1]);
    if (Number.isFinite(totalBytes) && totalBytes > 0 && Number.isFinite(usedBytes)) {
      const percent = Math.round((usedBytes / totalBytes) * 100);
      if (percent > 20) {
        findings.push({
          severity: 'warn',
          title: `Swap is ${percent}% used`,
          detail: 'Heavy swap use means the working set no longer fits in RAM, and every access becomes slower.',
        });
      } else {
        findings.push({ severity: 'info', title: `Swap is ${percent}% used`, detail: 'Swap use is low, so memory pressure is not the problem here.' });
      }
    } else if (totalBytes === 0) {
      findings.push({ severity: 'warn', title: 'No swap is configured', detail: 'Without swap, memory pressure turns directly into OOM kills.' });
    }
  }
  return { kind: 'free', label: 'Memory (free)', summary: 'Memory and swap pressure.', findings, next: ['ram-top', 'ram-oom', 'ram-vmstat'] };
}

function analyzeSs(text: string): Analysis {
  const findings: Finding[] = [];
  const lines = text.split('\n').filter((line) => /\b(LISTEN|UNCONN)\b/.test(line));
  const exposed: string[] = [];
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    // ss -tulpn: Netid State Recv-Q Send-Q Local:Port Peer:Port Process
    const local = cols[4] ?? '';
    const address = local.split(':').slice(0, -1).join(':');
    if ((address === '0.0.0.0' || address === '::' || address === '*') && !exposed.includes(local)) exposed.push(local);
  }
  findings.push({ severity: 'info', title: `${lines.length} listening socket${lines.length === 1 ? '' : 's'}`, detail: 'Every bound port is listed below in the raw output.' });
  if (exposed.length) {
    findings.push({
      severity: 'warn',
      title: `${exposed.length} service${exposed.length === 1 ? '' : 's'} listen on every interface`,
      detail: `${exposed.slice(0, 6).join(', ')} are bound to a wildcard address, so they are reachable from outside unless a firewall blocks them.`,
    });
  }
  return { kind: 'ss', label: 'Listening sockets (ss)', summary: `${lines.length} listeners found.`, findings, next: ['net-firewall', 'ports-who-owns'] };
}

function analyzeDockerPs(text: string): Analysis {
  const findings: Finding[] = [];
  const lines = text.split('\n').slice(1).filter((line) => line.trim());
  const restarting = lines.filter((line) => /Restarting|unhealthy/i.test(line));
  const exited = lines.filter((line) => /Exited|Dead/i.test(line));
  findings.push({ severity: 'info', title: `${lines.length} container${lines.length === 1 ? '' : 's'} listed`, detail: 'The status column tells you whether each one is healthy.' });
  if (restarting.length) {
    findings.push({
      severity: 'crit',
      title: `${restarting.length} container${restarting.length === 1 ? '' : 's'} restarting or unhealthy`,
      detail: 'A restart loop usually means the entrypoint fails on start. Read the logs and inspect the exit code.',
    });
  }
  if (exited.length) {
    findings.push({ severity: 'warn', title: `${exited.length} container${exited.length === 1 ? '' : 's'} not running`, detail: 'Exited containers keep their exit code; inspect it before restarting.' });
  }
  return { kind: 'docker-ps', label: 'Containers (docker ps)', summary: `${lines.length} containers.`, findings, next: ['docker-logs', 'docker-inspect'] };
}

function analyzeNginxTest(text: string): Analysis {
  const ok = /syntax is ok|test is successful/i.test(text);
  const findings: Finding[] = ok
    ? [{ severity: 'info', title: 'Configuration is valid', detail: 'nginx parsed the whole config without errors, so a reload is safe.' }]
    : [
        {
          severity: 'crit',
          title: 'Configuration has an error',
          detail: 'nginx rejected the config. The file and line are in the raw output; fix that before reloading.',
        },
      ];
  return { kind: 'nginx-test', label: 'nginx -t', summary: ok ? 'Config is valid.' : 'Config is broken.', findings, next: ok ? ['nginx-reload'] : ['nginx-config-dump', 'nginx-error-log'] };
}

function analyzeSystemctl(text: string): Analysis {
  const findings: Finding[] = [];
  const active = text.match(/Active:\s+([a-z]+)\s+\(([^)]+)\)/i);
  if (active && /failed/i.test(active[1])) {
    findings.push({ severity: 'crit', title: 'The unit has failed', detail: `systemd reports: ${active[0]}. The journal holds the reason.` });
  } else if (active && /active/i.test(active[1])) {
    findings.push({ severity: 'info', title: 'The unit is running', detail: active[0] });
  } else if (active) {
    findings.push({ severity: 'warn', title: `The unit is ${active[1]}`, detail: active[0] });
  }
  const restarts = text.match(/restart counter is at (\d+)/i);
  if (restarts && Number(restarts[1]) > 2) {
    findings.push({ severity: 'warn', title: `Restarted ${restarts[1]} times`, detail: 'systemd is restarting the unit repeatedly, which means it keeps crashing.' });
  }
  return { kind: 'systemctl', label: 'systemctl status', summary: 'Unit state and recent log.', findings, next: ['sd-logs', 'sd-failed'] };
}

function analyzeGitStatus(text: string): Analysis {
  const findings: Finding[] = [];
  const branch = text.match(/On branch (\S+)/);
  if (branch) findings.push({ severity: 'info', title: `On branch ${branch[1]}`, detail: 'The current branch and its tracking state are in the raw output.' });
  const ahead = text.match(/Your branch is ahead of '([^']+)' by (\d+)/);
  if (ahead) findings.push({ severity: 'warn', title: `${ahead[2]} commit(s) not pushed`, detail: `Local commits are ahead of ${ahead[1]}.` });
  const behind = text.match(/Your branch is behind '([^']+)' by (\d+)/);
  if (behind) findings.push({ severity: 'warn', title: `${behind[2]} commit(s) behind`, detail: `The remote ${behind[1]} has commits you do not have locally.` });
  if (/Changes not staged|Changes to be committed|Untracked files/.test(text)) {
    findings.push({ severity: 'info', title: 'There are uncommitted changes', detail: 'Review them before switching branches or pulling.' });
  }
  return { kind: 'git-status', label: 'git status', summary: 'Working tree state.', findings, next: ['git-diff', 'git-branch'] };
}

function analyzePgReplication(text: string): Analysis {
  const findings: Finding[] = [];
  const lines = text.split('\n').filter((line) => line.trim() && !/^[-\s|]+$/.test(line));
  findings.push({ severity: 'info', title: `${Math.max(lines.length - 1, 0)} replica row(s)`, detail: 'Each row is one connected standby.' });
  if (/streaming/i.test(text)) findings.push({ severity: 'info', title: 'At least one replica is streaming', detail: 'state=streaming means the standby is keeping up with the primary.' });
  if (!text.trim() || /^\(0 rows\)/m.test(text)) findings.push({ severity: 'warn', title: 'No replicas connected', detail: 'The primary has no standby attached, so a failover would lose data.' });
  const lag = text.match(/(\d{4,})\s*$/m);
  if (lag && Number(lag[1]) > 100 * 1024 * 1024) {
    findings.push({ severity: 'warn', title: `Replication lag is ${human(Number(lag[1]))}`, detail: 'The standby is far behind; check network and disk on the replica.' });
  }
  return { kind: 'pg-replication', label: 'PostgreSQL replication', summary: 'Replica state and lag.', findings, next: ['pg-activity', 'net-ss'] };
}

function analyzeMysqlProcesslist(text: string): Analysis {
  const findings: Finding[] = [];
  const lines = text.split('\n').filter((line) => /^\s*\d+\s/.test(line));
  const long = lines.filter((line) => {
    const time = Number(line.trim().split(/\s+/)[5]);
    return Number.isFinite(time) && time > 60 && !/Sleep/i.test(line);
  });
  findings.push({ severity: 'info', title: `${lines.length} connection(s)`, detail: 'Each row is a client connection and its current command.' });
  if (long.length) {
    findings.push({ severity: 'warn', title: `${long.length} query(ies) running over a minute`, detail: 'Long-running queries hold locks and memory. Inspect the full query text and the plan.' });
  }
  return { kind: 'mysql-processlist', label: 'MySQL process list', summary: `${lines.length} connections.`, findings, next: ['my-innodb-status', 'my-kill'] };
}

function analyzePs(text: string): Analysis {
  const findings: Finding[] = [];
  const rows = text.split('\n').slice(1).filter((line) => line.trim());
  let topCpu: { cmd: string; cpu: number } | null = null;
  let topMem: { cmd: string; mem: number } | null = null;
  for (const row of rows) {
    const cols = row.trim().split(/\s+/);
    const cpu = Number.parseFloat(cols[2]);
    const mem = Number.parseFloat(cols[3]);
    const cmd = cols.slice(10).join(' ') || cols[cols.length - 1];
    if (Number.isFinite(cpu) && (!topCpu || cpu > topCpu.cpu)) topCpu = { cmd, cpu };
    if (Number.isFinite(mem) && (!topMem || mem > topMem.mem)) topMem = { cmd, mem };
  }
  if (topCpu) findings.push({ severity: topCpu.cpu > 80 ? 'warn' : 'info', title: `Top CPU: ${topCpu.cmd}`, detail: `${topCpu.cpu}% of one core.` });
  if (topMem) findings.push({ severity: topMem.mem > 50 ? 'warn' : 'info', title: `Top memory: ${topMem.cmd}`, detail: `${topMem.mem}% of RAM.` });
  return { kind: 'ps', label: 'Process list (ps/top)', summary: `${rows.length} processes.`, findings, next: ['adv-proc-cmdline', 'cpu-top'] };
}

function analyzeLsblk(text: string): Analysis {
  const findings: Finding[] = [];
  const rows = text.split('\n').slice(1).filter((line) => line.trim());
  const unmounted = rows.filter((line) => /(disk|part|lvm)\s*$/.test(line) && !/\//.test(line));
  findings.push({ severity: 'info', title: `${rows.length} block device row(s)`, detail: 'The tree shows disks, partitions and their mount points.' });
  if (unmounted.length) {
    findings.push({ severity: 'info', title: `${unmounted.length} device(s) without a filesystem or mount`, detail: 'A partition with no FSTYPE is unformatted, and one with no MOUNTPOINT is not mounted.' });
  }
  return { kind: 'lsblk', label: 'Block devices (lsblk)', summary: `${rows.length} rows.`, findings, next: ['disk-mount', 'disk-df'] };
}

function analyzePvs(text: string): Analysis {
  const findings: Finding[] = [];
  const rows = text.split('\n').slice(1).filter((line) => line.trim());
  findings.push({ severity: 'info', title: `${rows.length} physical volume(s)`, detail: 'PVs are the disks that back LVM volume groups.' });
  return { kind: 'pvs', label: 'LVM (pvs/lvs)', summary: `${rows.length} volumes.`, findings, next: ['disk-lsblk', 'disk-df'] };
}

function analyzeGeneric(text: string): Analysis {
  const findings: Finding[] = [];
  const lower = text.toLowerCase();
  const checks: { re: RegExp; severity: Severity; title: string; detail: string }[] = [
    { re: /out of memory|oom-kill/i, severity: 'crit', title: 'OOM killer mentioned', detail: 'The kernel killed a process for memory. Check which one and why.' },
    { re: /no space left on device/i, severity: 'crit', title: 'Disk full', detail: 'A write failed because the filesystem is full.' },
    { re: /connection refused/i, severity: 'crit', title: 'Connection refused', detail: 'Nothing is listening on the target port, or a firewall rejected it.' },
    { re: /connection timed out|timed out/i, severity: 'warn', title: 'Timeout', detail: 'The peer did not answer in time. Check latency, firewalls and load.' },
    { re: /permission denied/i, severity: 'warn', title: 'Permission denied', detail: 'The process or user lacks access to the file or socket.' },
    { re: /too many open files/i, severity: 'warn', title: 'File descriptor limit hit', detail: 'A process reached its open-file limit.' },
    { re: /segmentation fault/i, severity: 'crit', title: 'Segmentation fault', detail: 'A process crashed at the memory level; check for a bug or a bad library.' },
    { re: /deadlock/i, severity: 'warn', title: 'Deadlock mentioned', detail: 'Two transactions are waiting on each other; one must be rolled back.' },
  ];
  for (const check of checks) {
    if (check.re.test(lower)) findings.push({ severity: check.severity, title: check.title, detail: check.detail });
  }
  const errorLines = text.split('\n').filter((line) => /\b(error|failed|fatal|critical|panic)\b/i.test(line)).length;
  if (!findings.length) {
    findings.push({ severity: 'info', title: 'No known failure signature', detail: 'The text did not match any built-in pattern. Read it against the command it came from.' });
  }
  if (errorLines) findings.push({ severity: 'info', title: `${errorLines} line(s) mention an error`, detail: 'Filter the output for error, failed or fatal to focus.' });
  return { kind: 'generic', label: 'Unrecognised output', summary: `${text.split('\n').length} lines.`, findings, next: ['logs-grep'] };
}

/** Analyse pasted command output. Never throws; unknown text gets generic advice. */
export function analyzeOutput(raw: string): Analysis {
  const text = raw.replace(/\r\n/g, '\n').trim();
  try {
    switch (detect(text)) {
      case 'df':
        return analyzeDf(text);
      case 'free':
        return analyzeFree(text);
      case 'ss':
        return analyzeSs(text);
      case 'docker-ps':
        return analyzeDockerPs(text);
      case 'nginx-test':
        return analyzeNginxTest(text);
      case 'systemctl':
        return analyzeSystemctl(text);
      case 'lsblk':
        return analyzeLsblk(text);
      case 'git-status':
        return analyzeGitStatus(text);
      case 'pg-replication':
        return analyzePgReplication(text);
      case 'mysql-processlist':
        return analyzeMysqlProcesslist(text);
      case 'ps':
      case 'top':
        return analyzePs(text);
      case 'pvs':
        return analyzePvs(text);
      default:
        return analyzeGeneric(text);
    }
  } catch {
    return analyzeGeneric(text);
  }
}
