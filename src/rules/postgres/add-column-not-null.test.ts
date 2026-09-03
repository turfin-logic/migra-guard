import { addColumnNotNullRule } from './add-column-not-null';
import { PostgresParser } from '../../parser/postgres';

describe('PG002: Add Column Not Null', () => {
  let parser: PostgresParser;

  beforeEach(() => {
    parser = new PostgresParser();
  });

  it('should flag NOT NULL without DEFAULT on an existing prod table', () => {
    const stmts = parser.parseSql('ALTER TABLE existing_table ADD COLUMN phone VARCHAR NOT NULL;');
    const violation = addColumnNotNullRule.check(stmts[0]);
    
    expect(violation).not.toBeNull();
    expect(violation?.severity).toBe('critical');
    expect(violation?.message).toMatch(/DANGEROUS/);
  });

  it('should PASS if NOT NULL has a DEFAULT', () => {
    const stmts = parser.parseSql("ALTER TABLE existing_table ADD COLUMN phone VARCHAR NOT NULL DEFAULT '000';");
    const violation = addColumnNotNullRule.check(stmts[0]);
    
    expect(violation).toBeNull();
  });

  it('flags a table created earlier because its data/deployment state is unknown', () => {
    // 1. Simulate creating table in this PR
    
    // 2. Try adding NOT NULL to it
    const stmts = parser.parseSql('ALTER TABLE new_table ADD COLUMN phone VARCHAR NOT NULL;');
    const violation = addColumnNotNullRule.check(stmts[0]);
    
    expect(violation).not.toBeNull();
  });
});
