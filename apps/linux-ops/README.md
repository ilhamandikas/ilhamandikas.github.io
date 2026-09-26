# Linux Ops

A client-side troubleshooting assistant for Linux and DevOps work. You describe a
problem — "cek port 8080 dipakai apa", "disk penuh", "503 nginx", "oom" — and it
answers with **safe commands**, an explanation of every flag, a risk level, safer
alternatives and the next troubleshooting steps.

It is not a cheat sheet. Every entry explains what the command does, whether it
only reads or changes state, and where to go next.

## What it does

- **Natural-language search** across 190+ curated commands, with an intent layer
  for Indonesian and English phrasings plus fuzzy matching for typos.
- **Dynamic parameters** — any `{port}`, `{pid}`, `{host}` in a command becomes
  an input, so the copy button gives you a ready-to-run line.
- **Risk levels** — `safe` (read-only), `change` (modifies state) and
  `dangerous` (destructive). Dangerous commands are never the default suggestion
  and are hidden behind an explicit "I understand" click.
- **Per-flag explanations** from a shared glossary, so you learn the syntax while
  you use it.
- **Troubleshooting flows** — each command links to the sensible next commands.
- **Paste-output analyzer** — paste the output of `ss`, `df`, `free`, `ps`,
  `docker ps`, `nginx -t`, `systemctl status`, `lsblk`, `pvs`/`lvs`, `git status`,
  a replication query or a process list, and it explains what it sees. Pure
  regex, no model, no API.
- **Discover** — a section for the lesser-known tools (`namei`, `lsof +L1`,
  `strace`, `perf`, `bpftrace`) that solve a problem cleanly.
- **Favorites and recents** in `localStorage`, and a shareable URL state
  (`?q=`, `?cat=`, `?cmd=`, `?tab=`).

## Privacy

Everything runs in the browser. There is no backend, no database, no auth and no
proprietary API. Nothing you type or paste is uploaded. The URL never contains
command output, and any search that looks like a secret (a private key, a bearer
token, `password=`, an AWS secret key, a database URL with credentials) is kept
out of the URL and flagged on screen.

## Stack

React 18 + Vite 5 + TypeScript + Tailwind CSS, with Fuse.js for fuzzy search.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/ (dev only; production mounts into Hugo)
npm run lint
npm run build    # type-check + production build
```

## Deployment

The build output goes to `../../assets/linux-ops` with stable file names (`app.js`,
`app.css`). Hugo fingerprints those into `public/linux-ops/` and the page at
`content/tools/linux-ops.md` mounts the app into its `#root` element, so the app is
served at <https://ilham.dev/tools/linux-ops/> as a normal Hugo page with the site
header and footer. Nothing needs npm during the Hugo build.

Tailwind is configured with `preflight: false` and `important: '.lo-app'`, so the
app's styles are scoped under `.lo-app` and cannot collide with the site's own
`.card`, `.grid` or `.container` rules.

The build output is committed so the Hugo CI stays npm-free. The dedicated
workflow at `.github/workflows/linux-ops.yml` rebuilds the app from source and
fails if the committed output is out of date, which keeps the two in sync.

## Adding a command

Add an object to the right file under `src/data/commands/`:

```ts
{
  id: 'ports-ss-listen',
  title: 'List every listening TCP and UDP port',
  description: 'The first command to run when you do not know what is bound where.',
  command: 'sudo ss -tulpn',          // {port}, {pid}, {host}, … become inputs
  category: 'ports',
  tags: ['port', 'listen', 'socket'],
  risk: 'safe',                        // safe | change | dangerous
  requiresSudo: true,
  explanation: 'ss reads the kernel socket tables directly…',
  alternatives: ['sudo lsof -i -P -n | grep LISTEN'],
  nextSteps: ['ports-who-owns'],       // ids of other commands
}
```

The sidebar counts, search index, URL state and analyzer hints all pick it up
automatically.
