const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('native polish dependencies are explicitly declared', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.dependencies['expo-haptics'], '~57.0.3');
  assert.equal(pkg.dependencies['expo-blur'], '~57.0.3');
  assert.equal(pkg.dependencies['react-native-svg'], '15.15.4');
});

test('bottom navigation uses native icons instead of text glyphs', () => {
  const app = fs.readFileSync(path.join(root, 'App.js'), 'utf8');
  assert.match(app, /NativeTabBar/);
  assert.doesNotMatch(app, /⌂|≡|◫|◔|＋/);
});

test('primary transaction surfaces use the shared native icon system', () => {
  const primitives = fs.readFileSync(path.join(root, 'src/components/AppPrimitives.js'), 'utf8');
  const overview = fs.readFileSync(path.join(root, 'src/screens/OverviewScreen.js'), 'utf8');
  const budget = fs.readFileSync(path.join(root, 'src/screens/BudgetScreen.js'), 'utf8');
  const add = fs.readFileSync(path.join(root, 'src/components/AddTransactionModal.js'), 'utf8');

  for (const source of [primitives, overview, budget, add]) {
    assert.match(source, /NativeIcon/);
  }

  assert.doesNotMatch(primitives, /categoryIcon\(/);
  assert.doesNotMatch(overview, /meta\?\.icon/);
  assert.doesNotMatch(budget, /\[name,emoji\]/);
  assert.doesNotMatch(add, /\[name,emoji\]/);
});

test('finance cards do not render fake non-interactive overflow controls', () => {
  const primitives = fs.readFileSync(path.join(root, 'src/components/AppPrimitives.js'), 'utf8');
  assert.doesNotMatch(primitives, /action='•••'/);
});

test('financial figures use tabular numerals and section alignment is flush', () => {
  const styles = fs.readFileSync(path.join(root, 'src/appStyles.js'), 'utf8');
  assert.match(styles, /fontVariant:\['tabular-nums'\]/);
  assert.doesNotMatch(styles, /sectionHead:\{[^}]*paddingLeft:12/);
});

test('main scrolling screens opt into native inset behavior', () => {
  for (const file of ['OverviewScreen.js','ActivityScreen.js','BudgetScreen.js','InsightsScreen.js']) {
    const source = fs.readFileSync(path.join(root, 'src/screens', file), 'utf8');
    assert.match(source, /contentInsetAdjustmentBehavior="automatic"/, file);
  }
});
