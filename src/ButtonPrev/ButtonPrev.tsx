import { Link } from 'react-router-dom';
import styles from './ButtonPrev.module.css';

interface ButtonPrevProps {
  prevSlug: string | null;
}

const ButtonPrev = ({ prevSlug }: ButtonPrevProps) => {
  if (!prevSlug) return null;

  return (
    <Link to={`/guide/${prevSlug}`} className={styles.buttonPrev}>
      <span className={styles.buttonIcon}>←</span>
      <span className={styles.buttonText}>Предыдущая статья</span>
    </Link>
  );
};

export default ButtonPrev;
