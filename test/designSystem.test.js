const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('Kharcha uses light system chrome', () => {
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  assert.equal(app.expo.userInterfaceStyle, 'light');
});

test('core design tokens use the light finance palette', () => {
  const source = fs.readFileSync(path.join(root, 'src/constants.js'), 'utf8');
  assert.match(source, /bg: '#F7F8FA'/);
  assert.match(source, /surface: '#FFFFFF'/);
  assert.match(source, /text: '#101828'/);
  assert.match(source, /accent: '#0F766E'/);
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
