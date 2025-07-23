/**
 * Header - компонент верхней панели навигации
 * 
 * Отвечает за:
 * - Отображение логотипа с навигацией на главную страницу
 * - Навигационные ссылки на основные разделы
 * - Поисковую строку для поиска статей
 * - Кнопку переключения темы
 * 
 * CSS: Header.module.css
 * Используется в: App.tsx
 */
import { useState, useEffect } from 'react';
import styles from './Header.module.css';
import { CiSearch } from 'react-icons/ci';
import ThemeToggle from '../ThemePopUp/ThemePopUp';
import { Link, NavLink } from 'react-router-dom'

const Header = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // Отслеживаем текущую тему
  useEffect(() => {
    // Получаем начальную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);
    
    // Создаем наблюдатель для отслеживания изменений класса body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const bodyClass = document.body.className;
          setCurrentTheme(bodyClass);
        }
      });
    });
    
    // Начинаем наблюдение за изменениями класса body
    observer.observe(document.body, { attributes: true });
    
    // Очищаем наблюдатель при размонтировании компонента
    return () => observer.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>

          <Link to="/">
            <div className={styles.logo}>
            <img 
              src={currentTheme === 'dark' ? "/braint-w.svg" : "/braint-b.svg"} 
              alt="Логотип" 
            />
            </div>
          </Link>


          <NavLink to="/guide" className={({ isActive }) => 
            isActive ? `${styles.link} ${styles.activeLink}` : styles.link
          }>
            <div className={styles.links}>Guides</div>
          </NavLink>

        </div>

        <div className={styles.right}>
          <div className={styles.searchContainer}>
            <CiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Искать статью..." />
          </div>
          <div className={styles.themeButtonContainer}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
