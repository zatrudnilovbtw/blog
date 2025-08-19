const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const frontMatter = require('front-matter');
const cors = require('cors');
const NodeCache = require('node-cache');
const chokidar = require('chokidar');

const app = express();

// Переменные окружения
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || (NODE_ENV === 'production' ? 'https://braint.ru' : 'http://localhost:5173');

// Кэш для поиска и статей
const searchCache = new NodeCache({ stdTTL: 600 });

// CORS настройка для разных окружений
const corsOptions = {
  origin: NODE_ENV === 'development' ? ['http://localhost:5173', 'http://localhost:3000'] : CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Middleware для обработки JSON
app.use(express.json());

// Статические файлы - разные пути для dev и prod
const staticPath = NODE_ENV === 'production' 
  ? path.join(__dirname, '../dist') 
  : path.join(__dirname, '../public');

console.log(`📁 Статические файлы: ${staticPath}`);
app.use(express.static(staticPath));

// Дополнительно обслуживаем файлы из public в любом случае
app.use('/articles', express.static(path.join(__dirname, '../public/articles')));

let articlesCache = null;
let cacheTime = null;
const CACHE_TTL = NODE_ENV === 'development' ? 5000 : 300000; // 5 сек в dev, 5 мин в prod

// Функция для очистки кэша
const clearCache = () => {
  articlesCache = null;
  cacheTime = null;
  searchCache.flushAll();
  console.log('🗑️ Кэш очищен из-за изменения файлов');
};

const loadArticles = async () => {
  const now = Date.now();
  
  // В dev режиме кэш живет только 5 секунд, в prod - 5 минут
  if (articlesCache && cacheTime && (now - cacheTime) < CACHE_TTL) {
    console.log('Использован кэш метаданных статей');
    return articlesCache;
  }
  
  console.log('Обновляем кэш статей...');

  const articlesDir = path.join(__dirname, '../public/articles');
  const articles = [];

  try {
    const files = await fs.readdir(articlesDir);
    console.log(`Найдено файлов в папке articles: ${files.length}`);

    for (const file of files) {
      if (file.endsWith('.mdx')) {
        const filePath = path.join(articlesDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        let lastModifiedIso = null;
        try {
          const stat = await fs.stat(filePath);
          lastModifiedIso = new Date(stat.mtime).toISOString();
        } catch (_) {}
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
          lastModified: lastModifiedIso,
          aliases: Array.isArray(attributes.aliases)
            ? attributes.aliases
            : (attributes.aliases ? [attributes.aliases] : []),
        });
      }
    }

    articlesCache = articles;
    cacheTime = Date.now();
    console.log(`Загружено ${articles.length} статей`);
    return articles;

  } catch (error) {
    console.error('Ошибка загрузки статей:', error.message);
    return [];
  }
};

// API для получения всех статей
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await loadArticles();
    res.json(articles);
  } catch (error) {
    console.error('Ошибка получения статей:', error.message);
    res.status(500).json({ error: 'Failed to load articles' });
  }
});

// API для получения конкретной статьи - возвращаем raw MDX
app.get('/api/articles/:slug', async (req, res) => {
  const { slug } = req.params;
  const cacheKey = `article:${slug}`;
  
  try {
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log(`Возвращена кэшированная статья: ${slug}`);
      return res.json(cached);
    }

    const articlesDir = path.join(__dirname, '../public/articles');
    const filePath = path.join(articlesDir, `${slug}.mdx`);
    
    const content = await fs.readFile(filePath, 'utf-8');
    const { attributes, body } = frontMatter(content);
    
    const articleData = {
      slug,
      content: body, // Возвращаем raw MDX контент
      frontMatter: attributes,
      title: attributes.title || slug,
      category: attributes.category || 'Без категории'
    };
    
    searchCache.set(cacheKey, articleData);
    res.json(articleData);
    
  } catch (error) {
    console.error(`Ошибка получения статьи ${slug}:`, error.message);
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.status(500).json({ error: 'Failed to load article' });
  }
});

