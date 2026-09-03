# migra-guard

[![CI](https://github.com/turfin-logic/migra-guard/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/turfin-logic/migra-guard/actions/workflows/test.yml)

Experimental PostgreSQL migration linter with two conservative rules: flag DROP TABLE and ADD COLUMN NOT NULL without a default. It does not connect to a database, estimate locks, know deployed migration state or guarantee safe deployment.

## Run

Requires Node.js 22.14+ and npm.

```sh
git clone https://github.com/turfin-logic/migra-guard.git
cd migra-guard
npm ci --ignore-scripts
npm run build
node dist/cli.js --help
node dist/cli.js check ./test-migrations
```

The included migration folder deliberately contains dangerous examples; a nonzero result is expected. Input must be a directory within the current project, including real-path resolution of files. Only its immediate `.sql` files are scanned, in lexical order. Use zero-padded names. Empty input and parser failures are incomplete scans, not passing checks.

| Exit | Meaning |
|---|---|
| 0 | No violations of the two covered rules |
| 1 | Covered operation requires human review |
| 2 | Input error or incomplete parsing |

## Conservative policy

Every DROP TABLE is flagged, even after a CREATE in the same input. Every NOT NULL addition without DEFAULT is flagged, even on an apparently new table. A migration directory alone cannot prove that a table is undeployed or empty. This intentionally produces false positives; review them with database context.

For example, `CREATE TABLE customers (id INT); DROP TABLE customers;` produces a violation. Creating and populating a table before adding a required column also produces a violation. Ordinary CREATE TABLE has no covered violation; that says nothing about application compatibility or deployment safety.

## Verify

```sh
npm test
npm run typecheck
npm audit --audit-level=high
npm pack --dry-run
```

Tests exercise rules with parsed SQL and invoke the built CLI in temporary fixture directories. Cases include historical CREATE followed by DROP, inserted data before NOT NULL, schema-qualified DROP, empty directories and parse errors. The CI workflow targets Windows/Linux and Node 22.14/24.

## Scope

SQL parsing uses `node-sql-parser`; PostgreSQL syntax it does not support fails the scan. No full PostgreSQL semantic analysis is claimed. Other destructive operations, migration rollback correctness, defaults that evaluate to NULL, lock duration, multi-statement business invariants and application compatibility require separate review. Files have size bounds; these are resource limits, not a hostile-input sandbox.

Code separates CLI input/reporting, parser and rules. No state-based safety exemptions are inferred. [Claim evidence](docs/claim-evidence.md). ISC license, matching existing package metadata.
