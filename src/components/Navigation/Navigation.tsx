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
import { sortArticlesByAlphabet } from '../../utils/sortArticles';
import { useRef } from 'react';

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation = ({ onLinkClick }: NavigationProps) => {
  const { articleId } = useParams<{ articleId?: string }>();
  const { articles, loading } = useArticles();
  
  const sortedArticles = sortArticlesByAlphabet(articles);

  const viewportRef = useRef<HTMLDivElement>(null);

  const alphabet = Array.from({ length: 32 }, (_, i) => String.fromCharCode(0x0410 + i));

  const scrollToLetter = (letter: string) => {
    const scrollViewport = viewportRef.current;
    if (!scrollViewport) return;

    const firstArticleWithLetter = scrollViewport.querySelector(
      `[data-letter="${letter.toLowerCase()}"]`
    ) as HTMLElement | null;

    if (firstArticleWithLetter) {
      scrollViewport.scrollTo({
        top: firstArticleWithLetter.offsetTop,
        behavior: 'smooth',
      });
    } else {
      const nextLetterIndex = alphabet.indexOf(letter) + 1;
      if (nextLetterIndex < alphabet.length) {
        scrollToLetter(alphabet[nextLetterIndex]);
      }
    }
  };

  const handleLinkClick = () => {
    const mainSection = document.querySelector('[class*="mainSection"]') as HTMLElement;
    if (mainSection) {
      mainSection.scrollTop = 0;
    }
    if (onLinkClick) {
      onLinkClick();
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
        <ScrollArea.Viewport ref={viewportRef} className={styles.scrollViewport}>
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : (
            <ul className={styles.navigationList}>
              {sortedArticles.map((article) => {
                const firstLetter = article.title.charAt(0).toUpperCase();
                return (
                  <li
                    key={article.slug}
                    className={styles.navigationItem}
                    data-letter={firstLetter.toLowerCase()}
                  >
                    <Link
                      to={`/guide/${article.slug}`}
                      className={`${styles.navLink} ${
                        articleId === article.slug ? styles.activeLink : ''
                      }`}
                      onClick={handleLinkClick}
                    >
                      {article.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
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