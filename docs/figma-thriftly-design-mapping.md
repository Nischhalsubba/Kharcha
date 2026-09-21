# Figma Thriftly UI kit → Kharcha implementation map

Source file: `wlUzmBSQTWniOXYct2VapT`

The Figma kit is used as a visual/design-system reference. Kharcha keeps its own Nepal-first content, data model, terminology, permissions, and finance logic.

## Foundations extracted
- Canvas: `#F3F3F3`
- Surface: `#FFFFFF`
- Primary text: `#262730`
- Secondary text: `#7B7D8E`
- Strong secondary: `#5A5D72`
- Divider/border: `#EFEFF1`, strong border `#CCCDD3`
- Primary blue: `#1F6FEB`
- Success: `#40C79A`
- Expense/error: `#F26969`
- Warning: `#F7B13C`
- Card radius: 12
- Pill radius: 99
- Main spacing rhythm: 4 / 8 / 12 / 16 / 20 / 24
- Main typography: Inter-style 12 / 14 / 16 / 20 / 24 with regular/medium/semibold weights
- Floating navigation: dark `#262730` capsule, active `#32333F`

## 20 supplied nodes
- [x] `25021:719` — Spending → Kharcha Overview/Spending shell
- [x] `25021:1075` — Transaction Record → Activity screen
- [x] `25021:2292` — Transaction Record Details → transaction detail sheet
- [x] `25021:2449` — Breakdown & budget (Expenses) → Budget > Expenses
- [x] `25021:3122` — Breakdown & budget (Income) → Budget > Income
- [x] `25021:2764` — Breakdown & budget (Budget) → Budget > Budget
- [x] `25021:3436` — Breakdown & budget (Scroll Down) → category/transaction drill-down
- [x] `25021:1657` — Budget Management → budget manager
- [x] `25021:2150` — Monthly income management → income planning editor
- [x] `25021:2239` — Monthly budget management → monthly budget editor
- [x] `25021:1744` — Add Category management → category creation state
- [x] `25021:1974` — Add Category selected state → category creation confirmation state
- [x] `25021:1191` — Reports → Insights/Reports
- [x] `25021:1511` — Repeated transaction → recurring transaction manager
- [x] `25021:3610` — reference label: Spending
- [x] `25021:3614` — reference label: Transaction Record
- [x] `25021:3630` — reference label: Breakdown & budget
- [x] `25021:3622` — reference label: Reports
- [x] `25021:3618` — reference label: Repeated transaction
- [x] `25021:3626` — reference label: Creating a Budget

## Delivery batches
1. **Batch 1** — foundations, app shell, Spending, Transaction Record/Details, label atoms.
2. **Batch 2** — Breakdown & budget variants + budget-management variants.
3. **Batch 3** — Reports + Repeated transaction + cross-screen polish and release version bump.

Every batch must pass domain tests, dependency audit, Expo configuration validation and Android JS bundling before merge.


### Batch 2 implementation note
The nine budget references are implemented as one navigable Kharcha flow instead of duplicated routes: Breakdown tabs (Expenses / Budget / Income), category drill-down, Budget Management, monthly-income view, monthly-budget editor, category selector, and category-budget editor. Values come from existing Kharcha transactions, monthly budget, and category-budget settings.


### Batch 3 implementation note
Reports now follows the supplied cash-flow/category/income/transfer hierarchy using real Kharcha data and existing smart insights. Repeated transaction is a grouped manager for active weekly/monthly rules plus inactive rules, with the existing rule-creation form behind Add.

**All 20 supplied Figma references are now represented in the Kharcha design-system migration.**
