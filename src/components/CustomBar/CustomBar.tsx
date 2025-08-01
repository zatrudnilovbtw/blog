/**
 * CustomBar - компонент индикатора прогресса прокрутки
 * 
 * Отвечает за:
 * - Отображение прогресса прокрутки статьи
 * - Визуализацию полосы прогресса в верхней части контента
 * 
 * CSS: CustomBar.module.css
 * Используется в: ArticleContent.tsx
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CustomBar.module.css';

const CustomBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const { articleId } = useParams<{ articleId?: string }>();

  useEffect(() => {
    const parentElement = document.querySelector('[class*="mainSection"]');
    
    if (!parentElement) {
      console.error('Не удалось найти родительский элемент с классом mainSection');
      return;
    }
    
    const handleScroll = () => {
      const scrollPosition = parentElement.scrollTop;
      const scrollHeight = parentElement.scrollHeight - parentElement.clientHeight;
      const scrollPercentage = (scrollPosition / scrollHeight) * 100;
      
      setScrollProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };
    
    parentElement.addEventListener('scroll', handleScroll);
    
    handleScroll();
    
    return () => {
      parentElement.removeEventListener('scroll', handleScroll);
    };
  }, [articleId]); 

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />
    </div>
  );
};

export default CustomBar;