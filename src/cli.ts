#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';

const program = new Command();

program
  .name('migra-guard')
  .description('Conservative PostgreSQL migration linter with two rules')
  .version('1.0.0');

program
  .command('check')
  .description('Lint SQL migration files for dangerous operations')
  .argument('<path>', 'Directory containing .sql files')
  .action((targetPath) => {
    const fullPath = path.resolve(process.cwd(), targetPath);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
      console.error(chalk.red(`\n❌ Directory not found: ${fullPath}\n`));
      process.exit(2);
    }
    
    console.log(chalk.blue(`\n🔍 Scanning migrations in: ${fullPath}\n`));
    
    // Import components inline for the CLI
    const { PostgresParser } = require('./parser/postgres');
    const { dropTableRule } = require('./rules/postgres/drop-table');
    const { addColumnNotNullRule } = require('./rules/postgres/add-column-not-null');

    const parser = new PostgresParser();
    const rules = [dropTableRule, addColumnNotNullRule];

    let hasCritical = false;
    let fileCount = 0;
    let hasErrors = false;

    // Get all SQL files sorted
    const files = fs.readdirSync(fullPath)
      .filter(f => f.endsWith('.sql'))
      .sort(); // Lexical order; use zero-padded migration names.

    if (files.length === 0) {
      console.error('No SQL files found; nothing was checked.');
      process.exit(2);
    }

    for (const file of files) {
      const filePath = path.join(fullPath, file);
      try {
        const stmts = parser.parseFile(filePath);
        fileCount++;
        
        let fileHasViolations = false;

        for (const stmt of stmts) {
          // Apply conservative rules independently of migration history.
          for (const rule of rules) {
            const violation = rule.check(stmt);
            if (violation) {
              fileHasViolations = true;
              if (violation.severity === 'critical') hasCritical = true;
              
              const color = violation.severity === 'critical' ? chalk.red : chalk.yellow;
              const icon = violation.severity === 'critical' ? '❌' : '⚠️';
              
              console.log(color(`${icon} [${rule.id}] in ${file}`));
              console.log(`   ${violation.message}`);
              console.log(chalk.gray(`   SQL snippet: ${stmt.sql.replace(/\\n/g, ' ')}\n`));
            }
          }
        }

        if (!fileHasViolations) {
          console.log(chalk.green(`No covered violations: ${file}`));
        }

      } catch (err: any) {
        console.log(chalk.red(`❌ ERROR parsing ${file}: ${err.message}`));
        hasErrors = true;
      }
    }

    console.log(chalk.blue(`\n📊 Scan complete: ${fileCount} files checked.`));
    
    if (hasErrors) {
      console.error('Scan incomplete: input or parsing errors.');
      process.exit(2);
    } else if (hasCritical) {
      console.log(chalk.red.bold(`\nPotentially destructive operations require review.\n`));
      process.exit(1);
    } else {
      console.log(chalk.green.bold(`\nNo violations of the two implemented rules. This is not a deployment safety guarantee.\n`));
      process.exit(0);
    }
  });

program.parse(process.argv);
