import { Rule, Violation } from '../index';
import { ParsedStatement } from '../../parser/postgres';

export const dropTableRule: Rule = {
  id: 'PG001_DROP_TABLE',
  
  check(stmt: ParsedStatement): Violation | null {
    const ast = stmt.ast;
    
    if (ast && ast.type === 'drop' && ast.keyword === 'table') {
      const tableObj = ast.name && ast.name[0];
      const tableName = tableObj ? tableObj.table : null;
      
      if (!tableName) return null;

      // A directory is not evidence that a table is undeployed or empty.
      // Conservatively flag every DROP, including tables created earlier.
      return {
        ruleId: this.id,
        severity: 'critical',
        message: `DANGEROUS: Dropping table '${tableName}' can delete data and break queries. Verify deployment state, dependencies and recovery before executing.`
      };
    }
    
    return null;
  }
};
