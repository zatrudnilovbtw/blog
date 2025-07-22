/**
 * ArticleContent - компонент содержимого статьи
 * 
 * Отвечает за:
 * - Отображение текста и медиа-контента статьи
 * - Форматирование содержимого статьи
 * - Загрузку и отображение MDX контента
 * 
 * CSS: ArticleContent.module.css
 * Используется в: Guide.tsx
 */
import { useParams } from 'react-router-dom';
import styles from './ArticleContent.module.css';
import { useArticle } from '../../utils/fileReader';
import ButtonNext from '../../ButtonNext/ButtonNext';
import ButtonPrev from '../../ButtonPrev/ButtonPrev';

interface RouteParams {
  articleId: string;
}

const ArticleContent = () => {
  const { articleId } = useParams<keyof RouteParams>();
  const { article, loading, error, prevSlug, nextSlug } = useArticle(articleId);

  if (loading) {
    return <div className={styles.loading}>Загрузка статьи...</div>;
  }

  if (error || !article) {
    return <div className={styles.error}>{error || 'Статья не найдена'}</div>;
  }

  const { Component } = article;

  return (
    <div className={styles.articleContent}>
      <div className={styles.content}>
        <Component />
        
        <nav className={styles.navigation}>
          <div className={styles.prevButton}>
            <ButtonPrev prevSlug={prevSlug} />
          </div>
          <div className={styles.nextButton}>
            <ButtonNext nextSlug={nextSlug} />
          </div>
        </nav>
        
        {/* Пустой элемент для дополнительного отступа внизу */}
        <div className={styles.bottomSpacing}></div>
      </div>
    </div>
  );
};

export default ArticleContent;