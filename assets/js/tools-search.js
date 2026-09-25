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
//   prefix        the token starts a word                 (+25)
//   substring     the token appears inside a word         (+10)
//   typo          one insert/delete/substitution away     (+5)
//   subsequence   the token's letters appear in order     (0)
//
// and the field it landed in decides the base: name 100, keywords 60,
// description 30. Every token must match something, so "json yaml" cannot
// quietly degrade into "anything mentioning json".
//
// Two guards exist because the obvious version of each tier is wrong:
//
//   - a typo match must agree on the first letter, or "time" matches "mime"
//   - a subsequence must start a word and cover 45% of it, or "hash" matches
//     "cheatsheet" (h-a-s-h in order) and every search returns noise

const WORD = 40;
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
const MIN_TYPO = 4;
const MIN_SUBSEQUENCE = 3;
// ...and a short word gives a subsequence far too much room to hide in.
const MIN_WORD = 4;
const MIN_COVERAGE = 0.45;

export function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_/.,:]+/g, ' ')
    .trim();
}

const tokens = (text) => text.split(' ').filter(Boolean);

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
function tier(token, words, text) {
  if (words.includes(token)) return WORD;
  for (const word of words) {
    if (word.startsWith(token)) return PREFIX;
  }
  if (text.includes(token)) return SUBSTRING;

  if (token.length >= MIN_TYPO) {
    for (const word of words) {
      if (word.length >= MIN_WORD && word[0] === token[0] && withinOneEdit(token, word)) return TYPO;
    }
  }
  if (token.length >= MIN_SUBSEQUENCE) {
    for (const word of words) {
      if (
        word.length >= MIN_WORD &&
        word[0] === token[0] &&
        token.length / word.length >= MIN_COVERAGE &&
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
      keywords,
      keywordWords: tokens(keywords),
      desc,
      descWords: tokens(desc),
    };
  });
}

// Returns [{ item, score, fuzzy }] best first. `fuzzy` says the winning tier was
// a typo or a subsequence, i.e. nothing the user literally typed, so the UI can
// admit that rather than pretend it was an exact match.
export function search(query, index) {
  const wanted = tokens(normalize(query));
  if (wanted.length === 0) return [];

  const results = [];
  for (const entry of index) {
    let total = 0;
    let inName = 0;
    let fuzzy = false;

    for (const token of wanted) {
      const nameTier = tier(token, entry.nameWords, entry.name);
      const keywordTier = tier(token, entry.keywordWords, entry.keywords);
      const descTier = tier(token, entry.descWords, entry.desc);

      let best = NO_MATCH;
      let winning = NO_MATCH;
      if (nameTier !== NO_MATCH) {
        best = IN_NAME + nameTier;
        winning = nameTier;
      }
      if (keywordTier !== NO_MATCH && IN_KEYWORDS + keywordTier > best) {
        best = IN_KEYWORDS + keywordTier;
        winning = keywordTier;
      }
      if (descTier !== NO_MATCH && IN_DESC + descTier > best) {
        best = IN_DESC + descTier;
        winning = descTier;
      }

      if (best === NO_MATCH) {
        total = NO_MATCH;
        break;
      }
      if (nameTier !== NO_MATCH) inName += 1;
      if (winning === TYPO || winning === SUBSEQUENCE) fuzzy = true;
      total += best;
    }

    if (total !== NO_MATCH) {
      results.push({
        item: entry.item,
        score: total + (inName === wanted.length ? ALL_TOKENS_IN_NAME : 0),
        fuzzy,
      });
    }
  }

  // Ties keep their original order, so the list does not reshuffle between
  // keystrokes.
  return results.sort((a, b) => b.score - a.score);
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
