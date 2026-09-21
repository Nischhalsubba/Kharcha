export const COLORS = {
  bg: '#0B0F14', surface: '#141A22', surface2: '#1B2430', border: '#273244',
  text: '#F8FAFC', muted: '#9AA8BA', accent: '#7CE3B6', accentSoft: '#173C33',
  danger: '#FF8B8B', income: '#8FD8FF', warning: '#FFD27A',
};

export const EXPENSE_CATEGORIES = [
  ['Food', '🍲'], ['Transport', '🚕'], ['Shopping', '🛍️'], ['Bills', '💡'],
  ['Health', '🩺'], ['Home', '🏠'], ['Entertainment', '🎬'], ['Other', '✨'],
];

export const INCOME_CATEGORIES = [
  ['Salary', '💼'], ['Freelance', '💻'], ['Gift', '🎁'], ['Other', '➕'],
];

export const WALLET_PRESETS = [
  ['cash', 'Cash', '💵'], ['bank', 'Bank', '🏦'], ['esewa', 'eSewa', '🟢'],
  ['khalti', 'Khalti', '🟣'], ['imepay', 'IME Pay', '🔴'], ['card', 'Card', '💳'], ['other', 'Other', '👛'],
];

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
  return categoryPairs(type, customCategories).find(([name]) => name === category)?.[1] || '•';
}
