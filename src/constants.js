export const COLORS = {
  bg: '#F7F8FA',
  surface: '#FFFFFF',
  surface2: '#F2F4F7',
  border: '#E4E7EC',
  text: '#101828',
  muted: '#667085',
  accent: '#0F766E',
  accentSoft: '#E8F5F1',
  onAccent: '#FFFFFF',
  danger: '#D14343',
  income: '#1677B8',
  warning: '#A15C00',
  success: '#0F766E',
  shadow: '#101828',
};

export const EXPENSE_CATEGORIES = [
  ['Food', '🍲'], ['Khaja', '🥟'], ['Groceries', '🥬'], ['Transport', '🚕'], ['Fuel', '⛽'], ['Shopping', '🛍️'],
  ['Bills', '🧾'], ['Electricity', '💡'], ['Water', '💧'], ['Internet', '🌐'], ['Mobile Recharge', '📱'],
  ['Health', '🩺'], ['Home', '🏠'], ['Rent', '🔑'], ['School Fees', '🎓'], ['EMI', '📆'], ['Loan Repayment', '🏦'], ['Puja & Donation', '🙏'],
  ['Festival', '🪔'], ['Entertainment', '🎬'], ['Other', '✨'],
];

export const INCOME_CATEGORIES = [
  ['Salary', '💼'], ['Freelance', '💻'], ['Remittance', '🌏'], ['Business', '🏪'], ['Rental Income', '🏠'],
  ['Allowance', '🪙'], ['Gift', '🎁'], ['Other', '➕'],
];

export const WALLET_PRESETS = [
  ['cash', 'Cash', '💵'], ['bank', 'Bank', '🏦'], ['esewa', 'eSewa', '🟢'],
  ['khalti', 'Khalti', '🟣'], ['imepay', 'IME Pay', '🔴'], ['card', 'Card', '💳'], ['other', 'Other', '👛'],
];

export const PAYMENT_METHODS = [
  ['cash', 'Cash', '💵'], ['qr', 'QR', '▦'], ['card', 'Card', '💳'], ['bank', 'Bank Transfer', '🏦'],
];

export const REMITTANCE_CURRENCIES = ['AED','QAR','SAR','MYR','USD','AUD','GBP','INR','JPY','KRW'];

export function categoryPairs(type, customCategories = { expense: [], income: [] }) {
  const base = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const custom = (customCategories?.[type] || []).map((item) => [item.name, item.emoji || '✨']);
  const seen = new Set();
  return [...base, ...custom].filter(([name]) => {
    const key = String(name).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function categoryIcon(type, category, customCategories) {
  if (category === 'Savings Goal') return '🎯';
  if (category === 'Udhaaro Repayment') return '🤝';
  return categoryPairs(type, customCategories).find(([name]) => name === category)?.[1] || '•';
}
