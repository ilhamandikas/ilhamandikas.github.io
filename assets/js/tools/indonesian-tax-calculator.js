import snapshot from '../data/indonesian-tax-objects.js';
import { CATEGORIES, EXTRA_OBJECTS, SOURCES, ruleFor, calculate, exactMoney } from './indonesian-tax-rules.js';

const $ = (id) => document.getElementById(`itc-${id}`);
const objects = [...snapshot.objects, ...EXTRA_OBJECTS];
const form = $('form');
let report = '';

function option(value, text) {
  const el = document.createElement('option');
  el.value = value;
  el.textContent = text;
  return el;
}

function clearResult() {
  report = '';
  $('result').hidden = true;
  $('tax').textContent = '';
  $('context').textContent = '';
  $('rows').replaceChildren();
  $('sources').replaceChildren();
  $('copy').disabled = true;
  $('copy-status').textContent = '';
  $('status').textContent = 'Choose a scenario, enter its amount and confirm the assumptions.';
  $('status').className = 'tool-status';
}

function selectedObject() {
  return objects.find((obj) => obj.group === $('category').value && obj.code === $('object').value);
}

function updateScenario() {
  clearResult();
  const obj = selectedObject();
  const rule = ruleFor($('category').value, $('object').value, $('date').value);
  const kind = rule.kind;
  $('official').textContent = obj ? `Official description: ${obj.officialName}` : 'No objects match this search. Try a shorter name or a different code.';
  $('availability').textContent = rule.available
    ? `Calculation available for the named transaction: ${rule.from} to ${rule.to}. Filing-code validity is not verified.`
    : rule.reason;
  $('calculate').disabled = !rule.available || !obj;
  $('assumptions').textContent = rule.note || 'No calculation is offered until this scenario and its period have been audited.';
  $('registration-field').hidden = $('category').value !== 'pph23';
  $('confirm').checked = false;
  $('mode').replaceChildren();
  if (kind === 'progressive' || kind === 'corporate') {
    $('amount-label').textContent = 'Taxable income (PKP), after deductions and PTKP where applicable (IDR)';
    $('mode').append(option('gross', 'Annual taxable income (PKP)'));
  } else if (kind === 'vat') {
    $('amount-label').textContent = rule.excludesPPnBM ? 'Price / reimbursement or price + VAT only (IDR; no separate PPnBM charge)' : 'Supply amount (IDR)';
    $('mode').append(option('gross', 'VAT-exclusive price / reimbursement'), option('inclusive', 'Price + VAT only'));
  } else {
    $('amount-label').textContent = 'Taxable gross base or agreed net amount, excluding VAT (IDR)';
    $('mode').append(option('gross', 'Taxable gross base'), option('net', 'Net after withholding — calculate gross-up'));
  }
}

function filterObjects() {
  const previous = $('object').value;
  const term = $('search').value.trim().toLocaleLowerCase('en');
  const matches = objects.filter((obj) => obj.group === $('category').value
    && `${obj.code} ${obj.name} ${obj.officialName}`.toLocaleLowerCase('en').includes(term));
  $('object').replaceChildren(...matches.map((obj) => option(obj.code, `${obj.code} — ${obj.name}`)));
  $('object').disabled = matches.length === 0;
  if (matches.some((obj) => obj.code === previous)) $('object').value = previous;
  updateScenario();
}

function reset() {
  form.reset();
  $('category').value = 'vat';
  $('search').value = '';
  filterObjects();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearResult();
  try {
    const obj = selectedObject();
    if (!obj) throw new Error('Choose a tax object or shorten the search to see matching objects.');
    const result = calculate({
      group: obj.group, code: obj.code, date: $('date').value,
      amount: $('amount').value, mode: $('mode').value,
      registered: $('registration').value === 'registered', confirmed: $('confirm').checked,
    });
    const context = `${obj.name} · ${obj.code} · ${$('date').value}`;
    $('context').textContent = context;
    $('tax').textContent = exactMoney(result.tax);
    $('rows').replaceChildren(...result.rows.map(([label, value]) => {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = label;
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(heading, cell);
      return row;
    }));
    const sources = result.rule.sources.map((key) => SOURCES[key]);
    $('sources').replaceChildren(...sources.map((source) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      item.append(link);
      return item;
    }));
    report = [
      'Indonesian Tax Calculator — experimental, partial coverage', context,
      ...result.rows.map(([label, value]) => `${label}: ${value}`),
      `Assumptions: ${result.rule.note}`,
      `Audited window: ${result.rule.from} to ${result.rule.to}. Not the full legal effective period.`,
      'Exact arithmetic before tax-document rounding; statutory PKP rounding only. Not a tax return.',
      'Historical filing-code validity is not verified. No exemption or liability determination.',
      ...sources.map((source) => `${source.name}: ${source.url}`),
    ].join('\n');
    $('result').hidden = false;
    $('copy').disabled = false;
    $('status').textContent = 'Calculated under the stated assumptions. Review the breakdown, references and coverage limits.';
    $('status').className = 'tool-status ok';
  } catch (error) {
    $('status').textContent = error.message;
    $('status').className = 'tool-status err';
  }
});

$('category').addEventListener('change', () => {
  $('search').value = '';
  filterObjects();
});
$('search').addEventListener('input', filterObjects);
$('object').addEventListener('change', updateScenario);
$('date').addEventListener('input', updateScenario);
$('date').addEventListener('change', updateScenario);
for (const id of ['amount', 'mode', 'registration', 'confirm']) {
  $(id).addEventListener('input', clearResult);
  $(id).addEventListener('change', clearResult);
}
$('reset').addEventListener('click', reset);
$('copy').addEventListener('click', async () => {
  if (!report) return;
  const copiedReport = report;
  try {
    await navigator.clipboard.writeText(copiedReport);
    if (report === copiedReport) $('copy-status').textContent = 'Calculation copied.';
  } catch {
    $('copy-status').textContent = 'Clipboard access failed. Select and copy the calculation text instead.';
  }
});
$('category').replaceChildren(...CATEGORIES.map(([id, name]) => option(id, name)));
reset();
