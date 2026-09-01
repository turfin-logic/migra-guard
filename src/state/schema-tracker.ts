export class SchemaTracker {
  private knownTables: Set<string>;

  constructor() {
    this.knownTables = new Set<string>();
  }

  /**
   * Register a table created in the current PR migration context.
   */
  public addTable(tableName: string) {
    this.knownTables.add(tableName.toLowerCase());
  }

  /**
   * Check if a table was created in the current context.
   * If false, we assume it's a pre-existing production table (Baseline).
   */
  public isEphemeral(tableName: string): boolean {
    return this.knownTables.has(tableName.toLowerCase());
  }

  /**
   * Process an AST node to extract state changes (e.g., CREATE TABLE)
   */
  public processAst(ast: any) {
    if (!ast || !ast.type) return;

    if (ast.type === 'create' && ast.keyword === 'table') {
      // Extract table name safely from node-sql-parser format
      const tableObj = ast.table && ast.table[0];
      if (tableObj && tableObj.table) {
        this.addTable(tableObj.table);
      }
    }
  }
}
