// A small, safe arithmetic expression evaluator (recursive descent, no eval).
const { tk } = window;

const CONSTANTS = { pi: Math.PI, e: Math.E, tau: Math.PI * 2 };
const FUNCTIONS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, round: Math.round, floor: Math.floor,
  ceil: Math.ceil, log: Math.log10, ln: Math.log, exp: Math.exp, sign: Math.sign,
  min: Math.min, max: Math.max, pow: Math.pow, hypot: Math.hypot,
};

function tokenize(source) {
  const tokens = source.match(/\d+\.?\d*|\.\d+|[a-zA-Z_]\w*|[+\-*/%^(),]/g) || [];
  const leftover = source.replace(/\s+/g, '').replace(/\d+\.?\d*|\.\d+|[a-zA-Z_]\w*|[+\-*/%^(),]/g, '');
  if (leftover) throw new Error(`Unexpected character "${leftover[0]}"`);
  return tokens;
}

function evaluate(source) {
  const tokens = tokenize(source);
  if (tokens.length === 0) return null;
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  const parseExpression = () => {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  };

  const parseTerm = () => {
    let value = parseUnary();
    while (['*', '/', '%'].includes(peek())) {
      const op = next();
      const rhs = parseUnary();
      if (op === '*') value *= rhs;
      else if (op === '/') value /= rhs;
      else value %= rhs;
    }
    return value;
  };

  const parseUnary = () => {
    if (peek() === '-') { next(); return -parseUnary(); }
    if (peek() === '+') { next(); return parseUnary(); }
    return parsePower();
  };

  const parsePower = () => {
    const base = parseAtom();
    if (peek() === '^') { next(); return base ** parsePower(); }
    return base;
  };

  const parseAtom = () => {
    const token = next();
    if (token === undefined) throw new Error('Unexpected end of expression');
    if (token === '(') {
      const value = parseExpression();
      if (next() !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }
    if (/^[\d.]/.test(token)) return parseFloat(token);
    const name = token.toLowerCase();
    if (name in CONSTANTS) return CONSTANTS[name];
    if (peek() === '(') {
      next();
      const args = [parseExpression()];
      while (peek() === ',') { next(); args.push(parseExpression()); }
      if (next() !== ')') throw new Error('Missing closing parenthesis');
      if (!(name in FUNCTIONS)) throw new Error(`Unknown function "${name}"`);
      return FUNCTIONS[name](...args);
    }
    throw new Error(`Unknown name "${token}"`);
  };

  const result = parseExpression();
  if (pos !== tokens.length) throw new Error(`Unexpected "${peek()}"`);
  if (!Number.isFinite(result)) throw new Error('Result is not a finite number');
  return result;
}

const input = document.querySelector('#calc-input');

tk.transform({
  watch: input,
  output: document.querySelector('#calc-output'),
  status: document.querySelector('#calc-status'),
  ok: 'Valid',
  fn: () => {
    const result = evaluate(input.value);
    return result === null ? '' : String(Number(result.toPrecision(12)));
  },
});
