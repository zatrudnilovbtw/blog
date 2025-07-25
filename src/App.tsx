/**
 * App - корневой компонент приложения
 * 
 * Отвечает за:
 * - Настройку маршрутизации с помощью React Router
 * - Определение основной структуры приложения
 * - Подключение темы Radix UI
 * 
 * Используется в: main.tsx
 */
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Guide from "./pages/Guide/Guide"
import Home from "./pages/Home/Home"
import Header from "./components/Header/Header"

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="guide" element={<Guide/>} />
            <Route path="/guide/:articleId" element={<Guide />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>

  )
}

export default App
