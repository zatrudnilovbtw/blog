/**
 * Navigation - компонент боковой навигации
 * 
 * Отвечает за:
 * - Отображение списка категорий и статей
 * - Обеспечение навигации по разделам сайта
 * - Реализацию прокрутки с помощью Radix UI ScrollArea
 * 
 * CSS: Navigation.module.css
 * Используется в: Guide.tsx
 */
import styles from './Navigation.module.css'
import * as ScrollArea from '@radix-ui/react-scroll-area';

const Navigation = () => {
  const peptides = [
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример",
    "Пример", 
    "Пример",
  ];

  return (
    <div className={styles.navigation}>
      <ScrollArea.Root className={styles.scrollRoot}>
        <ScrollArea.Viewport className={styles.scrollViewport}>
          <div className={styles.categoryTitle}>Пример категории</div>
          <ul className={styles.navigationList}>
            {peptides.map((peptide, index) => (
              <li key={index} className={styles.navigationItem}>
                {peptide}
              </li>
            ))}
          </ul>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar 
          className={styles.scrollbar} 
          orientation="vertical"
        >
          <ScrollArea.Thumb className={styles.scrollThumb} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  )
}

export default Navigation