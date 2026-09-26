import Fuse from 'fuse.js';
import type { CommandItem } from '../types';
import { COMMANDS, COMMAND_BY_ID } from '../data/commands';

// Natural-language intent matching. Fuse alone is good at typos and partial
// words, but a question like "cek port 8080 dipakai apa" needs an intent layer
// that knows the Indonesian and English phrasings people actually use.
interface Intent {
  match: RegExp;
  ids: string[];
}

const INTENTS: Intent[] = [
  { match: /\b(port|listening|listen|bind|dipakai|kepakai|occupied|socket)\b/i, ids: ['ports-ss-listen', 'ports-who-owns', 'ports-fuser'] },
  { match: /\b(nginx|502|503|504|bad gateway|gateway timeout)\b/i, ids: ['nginx-test', 'nginx-503', 'nginx-error-log', 'nginx-upstream-check'] },
  { match: /\b(disk|storage|penuh|full|space|filesystem|mount|inode)\b/i, ids: ['disk-df', 'disk-du', 'disk-df-inodes', 'disk-deleted-open'] },
  { match: /\b(ram|memory|memori|oom|swap|penuh)\b/i, ids: ['ram-free', 'ram-top', 'ram-oom', 'ram-vmstat'] },
  { match: /\b(cpu|load|beban|throttle|steal|high cpu)\b/i, ids: ['cpu-top', 'cpu-load-check', 'cpu-mpstat', 'cpu-runqueue'] },
  { match: /\b(i\/o|io|latency|await|disk busy|slow disk|saturat)\b/i, ids: ['io-iostat', 'io-iotop', 'io-pidstat'] },
  { match: /\b(docker|container|compose|image|podman)\b/i, ids: ['docker-ps', 'docker-logs', 'docker-inspect', 'docker-stats'] },
  { match: /\b(git|commit|branch|merge|rebase|stash|reset)\b/i, ids: ['git-status', 'git-log', 'git-reflog', 'git-branch'] },
  { match: /\b(postgres|postgresql|pg|psql)\b/i, ids: ['pg-activity', 'pg-blocking', 'pg-replication', 'pg-long-queries'] },
  { match: /\b(mysql|mariadb|innodb)\b/i, ids: ['my-processlist', 'my-innodb-status', 'my-replication'] },
  { match: /\b(systemd|service|unit|systemctl|daemon|gagal start|failed to start)\b/i, ids: ['sd-status', 'sd-failed', 'sd-logs', 'sd-restart'] },
  { match: /\b(network|jaringan|koneksi|connection|ping|unreachable|timeout|packet|tcpdump|latency)\b/i, ids: ['net-ip-addr', 'net-route', 'net-ping', 'net-curl'] },
  { match: /\b(dns|resolve|resolv|nameserver|nslookup|dig|domain)\b/i, ids: ['dns-dig', 'dns-trace', 'dns-resolv', 'dns-reverse'] },
  { match: /\b(find|search|cari|file|locate|grep)\b/i, ids: ['search-find-name', 'search-grep', 'search-find-recent', 'search-rg'] },
  { match: /\b(permission|izin|chmod|chown|akses|access denied|world.writable|setuid|acl)\b/i, ids: ['perm-ls', 'perm-namei', 'perm-getfacl', 'perm-chown'] },
  { match: /\b(log|logs|journal|journalctl|error log|auth)\b/i, ids: ['logs-journal-follow', 'logs-grep', 'logs-journal-errors', 'logs-nginx-5xx'] },
  { match: /\b(tls|ssl|certificate|cert|sertifikat|expired|openssl|https)\b/i, ids: ['adv-openssl-cert', 'net-curl', 'nginx-test'] },
  { match: /\b(strace|syscall|hang|stuck|proc|fd|descriptor|ebpf|perf|profile)\b/i, ids: ['adv-strace', 'adv-proc-fd', 'adv-perf', 'adv-namei'] },
];

const fuse = new Fuse(COMMANDS, {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.2 },
    { name: 'tags', weight: 0.25 },
    { name: 'command', weight: 0.15 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
});

export interface ParsedQuery {
  /** Commands suggested by the intent layer, best first. */
  intentIds: string[];
  /** Values the query already contains, ready to fill into `{placeholders}`. */
  params: Record<string, string>;
  /** Free text to hand to the fuzzy matcher. */
  text: string;
}

/** Pull intent, embedded values (ports, IPs, hostnames) and text out of a query. */
export function parseQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  const params: Record<string, string> = {};

  const port = trimmed.match(/\bport\s+(\d{1,5})\b/i) ?? trimmed.match(/\b(\d{1,5})\b/);
  if (port && Number(port[1]) <= 65535) params.port = port[1];

  const ip = trimmed.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  if (ip) params.ip = ip[0];

  const host = trimmed.match(/\b([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/i);
  if (host && !ip) params.host = host[0];

  const intentIds: string[] = [];
  for (const intent of INTENTS) {
    if (!intent.match.test(trimmed)) continue;
    for (const id of intent.ids) {
      if (COMMAND_BY_ID.has(id) && !intentIds.includes(id)) intentIds.push(id);
    }
  }

  // Drop the intent keywords and embedded values before fuzzy matching so the
  // matcher sees the distinctive words only.
  const text = trimmed
    .replace(/\bport\s+\d{1,5}\b/gi, ' ')
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { intentIds, params, text };
}

/** Rank the catalogue for a query: intent first, then fuzzy matches. */
export function searchCommands(query: string, category?: string): CommandItem[] {
  const pool = category ? COMMANDS.filter((command) => command.category === category) : COMMANDS;
  const trimmed = query.trim();
  if (!trimmed) return pool;

  const { intentIds, text } = parseQuery(trimmed);
  const ranked: CommandItem[] = [];
  const seen = new Set<string>();

  for (const id of intentIds) {
    const command = COMMAND_BY_ID.get(id);
    if (command && pool.includes(command) && !seen.has(id)) {
      seen.add(id);
      ranked.push(command);
    }
  }

  const fuseQuery = text || trimmed;
  for (const result of fuse.search(fuseQuery)) {
    if (seen.has(result.item.id) || !pool.includes(result.item)) continue;
    seen.add(result.item.id);
    ranked.push(result.item);
  }

  return ranked;
}
