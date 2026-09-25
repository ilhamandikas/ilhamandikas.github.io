// A small SQL prettifier — uppercase keywords and line breaks at clauses.
const { tk } = window;

const input = document.querySelector('#sql-input');

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'LEFT JOIN', 'RIGHT JOIN',
  'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'JOIN', 'ON', 'AND', 'OR', 'UNION ALL',
  'UNION', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'WITH', 'AS', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'INTO', 'DISTINCT', 'ASC', 'DESC', 'NOT', 'NULL', 'IS', 'LIKE',
];

const BREAKS = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'LEFT JOIN', 'RIGHT JOIN',
  'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'JOIN', 'UNION ALL', 'UNION',
  'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'WITH',
].sort((a, b) => b.length - a.length);

tk.transform({
  watch: input,
  output: document.querySelector('#sql-output'),
  status: document.querySelector('#sql-status'),
  fn: () => {
    let sql = input.value.replace(/\s+/g, ' ').trim();
    if (sql === '') return '';
    sql = sql.replace(/;+\s*$/g, '');

    for (const keyword of [...KEYWORDS].sort((a, b) => b.length - a.length)) {
      sql = sql.replace(new RegExp(`\\b${keyword.replace(/ /g, '\\s+')}\\b`, 'gi'), keyword);
    }
    for (const keyword of BREAKS) {
      sql = sql.replace(new RegExp(`\\s*\\b${keyword.replace(/ /g, '\\s+')}\\b`, 'g'), `\n${keyword}`);
    }
    return `${sql.trim()};`;
  },
});
