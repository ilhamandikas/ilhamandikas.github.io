import type { CommandItem } from '../types';
import { CommandCard } from './CommandCard';

interface Props {
  commands: CommandItem[];
  activeId: string;
  favorites: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  query: string;
}

export function CommandList({ commands, activeId, favorites, onSelect, onToggleFavorite, query }: Props) {
  if (commands.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-sm text-fg">No command matches “{query}”.</p>
        <p className="mt-1 text-sm text-muted">
          Try a plain description of the symptom, such as “disk penuh”, “port 8080”, “503 nginx” or “oom”.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      {commands.map((command) => (
        <CommandCard
          key={command.id}
          command={command}
          active={command.id === activeId}
          favorite={favorites.includes(command.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
