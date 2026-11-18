# Kharcha release and financial-data QA

Kharcha is a local-first Expo/React Native expense tracker. A polished screen is not sufficient evidence that a financial-data change is safe: balances, category totals, migrations, exports and restores need independent checks.

## Before changing finance behavior

- Identify the affected money flows: income, expense, transfer, savings, Udhaaro, EMI/loan, recurring transaction, reporting or household allocation.
- Declare whether the change modifies a persisted shape, calculations, display-only rounding or historical data.
- Use synthetic fixtures only. Never commit bank statements, authentic transactions, private backup files, keys, or personal identifiers.

## Core regression matrix

| Scenario | What must remain true |
| --- | --- |
| Wallet transfer | Transfer moves value between wallets and does not inflate net income or spending |
| Date handling | Canonical stored date remains AD \`YYYY-MM-DD\`; BS formatting is a view concern |
| Empty/zero values | Zero balances and missing optional values are distinguished; no NaN/Infinity displayed |
| Duplicate/repeated events | Recurring activity does not silently duplicate transactions |
| Backup/restore | Valid backups restore expected entities; malformed/incompatible input fails clearly without destroying the current dataset |
| Export | CSV/PDF includes the intended range; spreadsheet formula injection protections stay in place |
| Reminders | Permissions are requested only on opt-in; rescheduling avoids duplicate local notifications |
| App lock | Local authentication gates app access, but must not be described as full database encryption |
| Offline mode | Core local records remain usable without an internet connection |
| Accessibility | Keyboard/screen-reader labels, touch targets, error text, text scaling and color contrast stay understandable |

## Commands and device validation

From repository root:

~~~bash
npm install
npm test
npm start
~~~

Use \`npm run start:go:tunnel\` when the device cannot access the LAN server. \`npm run start:dev\` is for a custom development client, not Expo Go; the two QR targets are not interchangeable.

For native-only behavior, test on the relevant supported device/build. Do not report Face ID as verified through Expo Go, which does not support that native flow.

## Privacy boundary

The README documents local storage, no live bank integration, and no app-level SQLCipher encryption of the main transaction database. Do not imply a stronger security guarantee without a verified implementation and review. Notifications and exports are sensitive surfaces: check permission denial, canceled sharing and inadvertent data exposure.

## Release evidence

Attach the test command/result, device/OS/build type, migration scenario, synthetic sample reconciliation and any manual screenshots with redacted data. For changes affecting backups, demonstrate recovery from a failed or partial restore before merging.

## Rollback

Prefer a reversible change that retains readable historical records. For a migration failure, preserve original local data, publish a corrected migration and avoid destructive reset instructions. Halt the rollout if balances, exports or restore integrity cannot be demonstrated.
