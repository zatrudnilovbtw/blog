/**
 * Home - компонент главной страницы
 * 
 * Отвечает за:
 * - Отображение приветственной информации
 * - Кнопку перехода к руководствам
 * - Отображение последних статей
 * 
 * CSS: Home.module.css
 * Используется в: App.tsx (маршрутизация)
 */
import styles from './Home.module.css'
import { Link } from 'react-router-dom'

const Home = () => {
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
                <div className={styles.article}>Основы биохакинга для начинающих</div>
                <div className={styles.article}>Топ-10 добавок для повышения энергии</div>
                <div className={styles.article}>Как улучшить когнитивные функции</div>
            </div>
        </div>
    )
}

export default Home