import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Link } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import styles from './SearchBar.module.css';

// Тип для данных статьи, возвращаемых сервером
interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  path: string;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);

  // Выполнение поиска
  useEffect(() => {
    if (debouncedSearchQuery.trim() === '') {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchQuery)}&limit=10`);
        if (!response.ok) throw new Error('Failed to fetch search results');
        const data: Article[] = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Ошибка поиска:', error instanceof Error ? error.message : error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchQuery]);

  return (
    <div className={styles.searchContainer}>
      <CiSearch className={styles.searchIcon} />
      <input
        type="text"
        placeholder="Искать статью..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {isLoading ? (
        <div className={styles.searchResults}>
          <div className={styles.searchResultItem}>Загрузка...</div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className={styles.searchResults}>
          {searchResults.map((article) => (
            <Link
              key={article.id}
              to={`/guide/${article.id}`}
              className={styles.searchResultItem}
              onClick={() => setSearchQuery('')}
            >
              <div className={styles.resultTitle}>{article.title}</div>
            </Link>
          ))}
        </div>
      ) : (
        searchQuery && (
          <div className={styles.searchResults}>
            <div className={styles.searchResultItem}>Нет результатов</div>
          </div>
        )
      )}
    </div>
  );
}