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
import { useArticles, preloadArticle } from '../../utils/fileReader';
import { sortArticlesByAlphabet } from '../../utils/sortArticles';
import { useRef } from 'react';
import Loader from '../Loader/Loader';

interface NavigationProps {
  onLinkClick?: () => void;
}

const Navigation = ({ onLinkClick }: NavigationProps) => {
  const { articleId } = useParams<{ articleId?: string }>();
  const { articles, loading } = useArticles();
  
  const sortedArticles = sortArticlesByAlphabet(articles);

  const viewportRef = useRef<HTMLDivElement>(null);

  const russianAlphabet = Array.from({ length: 32 }, (_, i) => String.fromCharCode(0x0410 + i));
  const latinAlphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(0x41 + i));
  const numbersAlphabet = Array.from({ length: 10 }, (_, i) => i.toString());

  const scrollToLetter = (letter: string, alphabetSource: string[]) => {
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
      // Исправляем: добавляем проверку чтобы избежать бесконечной рекурсии
      const nextLetterIndex = alphabetSource.indexOf(letter) + 1;
      if (nextLetterIndex < alphabetSource.length) {
        // Добавляем небольшую задержку чтобы избежать проблем с прокруткой
        setTimeout(() => scrollToLetter(alphabetSource[nextLetterIndex], alphabetSource), 100);
      } else {
        // Если дошли до конца алфавита, прокручиваем в самый низ
        scrollViewport.scrollTo({
          top: scrollViewport.scrollHeight,
          behavior: 'smooth',
        });
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
      <div className={styles.alphabetColumn}>
        <div className={styles.alphabetBlock}>
          {russianAlphabet.map((letter) => (
            <button
              key={letter}
              className={styles.alphabetButton}
              onClick={() => scrollToLetter(letter, russianAlphabet)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.alphabetBlock}>
          {latinAlphabet.map((letter) => (
            <button
              key={letter}
              className={styles.alphabetButton}
              onClick={() => scrollToLetter(letter, latinAlphabet)}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.alphabetBlock}>
          {numbersAlphabet.map((letter) => (
            <button
              key={letter}
              className={styles.alphabetButton}
              data-type="digit"
              onClick={() => scrollToLetter(letter, numbersAlphabet)}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <ScrollArea.Root className={styles.scrollRoot}>
        <ScrollArea.Viewport ref={viewportRef} className={styles.scrollViewport}>
          {loading ? (
            <Loader size="medium" text="Загрузка статей..." />
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
                      onMouseEnter={() => preloadArticle(article.slug)}
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