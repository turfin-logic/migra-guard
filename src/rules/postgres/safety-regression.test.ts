import { PostgresParser } from '../../parser/postgres';
import { dropTableRule } from './drop-table';
import { addColumnNotNullRule } from './add-column-not-null';

const parser = new PostgresParser();
function violations(sql: string) {
  return parser.parseSql(sql).flatMap(stmt => {
    return [dropTableRule.check(stmt), addColumnNotNullRule.check(stmt)].filter(Boolean);
  });
}

test('historical CREATE cannot exempt a production DROP', () => {
  expect(violations('CREATE TABLE customers (id INT); DROP TABLE customers;')).toHaveLength(1);
});
test('INSERT after CREATE does not exempt a NOT NULL addition', () => {
  expect(violations('CREATE TABLE customers (id INT); INSERT INTO customers VALUES (1); ALTER TABLE customers ADD COLUMN email TEXT NOT NULL;')).toHaveLength(1);
});
test('schema-qualified DROP is flagged', () => {
  expect(violations('DROP TABLE public.customers;')).toHaveLength(1);
});
test('ordinary CREATE has no covered violations', () => {
  expect(violations('CREATE TABLE customers (id INT);')).toHaveLength(0);
});
test('invalid SQL raises an error instead of producing a pass', () => {
  expect(() => violations('THIS IS NOT SQL')).toThrow();
});
