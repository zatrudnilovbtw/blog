/**
 * Guide - компонент страницы руководств
 * 
 * Отвечает за:
 * - Структуру страницы с руководствами
 * - Интеграцию компонентов Navigation, ArticleContent и TableOfContents
 * - Отображение статей по выбранной категории
 * - Автоматическую загрузку первой статьи при открытии страницы
 * 
 * CSS: Guide.module.css
 * Используется в: App.tsx (маршрутизация)
 */
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styles from './Guide.module.css'
import Navigation from '../../components/Navigation/Navigation'
import ArticleContent from '../../components/ArticleContent/ArticleContent'
import TableOfContents from '../../components/TableOfContents/TableOfContents'
import { useArticles } from '../../utils/fileReader'
import { sortArticlesByAlphabet } from '../../utils/sortArticles'

const Guide = () => {
  const { articleId } = useParams<{ articleId?: string }>()
  const { articles, loading } = useArticles()
  const navigate = useNavigate()

  // Если нет выбранной статьи, перенаправляем на первую статью в списке
  useEffect(() => {
    if (!articleId && !loading && articles.length > 0) {
      // Сортируем статьи по алфавиту и берем первую
      const sortedArticles = sortArticlesByAlphabet(articles)
      navigate(`/guide/${sortedArticles[0].slug}`, { replace: true })
    }
  }, [articleId, articles, loading, navigate])

  return (
    <div className={styles.guidePage}>
        <div className={styles.nav}><Navigation onLinkClick={undefined} /></div>
        <div className={styles.mainSection}><ArticleContent/></div>
        <div className={styles.table}><TableOfContents/></div>
    </div>
  )
}

export default Guide