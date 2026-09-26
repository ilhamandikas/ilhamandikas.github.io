import { useMemo, useState } from 'react';
import type { Severity } from '../lib/analyzer';
import { analyzeOutput } from '../lib/analyzer';
import { detectSensitive } from '../lib/sensitive';
import { COMMAND_BY_ID } from '../data/commands';
import { CopyButton } from './CopyButton';

interface Props {
  notify: (message: string) => void;
  onSelect: (id: string) => void;
}

const SEVERITY_STYLES: Record<Severity, string> = {
  info: 'border-edge2 text-muted',
  warn: 'border-change/40 text-change',
  crit: 'border-danger/50 text-danger',
};

const SAMPLES: { label: string; text: string }[] = [
  {
    label: 'df -h',
    text: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        98G   93G     0 100% /\ntmpfs           1.6G     0  1.6G   0% /run',
  },
  {
    label: 'free -h',
    text: '               total        used        free      shared  buff/cache   available\nMem:            15Gi       3.2Gi       1.1Gi       200Mi        11Gi        12Gi\nSwap:          2.0Gi       1.4Gi       0.6Gi',
  },
  {
    label: 'nginx -t',
    text: 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful',
  },
  {
    label: 'systemctl status',
    text: '● nginx.service - A high performance web server\n     Active: failed (Result: exit-code) since Fri 2026-09-25 09:00:00 UTC\n    Process: 1234 ExecStart=/usr/sbin/nginx (code=exited, status=1/FAILURE)\n   restart counter is at 5',
  },
];

// The paste analyzer. It never sends the text anywhere: the findings are built
// from local regexes in lib/analyzer.ts.
export function Analyzer({ notify, onSelect }: Props) {
  const [text, setText] = useState('');
  const analysis = useMemo(() => (text.trim() ? analyzeOutput(text) : null), [text]);
  const sensitive = useMemo(() => detectSensitive(text), [text]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="card flex flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-fg">Paste command output</h2>
          <CopyButton text={text} notify={notify} label="Copy" className="btn" />
        </div>
        <textarea
          className="input min-h-[320px] flex-1 resize-y font-mono text-xs"
          placeholder={'Paste the output of ss, df, free, ps, docker ps, nginx -t, systemctl status, lsblk, pvs/lvs, git status, a replication query or a process list.'}
          value={text}
          spellCheck={false}
          onChange={(event) => setText(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Try a sample:</span>
          {SAMPLES.map((sample) => (
            <button key={sample.label} type="button" className="btn" onClick={() => setText(sample.text)}>
              {sample.label}
            </button>
          ))}
          {text && (
            <button type="button" className="btn" onClick={() => setText('')}>
              Clear
            </button>
          )}
        </div>
        {sensitive.length > 0 && (
          <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
            This output looks like it contains a secret ({sensitive.join(', ')}). It stays in your browser, but be careful
            before sharing a screenshot.
          </p>
        )}
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold text-fg">What this output means</h2>
        {!analysis ? (
          <p className="mt-2 text-sm text-muted">
            Paste output on the left. The analyzer recognises the common tools and explains what it sees, with the next
            commands to run.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex items-center gap-2">
              <span className="chip">{analysis.label}</span>
              <span className="text-xs text-muted">{analysis.summary}</span>
            </div>
            <ul className="space-y-2">
              {analysis.findings.map((finding) => (
                <li key={finding.title} className={`rounded-lg border bg-base p-3 ${SEVERITY_STYLES[finding.severity]}`}>
                  <p className="text-sm font-medium">{finding.title}</p>
                  <p className="mt-1 text-xs text-muted">{finding.detail}</p>
                </li>
              ))}
            </ul>
            {analysis.next.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Next commands</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.next
                    .map((id) => COMMAND_BY_ID.get(id))
                    .filter((item) => item !== undefined)
                    .map((item) => (
                      <button key={item.id} type="button" className="btn" onClick={() => onSelect(item.id)}>
                        {item.title}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
