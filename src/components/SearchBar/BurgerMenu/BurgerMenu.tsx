import { NavLink, useLocation } from 'react-router-dom';
import styles from './BurgerMenu.module.css';
import Navigation from '../../Navigation/Navigation';

interface BurgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  width?: string;
}

export default function BurgerMenu({ isOpen, onToggle, width = '300px' }: BurgerMenuProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  // Функция для закрытия меню при клике на ссылку
  const handleLinkClick = () => {
    onToggle();
  };

  return (
    <>
    <button
      className={styles.burgerButton}
      onClick={onToggle}
      aria-label="Toggle menu"
    >
      ☰
    </button>
  
    <div className={`${styles.burgerMenu} ${isOpen ? styles.burgerMenuOpen : ''}`} style={{ width }}>
      <div className={styles.headerSection}>
        <NavLink 
          to="/" 
          onClick={handleLinkClick}
          className={({ isActive }) => isActive ? styles.activeLink : ''}
        >
          <div className={styles.logo}>
            <img
              src={typeof document !== 'undefined' && document.body.className === 'dark' ? '/braint-w.svg' : '/braint-b.svg'}
              alt="Логотип"
            />
          </div>
        </NavLink>
        <button
          className={styles.closeButton}
          onClick={onToggle}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <div className={styles.contentSection}>
        <div className={styles.quickLinksRow}>
          <NavLink 
            to="/guide" 
            className={({ isActive }) => `${styles.guideLink} ${isActive ? styles.activeLink : ''}`} 
            onClick={handleLinkClick}
          >
            <div className={styles.linkWrapper}>
              Гайды
            </div>
          </NavLink>
          <NavLink 
            to="/about" 
            className={({ isActive }) => `${styles.guideLink} ${isActive ? styles.activeLink : ''}`} 
            onClick={handleLinkClick}
          >
            <div className={styles.linkWrapper}>
              О нас
            </div>
          </NavLink>
        </div>
        {!isHome && <Navigation onLinkClick={handleLinkClick} />}
      </div>
      
    </div>
  
    {isOpen && <div className={styles.overlay} onClick={onToggle}></div>}
  </>
  );
}