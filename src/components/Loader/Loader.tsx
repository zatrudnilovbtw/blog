/**
 * Loader - компонент анимированного лоудера
 * 
 * Отвечает за:
 * - Красивая анимация загрузки
 * - Поддержка темной и светлой темы
 * - Настраиваемый размер и текст
 * 
 * CSS: Loader.module.css
 * Используется в: ArticleContent.tsx, Home.tsx, Navigation.tsx
 */
import styles from './Loader.module.css';

interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  showText?: boolean;
}

const Loader = ({ 
  size = 'medium', 
  text = 'Загрузка...', 
  showText = true 
}: LoaderProps) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
      {showText && (
        <div className={styles.loaderText}>{text}</div>
      )}
    </div>
  );
};

export default Loader;