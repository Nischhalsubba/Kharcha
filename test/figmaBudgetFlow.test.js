const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root=path.resolve(__dirname,'..');

test('budget screen exposes the Figma breakdown and management states',()=>{
  const source=fs.readFileSync(path.join(root,'src/screens/BudgetScreen.js'),'utf8');
  for(const label of ['Breakdown & budget','Category Breakdown','Budget Management','Monthly Income','Monthly Budget','Add Category','Budget by Category']){
    assert.ok(source.includes(label), `missing ${label}`);
  }
  assert.match(source,/\['expense','budget','income'\]/);
  assert.match(source,/setView\('categoryEditor'\)/);
  assert.match(source,/setView\('detail'\)/);
});

test('budget flow reuses recorded Kharcha data instead of introducing a parallel finance store',()=>{
  const source=fs.readFileSync(path.join(root,'src/screens/BudgetScreen.js'),'utf8');
  assert.match(source,/transactions/);
  assert.match(source,/summary\.income/);
  assert.match(source,/settings\.categoryBudgets/);
  assert.doesNotMatch(source,/AsyncStorage|SQLite|fetch\(/);
});
