import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'
import { useArticles, preloadArticle } from '../../utils/fileReader'

export default function NotFound() {
    const { articles } = useArticles()

    const latest = [...articles]
        .sort((a: any, b: any) => {
            const aTime = a.lastModified ? new Date(a.lastModified).getTime() : 0
            const bTime = b.lastModified ? new Date(b.lastModified).getTime() : 0
            return bTime - aTime
        })
        .slice(0, 3)

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Страница не найдена</h1>
            <p className={styles.subtitle}>Возможно, страница была перемещена или удалена.</p>
            <p className={styles.subtitle}>Попробуйте найти то, что вы ищете, в разделах ниже</p>
            <div className={styles.buttons}>
                {latest.map(article => (
                    <Link 
                        to={`/guide/${article.slug}`}
                        key={article.slug}
                        className={styles.button}
                        onMouseEnter={() => preloadArticle(article.slug)}
                    >
                        {article.title}
                    </Link>
                ))}
            </div>
            <div className={styles.homeLinkWrap}>
                <Link to="/" className={styles.homeLink}>На главную</Link>
            </div>
        </div>
    )
}


