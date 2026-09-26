// Sensitive-data detection. The whole app is client-side, so nothing is ever
// uploaded; this exists to warn before a secret ends up in a shared URL or on
// screen in a screenshot. Patterns are deliberately broad and cheap.
interface Rule {
  label: string;
  re: RegExp;
}

const RULES: Rule[] = [
  { label: 'Private key block', re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/ },
  { label: 'Bearer token', re: /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/ },
  { label: 'Password assignment', re: /\b(?:password|passwd|pwd|pass)\s*[=:]\s*\S{3,}/i },
  { label: 'AWS secret key', re: /\bAWS_SECRET_ACCESS_KEY\b|aws_secret_access_key\s*[=:]/i },
  { label: 'Database URL with credentials', re: /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis):\/\/[^\s:@/]+:[^\s@/]+@/i },
  { label: 'API key assignment', re: /\b(?:api[_-]?key|secret[_-]?key|access[_-]?token)\s*[=:]\s*["']?[A-Za-z0-9._-]{16,}/i },
];

/** Names of the sensitive patterns found in the text (empty when clean). */
export function detectSensitive(text: string): string[] {
  if (!text) return [];
  const found: string[] = [];
  for (const rule of RULES) {
    if (rule.re.test(text) && !found.includes(rule.label)) found.push(rule.label);
  }
  return found;
}

/** Redact anything that looks sensitive, for logs or previews. */
export function redact(text: string): string {
  return RULES.reduce((acc, rule) => acc.replace(rule.re, '[redacted]'), text);
}
