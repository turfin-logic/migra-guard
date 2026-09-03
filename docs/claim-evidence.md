# Claim evidence

Local verification snapshot: 3 September 2026. See GitHub Actions for subsequent remote results. Tests parse SQL and invoke the built CLI; they do not connect to a PostgreSQL deployment. Remote CI has not been executed for this revision.

| Claim | Code evidence | Test evidence | Status |
|---|---|---|---|
| DROP TABLE is flagged even after historical CREATE | `src/rules/postgres/drop-table.ts`; no state exemption | Parsed SQL regression and separate historical/new migration CLI files | VERIFIED |
| Adding NOT NULL without DEFAULT is flagged after INSERT | `add-column-not-null.ts`; no new-table exemption | CREATE + INSERT + ALTER regression | VERIFIED |
| Schema-qualified DROP is covered | Parser AST and DROP rule | `DROP TABLE public.customers` regression | VERIFIED |
| Empty or unparsable input is not a pass | `src/cli.ts`, exit 2 | Empty folder and bad SQL CLI tests | VERIFIED |
| Covered unsafe operations return exit 1 | CLI violation handling | Historical DROP CLI test | VERIFIED |
| Files cannot escape via a sibling path sharing a prefix | Real-path resolution and relative-path boundary in parser | Sibling directory regression | VERIFIED for tested case; hostile filesystem race/symlink matrix not exhaustively tested |
| A zero exit means safe deployment | Only two rules, no deployed state or data inspection | Test requires disclaimer in successful output | FALSE — removed |
| PostgreSQL semantics, lock durations and rollback safety are fully checked | Third-party parser, no database connection | No integration benchmark | UNSUPPORTED — not claimed |
| Clean install/build/typecheck/package checks work | Lockfile, build-first scripts, `dist/cli.js` | Node 24.20.0 / Windows checks | VERIFIED within that environment |
| Windows/Linux and Node 22/24 compatibility | Proposed CI matrix and engine declaration | Node 22 local run blocked by EPERM; remote matrix NOT EXECUTED | PARTIAL |

Intentional false positives are documented. Defaults evaluating to NULL and destructive operations other than the two covered forms require separate review. Resource bounds do not establish a hostile-input sandbox.
