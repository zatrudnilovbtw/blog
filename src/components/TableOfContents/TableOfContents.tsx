/**
 * TableOfContents - компонент оглавления статьи
 * 
 * Отвечает за:
 * - Отображение структуры текущей статьи
 * - Навигацию по разделам статьи
 * - В разработке
 * 
 * CSS: TableOfContents.module.css
 * Используется в: Guide.tsx
 */
import styles from './TableOfContents.module.css'

const TableOfContents = () => {
  return (
    <div className={styles.tableOfContents}>TableOfContents</div>
  )
}

export default TableOfContents