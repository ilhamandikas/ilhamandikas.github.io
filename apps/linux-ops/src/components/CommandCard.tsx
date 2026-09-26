import type { CommandItem } from '../types';
import { RiskBadge } from './RiskBadge';

interface Props {
  command: CommandItem;
  active: boolean;
  favorite: boolean;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function CommandCard({ command, active, favorite, onSelect, onToggleFavorite }: Props) {
  return (
    <article
      className={`lo-card cursor-pointer p-4 transition-colors ${
        active ? 'border-accent/60' : 'hover:border-edge2'
      }`}
      onClick={() => onSelect(command.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-fg">{command.title}</h3>
        <button
          type="button"
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
          title={favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`shrink-0 text-lg leading-none ${favorite ? 'text-change' : 'text-muted hover:text-fg'}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(command.id);
          }}
        >
          {favorite ? '★' : '☆'}
        </button>
      </div>
      <p className="mt-1 text-sm text-muted">{command.description}</p>
      <pre className="mt-3 overflow-x-auto rounded-lg border border-edge bg-panel px-3 py-2 font-mono text-xs text-accent">
        {command.command}
      </pre>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RiskBadge risk={command.risk} />
        {command.requiresSudo && <span className="lo-chip">needs sudo</span>}
        {command.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="lo-chip">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
