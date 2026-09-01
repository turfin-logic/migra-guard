import { addColumnNotNullRule } from './add-column-not-null';
import { SchemaTracker } from '../../state/schema-tracker';
import { PostgresParser } from '../../parser/postgres';

describe('PG002: Add Column Not Null', () => {
  let state: SchemaTracker;
  let parser: PostgresParser;

  beforeEach(() => {
    state = new SchemaTracker();
    parser = new PostgresParser();
  });

  it('should flag NOT NULL without DEFAULT on an existing prod table', () => {
    const stmts = parser.parseSql('ALTER TABLE existing_table ADD COLUMN phone VARCHAR NOT NULL;');
    const violation = addColumnNotNullRule.check(stmts[0], state);
    
    expect(violation).not.toBeNull();
    expect(violation?.severity).toBe('critical');
    expect(violation?.message).toMatch(/DANGEROUS/);
  });

  it('should PASS if NOT NULL has a DEFAULT', () => {
    const stmts = parser.parseSql("ALTER TABLE existing_table ADD COLUMN phone VARCHAR NOT NULL DEFAULT '000';");
    const violation = addColumnNotNullRule.check(stmts[0], state);
    
    expect(violation).toBeNull();
  });

  it('should PASS if table was created in the same PR (context aware)', () => {
    // 1. Simulate creating table in this PR
    state.addTable('new_table');
    
    // 2. Try adding NOT NULL to it
    const stmts = parser.parseSql('ALTER TABLE new_table ADD COLUMN phone VARCHAR NOT NULL;');
    const violation = addColumnNotNullRule.check(stmts[0], state);
    
    // Should be safe because the table is empty!
    expect(violation).toBeNull();
  });
});
