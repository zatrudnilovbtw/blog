/**
 * Guide - компонент страницы руководств
 * 
 * Отвечает за:
 * - Структуру страницы с руководствами
 * - Интеграцию компонентов Navigation, ArticleContent и TableOfContents
 * - Отображение статей по выбранной категории
 * 
 * CSS: Guide.module.css
 * Используется в: App.tsx (маршрутизация)
 */
import styles from './Guide.module.css'
import Navigation from '../../components/Navigation/Navigation'
import ArticleContent from '../../components/ArticleContent/ArticleContent'
import TableOfContents from '../../components/TableOfContents/TableOfContents'


const Guide = () => {
  return (
    <div className={styles.guidePage}>
        <div className={styles.nav}><Navigation/></div>
        <div className={styles.mainSection}><ArticleContent/></div>
        <div className={styles.table}><TableOfContents/></div>
    </div>
  )
}

export default Guide