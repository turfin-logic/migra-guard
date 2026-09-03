import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let dir: string;
beforeEach(() => { dir = fs.mkdtempSync(path.join(process.cwd(), '.test-migrations-')); });
afterEach(() => { fs.rmSync(dir, { recursive: true, force: true }); });
function run() { return spawnSync(process.execPath, ['dist/cli.js', 'check', dir], { encoding: 'utf8' }); }
test('empty input is an incomplete scan', () => { expect(run().status).toBe(2); });
test('historical migration plus new DROP returns failure', () => {
  fs.writeFileSync(path.join(dir, '001.sql'), 'CREATE TABLE customers (id INT);');
  fs.writeFileSync(path.join(dir, '002.sql'), 'DROP TABLE customers;');
  expect(run().status).toBe(1);
});
test('parser failure is distinct from a completed lint', () => {
  fs.writeFileSync(path.join(dir, '001.sql'), 'BAD SQL');
  expect(run().status).toBe(2);
});
test('successful scan avoids deployment promises', () => {
  fs.writeFileSync(path.join(dir, '001.sql'), 'CREATE TABLE customers (id INT);');
  const result = run();
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('not a deployment safety guarantee');
});
