import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, DISCOVER_TAG } from './data/categories';
import { COMMANDS, COMMAND_BY_ID } from './data/commands';
import { parseQuery, searchCommands } from './lib/search';
import { loadFavorites, loadRecent, pushRecent, toggleFavorite } from './lib/storage';
import { readUrl, writeUrl } from './lib/urlState';
import { detectSensitive } from './lib/sensitive';
import { useToasts } from './hooks/useToasts';
import { ToastHost } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { SearchBar } from './components/SearchBar';
import { CommandList } from './components/CommandList';
import { CommandDetail } from './components/CommandDetail';
import { Analyzer } from './components/Analyzer';
import { CommandPalette } from './components/CommandPalette';

const DISCOVER_COUNT = COMMANDS.filter((command) => command.tags.includes(DISCOVER_TAG)).length;

type Tab = 'commands' | 'analyzer';

export default function App() {
  const initial = useMemo(() => readUrl(), []);
  const [query, setQuery] = useState(initial.q ?? '');
  const [category, setCategory] = useState(initial.cat ?? '');
  const [selectedId, setSelectedId] = useState(initial.cmd ?? '');
  const [tab, setTab] = useState<Tab>(initial.tab === 'analyzer' ? 'analyzer' : 'commands');
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [recent, setRecent] = useState<string[]>(() => loadRecent());
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, notify } = useToasts();
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    if (category === 'discover') {
      const discover = COMMANDS.filter((command) => command.tags.includes(DISCOVER_TAG));
      if (!query.trim()) return discover;
      return searchCommands(query).filter((command) => command.tags.includes(DISCOVER_TAG));
    }
    return searchCommands(query, category || undefined);
  }, [query, category]);

  const selected = selectedId ? COMMAND_BY_ID.get(selectedId) : undefined;
  const detail = selected ?? results[0];
  // Values embedded in the query (a port, an IP, a hostname) prefill the inputs.
  const parsed = useMemo(() => parseQuery(query), [query]);

  useEffect(() => {
    writeUrl({ q: query, cat: category, cmd: selectedId, tab });
  }, [query, category, selectedId, tab]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setRecent(pushRecent(id));
    setTab('commands');
    setSidebarOpen(false);
  }, []);

  const onToggleFavorite = useCallback(
    (id: string) => {
      const next = toggleFavorite(id);
      setFavorites(next);
      notify(next.includes(id) ? 'Added to favorites' : 'Removed from favorites');
    },
    [notify],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (event.key === '/' && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const sensitiveQuery = detectSensitive(query);

  return (
    <div className="lo-app">
      {/* The site page supplies the title and description, so the app keeps only
          the tab switch here. The box is a fixed-height panel that scrolls
          internally, which keeps the site footer reachable. */}
      <div className="flex h-[70vh] min-h-[560px] flex-col overflow-hidden rounded-[10px] border border-edge bg-panel">
        <div className="flex flex-wrap items-center gap-3 border-b border-edge px-3 py-2">
          <button type="button" className="lo-btn lg:hidden" onClick={() => setSidebarOpen((open) => !open)}>
            Menu
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className={`lo-btn ${tab === 'commands' ? 'lo-btn-primary' : ''}`}
              onClick={() => setTab('commands')}
            >
              Commands
            </button>
            <button
              type="button"
              className={`lo-btn ${tab === 'analyzer' ? 'lo-btn-primary' : ''}`}
              onClick={() => setTab('analyzer')}
            >
              Analyzer
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} w-64 shrink-0 border-r border-edge bg-panel lg:block`}>
          <Sidebar
            categories={CATEGORIES}
            activeCategory={category}
            favorites={favorites}
            recent={recent}
            onCategory={(slug) => {
              setCategory(slug);
              setSidebarOpen(false);
            }}
            onSelect={select}
            discoverCount={DISCOVER_COUNT}
          />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-4">
          {tab === 'commands' ? (
            <div className="space-y-4">
              <SearchBar
                ref={searchRef}
                value={query}
                onChange={setQuery}
                onOpenPalette={() => setPaletteOpen(true)}
                resultCount={results.length}
              />
              {sensitiveQuery.length > 0 && (
                <p className="rounded-lg border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
                  Your search looks like it contains a secret ({sensitiveQuery.join(', ')}). It is not written to the URL,
                  and it never leaves this page.
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
                <CommandList
                  commands={results}
                  activeId={detail?.id ?? ''}
                  favorites={favorites}
                  onSelect={select}
                  onToggleFavorite={onToggleFavorite}
                  query={query}
                />
                {detail && (
                  <div className="xl:sticky xl:top-4 xl:h-[calc(70vh-6.5rem)]">
                    <CommandDetail
                      command={detail}
                      initialValues={parsed.params}
                      favorite={favorites.includes(detail.id)}
                      onToggleFavorite={onToggleFavorite}
                      onSelect={select}
                      notify={notify}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Analyzer notify={notify} onSelect={select} />
          )}
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onSelect={select} />
      <ToastHost toasts={toasts} />
      </div>
    </div>
  );
}
