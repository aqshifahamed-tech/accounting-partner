import type { CategoryDef, TransactionType } from '@/types';

export const INCOME_CATEGORIES: CategoryDef[] = [
  { name: 'Salary', icon: 'briefcase', color: '#2E7DFF' },
  { name: 'Business', icon: 'trending-up', color: '#00B37E' },
  { name: 'Freelancing', icon: 'edit-3', color: '#8A5CFF' },
  { name: 'Investments', icon: 'bar-chart-2', color: '#00C2A8' },
  { name: 'Rental', icon: 'home', color: '#FFB020' },
  { name: 'Bonus', icon: 'gift', color: '#FF6FA5' },
  { name: 'Other', icon: 'more-horizontal', color: '#7A8699' },
];

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { name: 'Food', icon: 'coffee', color: '#FF7A45' },
  { name: 'Transport', icon: 'navigation', color: '#2E7DFF' },
  { name: 'Bills', icon: 'file-text', color: '#FFB020' },
  { name: 'Education', icon: 'book-open', color: '#8A5CFF' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#FF5C8A' },
  { name: 'Medical', icon: 'heart', color: '#FF4D4F' },
  { name: 'Entertainment', icon: 'film', color: '#00C2A8' },
  { name: 'Fuel', icon: 'droplet', color: '#F2994A' },
  { name: 'Rent', icon: 'home', color: '#5C7CFA' },
  { name: 'Other', icon: 'more-horizontal', color: '#7A8699' },
];

export function getCategories(type: TransactionType): CategoryDef[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryDef(
  type: TransactionType,
  name: string,
): CategoryDef {
  const list = getCategories(type);
  return (
    list.find((c) => c.name === name) ?? {
      name,
      icon: 'circle',
      color: '#7A8699',
    }
  );
}
