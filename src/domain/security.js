const DEFAULT_SECURITY_CONFIG = Object.freeze({
  enabled: false,
  biometricEnabled: false,
  lockAfterSeconds: 30,
});

const SUPPORTED_LOCK_TIMEOUTS = new Set([0, 30, 60, 300]);

function isValidPin(pin) {
  return /^\d{4,6}$/.test(String(pin ?? ''));
}

function normalizeSecurityConfig(config = {}) {
  return {
    enabled: config.enabled === true,
    biometricEnabled: config.biometricEnabled === true,
    lockAfterSeconds: SUPPORTED_LOCK_TIMEOUTS.has(config.lockAfterSeconds)
      ? config.lockAfterSeconds
      : DEFAULT_SECURITY_CONFIG.lockAfterSeconds,
  };
}

function shouldLockAfterBackground(backgroundAt, now = Date.now(), timeoutSeconds = DEFAULT_SECURITY_CONFIG.lockAfterSeconds) {
  if (!Number.isFinite(backgroundAt)) return false;
  const timeout = SUPPORTED_LOCK_TIMEOUTS.has(timeoutSeconds)
    ? timeoutSeconds
    : DEFAULT_SECURITY_CONFIG.lockAfterSeconds;
  if (timeout === 0) return true;
  return Math.max(0, Number(now) - backgroundAt) >= timeout * 1000;
}

function cooldownSecondsForFailures(failureCount) {
  const failures = Math.max(0, Math.trunc(Number(failureCount) || 0));
  if (failures >= 10) return 60;
  if (failures >= 5) return 30;
  return 0;
}

module.exports = {
  DEFAULT_SECURITY_CONFIG,
  SUPPORTED_LOCK_TIMEOUTS,
  isValidPin,
  normalizeSecurityConfig,
  shouldLockAfterBackground,
  cooldownSecondsForFailures,
};
