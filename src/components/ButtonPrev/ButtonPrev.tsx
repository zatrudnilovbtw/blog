import { Link } from 'react-router-dom';
import styles from './ButtonPrev.module.css';

interface ButtonPrevProps {
  prevSlug: string | null;
}

const ButtonPrev = ({ prevSlug }: ButtonPrevProps) => {
  if (!prevSlug) return null;

  const handleClick = () => {
    const mainSection = document.querySelector('[class*="mainSection"]') as HTMLElement;
    if (mainSection) {
      mainSection.scrollTop = 0;
    }
  };

  return (
    <Link to={`/guide/${prevSlug}`} className={styles.buttonPrev} onClick={handleClick}>
      <span className={styles.buttonIcon}>←</span>
      <span className={styles.buttonText}>Предыдущая статья</span>
    </Link>
  );
};

export default ButtonPrev;
