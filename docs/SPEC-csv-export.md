# Spec: Phase 4.2 CSV / Excel-compatible export

## Goal
Let a Kharcha user export transaction history to a spreadsheet without sending financial data to a Kharcha server.

## Export scopes
- all transactions
- current calendar month
- inclusive custom AD date range

## Format
- UTF-8 CSV with BOM for reliable Nepali text display in Microsoft Excel
- one header row
- transactions sorted oldest to newest
- filename includes scope and export date

## Columns
- Date AD
- Date BS
- Type
- Amount NPR
- Category
- Note
- Wallet
- Payment Method
- Event
- Household Budget
- Household Member
- Remittance Sender
- Remittance Country
- Remittance Original Currency
- Remittance Original Amount
- Remittance Fee NPR
- Udhaaro Record ID
- Obligation ID
- Savings Goal
- Savings Direction
- Recurring ID

## Safety
- validate real ISO calendar dates for custom ranges
- quote CSV values containing commas, quotes, or line breaks
- neutralize spreadsheet formula prefixes (=, +, -, @) in user-controlled text
- no background upload or network transport
- sharing occurs only through the user-invoked OS share sheet

## Acceptance
- Nepali text remains readable in Excel-compatible readers
- remittance fees use the persisted `remittance.fees` field
- empty ranges are reported rather than sharing an empty file
- full test/audit/Expo-config/Android-bundle CI must pass before merge
