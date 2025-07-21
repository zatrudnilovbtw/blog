/**
 * ThemePopUp - компонент всплывающего меню выбора темы
 * 
 * Отвечает за:
 * - Отображение опций выбора темы (светлая/темная)
 * - Обработку клика вне компонента для закрытия
 * - Переключение темы оформления
 * 
 * CSS: ThemePopUp.module.css
 * Используется в: Header.tsx
 */
import styles from './ThemePopUp.module.css';
import { useEffect, useRef } from "react";
import { GoSun, GoMoon } from 'react-icons/go';

interface ThemePopUpProps {
    isOpen: boolean;
    onClose: () => void;
}

const ThemePopUp = ({ isOpen, onClose }: ThemePopUpProps) => {
    const popupRef = useRef<HTMLDivElement>(null);
  
    const handleClickOutside = (event: MouseEvent) => {
        if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;
    
    return (
        <div className={styles.themePopup} ref={popupRef}>
            <div className={styles.themeOption}>
                <GoSun />
                <span>Светлая</span>
            </div>
            <div className={styles.themeOption}>
                <GoMoon />
                <span>Темная</span>
            </div>
        </div>
    );
};

export default ThemePopUp;