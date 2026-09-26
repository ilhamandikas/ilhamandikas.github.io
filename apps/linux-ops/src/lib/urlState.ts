import { detectSensitive } from './sensitive';

// The URL carries only the search text, the category, the selected command and
// the active tab. It never carries command output, and any sensitive-looking
// query is dropped before it is written, so a shared link cannot leak a secret.
export interface UrlState {
  q: string;
  cat: string;
  cmd: string;
  tab: string;
}

export function readUrl(): Partial<UrlState> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const state: Partial<UrlState> = {};
  const q = params.get('q');
  const cat = params.get('cat');
  const cmd = params.get('cmd');
  const tab = params.get('tab');
  if (q) state.q = q;
  if (cat) state.cat = cat;
  if (cmd) state.cmd = cmd;
  if (tab) state.tab = tab;
  return state;
}

export function writeUrl(state: Partial<UrlState>): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams();
  if (state.q && !detectSensitive(state.q).length) params.set('q', state.q);
  if (state.cat) params.set('cat', state.cat);
  if (state.cmd) params.set('cmd', state.cmd);
  if (state.tab && state.tab !== 'commands') params.set('tab', state.tab);
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
  window.history.replaceState(null, '', url);
}
