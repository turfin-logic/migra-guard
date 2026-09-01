import { Parser } from 'node-sql-parser';
import * as fs from 'fs';
import * as path from 'path';

export interface ParsedStatement {
  ast: any;
  sql: string;
}

export class PostgresParser {
  private parser: Parser;

  constructor() {
    this.parser = new Parser();
  }

  public parseFile(filePath: string): ParsedStatement[] {
    const cwd = process.cwd();
    const resolvedPath = path.resolve(cwd, filePath);
    
    // 1. Path Traversal Protection (LFI)
    if (!resolvedPath.startsWith(cwd)) {
      throw new Error(`SECURITY ERROR: Attempted path traversal outside project directory: ${resolvedPath}`);
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: ${resolvedPath}`);
    }

    // 2. Out of Memory (OOM) Protection: Max 5MB file
    const stats = fs.statSync(resolvedPath);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`SECURITY ERROR: File exceeds 5MB limit (${filePath})`);
    }

    const sqlContent = fs.readFileSync(resolvedPath, 'utf-8');
    
    // 3. ReDoS / AST Bomb Protection: Limit statement length
    if (sqlContent.length > 500000) {
      throw new Error(`SECURITY ERROR: SQL content too large for AST parsing (${filePath})`);
    }

    return this.parseSql(sqlContent);
  }

  public parseSql(sql: string): ParsedStatement[] {
    try {
      // Opt { database: 'postgresql' } tells the parser to use PG dialect rules
      const parseResult = this.parser.astify(sql, { database: 'postgresql' });
      
      const astArray = Array.isArray(parseResult) ? parseResult : [parseResult];
      
      return astArray.map(ast => ({
        ast,
        sql: sql.substring(0, 100) + '...' // Store snippet for reporting
      }));
    } catch (error: any) {
      throw new Error(`SQL Parsing Error: ${error.message}`);
    }
  }
}
