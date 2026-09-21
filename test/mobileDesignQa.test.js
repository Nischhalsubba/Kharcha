const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('mobile shell uses react-native-safe-area-context instead of core SafeAreaView', () => {
  const source = fs.readFileSync(path.join(root, 'App.js'), 'utf8');

  assert.match(source, /from ['"]react-native-safe-area-context['"]/);
  assert.match(source, /SafeAreaProvider/);
  assert.match(source, /edges=\{\['top','left','right','bottom'\]\}/);
  assert.doesNotMatch(
    source,
    /import\s*\{[^}]*SafeAreaView[^}]*\}\s*from\s*['"]react-native['"]/,
  );
});

test('Expo config is wired to the supplied Kharcha brand assets', () => {
  const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  assert.equal(app.expo.icon, './assets/images/icon.png');
  assert.equal(app.expo.ios.icon, './assets/images/icon.png');
  assert.equal(app.expo.android.icon, './assets/images/icon.png');
  assert.equal(app.expo.android.adaptiveIcon.foregroundImage, './assets/images/adaptive-icon-foreground.png');
  assert.equal(app.expo.android.adaptiveIcon.monochromeImage, './assets/images/adaptive-icon-monochrome.png');
  assert.equal(app.expo.android.adaptiveIcon.backgroundColor, '#F7FAFF');
  assert.equal(app.expo.web.favicon, './assets/images/favicon.png');

  const splash = app.expo.plugins.find((plugin) => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen');
  assert.ok(splash, 'expo-splash-screen plugin is configured');
  assert.equal(splash[1].image, './assets/images/splash-icon.png');
  assert.equal(splash[1].backgroundColor, '#F7FAFF');

  assert.equal(pkg.dependencies['expo-splash-screen'], '~57.0.9');
  assert.equal(pkg.dependencies['react-native-safe-area-context'], '~5.7.0');
});

test('brand accent is centralized and matches the supplied asset pack', () => {
  const source = fs.readFileSync(path.join(root, 'src/constants.js'), 'utf8');

  assert.match(source, /primary:\s*'#0074FC'/);
  assert.match(source, /iconBackground:\s*'#F7FAFF'/);
  assert.match(source, /dark:\s*'#0F172A'/);
  assert.match(source, /text:\s*'#111827'/);
  assert.match(source, /primary:\s*BRAND_TOKENS\.primary/);
});

test('high-use bottom sheets use the same radius and typography contract', () => {
  const components = [
    'AddTransactionModal.js',
    'CategoryModal.js',
    'TransferModal.js',
    'RecurringModal.js',
    'NepalSettingsModal.js',
    'DataSafetyModal.js',
    'DataManagementModal.js',
    'CsvExportModal.js',
    'MonthlyReportModal.js',
    'RemittanceModal.js',
    'UdhaaroModal.js',
    'EventBudgetModal.js',
    'ObligationModal.js',
    'SavingsGoalModal.js',
    'HouseholdBudgetModal.js',
    'WalletModal.js',
    'ReminderSettingsModal.js',
    'SecuritySettingsModal.js',
  ];

  for (const filename of components) {
    const source = fs.readFileSync(path.join(root, 'src/components', filename), 'utf8');
    assert.doesNotMatch(source, /borderTopLeftRadius:28|borderTopRightRadius:28/, filename);
    assert.doesNotMatch(source, /fontWeight:['"](?:700|800|900)['"]/, filename);
  }
});


test('lock screen follows the same typography and control-radius system', () => {
  const source = fs.readFileSync(path.join(root, 'src/components/LockScreen.js'), 'utf8');
  assert.doesNotMatch(source, /fontWeight:['"](?:700|800|900)['"]/);
  assert.doesNotMatch(source, /borderRadius:(?:14|16|20)/);
  assert.match(source, /height:48/);
});
