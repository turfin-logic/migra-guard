# migra-guard 🛡️

**The Automated Senior DBA for PostgreSQL migrations.**

> Catch dangerous SQL migrations (table locks, accidental drops, missing defaults) in your CI/CD pipeline *before* they bring down your production database.

---

## 😱 The 2 AM Horror Story
Your junior developer adds a new feature and includes this migration:
```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR NOT NULL;
```
It runs in 0.1 seconds on their local machine. They merge the PR. 

**What happens in production?** 
Because the `users` table has 5 million rows and the new column lacks a `DEFAULT`, PostgreSQL places an **Access Exclusive Lock** on the entire table. Your app goes down for 15 minutes. 500 Errors everywhere. Support tickets flood in. 

`migra-guard` prevents this. 

## 🚀 Why migra-guard? (The "Context-Aware" Linter)
Other SQL linters are dumb. They scream at you for dropping a table, even if you literally just created that table in the *same* Pull Request.

`migra-guard` uses a **Context-Aware Schema Tracker**. It reads your migrations chronologically and understands ephemeral state. 

✅ **Dropping a table you just created in this PR?** `migra-guard` says it's SAFE.
❌ **Dropping an existing production table?** `migra-guard` blocks the deployment.

## 🛠️ Usage

Simply run it against your raw `.sql` migrations folder (works beautifully with Prisma's `--create-only` raw SQL, or manual SQL migrations).

```bash
npx migra-guard check ./prisma/migrations
```

### Example Output
```
🔍 Scanning migrations...

✅ SAFE      001_init.sql
❌ [PG002_ADD_COLUMN_NOT_NULL] in 002_add_phone.sql
   DANGEROUS: Adding NOT NULL column 'phone' without DEFAULT to table 'users'. 
   This will lock the table while verifying constraints.

🚨 CRITICAL VIOLATIONS FOUND. Deployment blocked.
```

## 💼 For Companies (Sponsorship)
Downtime is expensive. If `migra-guard` catches a single bad migration and saves your team from a 15-minute production outage, it has paid for itself 100x over. 

Consider [sponsoring this project](https://github.com/sponsors/turfin-logic) to ensure your company's database edge-cases are prioritized.
