// Minimal rich-text editor built on contenteditable.
const { tk } = window;

const editor = document.querySelector('#wys-editor');
const output = document.querySelector('#wys-output');

function sync() {
  output.value = editor.innerHTML;
}

document.querySelectorAll('#wys-toolbar [data-cmd]').forEach((button) => {
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('click', () => {
    document.execCommand(button.dataset.cmd, false, button.dataset.value || null);
    editor.focus();
    sync();
  });
});

document.querySelector('#wys-link').addEventListener('mousedown', (event) => event.preventDefault());
document.querySelector('#wys-link').addEventListener('click', () => {
  const url = window.prompt('Link URL', 'https://');
  if (url) document.execCommand('createLink', false, url);
  editor.focus();
  sync();
});

editor.addEventListener('input', sync);
sync();
