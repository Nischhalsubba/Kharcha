const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root=path.resolve(__dirname,'..');

test('all supplied Figma references are marked implemented',()=>{
  const mapping=fs.readFileSync(path.join(root,'docs/figma-thriftly-design-mapping.md'),'utf8');
  assert.doesNotMatch(mapping,/- \[ \] `25021:/);
  const completed=(mapping.match(/- \[x\] `25021:/g)||[]).length;
  assert.equal(completed,20);
});

test('Reports and recurring manager use Kharcha data instead of placeholder stores',()=>{
  const reports=fs.readFileSync(path.join(root,'src/screens/InsightsScreen.js'),'utf8');
  const recurring=fs.readFileSync(path.join(root,'src/components/RecurringManagerModal.js'),'utf8');
  assert.match(reports,/Cash Flow/);
  assert.match(reports,/Income Breakdown/);
  assert.match(reports,/transactions/);
  assert.match(recurring,/Weekly/);
  assert.match(recurring,/Monthly/);
  assert.match(recurring,/Inactive/);
  assert.doesNotMatch(reports,/fetch\(|AsyncStorage|SQLite/);
});

test('Figma migration release version is aligned across Expo and package metadata',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  const app=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8'));
  assert.equal(pkg.version,'1.12.0');
  assert.equal(app.expo.version,'1.12.0');
});
