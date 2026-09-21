import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
const {
  DEFAULT_SECURITY_CONFIG,
  isValidPin,
  normalizeSecurityConfig,
} = require('../domain/security');

const CONFIG_KEY = 'kharcha.security.config.v1';
const PIN_KEY = 'kharcha.security.pin.v1';
const STORE_OPTIONS = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

async function hashPin(pin, salt) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}:kharcha-app-lock-v1`,
  );
}

async function readPinRecord() {
  const raw = await SecureStore.getItemAsync(PIN_KEY, STORE_OPTIONS);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw);
    if (!record?.salt || !record?.hash || record.version !== 1) return null;
    return record;
  } catch {
    return null;
  }
}

export async function getSecurityConfig() {
  const raw = await SecureStore.getItemAsync(CONFIG_KEY, STORE_OPTIONS);
  if (!raw) return DEFAULT_SECURITY_CONFIG;
  try {
    const config = normalizeSecurityConfig(JSON.parse(raw));
    if (config.enabled && !(await readPinRecord())) return DEFAULT_SECURITY_CONFIG;
    return config;
  } catch {
    return DEFAULT_SECURITY_CONFIG;
  }
}

async function saveSecurityConfig(config) {
  const normalized = normalizeSecurityConfig(config);
  await SecureStore.setItemAsync(CONFIG_KEY, JSON.stringify(normalized), STORE_OPTIONS);
  return normalized;
}

async function writePinRecord(pin) {
  if (!isValidPin(pin)) throw new Error('Use a 4 to 6 digit PIN.');
  const salt = Crypto.randomUUID();
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(
    PIN_KEY,
    JSON.stringify({ version: 1, salt, hash }),
    STORE_OPTIONS,
  );
}

export async function enablePinLock(pin) {
  await writePinRecord(pin);
  return saveSecurityConfig({
    ...DEFAULT_SECURITY_CONFIG,
    enabled: true,
  });
}

export async function updatePin(pin) {
  const config = await getSecurityConfig();
  if (!config.enabled) throw new Error('App lock is not enabled.');
  await writePinRecord(pin);
  return config;
}

export async function verifyPin(pin) {
  if (!isValidPin(pin)) return false;
  const record = await readPinRecord();
  if (!record) return false;
  const candidate = await hashPin(pin, record.salt);
  return candidate === record.hash;
}

export async function disableAppLock() {
  const disabled = await saveSecurityConfig(DEFAULT_SECURITY_CONFIG);
  await SecureStore.deleteItemAsync(PIN_KEY, STORE_OPTIONS);
  return disabled;
}

export async function getBiometricAvailability() {
  try {
    const [hardware, enrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return Boolean(hardware && enrolled);
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled) {
  const config = await getSecurityConfig();
  if (!config.enabled) throw new Error('Enable PIN lock before biometrics.');
  if (enabled && !(await getBiometricAvailability())) {
    throw new Error('No enrolled biometric authentication is available on this device.');
  }
  return saveSecurityConfig({ ...config, biometricEnabled: enabled === true });
}

export async function setLockAfterSeconds(seconds) {
  const config = await getSecurityConfig();
  if (!config.enabled) throw new Error('Enable app lock first.');
  return saveSecurityConfig({ ...config, lockAfterSeconds: seconds });
}

export async function authenticateBiometric() {
  if (!(await getBiometricAvailability())) {
    return { success: false, error: 'not_available' };
  }
  return LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock Kharcha',
    cancelLabel: 'Use PIN',
    fallbackLabel: 'Use PIN',
    disableDeviceFallback: true,
    biometricsSecurityLevel: 'strong',
  });
}
