import { Rule, Violation } from '../index';
import { ParsedStatement } from '../../parser/postgres';

export const addColumnNotNullRule: Rule = {
  id: 'PG002_ADD_COLUMN_NOT_NULL',
  
  check(stmt: ParsedStatement): Violation | null {
    const ast = stmt.ast;
    
    // node-sql-parser structure for ALTER TABLE ... ADD COLUMN
    if (ast && ast.type === 'alter' && ast.expr) {
      // It can be an array of ALTER expressions
      const exprs = Array.isArray(ast.expr) ? ast.expr : [ast.expr];
      
      for (const expr of exprs) {
        if (expr.action === 'add' && expr.resource === 'column') {
          // Check nullable property natively exposed by node-sql-parser
          const isNotNull = expr.nullable && expr.nullable.type === 'not null';
          const hasDefault = expr.default_val !== null && expr.default_val !== undefined;

          if (isNotNull && !hasDefault) {
            const tableObj = ast.table && ast.table[0];
            const tableName = tableObj ? tableObj.table : 'unknown';
            
            // Extract column name safely
            const colName = expr.column?.column?.expr?.value || 'unknown_column';

            return {
              ruleId: this.id,
              severity: 'critical',
              message: `DANGEROUS: Adding NOT NULL column '${colName}' without DEFAULT to table '${tableName}'. This will fail if the table has existing rows and locks the table while verifying constraints.`
            };
          }
        }
      }
    }
    
    return null;
  }
};
