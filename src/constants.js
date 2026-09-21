export const COLORS = {
  bg: '#0B0F14', surface: '#141A22', surface2: '#1B2430', border: '#273244',
  text: '#F8FAFC', muted: '#9AA8BA', accent: '#7CE3B6', accentSoft: '#173C33',
  danger: '#FF8B8B', income: '#8FD8FF',
};

export const EXPENSE_CATEGORIES = [
  ['Food', '🍲'], ['Transport', '🚕'], ['Shopping', '🛍️'], ['Bills', '💡'],
  ['Health', '🩺'], ['Home', '🏠'], ['Entertainment', '🎬'], ['Other', '✨'],
];

export const INCOME_CATEGORIES = [
  ['Salary', '💼'], ['Freelance', '💻'], ['Gift', '🎁'], ['Other', '➕'],
];

export const CATEGORY_ICONS = {
  expense: Object.fromEntries(EXPENSE_CATEGORIES),
  income: Object.fromEntries(INCOME_CATEGORIES),
};
