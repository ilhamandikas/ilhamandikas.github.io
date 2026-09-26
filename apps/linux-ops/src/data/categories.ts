import type { Category } from '../types';

// The sidebar order. Categories are deliberately ordered by how often they come
// up during an incident: ports first, deep discovery last.
export const CATEGORIES: Category[] = [
  { slug: 'ports', name: 'Port & Process', blurb: 'Find out what is listening, and which process owns it.' },
  { slug: 'nginx', name: 'Nginx', blurb: 'Config checks, logs and the classic 502/503 hunt.' },
  { slug: 'disk', name: 'Disk & Filesystem', blurb: 'Full disks, inodes, mounts and deleted-but-open files.' },
  { slug: 'ram', name: 'RAM & Swap', blurb: 'Memory pressure, swap use and the OOM killer.' },
  { slug: 'cpu', name: 'CPU & Load', blurb: 'Load average, run queues, per-core and per-thread views.' },
  { slug: 'io', name: 'Disk I/O', blurb: 'Latency, saturation and the processes doing the writing.' },
  { slug: 'docker', name: 'Docker', blurb: 'Containers, logs, stats and disk usage.' },
  { slug: 'git', name: 'Git', blurb: 'Inspect state, history and recover from mistakes.' },
  { slug: 'postgres', name: 'PostgreSQL', blurb: 'Connections, locks, replication and table size.' },
  { slug: 'mysql', name: 'MySQL', blurb: 'Process list, InnoDB status, replication and locks.' },
  { slug: 'systemd', name: 'Systemd', blurb: 'Units, journal logs and service control.' },
  { slug: 'network', name: 'Networking', blurb: 'Interfaces, routes, reachability and packet capture.' },
  { slug: 'dns', name: 'DNS', blurb: 'Lookups, records, traces and the resolver.' },
  { slug: 'search', name: 'File Search', blurb: 'Find files by name, age, size or content.' },
  { slug: 'permissions', name: 'Permission', blurb: 'Modes, ownership, ACLs and who can do what.' },
  { slug: 'logs', name: 'Logs', blurb: 'Read, follow and summarise logs without drowning in them.' },
  { slug: 'advanced', name: 'Advanced & Discover', blurb: 'The lesser-known tools worth knowing.' },
];

export const DISCOVER_TAG = 'discover';

export const RISK_LABEL: Record<string, string> = {
  safe: 'Read-only',
  change: 'Changes state',
  dangerous: 'Destructive',
};
