export const BRAND_TOKENS = {
  primary: '#0074FC',
  iconBackground: '#F7FAFF',
  dark: '#0F172A',
  text: '#111827',
};

export const DESIGN_TOKENS = {
  colors: {
    canvas: '#F3F3F3',
    surface: '#FFFFFF',
    neutral: '#F3F4F6',
    border: '#EFEFF1',
    borderStrong: '#CCCDD3',
    text: BRAND_TOKENS.text,
    muted: '#7B7D8E',
    mutedStrong: '#5A5D72',
    primary: BRAND_TOKENS.primary,
    primarySoft: '#E9F1FD',
    primaryLight: '#6FBFFF',
    success: '#40C79A',
    successLight: '#68EFC2',
    danger: '#F26969',
    dangerLight: '#FF9B9B',
    warning: '#F7B13C',
    warningLight: '#FFD964',
    nav: '#262730',
    navActive: '#32333F',
    uiBlack: '#262626',
  },
  radius: { small: 8, card: 12, control: 10, pill: 99 },
  spacing: { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24 },
  type: {
    display: { fontSize: 24, lineHeight: 36, fontWeight: '600', letterSpacing: -0.72 },
    title: { fontSize: 20, lineHeight: 30, fontWeight: '600', letterSpacing: -0.4 },
    section: { fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: -0.32 },
    bodyStrong: { fontSize: 14, lineHeight: 21, fontWeight: '600', letterSpacing: -0.28 },
    body: { fontSize: 14, lineHeight: 21, fontWeight: '400', letterSpacing: -0.28 },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: -0.12 },
  },
};

export const COLORS = {
  bg: DESIGN_TOKENS.colors.canvas,
  surface: DESIGN_TOKENS.colors.surface,
  surface2: DESIGN_TOKENS.colors.neutral,
  border: DESIGN_TOKENS.colors.border,
  borderStrong: DESIGN_TOKENS.colors.borderStrong,
  text: DESIGN_TOKENS.colors.text,
  muted: DESIGN_TOKENS.colors.muted,
  mutedStrong: DESIGN_TOKENS.colors.mutedStrong,
  accent: DESIGN_TOKENS.colors.primary,
  accentSoft: DESIGN_TOKENS.colors.primarySoft,
  onAccent: '#FFFFFF',
  danger: DESIGN_TOKENS.colors.danger,
  income: DESIGN_TOKENS.colors.success,
  warning: DESIGN_TOKENS.colors.warning,
  success: DESIGN_TOKENS.colors.success,
  shadow: '#000000',
  nav: DESIGN_TOKENS.colors.nav,
  navActive: DESIGN_TOKENS.colors.navActive,
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
