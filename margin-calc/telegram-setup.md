# Запуск как Telegram Mini App

Сайт уже готов к открытию внутри Telegram. Никакого бэкенда и сборки не нужно — нужен только HTTPS-адрес и бот с одной кнопкой.

## 1. Опубликуйте сайт

Залейте содержимое папки `margin-calc` на Netlify, Vercel, Cloudflare Pages или GitHub Pages. Telegram Mini App работает только по **HTTPS**.

## 2. Создайте бота

1. Напишите [@BotFather](https://t.me/BotFather).
2. Отправьте `/newbot`, придумайте имя и username.
3. Сохраните токен вида `123456:ABC-DEF...`.

## 3. Сделайте кнопку «Открыть калькулятор»

Узнайте свой `chat_id`, например у [@userinfobot](https://t.me/userinfobot) — просто отправьте ему `/start`.

### Windows (PowerShell) — самый простой способ

Откройте PowerShell и вставьте это, заменив три значения в кавычках:

```powershell
$token = "123456:ABC-DEF"
$chat  = "123456789"
$url   = "https://ВАШ-ДОМЕН/"

$markup = @{
  inline_keyboard = @(
    @(@{ text = "Открыть калькулятор"; web_app = @{ url = $url } })
  )
} | ConvertTo-Json -Depth 6 -Compress

$body = @{
  chat_id = $chat
  text = "Калькулятор маржи для Wildberries и Ozon"
  reply_markup = $markup
}

Invoke-RestMethod -Uri "https://api.telegram.org/bot$token/sendMessage" -Method Post -Body $body
```

### Linux / macOS

```bash
curl -s -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" \
  -d "chat_id=<YOUR_CHAT_ID>" \
  -d "text=Калькулятор маржи для Wildberries и Ozon" \
  --data-urlencode 'reply_markup={"inline_keyboard":[[{"text":"Открыть калькулятор","web_app":{"url":"https://ВАШ-ДОМЕН/"}}]]}'
```

После этого в чате с ботом появится сообщение с кнопкой. Нажмите её — калькулятор откроется внутри Telegram.

Можно заменить URL на страницу с нужным разделом:

- `https://ВАШ-ДОМЕН/wildberries/` — Wildberries
- `https://ВАШ-ДОМЕН/ozon/` — Ozon
- `https://ВАШ-ДОМЕН/breakeven/` — цена безубыточности

## 4. Готовые ссылки с параметром запуска

Скрипт понимает `start_param` у deep-ссылки вида:

```text
https://t.me/ВАШ_БОТ?startapp=ozon
```

Поддерживается `wb`, `ozon`, `own` — нужная вкладка откроется сразу.

## Что уже работает внутри Telegram

- Подстраивается под светлую и тёмную тему Telegram (`themeParams`).
- Кнопка «Назад» на внутренних страницах, закрытие через системную кнопку.
- Нижняя кнопка Telegram «Скопировать расчёт».
- Лёгкая вибрация при переключении вкладок, примерах и копировании.
- «Поделиться ссылкой» открывает нативное окно Telegram «Поделиться».
- Внешние ссылки открываются через `Telegram.WebApp.openLink`.
- Отступ под безопасную зону iPhone и нижнюю панель Telegram.

## Готовый текст для поста в канале

```text
🧮 Сколько вы реально зарабатываете на каждой продаже?

Калькулятор маржи для Wildberries и Ozon считает прибыль, маржу и цену безубыточности с учётом комиссии, логистики, скидки и возвратов.

Без регистрации. Все цифры остаются в вашем браузере.

Открыть калькулятор → [кнопка web_app]

Создатель: @merzter
```

## Если нужна обычная ссылка для чата/канала

Метатеги `og:title`, `og:description` и `og:image` уже настроены — ссылка на сайт будет красиво предпросматриваться в Telegram. Картинка лежит в `og-image.svg`.

> Если вы имели в виду именно новую функцию Telegram Sites (публикация сайта через Telegram), статические файлы подходят и там: достаточно залить эту же папку и указать домен. Код, шрифты и метаданные уже готовы.
