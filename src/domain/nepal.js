const DEVANAGARI_DIGITS = ['०','१','२','३','४','५','६','७','८','९'];

function calendarCore() {
  return require('@inicrea/bikram-sambat-core');
}

function toNepaliDigits(value) {
  return String(value).replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}

function toLatinDigits(value) {
  return String(value).replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966));
}

function trimDecimal(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

function groupNepalNumber(value) {
  const rounded = Math.round(Math.abs(Number(value) || 0));
  const raw = String(rounded);
  if (raw.length <= 3) return raw;
  const tail = raw.slice(-3);
  const head = raw.slice(0, -3);
  const groups = [];
  for (let end = head.length; end > 0; end -= 2) groups.unshift(head.slice(Math.max(0, end - 2), end));
  return `${groups.join(',')},${tail}`;
}

function formatNpr(value, options = {}) {
  const amount = Number(value) || 0;
  const language = options.language === 'ne' ? 'ne' : 'en';
  const mode = options.mode === 'compact' ? 'compact' : 'standard';
  const prefix = language === 'ne' ? 'रु' : 'Rs';
  let body;

  if (mode === 'compact' && Math.abs(amount) >= 10000000) {
    body = `${trimDecimal(Math.abs(amount) / 10000000)} ${language === 'ne' ? 'करोड' : 'crore'}`;
  } else if (mode === 'compact' && Math.abs(amount) >= 100000) {
    body = `${trimDecimal(Math.abs(amount) / 100000)} ${language === 'ne' ? 'लाख' : 'lakh'}`;
  } else {
    body = groupNepalNumber(amount);
  }

  if (amount < 0) body = `-${body}`;
  if (language === 'ne') body = toNepaliDigits(body);
  return `${prefix} ${body}`;
}

function normalizeNepalPreferences(settings = {}) {
  return {
    language: settings.language === 'ne' ? 'ne' : 'en',
    dateSystem: ['AD', 'BS', 'both'].includes(settings.dateSystem) ? settings.dateSystem : 'AD',
    amountFormat: settings.amountFormat === 'compact' ? 'compact' : 'standard',
  };
}

function bsPartsToIso(bs) {
  return `${String(bs.year).padStart(4, '0')}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`;
}

function adToBsIso(adDate, core = calendarCore()) {
  return bsPartsToIso(core.adToBs(adDate));
}

function bsToAdIso(bsDate, core = calendarCore()) {
  const parsed = core.parseBs(toLatinDigits(bsDate), 'YYYY-MM-DD');
  if (!parsed) return null;
  return core.bsToAdIso(parsed);
}

function displayBs(adDate, language = 'en', core = calendarCore()) {
  const bs = core.adToBs(adDate);
  return core.formatBs(bs, 'YYYY MMMM DD', { locale: language === 'ne' ? 'ne' : 'en' });
}

function transactionDateLabel(adDate, settings = {}, core = calendarCore()) {
  const preferences = normalizeNepalPreferences(settings);
  if (preferences.dateSystem === 'AD') return { primary: adDate, secondary: '' };
  const bs = displayBs(adDate, preferences.language, core);
  if (preferences.dateSystem === 'BS') return { primary: bs, secondary: '' };
  return { primary: bs, secondary: adDate };
}

function transactionDateInput(adDate, settings = {}, core = calendarCore()) {
  const preferences = normalizeNepalPreferences(settings);
  return preferences.dateSystem === 'BS' ? adToBsIso(adDate, core) : adDate;
}

function inputDateToAd(input, settings = {}, core = calendarCore()) {
  const preferences = normalizeNepalPreferences(settings);
  if (preferences.dateSystem !== 'BS') return input;
  return bsToAdIso(input, core);
}

module.exports = {
  toNepaliDigits,
  toLatinDigits,
  formatNpr,
  normalizeNepalPreferences,
  adToBsIso,
  bsToAdIso,
  transactionDateLabel,
  transactionDateInput,
  inputDateToAd,
};