// API для поиска статей
app.get('/api/search', async (req, res) => {
  const rawQuery = String(req.query.q || '').trim();
  const limit = parseInt(req.query.limit) || 5;
  const cacheKey = `search:${rawQuery}:${limit}`;
  console.log(`Поисковый запрос: q=${rawQuery}, limit=${limit}`);

  try {
    const cached = searchCache.get(cacheKey);
    if (cached) {
      console.log(`Возвращён кэшированный результат для ${cacheKey}`);
      return res.json(cached);
    }

    const articles = await loadArticles();
    
    // Нормализация для устойчивого поиска (регистр, дефисы, диакритика, ё→е)
    const normalize = (s = '') => String(s)
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/ё/g, 'е')
      .replace(/[\-_/.,]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const q = normalize(rawQuery);
    const tokens = q.length ? q.split(' ') : [];

    const scoreArticle = (a) => {
      const title = normalize(a.title);
      const category = normalize(a.category);
      const tags = (a.tags || []).map(normalize).join(' ');
      const aliases = (a.aliases || []).map(normalize).join(' ');
      const id = normalize(a.id);

      const haystackAll = [title, category, tags, aliases, id].join(' ');
      if (!tokens.length) return 0;

      let score = 0;
      for (const t of tokens) {
        const inTitle = title.includes(t);
        const inAliases = aliases.includes(t);
        const inTags = tags.includes(t);
        const inCategory = category.includes(t);
        const inId = id.includes(t);
        if (inTitle) score += 3;
        if (inAliases) score += 3;
        if (inTags) score += 1;
        if (inCategory) score += 1;
        if (inId) score += 1;
      }

      // Бонус за полное совпадение любой из строк
      if (haystackAll.includes(q)) score += 2;
      return score;
    };

    const scored = articles
      .map(a => ({ a, score: scoreArticle(a) }))
      .filter(x => x.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, limit)
      .map(x => x.a);

    searchCache.set(cacheKey, scored);
    res.json(scored);

  } catch (error) {
    console.error('Ошибка поиска:', error.message);
    res.status(500).json({ error: 'Failed to search articles' });
  }
});


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // В продакшене отдаем index.html из dist, в dev из public
  const indexPath = NODE_ENV === 'production' 
    ? path.join(__dirname, '../dist/index.html')
    : path.join(__dirname, '../public/index.html');
    
  res.sendFile(indexPath);
});



const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер запущен: http://0.0.0.0:${PORT}`);
  console.log(`🌍 Окружение: ${NODE_ENV}`);
  console.log(`🔗 CORS разрешен для: ${Array.isArray(corsOptions.origin) ? corsOptions.origin.join(', ') : corsOptions.origin}`);
  
  // Предзагружаем статьи при старте
  loadArticles().then(articles => {
    console.log(`📚 Предзагружено ${articles.length} статей`);
  });
});

// Настраиваем файловый watcher для автоматической очистки кэша
const articlesDir = path.join(__dirname, '../public/articles');
const watcher = chokidar.watch(articlesDir, {
  ignored: /(^|[\/\\])\../, // игнорируем скрытые файлы
  persistent: true
});

watcher
  .on('add', (filePath) => {
    console.log(`📄 Файл добавлен: ${path.basename(filePath)}`);
    clearCache();
  })
  .on('change', (filePath) => {
    console.log(`📝 Файл изменен: ${path.basename(filePath)}`);
    clearCache();
  })
  .on('unlink', (filePath) => {
    console.log(`🗑️ Файл удален: ${path.basename(filePath)}`);
    clearCache();
  })
  .on('ready', () => {
    console.log('👀 Файловый watcher готов к отслеживанию изменений в папке articles');
  })
  .on('error', (error) => {
    console.error('❌ Ошибка файлового watcher:', error);
  });

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT} занят! Измени переменную PORT`);
  }
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Получен сигнал ${signal}. Завершаем работу...`);
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
    searchCache.flushAll();
    watcher.close().then(() => {
      console.log('✅ Файловый watcher закрыт');
      process.exit(0);
    });
  });
  
  // Принудительное завершение через 10 секунд
  setTimeout(() => {
    console.error('❌ Принудительное завершение');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанный промис:', reason);
  console.error('Promise:', promise);
});