import { forwardRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onOpenPalette: () => void;
  resultCount: number;
}

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar(
  { value, onChange, onOpenPalette, resultCount },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type="search"
        className="input py-3 pl-10 pr-24 text-base"
        placeholder="Describe the problem: cek port 8080 dipakai apa, disk penuh, 503 nginx…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search commands"
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
        <span className="hidden text-xs text-muted sm:inline">{resultCount} results</span>
        <button
          type="button"
          onClick={onOpenPalette}
          className="rounded-md border border-edge2 px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent"
          title="Open the command palette"
        >
          ⌘K
        </button>
      </div>
    </div>
  );
});
