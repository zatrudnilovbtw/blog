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

  const getHeadings = () => {
    const articleContent = document.querySelector('.articleContent');
    if (!articleContent) return [];
    
    const headingElements = articleContent.querySelectorAll('h2');
    const headingItems: TocItem[] = [];

    headingElements.forEach((heading, index) => {
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

  const updateTableOfContents = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const items = getHeadings();
      setHeadings(items);
      
      if (items.length > 0) {
        setActiveId(items[0].id);
      }
    }, 10);
  };

  useEffect(() => {
    if (headings.length === 0) return;

    if (headingObserverRef.current) {
      headingObserverRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id);

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0]);
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px', 
        threshold: 0.1 
      }
    );

    headings.forEach(heading => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    headingObserverRef.current = observer;

    return () => {
      if (headingObserverRef.current) {
        headingObserverRef.current.disconnect();
      }
    };
  }, [headings]);

  useEffect(() => {
    setHeadings([]);
    setActiveId('');

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (headingObserverRef.current) {
      headingObserverRef.current.disconnect();
    }

    const observer = new MutationObserver(() => {
      updateTableOfContents();
    });

    updateTableOfContents();

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
  }, [articleId]); 

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      
      const scrollContainer = document.querySelector('[class*="mainSection"]');
      if (scrollContainer) {
        const offset = 60; 
        
        const elementPosition = element.getBoundingClientRect().top;
        const containerPosition = scrollContainer.getBoundingClientRect().top;
        const relativePosition = elementPosition - containerPosition;
        
        scrollContainer.scrollBy({
          top: relativePosition - offset,
          behavior: 'smooth'
        });
        
        setActiveId(id);
      } else {
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