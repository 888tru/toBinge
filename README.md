# toBinge

Мобильное PWA-приложение для изучения английских слов методом интервального повторения (SM-2).

**Live:** [toBinge.vercel.app](https://tobinge.vercel.app)

---

## Возможности

- **Доски** — организуй слова и выражения по темам (сериалы, подкасты, бизнес и т.д.)
- **SM-2 алгоритм** — карточки повторяются в оптимальный момент, когда ты вот-вот забудешь
- **3 режима изучения** — Классика (открой → оцени), Диктант (напиши слово), Выбор (из 4 вариантов)
- **Стрик** — счётчик дней подряд, рекорд, заморозка на 1 пропущенный день в неделю
- **Прогресс** — уровни карточек, 30-дневный график, слабые места
- **Импорт JSON** — вставь JSON или загрузи файл; промты для ChatGPT в один клик
- **PWA** — устанавливается на экран домой, работает офлайн

## Стек

- Vite 5 + React 18 (без TypeScript)
- Inline стили через токены (`src/tokens.js`)
- `vite-plugin-pwa` + Workbox — service worker, офлайн-кеш
- Данные в `localStorage` — никакого бэкенда

## Структура

```
src/
  App.jsx        — state machine, роутинг, все обработчики
  screens.jsx    — экраны приложения
  components.jsx — переиспользуемые компоненты (Shell, Header, Nav, Toast…)
  tokens.js      — цвета, шрифты, радиусы
  icons.jsx      — inline SVG иконки
  sm2.js         — SM-2 алгоритм + Levenshtein distance
  usePWA.js      — хук установки / обновления PWA
  PWABanners.jsx — баннеры установки и обновления
```

## Локальный запуск

```bash
npm install
npm run dev      # http://localhost:5174
npm run build    # сборка в dist/
npm run preview  # превью сборки
```

## Формат импорта

```json
[
  {
    "word": "ambiguous",
    "definition": "open to more than one interpretation",
    "translation": "неоднозначный",
    "example": "The contract contained several ambiguous clauses."
  }
]
```

## Уровни карточек

| Уровень   | Интервал       |
|-----------|----------------|
| Учу       | < 1 дня        |
| Знакомо   | 1–5 дней       |
| Знаю      | 6–20 дней      |
| Владею    | 21+ дней       |
