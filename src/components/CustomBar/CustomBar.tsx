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
import styles from './CustomBar.module.css';

const CustomBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Получаем родительский элемент, который имеет прокрутку
    const parentElement = document.querySelector('[class*="mainSection"]');
    
    if (!parentElement) {
      console.error('Не удалось найти родительский элемент с классом mainSection');
      return;
    }
    
    const handleScroll = () => {
      // Вычисляем прогресс прокрутки
      const scrollPosition = parentElement.scrollTop;
      const scrollHeight = parentElement.scrollHeight - parentElement.clientHeight;
      const scrollPercentage = (scrollPosition / scrollHeight) * 100;
      
      setScrollProgress(Math.min(100, Math.max(0, scrollPercentage)));
    };
    
    // Добавляем обработчик события прокрутки
    parentElement.addEventListener('scroll', handleScroll);
    
    // Вызываем обработчик сразу для установки начального значения
    handleScroll();
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      parentElement.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar} style={{ width: `${scrollProgress}%` }} />
    </div>
  );
};

export default CustomBar;