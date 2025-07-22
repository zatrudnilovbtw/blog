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
 * Сортирует статьи по алфавиту (по заголовку)
 * @param articles - массив статей
 * @returns отсортированный массив статей
 */
export function sortArticlesByAlphabet(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * Группирует статьи по категориям
 * @param articles - массив статей
 * @returns объект, где ключи - названия категорий, а значения - массивы статей
 */
export function groupArticlesByCategory(articles: Article[]): Record<string, Article[]> {
  return articles.reduce((grouped: Record<string, Article[]>, article: Article) => {
    const category = article.category || 'Без категории';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(article);
    return grouped;
  }, {});
} 