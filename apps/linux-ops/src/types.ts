// Shared types for the Linux Ops Command Generator. The CommandItem shape is the
// single source of truth for every command card, detail panel and analyzer hint.

export type Risk = 'safe' | 'change' | 'dangerous';

export interface CommandItem {
  /** Stable id, also used in the URL (`?cmd=`) and for `nextSteps` links. */
  id: string;
  title: string;
  description: string;
  /** The command itself. `{placeholders}` become editable inputs. */
  command: string;
  category: string;
  tags: string[];
  risk: Risk;
  requiresSudo?: boolean;
  explanation?: string;
  alternatives?: string[];
  /** Ids of commands that are a sensible next troubleshooting step. */
  nextSteps?: string[];
}

export interface Category {
  slug: string;
  name: string;
  blurb: string;
}

export interface Favorite {
  id: string;
  at: number;
}
