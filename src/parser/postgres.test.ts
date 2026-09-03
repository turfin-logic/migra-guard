import * as fs from 'fs';
import * as path from 'path';
import { PostgresParser } from './postgres';

test('a sibling directory sharing the project prefix is outside the boundary', () => {
  const sibling = fs.mkdtempSync(`${process.cwd()}-test-sibling-`);
  try {
    const file = path.join(sibling, '001.sql');
    fs.writeFileSync(file, 'CREATE TABLE customers (id INT);');
    expect(() => new PostgresParser().parseFile(file)).toThrow(/outside project directory/);
  } finally {
    fs.rmSync(sibling, { recursive: true, force: true });
  }
});
