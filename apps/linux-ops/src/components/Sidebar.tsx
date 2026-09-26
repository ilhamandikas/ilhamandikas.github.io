import type { Category } from '../types';
import { COMMAND_BY_ID, COUNTS_BY_CATEGORY } from '../data/commands';

interface Props {
  categories: Category[];
  activeCategory: string;
  favorites: string[];
  recent: string[];
  onCategory: (slug: string) => void;
  onSelect: (id: string) => void;
  discoverCount: number;
}

export function Sidebar({ categories, activeCategory, favorites, recent, onCategory, onSelect, discoverCount }: Props) {
  const favoriteItems = favorites.map((id) => COMMAND_BY_ID.get(id)).filter((item) => item !== undefined);

  return (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div>
        <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">Categories</h2>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onCategory('')}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${
                activeCategory === '' ? 'bg-accent/10 text-accent' : 'text-fg/90 hover:bg-panel2'
              }`}
            >
              <span>All commands</span>
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => onCategory(category.slug)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                  activeCategory === category.slug ? 'bg-accent/10 text-accent' : 'text-fg/90 hover:bg-panel2'
                }`}
              >
                <span className="truncate">{category.name}</span>
                <span className="shrink-0 text-xs text-muted">{COUNTS_BY_CATEGORY[category.slug] ?? 0}</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onCategory('discover')}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm ${
                activeCategory === 'discover' ? 'bg-accent/10 text-accent' : 'text-fg/90 hover:bg-panel2'
              }`}
            >
              <span className="truncate">Discover</span>
              <span className="shrink-0 text-xs text-muted">{discoverCount}</span>
            </button>
          </li>
        </ul>
      </div>

      {favoriteItems.length > 0 && (
        <div>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">Favorites</h2>
          <ul className="space-y-0.5">
            {favoriteItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className="w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-fg/90 hover:bg-panel2"
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted">Recent</h2>
          <ul className="space-y-0.5">
            {recent
              .map((id) => COMMAND_BY_ID.get(id))
              .filter((item) => item !== undefined)
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className="w-full truncate rounded-lg px-2 py-1.5 text-left text-sm text-muted hover:bg-panel2 hover:text-fg"
                  >
                    {item.title}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
