# Resume-Up

Простой сервис для обновления даты публикации резюме на сайте hh.ru

# Установка

Для работы приложения необходима версия Node.js 18 и выше (из-за stable fetch-api)

Наберите следующие комманды для запуска

```typescript
npm ci
npm run start
```

Для запуска необходим файл конфигурации app.config.ts, скопируйте его из шаблона app.config.example.ts

```typescript
const appConfig: Config = {
    baseConfig: {
        port: 3000,
        syncDatabase: true, // создает файл app.db (SQlite)
    },
    headHunterConfig: {
        redirectUrl: 'http://localhost:3000/user/auth', // передается в качестве параметра в ссылку авторизации на hh.ru
        clientId: 'ENTER_CLIENT_ID', // получить данные можно на сайте dev.hh.ru
        clientSecret: 'ENTER_CLIENT_SECRET',
        userAgent: 'UpResume/0.1 (bedrew@yandex.com)', // необходимо указать свой email и название приложения
    },
    telegramConfig: {
        botToken: 'ENTER_BOT_TOKEN' // получить токен можно у @BotFather
    }
}
```
