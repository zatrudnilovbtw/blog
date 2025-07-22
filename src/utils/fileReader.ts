/**
 * fileReader - утилита для чтения файлов статей
 * 
 * Отвечает за:
 * - Загрузку MDX файлов
 * - Извлечение метаданных из frontmatter
 * - Предоставление списка статей и их содержимого
 */
import { useState, useEffect } from 'react';

// Определение интерфейса Article
export interface Article {
  slug: string;
  title: string;
  category: string;
  [key: string]: any;
}

// Импортируем все MDX файлы динамически
const articleModules = import.meta.glob('/public/articles/*.mdx', { eager: true });

/**
 * Получает список всех статей
 */
export async function getArticlesList(): Promise<Article[]> {
  const articles: Article[] = [];
  
  for (const path in articleModules) {
    try {
      const module = articleModules[path] as any;
      const slug = path.split('/').pop()?.replace('.mdx', '') || '';
      
      articles.push({
        slug,
        title: module.frontMatter?.title || formatSlug(slug),
        category: module.frontMatter?.category || 'Без категории',
        ...module.frontMatter
      });
    } catch (err) {
      console.warn(`Не удалось загрузить статью из ${path}:`, err);
    }
  }
  
  return articles;
}

/**
 * Получает содержимое конкретной статьи по её slug
 */
export async function getArticleContent(slug: string) {
  try {
    const path = `/public/articles/${slug}.mdx`;
    
    if (!(path in articleModules)) {
      throw new Error(`Статья ${slug} не найдена`);
    }
    
    const module = articleModules[path] as any;
    
    return {
      Component: module.default,
      frontMatter: module.frontMatter || {
        title: formatSlug(slug),
        category: 'Без категории'
      }
    };
  } catch (error) {
    console.error(`Ошибка при чтении статьи ${slug}:`, error);
    return null;
  }
}

/**
 * Получает slug предыдущей и следующей статьи
 */
export async function getAdjacentArticles(currentSlug: string): Promise<{ prevSlug: string | null, nextSlug: string | null }> {
  const articles = await getArticlesList();
  
  // Сортируем статьи по алфавиту (или по другому критерию)
  const sortedArticles = [...articles].sort((a, b) => a.title.localeCompare(b.title));
  
  const currentIndex = sortedArticles.findIndex(article => article.slug === currentSlug);
  
  if (currentIndex === -1) {
    return { prevSlug: null, nextSlug: null };
  }
  
  const prevSlug = currentIndex > 0 ? sortedArticles[currentIndex - 1].slug : null;
  const nextSlug = currentIndex < sortedArticles.length - 1 ? sortedArticles[currentIndex + 1].slug : null;
  
  return { prevSlug, nextSlug };
}

/**
 * Форматирует slug в читаемый заголовок
 */
function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Хук для получения списка статей
 */
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const list = await getArticlesList();
        setArticles(list);
      } catch (err) {
        console.error('Ошибка при загрузке списка статей:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);
  
  return { articles, loading };
}

/**
 * Хук для получения конкретной статьи
 */
export function useArticle(slug: string | undefined) {
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prevSlug, setPrevSlug] = useState<string | null>(null);
  const [nextSlug, setNextSlug] = useState<string | null>(null);
  
  useEffect(() => {
    if (!slug) {
      setError('Статья не найдена');
      setLoading(false);
      return;
    }
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем содержимое статьи
        const content = await getArticleContent(slug);
        if (!content) {
          setError('Статья не найдена');
          return;
        }
        
        setArticle(content);
        
        // Загружаем информацию о соседних статьях
        const { prevSlug: prev, nextSlug: next } = await getAdjacentArticles(slug);
        setPrevSlug(prev);
        setNextSlug(next);
      } catch (err) {
        console.error(`Ошибка при загрузке статьи ${slug}:`, err);
        setError('Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug]);
  
  return { article, loading, error, prevSlug, nextSlug };
} 