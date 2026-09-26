// Lay plain text out on pages and write a PDF. Words are measured with the
// embedded font, so a long line breaks where it should rather than at a guess.
import { PDFDocument, StandardFonts, rgb } from '../vendor/pdf-lib.js';

const { tk } = window;

const els = {
  text: document.querySelector('#ttp-text'),
  page: document.querySelector('#ttp-page'),
  font: document.querySelector('#ttp-font'),
  size: document.querySelector('#ttp-size'),
  margin: document.querySelector('#ttp-margin'),
  leading: document.querySelector('#ttp-leading'),
  numbers: document.querySelector('#ttp-numbers'),
  download: document.querySelector('#ttp-download'),
  status: document.querySelector('#ttp-status'),
  result: document.querySelector('#ttp-result'),
  pages: document.querySelector('#ttp-pages'),
  lines: document.querySelector('#ttp-lines'),
  fileSize: document.querySelector('#ttp-file-size'),
};

const SIZES = { a4: [595.28, 841.89], letter: [612, 792], a5: [419.53, 595.28] };
const FONTS = { Helvetica: StandardFonts.Helvetica, TimesRoman: StandardFonts.TimesRoman, Courier: StandardFonts.Courier };
const MAX_CHARS = 200000;

let outputBlob = null;
let runId = 0;

function wrap(paragraph, font, size, maxWidth) {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate;
    else {
      lines.push(line);
      line = word;
    }
  });
  lines.push(line);
  return lines;
}

function build() {
  const id = ++runId;
  outputBlob = null;
  els.download.disabled = true;
  els.result.hidden = true;

  const raw = els.text.value;
  if (!raw.trim()) {
    tk.setStatus(els.status, 'Type some text to lay out.');
    return;
  }
  if (raw.length > MAX_CHARS) {
    tk.setStatus(els.status, 'That is more text than this page can lay out at once.', 'err');
    return;
  }

  // The standard fonts cover Latin-1; anything past that cannot be drawn.
  const text = raw.replace(/[^\t\n\r\x20-\xff]/g, '');
  const dropped = raw.length - text.length;

  (async () => {
    try {
      const [width, height] = SIZES[els.page.value] || SIZES.a4;
      const size = Math.min(36, Math.max(6, Number(els.size.value) || 12));
      const margin = Math.min(width / 3, Math.max(5, Number(els.margin.value) || 20) * (72 / 25.4));
      const leading = Math.min(3, Math.max(1, Number(els.leading.value) || 1.4));
      const lineHeight = size * leading;
      const maxWidth = width - margin * 2;

      const doc = await PDFDocument.create();
      const font = await doc.embedFont(FONTS[els.font.value] || StandardFonts.Helvetica);

      const lines = [];
      text.split('\n').forEach((paragraph) => {
        wrap(paragraph.replace(/\r/g, ''), font, size, maxWidth).forEach((line) => lines.push(line));
      });

      const bottom = margin + (els.numbers.checked ? size + 6 : 0);
      const pages = [doc.addPage([width, height])];
      let page = pages[0];
      let y = height - margin - size;
      lines.forEach((line) => {
        if (y < bottom) {
          page = doc.addPage([width, height]);
          pages.push(page);
          y = height - margin - size;
        }
        if (line) page.drawText(line, { x: margin, y, size, font, color: rgb(0.08, 0.09, 0.1) });
        y -= lineHeight;
      });

      if (els.numbers.checked) {
        const label = (index) => `${index + 1} / ${pages.length}`;
        const numberSize = Math.max(8, size * 0.8);
        pages.forEach((sheet, index) => {
          const caption = label(index);
          sheet.drawText(caption, {
            x: (width - font.widthOfTextAtSize(caption, numberSize)) / 2,
            y: Math.max(8, margin / 2),
            size: numberSize,
            font,
            color: rgb(0.42, 0.45, 0.5),
          });
        });
      }

      const bytes = await doc.save();
      if (id !== runId) return;

      outputBlob = new Blob([bytes], { type: 'application/pdf' });
      els.download.disabled = false;
      els.result.hidden = false;
      els.pages.textContent = String(pages.length);
      els.lines.textContent = String(lines.length);
      els.fileSize.textContent = tk.formatBytes(outputBlob.size);
      const note = dropped ? ` ${dropped} character${dropped === 1 ? '' : 's'} outside Latin-1 were left out.` : '';
      tk.setStatus(els.status, `Ready — ${pages.length} page${pages.length === 1 ? '' : 's'}, ${tk.formatBytes(outputBlob.size)}.${note}`, 'ok');
    } catch {
      els.download.disabled = true;
      tk.setStatus(els.status, 'Could not build the PDF from that text.', 'err');
    }
  })();
}

els.download.addEventListener('click', () => {
  if (!outputBlob) {
    tk.setStatus(els.status, 'Nothing to download yet.', 'err');
    return;
  }
  tk.download('text.pdf', outputBlob, 'application/pdf');
  tk.setStatus(els.status, 'Saved text.pdf.', 'ok');
});

tk.live([els.text, els.page, els.font, els.size, els.margin, els.leading, els.numbers], build, 250);
