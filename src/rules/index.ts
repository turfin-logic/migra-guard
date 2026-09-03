import { ParsedStatement } from '../parser/postgres';

export interface Violation {
  ruleId: string;
  severity: 'critical' | 'warning';
  message: string;
}

export interface Rule {
  id: string;
  check(stmt: ParsedStatement): Violation | null;
}
