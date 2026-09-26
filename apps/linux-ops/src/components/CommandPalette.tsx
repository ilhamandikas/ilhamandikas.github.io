import { useEffect, useMemo, useRef, useState } from 'react';
import { searchCommands } from '../lib/search';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export function CommandPalette({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (open ? searchCommands(query).slice(0, 12) : []), [open, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      // Focus after the overlay has mounted.
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  if (!open) return null;

  const choose = (id: string) => {
    onSelect(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 p-4 pt-24" onClick={onClose}>
      <div className="card w-full max-w-xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <input
          ref={inputRef}
          className="w-full border-b border-edge bg-transparent px-4 py-3 text-sm text-fg placeholder:text-muted/70 focus:outline-none"
          placeholder="Search commands…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setCursor((current) => Math.min(current + 1, results.length - 1));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setCursor((current) => Math.max(current - 1, 0));
            } else if (event.key === 'Enter' && results[cursor]) {
              choose(results[cursor].id);
            } else if (event.key === 'Escape') {
              onClose();
            }
          }}
        />
        <ul className="max-h-80 overflow-y-auto">
          {results.map((command, index) => (
            <li key={command.id}>
              <button
                type="button"
                onMouseEnter={() => setCursor(index)}
                onClick={() => choose(command.id)}
                className={`flex w-full flex-col items-start gap-0.5 px-4 py-2 text-left ${
                  index === cursor ? 'bg-accent/10' : 'hover:bg-panel2'
                }`}
              >
                <span className="text-sm text-fg">{command.title}</span>
                <span className="truncate font-mono text-xs text-muted">{command.command}</span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}
