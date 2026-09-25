// Finding a tool in the catalog. No dependencies.
//
// A plain `haystack.includes(query)` ranks badly, which matters more than it
// sounds: with substring matching, "ip" puts json-minifier first (str-IP),
// aes-encryption second (c-IP-her) and the actual IP tool fourth. So this
// module scores instead of merely filtering.
//
// Each query token is scored against three fields and keeps its best tier:
//
//   word          the token is a whole word               (+40)
//   stem          the token is that word, singular/plural (+35)
//   prefix        the token starts a word                 (+25)
//   substring     the token appears inside a word         (+10)
//   typo          one insert/delete/substitution away     (+5)
//   subsequence   the token's letters appear in order     (0)
//
// and the field it landed in decides the base: name 100, keywords 60,
// description 30. Every token must match something, so "json yaml" cannot
// quietly degrade into "anything mentioning json".
//
// Three guards exist because the obvious version of each tier is wrong:
//
//   - a typo match must agree on the first letter, or "time" matches "mime"
//   - a subsequence must start a word and cover 45% of it, or "hash" matches
//     "cheatsheet" (h-a-s-h in order) and every search returns noise
//   - a token may not fuzzy-match at all until the query has more than one token
//     to agree on it, or "ean" finds "expander" (see RELAXED)
//
// Two fallbacks rescue the queries those guards would otherwise throw away, and
// both are fallbacks rather than extra scores, so neither can displace a match
// that already worked:
//
//   - the query with its spaces removed is compared against the field with its
//     spaces removed. That is how "qrcode", "qrgenerator" and "jsonformatter"
//     find their tools. It is deliberately not a substring match, because a
//     collapsed field is not the string the user is looking at: "imei" sits
//     inside "date time iso" once the spaces go.
//   - if the strict pass finds nothing at all, the query is scored again with the
//     guards loosened. That is how "qt generater" finds QR Code Generator:
//     "generater" pins the entry down, so "qt" is allowed to be one edit from
//     "qr" even though it is also one edit from "js", "go" and "os".

const WORD = 40;
const STEM = 35;
const PREFIX = 25;
const SUBSTRING = 10;
const TYPO = 5;
const SUBSEQUENCE = 0;
const NO_MATCH = -1;

const IN_NAME = 100;
const IN_KEYWORDS = 60;
const IN_DESC = 30;
const ALL_TOKENS_IN_NAME = 60;

// Below four characters a single edit is most of the word, so "bc" would match
// half the catalog.
const STRICT = { minTypo: 4, minWord: 4, minSubsequence: 3, minCoverage: 0.45 };

// Only ever reached when the strict pass found nothing *and* the query has more
// than one token, so loosening these cannot dilute a search that already worked
// and cannot turn a lone short token into a guess.
const RELAXED = { minTypo: 2, minWord: 2, minSubsequence: 2, minCoverage: 0.3 };

// A collapsed field is one long word, so a loose subsequence over it would match
// almost anything. Most of it has to be there instead.
const FLAT_COVERAGE = 0.7;

// People write "json 2 yaml" for the "to" tools, and there are ten of those, so
// this is the one piece of shorthand worth knowing. Whole tokens only, which
// leaves "sha 256" alone, and nothing in the catalog uses a bare "2" as a word.
const SHORTHAND = { 2: 'to' };

export function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_/.,:]+/g, ' ')
    .trim();
}

const tokens = (text) => text.split(' ').filter(Boolean).map((token) => SHORTHAND[token] || token);
const collapse = (text) => text.replace(/ /g, '');

