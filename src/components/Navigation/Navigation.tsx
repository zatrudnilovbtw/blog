/**
 * Navigation - компонент боковой навигации
 * 
 * Отвечает за:
 * - Отображение списка категорий и статей
 * - Обеспечение навигации по разделам сайта
 * - Реализацию прокрутки с помощью Radix UI ScrollArea
 * - Добавление алфавитной навигации слева с полным алфавитом
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
  
  const groupedArticles = groupArticlesByCategory(articles);

const alphabet = Array.from({ length: 32 }, (_, i) => String.fromCharCode(0x0410 + i));
  const scrollToLetter = (letter: string) => {
    const scrollViewport = document.querySelector(`.${styles.scrollViewport}`);
    if (!scrollViewport) return;

    const firstArticleWithLetter = scrollViewport.querySelector(`[data-letter="${letter.toLowerCase()}"]`);
    if (firstArticleWithLetter) {
      const offsetTop = firstArticleWithLetter.getBoundingClientRect().top - scrollViewport.getBoundingClientRect().top;
      scrollViewport.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    } else {
      const nextLetterIndex = alphabet.indexOf(letter) + 1;
      if (nextLetterIndex < alphabet.length) {
        scrollToLetter(alphabet[nextLetterIndex]);
      }
    }
  };

  return (
    <div className={styles.navigation}>
      {/* Алфавитная навигация слева */}
      <div className={styles.alphabetNav}>
        {alphabet.map((letter) => (
          <button
            key={letter}
            className={styles.alphabetButton}
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <ScrollArea.Root className={styles.scrollRoot}>
        <ScrollArea.Viewport className={styles.scrollViewport}>
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            Object.entries(groupedArticles).map(([category, categoryArticles]) => (
              <div key={category}>
                <ul className={styles.navigationList}>
                  {categoryArticles.map((article) => {
                    const firstLetter = article.title.charAt(0).toUpperCase();
                    return (
                      <li
                        key={article.slug}
                        className={styles.navigationItem}
                        data-letter={firstLetter.toLowerCase()}
                      >
                        <Link
                          to={`/guide/${article.slug}`}
                          className={`${styles.navLink} ${articleId === article.slug ? styles.activeLink : ''}`}
                        >
                          {article.title}
                        </Link>
                      </li>
                    );
                  })}
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