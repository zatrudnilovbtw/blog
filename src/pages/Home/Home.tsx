/**
 * Home - компонент главной страницы
 * 
 * Отвечает за:
 * - Отображение приветственной информации
 * - Кнопку перехода к руководствам
 * - Отображение случайных статей
 * 
 * CSS: Home.module.css
 * Используется в: App.tsx (маршрутизация)
 */
import { useState, useEffect } from 'react'
import styles from './Home.module.css'
import { Link } from 'react-router-dom'
import { useArticles } from '../../utils/fileReader'
import type { Article } from '../../utils/fileReader'

const Home = () => {
    const { articles, loading } = useArticles();
    const [randomArticles, setRandomArticles] = useState<Article[]>([]);

    useEffect(() => {
        if (articles.length > 0) {
            // Выбираем 3 случайные статьи
            const shuffled = [...articles].sort(() => 0.5 - Math.random());
            setRandomArticles(shuffled.slice(0, 3));
        }
    }, [articles]);

    return (
        <div>
            <div className={styles.homePage}>
                <h1 className={styles.title}>Ваш гид по биохакингу и добавкам</h1>
                <h2 className={styles.subtitle}>Демистификация мира биохакинга. Откройте для себя четкие и эффективные техники для улучшения здоровья, производительности и повседневной жизни.</h2>
                <Link to="/guide">
                    <button className={styles.button}>Начать</button>
                </Link>
            </div>
            <div className={styles.lastArticles}>
                {loading ? (
                    <p>Загрузка статей...</p>
                ) : randomArticles.length > 0 ? (
                    randomArticles.map((article) => (
                        <Link 
                            to={`/guide/${article.slug}`} 
                            key={article.slug}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className={styles.article}>
                                {article.title}
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>Нет доступных статей</p>
                )}
            </div>
        </div>
    )
}

export default Home