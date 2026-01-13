# Step2Pay Business - Клиентская часть

Клиентское приложение на Next.js 15 с App Router для платформы Step2Pay Business.

## Технологии

- **Next.js 15** - React фреймворк с SSR/SSG
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **Tanstack Query** - управление состоянием и кэширование данных
- **Axios** - HTTP клиент для работы с API
- **Radix UI** - UI компоненты

## Структура проекта

```
step2pay-client/
├── src/
│   ├── app/                  # App Router страницы
│   │   ├── layout.tsx        # Корневой layout
│   │   ├── page.tsx          # Главная страница
│   │   ├── sitemap.ts        # Генерация sitemap.xml
│   │   └── robots.ts         # Генерация robots.txt
│   ├── components/           # React компоненты
│   │   ├── ui/              # UI компоненты (shadcn/ui)
│   │   └── providers.tsx    # Query Client provider
│   └── lib/                 # Утилиты и конфигурация
│       ├── api.ts           # Axios клиент
│       ├── query-client.ts  # React Query настройки
│       └── utils.ts         # Общие утилиты
├── public/                  # Статические файлы
└── .env.local              # Переменные окружения
```

## Установка и запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен версии
npm start
```

## Переменные окружения

```env
NEXT_PUBLIC_API_URL=http://localhost:8080  # URL Rust API
API_URL=http://localhost:8080              # URL для серверных запросов
NEXT_PUBLIC_SITE_NAME=Step2Pay Business
NEXT_PUBLIC_SITE_URL=https://aaa.sambacrm.online
```

## SEO оптимизация

- ✅ SSR/SSG из коробки
- ✅ Автоматическая генерация `sitemap.xml`
- ✅ Автоматическая генерация `robots.txt`
- ✅ Настройка метаданных через `Metadata API`
- ✅ Open Graph теги

## Подключение к API

API клиент настроен в `src/lib/api.ts` и использует Axios с interceptors для:
- Автоматического добавления токенов авторизации
- Обработки ошибок и редиректов

Пример использования с React Query:

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

function MyComponent() {
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/projects");
      return data;
    },
  });
}
```
