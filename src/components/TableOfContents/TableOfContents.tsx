/**
 * TableOfContents - компонент оглавления статьи
 * 
 * Отвечает за:
 * - Отображение структуры текущей статьи
 * - Навигацию по разделам статьи
 * - Автоматический сбор h2 заголовков
 * 
 * CSS: TableOfContents.module.css
 * Используется в: Guide.tsx
 */
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './TableOfContents.module.css';

interface TocItem {
  id: string;
  text: string;
}

const TableOfContents = () => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const { articleId } = useParams<{ articleId?: string }>();
  const observerRef = useRef<MutationObserver | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const headingObserverRef = useRef<IntersectionObserver | null>(null);

  // Функция для сбора всех h2 заголовков
  const getHeadings = () => {
    const articleContent = document.querySelector('.articleContent');
    if (!articleContent) return [];
    
    const headingElements = articleContent.querySelectorAll('h2');
    const headingItems: TocItem[] = [];

    headingElements.forEach((heading, index) => {
      // Создаем id для заголовка, если его нет
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      headingItems.push({
        id: heading.id,
        text: heading.textContent || `Раздел ${index + 1}`
      });
    });

    return headingItems;
  };

  // Обновление оглавления
  const updateTableOfContents = () => {
    // Очищаем предыдущий таймер, если он есть
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Устанавливаем новый таймер для обновления оглавления
    timerRef.current = setTimeout(() => {
      const items = getHeadings();
      setHeadings(items);
      
      // Если есть заголовки, устанавливаем первый как активный по умолчанию
      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    }, 10);
  };

  // Настройка наблюдателя за видимостью заголовков
  useEffect(() => {
    if (headings.length === 0) return;

    // Отключаем предыдущий наблюдатель, если он есть
    if (headingObserverRef.current) {
      headingObserverRef.current.disconnect();
    }

    // Создаем новый наблюдатель за видимостью заголовков
    const observer = new IntersectionObserver(
      (entries) => {
        // Получаем все видимые заголовки
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id);

        if (visibleHeadings.length > 0) {
          // Берем первый видимый заголовок как активный
          setActiveId(visibleHeadings[0]);
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px', // Смещение для определения видимой области
        threshold: 0.1 // Порог видимости элемента
      }
    );

    // Наблюдаем за всеми заголовками
    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Сохраняем наблюдатель для последующего отключения
    headingObserverRef.current = observer;

    return () => {
      if (headingObserverRef.current) {
        headingObserverRef.current.disconnect();
      }
    };
  }, [headings]);

  // Обновляем оглавление при изменении статьи
  useEffect(() => {
    // Сбрасываем состояние при смене статьи
    setHeadings([]);
    setActiveId('');

    // Отключаем предыдущий observer, если он есть
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Отключаем наблюдатель за заголовками
    if (headingObserverRef.current) {
      headingObserverRef.current.disconnect();
    }

    // Создаем новый observer для отслеживания изменений в DOM
    const observer = new MutationObserver(() => {
      updateTableOfContents();
    });

    // Запускаем первоначальное обновление оглавления
    updateTableOfContents();

    // Начинаем наблюдение за изменениями в контенте статьи
    setTimeout(() => {
      const articleContent = document.querySelector('.articleContent');
      if (articleContent) {
        observer.observe(articleContent, {
          childList: true,
          subtree: true,
          characterData: true
        });
        observerRef.current = observer;
      }
    }, 300);

    return () => {
      // Очищаем ресурсы при размонтировании
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (headingObserverRef.current) {
        headingObserverRef.current.disconnect();
      }
    };
  }, [articleId]); // Зависимость от articleId для обновления при смене статьи

  // Функция для прокрутки к заголовку с учетом фиксированного верхнего бара
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Получаем родительский элемент с прокруткой
      const scrollContainer = document.querySelector('[class*="mainSection"]');
      if (scrollContainer) {
        // Получаем высоту CustomBar (примерно 5px) и добавляем отступ для лучшего UX
        const offset = 60; // Отступ в пикселях от верха
        
        // Вычисляем позицию элемента относительно контейнера прокрутки
        const elementPosition = element.getBoundingClientRect().top;
        const containerPosition = scrollContainer.getBoundingClientRect().top;
        const relativePosition = elementPosition - containerPosition;
        
        // Прокручиваем контейнер к элементу с учетом отступа
        scrollContainer.scrollBy({
          top: relativePosition - offset,
          behavior: 'smooth'
        });
        
        // Устанавливаем активный заголовок
        setActiveId(id);
      } else {
        // Запасной вариант, если не найден контейнер прокрутки
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(id);
      }
    }
  };

  if (headings.length === 0) {
    return (
      <div className={styles.tableOfContents}>
        <div className={styles.onThisPage}>На этой странице</div>
      </div>
    );
  }

  return (
    <div className={styles.tableOfContents}>
      <div className={styles.onThisPage}>На этой странице</div>
      <ul className={styles.tocList}>
        {headings.map((heading) => (
          <li key={heading.id} className={styles.tocItem}>
            <a 
              href={`#${heading.id}`} 
              className={`${styles.tocLink} ${activeId === heading.id ? styles.activeLink : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToHeading(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents;