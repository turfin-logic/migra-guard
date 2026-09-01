# migra-guard 🛡️

**The "Cover Your Ass" (CYA) SQL Linter for PostgreSQL.**

Let’s be brutally honest. As a developer, you don’t fear database downtime. You fear the Post-Mortem incident meeting where you have to explain to the CTO why your simple `ALTER TABLE` statement locked up the production database for 20 minutes. 

As a Tech Lead, you can't manually review every single SQL migration from junior developers. You need an automated system to catch PostgreSQL lock quirks *before* they merge, so you don't spend your weekend fixing outages.

`migra-guard` is an automated Senior DBA that lives in your CI pipeline. It protects your uptime, and more importantly, it protects your ego.

## The "Context-Aware" Difference (No Alert Fatigue)

Most SQL linters are dumb. They regex for keywords like `DROP` and throw false positives everywhere. If a developer creates a temporary table in a PR and drops it in the very next file, a dumb linter blocks the CI. This causes developers to ignore the linter entirely.

`migra-guard` uses a stateful AST (Abstract Syntax Tree) engine. It tracks the chronological state of your migrations.

- **Drop an ephemeral table created in the same PR?** `migra-guard` knows it's empty. It stays quiet. (SAFE)
- **Add NOT NULL to a brand new table?** Safe.
- **Drop an existing production table?** CI blocked.
- **Add NOT NULL to a prod table without a DEFAULT?** (Which forces Postgres into an Access Exclusive Lock). CI blocked.

## Usage

Point it at your raw `.sql` migrations folder (works beautifully with manual migrations or Prisma's `--create-only` output).

```bash
npx migra-guard check ./migrations
```

**Example Output:**
```
🔍 Scanning migrations...

✅ SAFE      001_init.sql
❌ [PG002_ADD_COLUMN_NOT_NULL] in 002_add_phone.sql
   DANGEROUS: Adding NOT NULL column 'phone' without DEFAULT to table 'users'. 
   This will fail if the table has existing rows and locks the table while verifying constraints.

🚨 CRITICAL VIOLATIONS FOUND. Deployment blocked.
```

## Sponsorship (The Ultimate Insurance Policy)

I maintain this project solo. If `migra-guard` catches a single bad migration and saves your engineering team from a 15-minute production outage, it has paid for itself 100x over. 

If you use this at your company, tell your manager to [sponsor the project](https://github.com/sponsors/turfin-logic). It's cheaper than a Senior DBA, and it's the best insurance policy your team can buy against human error.
