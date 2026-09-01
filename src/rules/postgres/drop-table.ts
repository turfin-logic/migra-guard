import { Rule, Violation } from '../index';
import { ParsedStatement } from '../../parser/postgres';
import { SchemaTracker } from '../../state/schema-tracker';

export const dropTableRule: Rule = {
  id: 'PG001_DROP_TABLE',
  
  check(stmt: ParsedStatement, state: SchemaTracker): Violation | null {
    const ast = stmt.ast;
    
    if (ast && ast.type === 'drop' && ast.keyword === 'table') {
      const tableObj = ast.name && ast.name[0];
      const tableName = tableObj ? tableObj.table : null;
      
      if (!tableName) return null;

      // CONTEXT AWARENESS: If the table was created in this PR, it's safe to drop
      if (state.isEphemeral(tableName)) {
        return null;
      }

      // Otherwise, assume it's a production table
      return {
        ruleId: this.id,
        severity: 'critical',
        message: `DANGEROUS: Dropping table '${tableName}'. This causes immediate data loss and breaks queries. Ensure the table is no longer used by any running application code.`
      };
    }
    
    return null;
  }
};
