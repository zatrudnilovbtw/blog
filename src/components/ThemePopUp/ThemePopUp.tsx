/**
 * ThemeToggle - компонент кнопки переключения темы
 * 
 * Отвечает за:
 * - Отображение иконки текущей темы (солнце/луна)
 * - Переключение между светлой и темной темой
 * 
 * CSS: ThemePopUp.module.css
 * Используется в: Header.tsx
 */
import styles from './ThemePopUp.module.css';
import { useEffect, useState } from "react";
import { GoSun, GoMoon } from 'react-icons/go';

const ThemeToggle = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.body.className = savedTheme; 
    }, []);
    
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.className = newTheme; 
        localStorage.setItem('theme', newTheme);
    };
    
    return (
        <button 
            className={styles.themeToggleButton} 
            onClick={toggleTheme}
            aria-label={theme === 'light' ? "Переключить на темную тему" : "Переключить на светлую тему"}
        >
            {theme === 'light' ? <GoSun className={styles.whitetheme} /> : <GoMoon className={styles.darktheme} />}
        </button>
    );
};

export default ThemeToggle;