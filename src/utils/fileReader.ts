/**
 * fileReader - утилита для работы с API статей
 * 
 * Отвечает за:
 * - Загрузку статей через API
 * - Кэширование данных
 * - Предзагрузку статей
 * - Предоставление списка статей и их содержимого
 */
import { useState, useEffect } from 'react';

// Кэш для статей
const articleCache = new Map<string, ArticleContent>();
const preloadingArticles = new Set<string>();

// Определение интерфейса Article
export interface Article {
  slug: string;
  title: string;
  category: string;
  id: string;
  tags: string[];
  path: string;
  [key: string]: any;
}

// Интерфейс для данных статьи с контентом
export interface ArticleContent {
  slug: string;
  content: string;
  frontMatter: any;
  title: string;
  category: string;
}

/**
 * Получает список всех статей через API
 */
export async function getArticlesList(): Promise<Article[]> {
  try {
    const response = await fetch('/api/articles');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiArticles = await response.json();
    
    // Преобразуем данные API в нужный формат
    const articles: Article[] = apiArticles.map((article: any) => ({
      ...article,
      slug: article.id, // API возвращает id, а мы используем slug
    }));
    
    return articles;
  } catch (error) {
    console.error('Ошибка при загрузке списка статей:', error);
    return [];
  }
}

/**
 * Получает содержимое конкретной статьи по её slug через API с кэшированием
 */
export async function getArticleContent(slug: string): Promise<ArticleContent | null> {
  // Проверяем кэш
  if (articleCache.has(slug)) {
    return articleCache.get(slug)!;
  }

  try {
    const response = await fetch(`/api/articles/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Статья ${slug} не найдена`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const articleData: ArticleContent = await response.json();
    
    // Сохраняем в кэш
    articleCache.set(slug, articleData);
    
    return articleData;
  } catch (error) {
    console.error(`Ошибка при чтении статьи ${slug}:`, error);
    return null;
  }
}

/**
 * Предзагружает статью в фоновом режиме
 */
export async function preloadArticle(slug: string): Promise<void> {
  if (articleCache.has(slug) || preloadingArticles.has(slug)) {
    return; // Уже загружена или загружается
  }

  preloadingArticles.add(slug);
  
  try {
    await getArticleContent(slug);
  } catch (error) {
    // Тихо игнорируем ошибки предзагрузки
  } finally {
    preloadingArticles.delete(slug);
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
 * Хук для получения списка статей с предзагрузкой популярных
 */
export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const list = await getArticlesList();
        setArticles(list);
        
        // Предзагружаем первые 3 статьи для быстрого доступа
        if (list.length > 0) {
          const sortedArticles = [...list].sort((a, b) => a.title.localeCompare(b.title));
          const articlesToPreload = sortedArticles.slice(0, 3);
          
          // Предзагружаем с небольшой задержкой чтобы не блокировать UI
          setTimeout(() => {
            articlesToPreload.forEach((article, index) => {
              setTimeout(() => preloadArticle(article.slug), index * 200);
            });
          }, 500);
        }
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
 * Хук для получения конкретной статьи с мгновенным отображением кэшированных
 */
export function useArticle(slug: string | undefined) {
  const [article, setArticle] = useState<ArticleContent | null>(null);
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
    
    // Проверяем кэш сразу
    if (articleCache.has(slug)) {
      const cachedArticle = articleCache.get(slug)!;
      setArticle(cachedArticle);
      setLoading(false);
      setError(null);
      
      // Загружаем соседние статьи в фоне
      getAdjacentArticles(slug).then(({ prevSlug: prev, nextSlug: next }) => {
        setPrevSlug(prev);
        setNextSlug(next);
        
        // Предзагружаем соседние статьи
        if (prev) preloadArticle(prev);
        if (next) preloadArticle(next);
      });
      
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
        
        // Предзагружаем соседние статьи
        if (prev) preloadArticle(prev);
        if (next) preloadArticle(next);
      } catch (err) {
        console.error(`Ошибка при загрузке статьи ${slug}:`, err);
        setError(err instanceof Error ? err.message : 'Не удалось загрузить статью');
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug]);
  
  return { article, loading, error, prevSlug, nextSlug };
} 