/**
 * main.tsx - входная точка приложения
 * 
 * Отвечает за:
 * - Инициализацию React приложения
 * - Рендеринг корневого компонента App
 * - Подключение глобальных стилей
 */
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <App />

)
