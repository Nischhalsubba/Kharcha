# Kharcha Phase 4 — Backup, export & safety

## Outcome
Kharcha users must be able to recover their financial history, move it to another device, and export it without weakening the app's local-first privacy model.

| Module | Responsibility | Depends on |
| --- | --- | --- |
| backup-format | Versioned backup envelope, deterministic checksum, validation, compatibility rules | Phase 1–3 normalizers |
| backup-restore | Full-state export/import, pre-restore safety snapshot, atomic-ish restore sequencing | backup-format, local stores |
| tabular-export | CSV transaction export with planning/Nepal fields | transactions |
| reports | Monthly human-readable report export | finance + planning analytics |
| data-management | Destructive-data safety, duplicate/import policies, reset flows | backup-restore |
| local-security | App lock, secure PIN/biometric preferences | platform secure storage |

Build order: backup-format → backup-restore → tabular export → reports → data management → local security.

Phase 4 starts with backup-format + backup-restore because data-loss recovery is the highest-risk gap.
