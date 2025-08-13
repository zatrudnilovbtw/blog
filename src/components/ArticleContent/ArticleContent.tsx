/**
 * ArticleContent - компонент содержимого статьи
 * 
 * Отвечает за:
 * - Отображение текста и медиа-контента статьи
 * - Форматирование содержимого статьи
 * - Загрузку и отображение MDX контента
 * - Отображение индикатора прогресса прокрутки
 * 
 * CSS: ArticleContent.module.css
 * Используется в: Guide.tsx
 */
import { useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // Стили для подсветки кода
import styles from './ArticleContent.module.css';
import { useArticle } from '../../utils/fileReader';
import { useArticles } from '../../utils/fileReader';
import { remarkAutoLinkTerms } from '../../utils/remarkAutoLinkTerms';
import ButtonNext from '../../components/ButtonNext/ButtonNext';
import ButtonPrev from '../../components/ButtonPrev/ButtonPrev';
import CustomBar from '../../components/CustomBar/CustomBar';
import Loader from '../Loader/Loader';

interface RouteParams {
  articleId: string;
}

const ArticleContent = () => {
  const { articleId } = useParams<keyof RouteParams>();
  const { article, loading, error, prevSlug, nextSlug } = useArticle(articleId);
  const { articles: allArticles } = useArticles();

  const autoLinkPlugin = useMemo(() => {
    const terms = allArticles.flatMap((a: any) => {
      const labels = [a.title, ...(Array.isArray(a.aliases) ? a.aliases : [])]
        .filter(Boolean);
      return labels.map((label: string) => ({ label, slug: a.slug || a.id }));
    });
    return remarkAutoLinkTerms(terms, { perTermLimit: 2 });
  }, [allArticles]);

  useEffect(() => {
    const mainSection = document.querySelector('[class*="mainSection"]') as HTMLElement;
    if (mainSection) {
      mainSection.scrollTop = 0;
    }
  }, [articleId]);

  // Уведомляем TableOfContents об изменении контента
  useEffect(() => {
    if (article) {
      // Множественные уведомления для надежности
      const timers = [
        setTimeout(() => {
          const event = new CustomEvent('articleContentUpdated');
          document.dispatchEvent(event);
        }, 100),
        setTimeout(() => {
          const event = new CustomEvent('articleContentUpdated');
          document.dispatchEvent(event);
        }, 300),
        setTimeout(() => {
          const event = new CustomEvent('articleContentUpdated');
          document.dispatchEvent(event);
        }, 600)
      ];
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [article, articleId]); // Добавляем articleId как зависимость

  if (loading) {
    return (
      <div className={`${styles.articleContent} articleContent`}>
        <CustomBar />
        <Loader size="large" text="Загрузка статьи..." />
      </div>
    );
  }

  if (error || !article) {
    return <div className={styles.error}>{error || 'Статья не найдена'}</div>;
  }

  return (
    <div className={`${styles.articleContent} articleContent`}>
      <CustomBar />
      <div className={styles.content}>
        <ReactMarkdown
          remarkPlugins={[remarkFrontmatter, remarkGfm, autoLinkPlugin]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            a: ({ children, href, ...props }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
              </a>
            ),
            h2: ({ children, ...props }) => {
              // Создаем стабильный ID на основе текста заголовка
              const text = Array.isArray(children) ? children.join('') : String(children);
              const id = `heading-${text.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
              return <h2 id={id} {...props}>{children}</h2>;
            },
            h3: ({ children, ...props }) => {
              const text = Array.isArray(children) ? children.join('') : String(children);
              const id = `heading-${text.toLowerCase().replace(/[^a-zа-я0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
              return <h3 id={id} {...props}>{children}</h3>;
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
        <nav className={styles.navigation}>
          <div className={styles.prevButton}>
            <ButtonPrev prevSlug={prevSlug} />
          </div>
          <div className={styles.nextButton}>
            <ButtonNext nextSlug={nextSlug} />
          </div>
        </nav>
        <div className={styles.bottomSpacing}></div>
      </div>
    </div>
  );
};

export default ArticleContent;