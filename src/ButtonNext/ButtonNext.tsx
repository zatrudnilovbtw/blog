import { Link } from 'react-router-dom';
import styles from './ButtonNext.module.css';

interface ButtonNextProps {
  nextSlug: string | null;
}

const ButtonNext = ({ nextSlug }: ButtonNextProps) => {
  if (!nextSlug) return null;

  return (
    <Link to={`/guide/${nextSlug}`} className={styles.buttonNext}>
      <span className={styles.buttonText}>Следующая статья</span>
      <span className={styles.buttonIcon}>→</span>
    </Link>
  );
};

export default ButtonNext;
