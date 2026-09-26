// Bundles the handful of third-party libraries we use into self-contained ES
// modules under assets/js/vendor. The output is committed so that the Hugo
// build (and CI) never needs Node or npm.
//
// Usage: npm run vendor
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';

const OUT = 'assets/js/vendor';

// Each entry becomes assets/js/vendor/<name>.js and is imported by a tool.
const ENTRIES = {
  yaml: "export { parse, stringify, parseDocument } from 'yaml';",
  toml: "export { parse, stringify } from 'smol-toml';",
  marked: "import { marked } from 'marked'; export { marked };",
  bcrypt: "import bcrypt from 'bcryptjs'; export default bcrypt;",
  qrcode: "import QRCode from 'qrcode'; export default QRCode;",
  figlet: `
    import figlet from 'figlet/browser';
    import standard from 'figlet/importable-fonts/Standard.js';
    import big from 'figlet/importable-fonts/Big.js';
    import slant from 'figlet/importable-fonts/Slant.js';
    import small from 'figlet/importable-fonts/Small.js';
    import banner from 'figlet/importable-fonts/Banner.js';
    figlet.parseFont('Standard', standard);
    figlet.parseFont('Big', big);
    figlet.parseFont('Slant', slant);
    figlet.parseFont('Small', small);
    figlet.parseFont('Banner', banner);
    export default figlet;
  `,
  phone: "export { parsePhoneNumberFromString, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js';",
  bip39: "export { generateMnemonic, validateMnemonic, mnemonicToEntropy, entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39'; export { wordlist as english } from '@scure/bip39/wordlists/english';",
  jsonpath: "export { JSONPath } from 'jsonpath-plus';",
  fflate: "export { zipSync, unzipSync, strToU8, strFromU8 } from 'fflate';",
  'pdf-lib': "export { PDFDocument, StandardFonts, rgb, PDFName, PDFString, PDFHexString, PDFDict } from 'pdf-lib';",
};

// Only the files this script owns are replaced. jsqr is a hand-copied dist
// file that shares the directory, so the whole folder is never wiped.
await mkdir(OUT, { recursive: true });

for (const [name, contents] of Object.entries(ENTRIES)) {
  const result = await build({
    stdin: { contents, resolveDir: process.cwd(), sourcefile: `${name}.js`, loader: 'js' },
    bundle: true,
    format: 'esm',
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    write: false,
  });
  await writeFile(`${OUT}/${name}.js`, result.outputFiles[0].text);
  console.log(`vendored ${name}.js (${(result.outputFiles[0].text.length / 1024).toFixed(1)} kB)`);
}
