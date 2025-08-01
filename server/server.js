const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const frontMatter = require('front-matter');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const port = 3002;
const searchCache = new NodeCache({ stdTTL: 600 });

// Разрешаем запросы с фронтенда
<<<<<<< HEAD
app.use(cors({ origin: 'http://31.129.98.20:3002' })); // Замени на домен позже
=======
app.use(cors({ origin: 'http://31.129.98.20:3002' })); // Обнови для домена позже
>>>>>>> 306420bc5c8ecd613bd6ba38d19863fddd608b9c

// Логируем все запросы
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Отдаём статику из public
app.use(express.static(path.join(__dirname, '../public')));

let articlesCache = null;

// Загружаем статьи
const loadArticles = async () => {
  if (articlesCache) {
    console.log('Использован кэш метаданных статей');
    return articlesCache;
  }

  const articlesDir = path.join(__dirname, '../public/articles');
  const articles = [];

  try {
    const files = await fs.readdir(articlesDir);
    console.log(`Найдено файлов в папке articles: ${files.length}`);

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(articlesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const { attributes } = frontMatter(content);

        if (!attributes.title || !attributes.category || !Array.isArray(attributes.tags)) {
          console.warn(`Некорректный фронтматтер в файле ${file}`);
          continue;
        }

        articles.push({
          id: file.replace('.mdx', ''),
          title: attributes.title,
          category: attributes.category,
          tags: attributes.tags,
          path: `/articles/${file.replace('.mdx', '')}`,
        });
      }
    }

    articlesCache = articles;
    console.log(`Загружено ${articles.length} статей`);
    return articles;

  } catch (error) {
    console.error('Ошибка загрузки статей:', error.message);
    return [];
  }
};

// 🔍 API поиска
app.get('/api/search', async (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const limit = 5;
  const cacheKey = `search:${query}:${limit}`;
  console.log(`Поисковый запрос: q=${query}, limit=${limit}`);

  try {
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log(`Возвращён кэшированный результат для ${cacheKey}`);
      return res.json(cached);
    }

    const articles = await loadArticles();
    const filtered = articles
      .filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      )
      .slice(0, limit);

    searchCache.set(cacheKey, filtered);
    res.json(filtered);

  } catch (error) {
    console.error('Ошибка поиска:', error.message);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});

// Fallback для React Router
app.get('*', (req, res) => {
  // Исключаем API маршруты
  if (req.path.startsWith('/api/')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 🚀 Запускаем сервер
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен: http://0.0.0.0:${port}`);
});

// Обработка ошибок
server.on('error', (error) => {
  console.error('Ошибка запуска сервера:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${port} занят! Измени порт в server.js`);
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Необработанная ошибка:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Необработанный промис:', reason);
});