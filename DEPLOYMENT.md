# 🚀 Инструкция по деплою

## 📋 Что было исправлено

### ✅ **ФАЗА 1: Настройка сервера**
- Добавлены переменные окружения (PORT, NODE_ENV, CORS_ORIGIN)
- Настроен CORS для разных доменов (dev/prod)
- Добавлен graceful shutdown
- Улучшено логирование и обработка ошибок
- Добавлен health check endpoint `/api/health`

### ✅ **ФАЗА 2: Исправление сборки**
- Исправлены скрипты в package.json
- Настроен Vite для правильной сборки
- Добавлены production команды
- Создан файл .env.example

### ✅ **ФАЗА 3: Унификация архитектуры**
- Удален `import.meta.glob()` из frontend
- Все данные теперь через API сервера
- Добавлены новые API endpoints:
  - `GET /api/articles` - список всех статей
  - `GET /api/articles/:slug` - конкретная статья
  - `GET /api/search` - поиск статей
  - `GET /api/health` - проверка состояния

---

## 🛠️ Локальное тестирование

### 1. Development режим
```bash
# Терминал 1: Запуск сервера
npm run dev:server

# Терминал 2: Запуск frontend
npm run dev
```

### 2. Production тест (локально)
```bash
# Автоматический тест
node test-production.js

# Или вручную:
npm run build
npm run start:prod
```

---

## 🌐 Деплой на VPS

### 1. Подготовка сервера
```bash
# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка Nginx
sudo apt update
sudo apt install nginx
```

### 2. Загрузка проекта
```bash
# Клонирование репозитория
git clone <your-repo-url> /var/www/blog
cd /var/www/blog

# Установка зависимостей
npm install
cd server && npm install && cd ..

# Сборка проекта
npm run build
```

### 3. Настройка переменных окружения
```bash
# Создать .env файл
sudo nano /var/www/blog/.env
```

Содержимое .env:
```env
NODE_ENV=production
PORT=3002
CORS_ORIGIN=https://yourdomain.com
```

### 4. Настройка PM2
```bash
# Создать ecosystem файл
sudo nano /var/www/blog/ecosystem.config.js
```

Содержимое ecosystem.config.js:
```javascript
module.exports = {
  apps: [{
    name: 'blog',
    script: './server/server.js',
    cwd: '/var/www/blog',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
};
```

### 5. Запуск приложения
```bash
# Запуск через PM2
cd /var/www/blog
pm2 start ecosystem.config.js

# Сохранить конфигурацию PM2
pm2 save
pm2 startup
```

### 6. Настройка Nginx
```bash
# Создать конфигурацию сайта
sudo nano /etc/nginx/sites-available/blog
```

Содержимое конфигурации:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активировать сайт
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL сертификат (Let's Encrypt)
```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔍 Проверка работоспособности

### API Endpoints для тестирования:
- `GET /api/health` - статус сервера
- `GET /api/articles` - список статей
- `GET /api/articles/aicar` - конкретная статья
- `GET /api/search?q=aicar` - поиск

### Команды мониторинга:
```bash
# Статус PM2
pm2 status
pm2 logs blog

# Статус Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Проверка портов
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3002
```

---

## 🔧 Обновление приложения

```bash
# На сервере
cd /var/www/blog
git pull origin main
npm install
cd server && npm install && cd ..
npm run build
pm2 restart blog
```

---

## 📊 Структура проекта после деплоя

```
/var/www/blog/
├── dist/                 # Собранный frontend
├── server/              # Backend сервер
├── public/articles/     # MDX статьи
├── ecosystem.config.js  # PM2 конфигурация
├── .env                # Переменные окружения
└── ...
```

---

## ⚠️ Важные замечания

1. **Порты**: Убедитесь что порт 3002 свободен
2. **Домен**: Замените `yourdomain.com` на ваш домен
3. **CORS**: Обновите CORS_ORIGIN в .env
4. **Файрвол**: Откройте порты 80 и 443
5. **Бэкапы**: Настройте регулярные бэкапы статей

---

## 🆘 Решение проблем

### Сервер не запускается:
```bash
pm2 logs blog
sudo netstat -tlnp | grep :3002
```

### Nginx ошибки:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### API не отвечает:
```bash
curl http://localhost:3002/api/health
curl http://yourdomain.com/api/health
```