# migra-guard

A zero-config linter for PostgreSQL migrations that stops you from accidentally locking up your production database.

I built this because I got tired of seeing production go down over a simple `ALTER TABLE` statement. 

If you run `ALTER TABLE users ADD COLUMN phone VARCHAR NOT NULL;` on a table with 5 million rows, Postgres slaps an Access Exclusive Lock on the table. Your API goes down. Support tickets flood in.

`migra-guard` catches this in your CI pipeline before the PR is even merged.

## The problem with other linters

Most SQL linters suffer from "context blindness." They just regex for keywords and flag *everything*. If you write a migration to create a temp table, and then drop it a few files later, a dumb linter will flag the `DROP TABLE` as a critical danger.

`migra-guard` is stateful. It parses the AST and reads your `.sql` files chronologically to understand what's actually happening in your PR. 

- Drop a table you just created in the same PR? Safe.
- Drop an existing production table? CI blocked.
- Add NOT NULL to a brand new table? Safe.
- Add NOT NULL to a prod table without a DEFAULT? CI blocked.

## Usage

Point it at a folder of raw `.sql` migrations (works great with Prisma's `--create-only` raw SQL output, or just manual migrations).

```bash
npx migra-guard check ./migrations
```

## Sponsorship

I maintain this solo. If this tool saves your engineering team from even a single 15-minute production outage, it's already paid for itself. 

If you use this at your company, consider [sponsoring the project](https://github.com/sponsors/turfin-logic) so I can justify spending weekends adding more complex AST rules.
