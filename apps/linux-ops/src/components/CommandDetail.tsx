import { useEffect, useMemo, useState } from 'react';
import type { CommandItem } from '../types';
import { COMMAND_BY_ID } from '../data/commands';
import { FLAG_GLOSSARY, flagsIn } from '../data/flags';
import { fillCommand, paramsIn } from '../lib/params';
import { detectSensitive } from '../lib/sensitive';
import { RiskBadge } from './RiskBadge';
import { CopyButton } from './CopyButton';

interface Props {
  command: CommandItem;
  /** Values pulled out of the search query, used to prefill the inputs. */
  initialValues?: Record<string, string>;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (id: string) => void;
  notify: (message: string) => void;
}

export function CommandDetail({ command, initialValues = {}, favorite, onToggleFavorite, onSelect, notify }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);

  // Reset the parameter values and the danger gate whenever the command changes.
  useEffect(() => {
    setValues(initialValues);
    setRevealed(false);
  }, [command.id, initialValues]);

  const params = useMemo(() => paramsIn(command.command), [command.command]);
  const filled = fillCommand(command.command, values);
  const flags = useMemo(() => flagsIn(command.command), [command.command]);
  const sensitive = useMemo(() => detectSensitive(filled), [filled]);
  const nextSteps = (command.nextSteps ?? [])
    .map((id) => COMMAND_BY_ID.get(id))
    .filter((item): item is CommandItem => Boolean(item));

  const download = () => {
    const blob = new Blob([filled], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${command.id}.sh`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify('Downloaded command');
  };

  const gated = command.risk === 'dangerous' && !revealed;

  return (
    <div className="lo-card flex h-full flex-col overflow-hidden">
      <div className="border-b border-edge p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-fg">{command.title}</h2>
          <button
            type="button"
            aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`text-xl leading-none ${favorite ? 'text-change' : 'text-muted hover:text-fg'}`}
            onClick={() => onToggleFavorite(command.id)}
          >
            {favorite ? '★' : '☆'}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">{command.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskBadge risk={command.risk} />
          {command.requiresSudo && <span className="lo-chip">needs sudo</span>}
          <span className="lo-chip">{command.category}</span>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {params.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Fill in the values</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {params.map((param) => (
                <label key={param.name} className="block">
                  <span className="mb-1 block text-xs text-muted">{param.label}</span>
                  <input
                    className="lo-input"
                    value={values[param.name] ?? ''}
                    placeholder={param.placeholder}
                    onChange={(event) => setValues((current) => ({ ...current, [param.name]: event.target.value }))}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Command</h3>
          {gated ? (
            <div className="rounded-lg border border-danger/40 bg-danger/10 p-4">
              <p className="text-sm text-danger">
                This command is destructive and can cause data loss. It is never suggested by default — read it carefully
                before revealing it.
              </p>
              <button type="button" className="lo-btn mt-3 border-danger/50 text-danger" onClick={() => setRevealed(true)}>
                I understand, show the command
              </button>
            </div>
          ) : (
            <>
              <pre className="overflow-x-auto rounded-lg border border-edge bg-panel px-3 py-2 font-mono text-sm text-accent">
                {filled}
              </pre>
              <div className="mt-2 flex flex-wrap gap-2">
                <CopyButton text={filled} notify={notify} label="Copy command" className="lo-btn lo-btn-primary" />
                <button type="button" className="lo-btn" onClick={download}>
                  Download .sh
                </button>
              </div>
            </>
          )}
        </div>

        {sensitive.length > 0 && (
          <div className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
            <strong>Possible secret detected:</strong> {sensitive.join(', ')}. Do not paste this into a shared chat or
            ticket, and do not put it in the URL.
          </div>
        )}

        {command.explanation && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">What it does</h3>
            <p className="text-sm text-fg/90">{command.explanation}</p>
          </div>
        )}

        {flags.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Flags</h3>
            <ul className="space-y-1.5">
              {flags.map((flag) => (
                <li key={flag} className="flex gap-3 text-sm">
                  <code className="shrink-0 font-mono text-accent">{flag}</code>
                  <span className="text-muted">{FLAG_GLOSSARY[flag] ?? 'Not in the glossary — check the man page.'}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {command.alternatives && command.alternatives.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Alternatives</h3>
            <ul className="space-y-2">
              {command.alternatives.map((alternative) => (
                <li key={alternative} className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-panel px-3 py-2">
                  <code className="overflow-x-auto font-mono text-xs text-fg/90">{alternative}</code>
                  <CopyButton text={alternative} notify={notify} label="Copy" className="lo-btn shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextSteps.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Next troubleshooting steps</h3>
            <div className="flex flex-wrap gap-2">
              {nextSteps.map((step) => (
                <button key={step.id} type="button" className="lo-btn" onClick={() => onSelect(step.id)}>
                  {step.title}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted">
          Everything runs in your browser. Nothing is uploaded, and the URL never contains your command output.
        </p>
      </div>
    </div>
  );
}
