import type { Risk } from '../types';
import { RISK_LABEL } from '../data/categories';

const STYLES: Record<Risk, string> = {
  safe: 'border-safe/40 text-safe',
  change: 'border-change/40 text-change',
  dangerous: 'border-danger/40 text-danger',
};

export function RiskBadge({ risk }: { risk: Risk }) {
  return <span className={`lo-chip ${STYLES[risk]}`}>{RISK_LABEL[risk]}</span>;
}
