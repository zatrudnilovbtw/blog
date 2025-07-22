/**
 * Navigation - компонент боковой навигации
 * 
 * Отвечает за:
 * - Отображение списка категорий и статей
 * - Обеспечение навигации по разделам сайта
 * - Реализацию прокрутки с помощью Radix UI ScrollArea
 * 
 * CSS: Navigation.module.css
 * Используется в: Guide.tsx
 */
import { Link, useParams } from 'react-router-dom';
import styles from './Navigation.module.css';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useArticles } from '../../utils/fileReader';
import { groupArticlesByCategory } from '../../utils/sortArticles';

const Navigation = () => {
  const { articleId } = useParams<{ articleId?: string }>();
  const { articles, loading } = useArticles();
  
  // Группируем статьи по категориям
  const groupedArticles = groupArticlesByCategory(articles);

  return (
    <div className={styles.navigation}>
      <ScrollArea.Root className={styles.scrollRoot}>
        <ScrollArea.Viewport className={styles.scrollViewport}>
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <div key={category}>
                {/* <div className={styles.categoryTitle}>{category}</div> */}
                <ul className={styles.navigationList}>
                  {categoryArticles.map((article) => (
                    <li key={article.slug} className={styles.navigationItem}>
                      <Link 
                        to={`/guide/${article.slug}`} 
                        className={`${styles.navLink} ${articleId === article.slug ? styles.activeLink : ''}`}
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className={styles.scrollbar} 
          orientation="vertical"
        >
          <ScrollArea.Thumb className={styles.scrollThumb} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
};

export default Navigation;