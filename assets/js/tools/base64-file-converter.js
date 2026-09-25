// Convert a file to Base64 and back again — no upload, everything local.
const { tk } = window;

const file = document.querySelector('#b64f-file');
const dataUrl = document.querySelector('#b64f-dataurl');
const output = document.querySelector('#b64f-output');
const status = document.querySelector('#b64f-status');
const decodeInput = document.querySelector('#b64f-input');
const decodeStatus = document.querySelector('#b64f-status2');
const downloadLink = document.querySelector('#b64f-download');

function readFile(input) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(input);
  });
}

document.querySelector('#b64f-encode').addEventListener('click', async () => {
  try {
    const chosen = file.files[0];
    if (!chosen) throw new Error('Choose a file first');
    const url = await readFile(chosen);
    output.value = dataUrl.checked ? url : url.slice(url.indexOf(',') + 1);
    tk.setStatus(status, `${chosen.name} encoded`, 'ok');
  } catch (error) {
    output.value = '';
    tk.setStatus(status, error.message, 'err');
  }
});

document.querySelector('#b64f-decode').addEventListener('click', () => {
  try {
    let value = decodeInput.value.trim();
    if (value === '') throw new Error('Paste some Base64 first');
    let mime = 'application/octet-stream';
    let name = 'decoded.bin';
    const match = value.match(/^data:([^;,]*)(;base64)?,(.*)$/s);
    if (match) {
      mime = match[1] || mime;
      value = match[3];
      const ext = (mime.split('/')[1] || 'bin').split('+')[0];
      name = `decoded.${ext}`;
    }
    const binary = atob(value.replace(/\s+/g, ''));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: mime });
    if (downloadLink.href) URL.revokeObjectURL(downloadLink.href);
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = name;
    downloadLink.hidden = false;
    tk.setStatus(decodeStatus, `${bytes.length.toLocaleString()} bytes ready`, 'ok');
  } catch (error) {
    downloadLink.hidden = true;
    tk.setStatus(decodeStatus, error.message || 'That does not look like valid Base64', 'err');
  }
});
