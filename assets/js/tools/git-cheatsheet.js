// Git command reference with a live filter.
const { tk } = window;

const GROUPS = [
  {
    title: 'Setup',
    items: [
      { cmd: 'git init', desc: 'Create a new repository in the current directory' },
      { cmd: 'git clone <url>', desc: 'Copy a remote repository locally' },
      { cmd: 'git config --global user.name "<name>"', desc: 'Set the author name' },
      { cmd: 'git config --global user.email "<email>"', desc: 'Set the author email' },
    ],
  },
  {
    title: 'Basics',
    items: [
      { cmd: 'git status', desc: 'Show changed, staged and untracked files' },
      { cmd: 'git add <file>', desc: 'Stage a file (use . for everything)' },
      { cmd: 'git commit -m "<message>"', desc: 'Record staged changes' },
      { cmd: 'git commit --amend', desc: 'Rewrite the last commit' },
      { cmd: 'git diff', desc: 'Show unstaged changes' },
      { cmd: 'git diff --staged', desc: 'Show staged changes' },
    ],
  },
  {
    title: 'Branching',
    items: [
      { cmd: 'git branch', desc: 'List branches' },
      { cmd: 'git switch -c <branch>', desc: 'Create and switch to a branch' },
      { cmd: 'git switch <branch>', desc: 'Switch branches' },
      { cmd: 'git merge <branch>', desc: 'Merge a branch into the current one' },
      { cmd: 'git rebase <branch>', desc: 'Replay commits on top of another branch' },
      { cmd: 'git branch -d <branch>', desc: 'Delete a merged branch' },
    ],
  },
  {
    title: 'Remote',
    items: [
      { cmd: 'git remote -v', desc: 'List remotes' },
      { cmd: 'git remote add origin <url>', desc: 'Add a remote' },
      { cmd: 'git fetch', desc: 'Download objects without merging' },
      { cmd: 'git pull', desc: 'Fetch and merge' },
      { cmd: 'git push', desc: 'Upload commits' },
      { cmd: 'git push -u origin <branch>', desc: 'Push and set upstream' },
    ],
  },
  {
    title: 'Undo',
    items: [
      { cmd: 'git restore <file>', desc: 'Discard working-tree changes' },
      { cmd: 'git restore --staged <file>', desc: 'Unstage a file' },
      { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit, keep changes staged' },
      { cmd: 'git reset --hard HEAD~1', desc: 'Undo last commit and discard changes' },
      { cmd: 'git revert <commit>', desc: 'Create a commit that reverses another' },
    ],
  },
  {
    title: 'Stash',
    items: [
      { cmd: 'git stash', desc: 'Shelve changes' },
      { cmd: 'git stash list', desc: 'List stashes' },
      { cmd: 'git stash pop', desc: 'Reapply and drop the latest stash' },
      { cmd: 'git stash apply stash@{n}', desc: 'Apply a specific stash' },
    ],
  },
  {
    title: 'Log & inspect',
    items: [
      { cmd: 'git log --oneline --graph --decorate', desc: 'Compact visual history' },
      { cmd: 'git blame <file>', desc: 'Show who last changed each line' },
      { cmd: 'git show <commit>', desc: 'Show a commit and its diff' },
      { cmd: 'git shortlog -sn', desc: 'Commit count per author' },
    ],
  },
  {
    title: 'Tags',
    items: [
      { cmd: 'git tag <name>', desc: 'Create a lightweight tag' },
      { cmd: 'git tag -a <name> -m "<msg>"', desc: 'Create an annotated tag' },
      { cmd: 'git push --tags', desc: 'Push tags to the remote' },
    ],
  },
];

const search = document.querySelector('#git-search');
const list = document.querySelector('#git-list');
const status = document.querySelector('#git-status');

const escapeHtml = (value) => value.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function render() {
  const query = search.value.trim().toLowerCase();
  let count = 0;
  const sections = GROUPS.map((group) => {
    const items = group.items.filter((item) => `${item.cmd} ${item.desc}`.toLowerCase().includes(query));
    count += items.length;
    if (items.length === 0) return null;
    const section = document.createElement('section');
    const heading = document.createElement('h3');
    heading.textContent = group.title;
    section.appendChild(heading);
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'tool-cheat-item';
      row.innerHTML = `<code>${escapeHtml(item.cmd)}</code><span>${escapeHtml(item.desc)}</span>`;
      section.appendChild(row);
    });
    return section;
  }).filter(Boolean);

  list.replaceChildren(...sections);
  tk.setStatus(status, `${count} command${count === 1 ? '' : 's'}`);
}

tk.live(search, render);
