const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Kharcha uses light system chrome', () => {
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.userInterfaceStyle, 'light');
});

test('core design tokens combine the Figma system with official Kharcha branding', () => {
  const source = fs.readFileSync(path.join(root, 'src/constants.js'), 'utf8');
  assert.match(source, /primary: '#0074FC'/);
  assert.match(source, /iconBackground: '#F7FAFF'/);
  assert.match(source, /dark: '#0F172A'/);
  assert.match(source, /text: '#111827'/);
  assert.match(source, /canvas: '#F3F3F3'/);
  assert.match(source, /surface: '#FFFFFF'/);
  assert.match(source, /text: BRAND_TOKENS\.text/);
  assert.match(source, /primary: BRAND_TOKENS\.primary/);
  assert.match(source, /success: '#40C79A'/);
  assert.match(source, /danger: '#F26969'/);
  assert.match(source, /nav: '#262730'/);
  assert.match(source, /card: 12/);
  assert.match(source, /pill: 99/);
});

test('bottom sheets no longer hard-code the legacy dark surface or dark accent text', () => {
  const components = [
    'AddTransactionModal.js',
    'CategoryModal.js',
    'DataSafetyModal.js',
    'EventBudgetModal.js',
    'HouseholdBudgetModal.js',
    'NepalSettingsModal.js',
    'ObligationModal.js',
    'RecurringModal.js',
    'RemittanceModal.js',
    'SavingsGoalModal.js',
    'UdhaaroModal.js',
    'WalletModal.js',
  ];
  for (const filename of components) {
    const source = fs.readFileSync(path.join(root, 'src/components', filename), 'utf8');
    assert.doesNotMatch(source, /#10161E/i, filename);
    assert.doesNotMatch(source, /#07130F/i, filename);
  }
});
