/**
 * Header - компонент верхней панели навигации
 * 
 * Отвечает за:
 * - Отображение логотипа с навигацией на главную страницу
 * - Навигационные ссылки на основные разделы
 * - Поисковую строку для поиска статей
 * - Кнопку переключения темы с выпадающим меню
 * 
 * CSS: Header.module.css
 * Используется в: App.tsx
 */
import { useState } from 'react';
import styles from './Header.module.css';
import { CiSearch } from 'react-icons/ci';
import { GoSun } from 'react-icons/go';
import ThemePopUp from '../ThemePopUp/ThemePopUp';
import { Link, NavLink } from 'react-router-dom'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePopup = () => {
    setIsOpen(!isOpen);
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>

          <Link to="/">
            <div className={styles.logo}>
            <img src="/braint-b.svg" alt="Логотип" />
            </div>
          </Link>


          <NavLink to="/guide" className={({ isActive }) => 
            isActive ? `${styles.link} ${styles.activeLink}` : styles.link
          }>
            <div>Guides</div>
          </NavLink>

        </div>

        <div className={styles.right}>
          <div className={styles.searchContainer}>
            <CiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Искать статью..." />
          </div>
          <div className={styles.themeButtonContainer}>
            <button
              className={styles.themeButton}
              onClick={togglePopup}
            >
              <GoSun />
            </button>
            <ThemePopUp
              onClose={() => setIsOpen(false)}
              isOpen={isOpen}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
