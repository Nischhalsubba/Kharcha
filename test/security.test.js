const test = require('node:test');
const assert = require('node:assert/strict');
const {
  DEFAULT_SECURITY_CONFIG,
  isValidPin,
  normalizeSecurityConfig,
  shouldLockAfterBackground,
  cooldownSecondsForFailures,
} = require('../src/domain/security');

test('PIN accepts only 4 to 6 numeric digits', () => {
  assert.equal(isValidPin('1234'), true);
  assert.equal(isValidPin('123456'), true);
  assert.equal(isValidPin('123'), false);
  assert.equal(isValidPin('1234567'), false);
  assert.equal(isValidPin('12a4'), false);
  assert.equal(isValidPin(' 1234 '), false);
});

test('security config normalizes unknown values to safe defaults', () => {
  assert.deepEqual(normalizeSecurityConfig(), DEFAULT_SECURITY_CONFIG);
  assert.deepEqual(normalizeSecurityConfig({
    enabled: true,
    biometricEnabled: true,
    lockAfterSeconds: 60,
  }), {
    enabled: true,
    biometricEnabled: true,
    lockAfterSeconds: 60,
  });
  assert.deepEqual(normalizeSecurityConfig({
    enabled: 'yes',
    biometricEnabled: 1,
    lockAfterSeconds: 999,
  }), DEFAULT_SECURITY_CONFIG);
});

test('lock timeout accepts only supported choices', () => {
  for (const seconds of [0, 30, 60, 300]) {
    assert.equal(normalizeSecurityConfig({ enabled: true, lockAfterSeconds: seconds }).lockAfterSeconds, seconds);
  }
});

test('app locks immediately after background when timeout is zero', () => {
  assert.equal(shouldLockAfterBackground(1000, 1001, 0), true);
});

test('app locks only after configured background timeout', () => {
  assert.equal(shouldLockAfterBackground(1000, 30999, 30), false);
  assert.equal(shouldLockAfterBackground(1000, 31000, 30), true);
  assert.equal(shouldLockAfterBackground(null, 31000, 30), false);
});

test('five failed PIN attempts trigger a short cooldown', () => {
  assert.equal(cooldownSecondsForFailures(0), 0);
  assert.equal(cooldownSecondsForFailures(4), 0);
  assert.equal(cooldownSecondsForFailures(5), 30);
  assert.equal(cooldownSecondsForFailures(9), 30);
  assert.equal(cooldownSecondsForFailures(10), 60);
});
