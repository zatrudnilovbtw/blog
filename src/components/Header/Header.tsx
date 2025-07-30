// Header.tsx
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import SearchBar from '../SearchBar/SearchBar';
import ThemeToggle from '../ThemePopUp/ThemePopUp';
import BurgerMenu from '../SearchBar/BurgerMenu/BurgerMenu';

export default function Header() {
  const [currentTheme, setCurrentTheme] = useState<string>('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для бургер-меню

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setCurrentTheme(savedTheme);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const bodyClass = document.body.className;
          setCurrentTheme(bodyClass);
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
        <BurgerMenu isOpen={isMenuOpen} onToggle={toggleMenu} />
          <Link to="/">
            <div className={styles.logo}>
              <img
                src={currentTheme === 'dark' ? '/braint-w.svg' : '/braint-b.svg'}
                alt="Логотип"
              />
            </div>
          </Link>
          <NavLink
            to="/guide"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.activeLink}` : styles.link
            }
          >
            <div className={styles.links}>Guides</div>
          </NavLink>
        </div>
        <div className={styles.right}>
          <SearchBar />
          <div className={styles.themeButtonContainer}>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}