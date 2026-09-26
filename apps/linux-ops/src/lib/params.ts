// Dynamic parameters: any `{name}` in a command becomes an input. A small
// label map keeps the inputs friendly without repeating metadata per command.
export interface ParamSpec {
  name: string;
  label: string;
  placeholder: string;
}

const LABELS: Record<string, { label: string; placeholder: string }> = {
  port: { label: 'Port', placeholder: '8080' },
  pid: { label: 'PID', placeholder: '1234' },
  ip: { label: 'IP address', placeholder: '10.0.0.5' },
  host: { label: 'Host', placeholder: 'example.com' },
  path: { label: 'Path', placeholder: '/var/www' },
  pattern: { label: 'Pattern', placeholder: 'error' },
  file: { label: 'File', placeholder: '/var/log/app.log' },
  container: { label: 'Container', placeholder: 'api' },
  service: { label: 'Service', placeholder: 'nginx' },
  user: { label: 'User', placeholder: 'deploy' },
  group: { label: 'Group', placeholder: 'www-data' },
  device: { label: 'Device', placeholder: 'sda' },
  db: { label: 'Database', placeholder: 'appdb' },
  table: { label: 'Table', placeholder: 'orders' },
  column: { label: 'Column', placeholder: 'created_at' },
  mode: { label: 'Mode', placeholder: '644' },
  inode: { label: 'Inode', placeholder: '123456' },
  bond: { label: 'Bond interface', placeholder: 'bond0' },
};

/** The parameter names used by a command, in first-seen order. */
export function paramsIn(command: string): ParamSpec[] {
  const names: string[] = [];
  const re = /\{([a-z][a-z0-9_]*)\}/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(command)) !== null) {
    const name = match[1].toLowerCase();
    if (!names.includes(name)) names.push(name);
  }
  return names.map((name) => ({
    name,
    label: LABELS[name]?.label ?? name.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()),
    placeholder: LABELS[name]?.placeholder ?? '',
  }));
}

/** Replace `{name}` with the value the user typed, leaving unknown ones intact. */
export function fillCommand(command: string, values: Record<string, string>): string {
  return command.replace(/\{([a-z][a-z0-9_]*)\}/gi, (whole, name: string) => {
    const value = values[name.toLowerCase()];
    return value && value.trim() ? value : whole;
  });
}