// Singular and plural have to meet in the middle: "html entity" has to find
// "HTML Entities", and "status code" has to find "Status Codes". Three rules
// cover the whole catalog — -ies to -y, -es after a sibilant, and a bare -s.
function stem(word) {
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (/(?:s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

// At most one insert, delete or substitution — we only ever need a yes/no, and
// this stops at the first surplus edit instead of filling a matrix.
function withinOneEdit(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
    } else {
      edits += 1;
      if (edits > 1) return false;
      if (a.length === b.length) {
        i += 1;
        j += 1;
      } else if (a.length > b.length) {
        i += 1;
      } else {
        j += 1;
      }
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function isSubsequence(needle, haystack) {
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
    if (haystack[j] === needle[i]) i += 1;
  }
  return i === needle.length;
}

// The bonus for one token against one field, or NO_MATCH.
function tierOf(token, words, text, rules) {
  const stemmed = stem(token);
  for (const word of words) {
    if (word === token) return WORD;
    // Guarded at three characters, or "as" would stem to "a" and match half the
    // catalog.
    if (stemmed.length >= 3 && stem(word) === stemmed) return STEM;
  }
  for (const word of words) {
    if (word.startsWith(token)) return PREFIX;
  }
  if (text.includes(token)) return SUBSTRING;

  if (token.length >= rules.minTypo) {
    for (const word of words) {
      if (word.length >= rules.minWord && word[0] === token[0] && withinOneEdit(token, word)) return TYPO;
    }
  }
  if (token.length >= rules.minSubsequence) {
    for (const word of words) {
      if (
        word.length >= rules.minWord &&
        word[0] === token[0] &&
        token.length / word.length >= rules.minCoverage &&
        isSubsequence(token, word)
      ) {
        return SUBSEQUENCE;
      }
    }
  }
  return NO_MATCH;
}

// `items` are the caller's own objects: { name, desc, keywords }. Anything else
// on them is carried through untouched, so callers can hang a DOM node off them
// and get it back from search().
export function buildIndex(items) {
  return items.map((item) => {
    const name = normalize(item.name);
    const keywords = normalize(Array.isArray(item.keywords) ? item.keywords.join(' ') : item.keywords);
    const desc = normalize(item.desc);

    return {
      item,
      name,
      nameWords: tokens(name),
      flatName: collapse(name),
      keywords,
      keywordWords: tokens(keywords),
      flatKeywords: collapse(keywords),
      desc,
      descWords: tokens(desc),
    };
  });
}

// The best score for one token across all three fields, with which tier won and
// whether the name was one of the fields that matched.
function bestFor(token, entry, rules) {
  const name = tierOf(token, entry.nameWords, entry.name, rules);
  let score = name === NO_MATCH ? NO_MATCH : IN_NAME + name;
  let winning = name;

  const keywords = tierOf(token, entry.keywordWords, entry.keywords, rules);
  if (keywords !== NO_MATCH && IN_KEYWORDS + keywords > score) {
    score = IN_KEYWORDS + keywords;
    winning = keywords;
  }

  const desc = tierOf(token, entry.descWords, entry.desc, rules);
  if (desc !== NO_MATCH && IN_DESC + desc > score) {
    score = IN_DESC + desc;
    winning = desc;
  }

  return { score, winning, inName: name !== NO_MATCH };
}

// The whole query run together against the fields run together. This only ever
// speaks when the token-by-token pass has nothing to say, so it cannot pull an
// entry into a result set that already matched without it.
function flatFor(query, entry, rules) {
  const flat = collapse(query);
  const limits = { ...rules, minCoverage: Math.max(rules.minCoverage, FLAT_COVERAGE) };
  let best = NO_MATCH;
  let fuzzy = false;

  for (const [base, text] of [
    [IN_NAME, entry.flatName],
    [IN_KEYWORDS, entry.flatKeywords],
  ]) {
    const found = tierOf(flat, [text], text, limits);
    // A collapsed field is not the string the user is looking at, so a substring
    // hit inside it is an accident: "imei" sits inside "date time iso" once the
    // spaces go. Whole-field, prefix and near-total matches only.
    if (found === NO_MATCH || found === SUBSTRING) continue;
    if (base + found > best) {
      best = base + found;
      fuzzy = found === TYPO || found === SUBSEQUENCE;
    }
  }

  return { score: best, fuzzy };
}

function rank(wanted, index, rules) {
  const results = [];

  for (const entry of index) {
    let total = 0;
    let inName = 0;
    let fuzzy = false;
    let matched = true;

    for (const token of wanted) {
      const found = bestFor(token, entry, rules);
      if (found.score === NO_MATCH) {
        matched = false;
        break;
      }
      if (found.winning === TYPO || found.winning === SUBSEQUENCE) fuzzy = true;
      if (found.inName) inName += 1;
      total += found.score;
    }

    if (matched) {
      results.push({
        item: entry.item,
        score: total + (inName === wanted.length ? ALL_TOKENS_IN_NAME : 0),
        fuzzy,
      });
      continue;
    }

    const flat = flatFor(wanted.join(' '), entry, rules);
    if (flat.score !== NO_MATCH) results.push({ item: entry.item, score: flat.score, fuzzy: flat.fuzzy });
  }

  // Ties keep their original order, so the list does not reshuffle between
  // keystrokes.
  return results.sort((a, b) => b.score - a.score);
}

// Returns [{ item, score, fuzzy }] best first. `fuzzy` says the winning tier was
// a typo or a subsequence, i.e. nothing the user literally typed, so the UI can
// admit that rather than pretend it was an exact match.
//
// The strict pass is the answer whenever it has one. The relaxed pass is the
// fallback, and it is only for queries with more than one token: a lone short
// token is one edit away from dozens of words with nothing else in the query to
// disagree with it, which is why "ean" must not find "expander". Next to a word
// the user typed properly, though, the same token is specific — "generater"
// pins down the entry that "qt" is allowed to be one edit from "qr" in.
export function search(query, index) {
  const wanted = tokens(normalize(query));
  if (wanted.length === 0) return [];

  const strict = rank(wanted, index, STRICT);
  if (strict.length > 0 || wanted.length === 1) return strict;
  return rank(wanted, index, RELAXED);
}

// Shared by the catalog and the sidebar so the shortcut is described and wired
// in one place.
export function shortcutLabel() {
  const platform =
    (navigator.userAgentData && navigator.userAgentData.platform) ||
    navigator.platform ||
    navigator.userAgent ||
    '';
  return /mac|iphone|ipad|ipod/i.test(platform) ? '⌘K' : 'Ctrl K';
}

export function bindFocusShortcut(input) {
  document.addEventListener('keydown', (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    if (event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    input.focus();
    input.select();
  });
}
