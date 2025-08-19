/**
 * sortArticles - утилита для сортировки и фильтрации статей
 * 
 * Отвечает за:
 * - Сортировку статей по дате, популярности и другим параметрам
 * - Фильтрацию статей по категориям и тегам
 * - Группировку статей для навигации
 * 
 * Будет использоваться в: Navigation.tsx
 */

import type { Article } from './fileReader';

/**
 * Сортирует статьи сначала по языку (русские перед английскими), затем по алфавиту
 * @param articles - массив статей
 * @returns отсортированный массив статей
 */
export function sortArticlesByAlphabet(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => {
    const titleA = a.title.trim();
    const titleB = b.title.trim();

    const startsWithDigit = (title: string) => /^[0-9]/.test(title);
    const startsWithRussian = (title: string) => /^[А-Яа-яЁё]/.test(title);

    // Определяем группу: 0 - русские буквы, 1 - латиница/прочие буквы, 2 - цифры (в конец)
    const groupOf = (title: string) => {
      if (startsWithDigit(title)) return 2;
      if (startsWithRussian(title)) return 0;
      return 1;
    };

    const groupA = groupOf(titleA);
    const groupB = groupOf(titleB);

    if (groupA !== groupB) {
      return groupA - groupB;
    }

    // Для группы цифр сортируем по числовому значению префикса, затем по алфавиту
    if (groupA === 2) {
      const numA = parseInt(titleA.match(/^\d+/)?.[0] ?? '0', 10);
      const numB = parseInt(titleB.match(/^\d+/)?.[0] ?? '0', 10);
      if (numA !== numB) return numA - numB;
      return titleA.localeCompare(titleB, 'ru', { sensitivity: 'base' });
    }

    // Для остальных групп используем локаль 'ru' для стабильного порядка
    return titleA.localeCompare(titleB, 'ru', { sensitivity: 'base' });
  });
}

/**
 * Группирует статьи по категориям и сортирует категории по языку и алфавиту
 * @param articles - массив статей
 * @returns объект, где ключи - названия категорий, а значения - массивы статей
 */
export function groupArticlesByCategory(articles: Article[]): Record<string, Article[]> {
  // Сначала сортируем статьи
  const sortedArticles = sortArticlesByAlphabet(articles);

  // Группируем статьи по категориям
  const grouped = sortedArticles.reduce((grouped: Record<string, Article[]>, article: Article) => {
    const category = article.category || 'Без категории';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(article);
    return grouped;
  }, {});

  // Сортируем категории: русские первыми, затем английские, по алфавиту
  const sortedGrouped: Record<string, Article[]> = {};
  Object.keys(grouped)
    .sort((a, b) => {
      const isRussianA = /[А-Яа-яЁё]/.test(a);
      const isRussianB = /[А-Яа-яЁё]/.test(b);

      if (isRussianA && !isRussianB) return -1;
      if (!isRussianA && isRussianB) return 1;
      return a.localeCompare(b, 'ru', { sensitivity: 'base' });
    })
    .forEach((category) => {
      sortedGrouped[category] = grouped[category];
    });

  return sortedGrouped;
}