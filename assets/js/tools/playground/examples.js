export function createExamples({ els, getCode, onLoad }) {
  const data = JSON.parse(document.querySelector('#jsp-examples')?.textContent || '[]');
  const confirm = window.tk.confirmDialog(els.replaceDialog);
  let selected = '';
  function option(label, value) {
    const node = document.createElement('option');
    node.textContent = label;
    node.value = value;
    return node;
  }
  function hint() {
    const example = els.example.value === '' ? null : data[Number(els.example.value)];
    els.exampleHint.textContent = example?.hint || 'Choosing an example replaces code and input, and pauses Auto-run. Multiline code requires confirmation.';
  }
  function reset() { selected = ''; els.example.value = ''; hint(); }
  for (const category of new Set(data.map((example) => example.category))) els.category.add(option(category, category));
  els.category.addEventListener('change', () => {
    els.example.replaceChildren(option('Choose an example…', ''));
    data.forEach((example, index) => {
      if (!els.category.value || example.category === els.category.value) els.example.add(option(example.name, String(index)));
    });
    reset();
  });
  els.example.addEventListener('change', async () => {
    const value = els.example.value;
    const example = value === '' ? null : data[Number(value)];
    if (!example) { reset(); return; }
    if (getCode().trimEnd().split(/\r\n|\r|\n/).length > 1) {
      els.example.value = selected;
      hint();
      els.replaceName.textContent = example.name;
      if (!await confirm()) return;
    }
    selected = value;
    els.example.value = value;
    onLoad(example);
    hint();
  });
  return { reset };
}
