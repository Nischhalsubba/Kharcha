# Spec: Phase 4.1 Backup & Restore

## Objective
Export every Kharcha state store into one portable file and restore it safely on another device or after data loss.

## State in scope
- transactions
- settings / wallets / categories / recurring rules / budgets
- Nepal data: Udhaaro and event budgets
- Phase 3 planning: obligations, savings goals, household budgets

## Backup contract
- MIME: `application/json`
- extension: `.kharcha.json`
- schema version: `1`
- envelope contains app metadata, export timestamp, payload, and deterministic checksum
- checksum detects accidental edits/corruption; it is an integrity check, not encryption/authentication
- future schema versions must fail closed until a migration is implemented

## Restore safety
1. Parse JSON.
2. Validate product marker and schema version.
3. Verify checksum.
4. Normalize every payload section using the existing Phase 1–3 normalizers.
5. Reject malformed or structurally unsafe backups before writing any user data.
6. Create an in-memory pre-restore snapshot of the current stores.
7. Write all normalized stores.
8. If a write fails, restore the pre-restore snapshot best-effort and report failure.
9. Reload app state from the successful normalized restore result.

## Transport
- Android/iOS export: create a file in app cache and open the system share sheet.
- Import: system document picker with `copyToCacheDirectory: true`, then read the selected file.
- No cloud account or Kharcha server required.

## Success criteria
- Round trip preserves all Phase 1–3 state after normalization.
- Corrupted checksum is rejected.
- Unknown future schema is rejected.
- Invalid payload is rejected before storage writes.
- Restore failure attempts rollback to the pre-restore snapshot.
- Existing users need no migration action.

## Verification
- unit tests for envelope creation/validation/round-trip/corruption/future version
- full existing Node suite
- Expo config check
- Android Metro export in GitHub Actions
