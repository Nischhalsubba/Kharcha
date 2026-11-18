# Offline financial data integrity and recovery protocol

> Status: contributor review checklist, not a claim that the product has passed an audit. This document introduces review expectations; it does not change application behavior.

## Why this exists

Protect a Nepal-first local expense tracker's balances, obligations and export/restore workflows against silent data loss or double counting.

## Review rules

1. Define what constitutes an income, expense, wallet transfer, savings movement, recurring instance and obligation settlement. A wallet-to-wallet transfer must not increase overall spending or income.
2. Preserve original transaction IDs, timestamps, currency, wallet, category and recurrence association during export/restore. Restore retries must not duplicate transactions.
3. Use decimal-safe amounts for reporting; document rounding at display boundaries. Test NPR grouping and local date/calendar display without rewriting the original timestamp.
4. Keep private data and notification scheduling on-device unless the user explicitly enables a supported sharing action. Do not put financial details in error logs, screenshots or test fixtures.
5. For destructive operations (wallet deletion, import replace, recurrence migration), document what will be removed, where backups live, confirmation and an undo/recovery route.

## Verification

From the repository root run `npm test`. In a controlled test device, create transfers, partial repayments, repeating rules and due-date reminders; export, reinstall/restore and compare entry IDs, per-wallet totals, obligations, savings goals and scheduled-reminder counts. Exercise airplane mode, denied notifications and interrupted import.

## Required evidence in a change request

PR: sample anonymized dataset; precise opening/closing balances; a conservation-of-funds table; idempotency test results; device/OS; screenshots of recovery messaging; unsolved edge cases.

## Rollback and incident response

Stop a faulty migration, retain an untouched pre-migration backup, revert the release and provide a documented repeatable re-import path. Never claim a restore succeeded before reconciliation.

## Acceptance criteria

- [ ] The change addresses a stated user or maintainer risk.
- [ ] Evidence and source-of-truth references are attached or explicitly marked unavailable.
- [ ] Relevant automated checks are reported with actual outcomes; unrun checks are not marked passing.
- [ ] Negative, failure and recovery states are accounted for.
- [ ] A reviewer can understand what changed, remaining risk and how to revert it.

Document owner: repository maintainers. Review this checklist when workflows, dependencies or public claims materially change.
