# Личный кабинет клиента - Документация

## Реализовано

### Структура проекта

```
src/
├── app/
│   ├── cabinet/
│   │   ├── layout.tsx          # Layout кабинета с проверкой авторизации
│   │   ├── login/
│   │   │   └── page.tsx        # Страница логина
│   │   └── page.tsx            # Главная страница кабинета
│   └── layout.tsx              # Корневой layout с AuthProvider
│
├── lib/
│   ├── auth/
│   │   ├── types.ts            # Типы для авторизации
│   │   ├── token-manager.ts    # Управление токенами (cabinet_token)
│   │   └── api.ts              # API методы (login, logout, getMe)
│   └── api.ts                  # HTTP клиент с interceptors
│
├── contexts/
│   └── auth-context.tsx        # React контекст для авторизации
│
└── components/
    ├── auth/
    │   └── login-form.tsx      # Форма логина
    └── ui/
        ├── button.tsx
        ├── card.tsx
        ├── input.tsx
        └── label.tsx
```

## Функционал

### 1. Авторизация

**Токены**: Используется `cabinet_token` и `cabinet_refresh_token` в localStorage

**API эндпоинты**:
- `POST /auth/login` - вход в систему
- `POST /auth/refresh` - обновление токена
- `GET /api/client/me` - данные текущего пользователя

**Особенности**:
- Автоматическая проверка роли `client` в JWT токене
- Автоматическое обновление токена при истечении
- Редирект на `/cabinet/login` при 401 ошибке
- Защита роутов через `AuthContext`

### 2. Страница логина `/cabinet/login`

**Функционал**:
- Поля: username/email и password
- Кнопка показать/скрыть пароль
- Обработка ошибок авторизации
- Автоматический редирект в кабинет после входа
- Красивый градиентный фон

### 3. Главная страница кабинета `/cabinet`

**Отображаемые данные**:

**Личные данные пользователя**:
- Email
- Телефон
- Логин
- Адрес (если есть)

**Для специалистов**:
- Должность
- Специализация

**Для клиентов**:
- Тип клиента (физ. лицо / организация)

**Настройки организации**:
- Публичные настройки тенанта из `core_profiles.public_settings`
- Название компании
- Домен

### 4. Layout кабинета

**Шапка кабинета**:
- Иконка и название "Личный кабинет"
- Название организации
- Отображение имени пользователя и email
- Кнопка "Выйти"

**Защита роутов**:
- Автоматический редирект на `/cabinet/login` если не авторизован
- Проверка токена при загрузке
- Loading состояние

## API Backend

Все эндпоинты уже реализованы в backend:

### GET /api/client/me

Возвращает данные текущего клиента:

```typescript
{
  success: true,
  data: {
    account_id: string,
    username?: string,
    email: string,
    name?: string,
    first_name?: string,
    last_name?: string,
    phone?: string,
    profile_id: string,
    domain?: string,
    company_name?: string,
    entity_type?: "customer" | "specialist",
    // Данные customer или specialist
    ...
  }
}
```

### GET /public/settings?domain={domain}

Возвращает публичные настройки тенанта (без авторизации):

```typescript
{
  domain: string,
  settings: { ... }
}
```

## Запуск

### Настройка API URL

URL бэкенда настраивается в файле `src/local_config.js`:

```javascript
export const config = {
  api: "http://localhost:8080",
  // api: "https://api.sambacrm.online",  // для продакшена
}
```

Просто раскомментируйте нужную строку или укажите свой URL.

### Разработка

```bash
cd sambacrm-business-client
npm run dev
# или
pnpm dev
```

Приложение будет доступно на `http://localhost:3000`

### Переменные окружения

**Внимание**: API URL настраивается в `src/local_config.js`, но вы также можете использовать переменные окружения создав `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Однако `local_config.js` имеет приоритет над env переменными.

## Использование

### 1. Запустите backend

```bash
cd sambacrm-business-back
cargo run
```

### 2. Создайте клиента с аккаунтом через админку

В админке создайте клиента или специалиста с чекбоксом "Создать аккаунт"

### 3. Войдите в кабинет

Откройте `http://localhost:3000/cabinet/login` и войдите с учетными данными

## Технологии

- **Next.js 16** - React фреймворк
- **TypeScript** - типизация
- **Tailwind CSS 4** - стилизация
- **@tanstack/react-query** - работа с API
- **Axios** - HTTP клиент
- **Zod** - валидация
- **Lucide React** - иконки
- **Radix UI** - UI примитивы

## Дальнейшее развитие

В будущем можно добавить:

1. **Профиль пользователя** (`/cabinet/profile`)
   - Редактирование личных данных
   - Смена пароля
   - Аватар

2. **Записи/Заказы** (`/cabinet/appointments`)
   - Список записей
   - История заказов
   - Создание новых записей

3. **Уведомления** (`/cabinet/notifications`)
   - Список уведомлений
   - Настройки уведомлений

4. **Баланс** (`/cabinet/balance`)
   - История операций
   - Пополнение баланса
   - Бонусная программа

5. **Поддержка модулей**
   - Динамическая навигация в зависимости от подключенных модулей
   - Условный рендеринг секций

## Структура токенов

| Роль | Token Key | Refresh Token Key |
|------|-----------|------------------|
| Client | `cabinet_token` | `cabinet_refresh_token` |
| Admin | `token` | `refresh_token` |
| Root | `root_token` | `root_refresh_token` |

Различие пользователей происходит по полю `role` в JWT токене.
