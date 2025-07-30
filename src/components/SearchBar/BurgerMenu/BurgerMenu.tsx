import { Link, useLocation } from 'react-router-dom';
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
          <Link to="/" onClick={onToggle}>
            <div className={styles.logo}>
              <img
                src={typeof document !== 'undefined' && document.body.className === 'dark' ? '/braint-w.svg' : '/braint-b.svg'}
                alt="Логотип"
              />
            </div>
          </Link>
          <button
            className={styles.closeButton}
            onClick={onToggle}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className={styles.contentSection}>
          <Link to="/guide" className={styles.guideLink} onClick={onToggle}>
            Guides
          </Link>
          {!isHome && <Navigation />}
        </div>
      </div>
    </>
  );
}