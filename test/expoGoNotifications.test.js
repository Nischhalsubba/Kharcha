const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('notification reminders do not statically import expo-notifications on Android Expo Go', () => {
  const source = fs.readFileSync(path.join(root, 'src/services/notificationReminders.js'), 'utf8');

  assert.doesNotMatch(source, /import\s+\*\s+as\s+Notifications\s+from\s+['"]expo-notifications['"]/);
  assert.match(source, /executionEnvironment/);
  assert.match(source, /storeClient/);
  assert.match(source, /require\(['"]expo-notifications['"]\)/);
});

test('Expo Go notification fallback is explicit and non-fatal', () => {
  const source = fs.readFileSync(path.join(root, 'src/services/notificationReminders.js'), 'utf8');

  assert.match(source, /isReminderRuntimeSupported/);
  assert.match(source, /unsupportedRuntime/);
  assert.match(source, /scheduled:\s*0/);
  assert.match(source, /permissionGranted:\s*false/);
});
