const el = (id) => document.getElementById(id);
const examples = {
  javascript: "const name = await prompt('Name?'); console.log(`Hello, ${name}!`);",
  typescript: "const name: string = await prompt('Name?'); console.log(`Hello, ${name}!`);",
  python: "name = input()\nprint(f'Hello, {name}!')",
  php: "<?php\n$name = trim(fgets(STDIN));\necho \"Hello, $name!\\n\";",
  ruby: "name = STDIN.gets.strip\nputs \"Hello, #{name}!\"",
  c: '#include <stdio.h>\nint main(void) { char name[100]; fgets(name, sizeof(name), stdin); printf("Hello, %s", name); return 0; }',
  cpp: '#include <iostream>\n#include <string>\nint main() { std::string name; std::getline(std::cin, name); std::cout << "Hello, " << name << "!\\n"; }',
};
let worker;
let deadline;
function stop() {
  worker?.terminate();
  worker = null;
  clearTimeout(deadline);
  el('stop').disabled = true;
}
function example() { stop(); el('code').value = examples[el('language').value]; }
el('language').addEventListener('change', example);
el('stop').addEventListener('click', () => { stop(); el('status').textContent = 'Stopped.'; });
el('run').addEventListener('click', () => {
  stop();
  el('output').textContent = '';
  el('status').textContent = 'Loading runtime…';
  const code = el('code').value;
  const input = el('input').value + '\n';
  const current = new Worker('./worker.mjs', { type: 'module' });
  worker = current;
  el('stop').disabled = false;
  let bytes = 0;
  current.onmessage = ({ data }) => {
    if (worker !== current) return;
    if (data.type === 'ready') current.postMessage({ type: 'run', code, input });
    if (data.type === 'output' && bytes < 100000) {
      const text = `${data.kind}: ${data.text}\n`;
      bytes += text.length;
      el('output').textContent += text;
    }
    if (data.type === 'compiling' || data.type === 'running') el('status').textContent = `${data.type}…`;
    if (data.type === 'done' || data.type === 'error') {
      el('status').textContent = data.type === 'done' ? 'Finished.' : 'Execution failed.';
      if (data.type === 'error') el('output').textContent += data.text;
      stop();
    }
  };
  current.onerror = (event) => {
    el('status').textContent = event.message || 'Worker failed.';
    stop();
  };
  deadline = setTimeout(() => { stop(); el('status').textContent = 'Stopped at the 120-second prototype limit.'; }, 120000);
  current.postMessage({ type: 'init', language: el('language').value });
});
window.addEventListener('pagehide', stop);
example();
