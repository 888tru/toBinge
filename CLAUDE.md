# toBinge — CLAUDE.md

Vite 5 + React 18 SPA, без TypeScript. Стили inline через объект `T` из `src/tokens.js`.
Роутинг через `useState(route)` в `App.jsx` — никаких react-router.
Данные в `localStorage` (`tobinge-boards`, `tobinge-streak`).
PWA: `vite-plugin-pwa` + Workbox, установка через `usePWA.js`.

## Структура

```
src/
  App.jsx        — state machine, все обработчики, роутинг
  screens.jsx    — экраны (Screen*)
  components.jsx — Shell, Header, BottomNav, Toast, AnswerButton, ...
  tokens.js      — T (цвета, радиусы, шрифты)
  icons.jsx      — I (inline SVG)
  usePWA.js      — хук install/update banner
  PWABanners.jsx — InstallBanner, UpdateBanner
  data.js        — SAMPLE_* (не используется как initial state)
```

## Модель данных

```js
// Board
{ id, name, color, total, due, done, cards: [] }

// Card
{ id, type: 'word'|'phrase', word, definition, translation, example, level: 'new'|'learning'|'know'|'master' }

// Streak (tobinge-streak)
{ count, lastDate, days30: number[] }
```

## Деплой

GitHub: `git@github.com:888tru/toBinge.git` → ветка `main`
Vercel: автодеплой при пуше, URL `https://tobinge.vercel.app`

---

## Бэклог по спринтам

### Sprint 1 — Critical bugs & missing core
> Статус: 🔲 не начат

- [ ] **Удалить доску** — кнопка удаления в `ScreenBoard` (хедер или свайп). В `App.jsx` добавить `onDeleteBoard`.
- [ ] **Тип карточки при создании** — в `onSaveCard` использовать активный `boardTab` (`'words'` → `type: 'word'`, `'phrases'` → `type: 'phrase'`).
- [ ] **Clipboard copy** — в `onCopyPrompt` вызвать `navigator.clipboard.writeText(promptText)` с реальным текстом промта.
- [ ] **Загрузка JSON файла** — добавить `<input type="file" accept=".json">` в `ScreenImport`, читать через `FileReader`, парсить так же как `pasted`.
- [ ] **Скрыть пустые поля при изучении** — в `ScreenStudyBack` рендерить `ExpandPill` для перевода/примера только если `card.translation` / `card.example` не пустые. Аналогично в `ScreenDictation`.
- [ ] **Режим "Выбор" — исправить логику** — сейчас показывает definition, просит выбрать word. Нужно наоборот: показывать слово (`card.word`), 4 варианта определений (`card.definition`). Обновить `ScreenStudyChoice`.

---

### Sprint 2 — SM-2 алгоритм + реальные due dates
> Статус: 🔲 не начат

Центральная механика всего приложения.

**Новые поля карточки:**
```js
{ ...card, interval: 1, easeFactor: 2.5, dueDate: '2025-05-23', lapses: 0 }
```

- [ ] **Функция `sm2(card, rating)`** в `src/sm2.js` — пересчитывает `interval`, `easeFactor`, `dueDate`:
  - `again` → interval=1, easeFactor -= 0.2 (min 1.3), lapses++
  - `hard`  → interval = round(interval * 1.2), easeFactor -= 0.15
  - `easy`  → interval = round(interval * easeFactor), easeFactor += 0.1
  - `dueDate` = today + interval дней
- [ ] **Обновить `onAnswer`** в `App.jsx` — вызывать `sm2(card, rating)` вместо текущего `nextLevel`.
- [ ] **"X сегодня" на доске** — `due` = карточки где `dueDate <= today || !dueDate`. Вычислять при открытии доски или через `useMemo`.
- [ ] **Сессия** — `studyDeck` = сначала due-карточки, потом новые (без dueDate) до лимита по времени.
- [ ] **Счётчик `lapses`** на карточке — инкрементировать в SM-2 при `again`.

---

### Sprint 3 — Progress & Streak
> Статус: 🔲 не начат

- [ ] **Лучший стрик** — добавить `bestStreak` в `tobinge-streak`, обновлять в `recordStudySession` когда `count > prev.bestStreak`. Показать в `ScreenProgress` рядом с текущим стриком.
- [ ] **7 точек по реальным датам** — хранить массив `studyDates: string[]` (ISO даты) в streak-объекте. Точка закрашена если дата есть в массиве.
- [ ] **Заморозка стрика** — в `recordStudySession`: если пропущено 1 день И `freezeUsedWeek !== currentWeek` → не сбрасывать стрик, записать `freezeUsedWeek`. Хранить в streak-объекте.
- [ ] **Слабые места** — секция в `ScreenProgress`: `allCards.filter(c => c.lapses > 0).sort((a,b) => b.lapses - a.lapses).slice(0, 5)`. Показывать слово + число промахов.
- [ ] **Диктант: допуск на 1 опечатку** — реализовать Levenshtein distance в `src/utils.js`, считать правильным если `levenshtein(input, card.word) <= 1`.

---

### Sprint 4 — Settings + Data export/import
> Статус: 🔲 не начат

- [ ] **Экран настроек** — новый роут `settings`. Кнопка в `ScreenProgress` (иконка шестерёнки) или отдельная вкладка в CustomNav.
- [ ] **Экспорт JSON** — `JSON.stringify({ boards, streak })` → `Blob` → скачать как `tobinge-backup.json`.
- [ ] **Импорт резервной копии** — `<input type="file" accept=".json">` → parse → диалог подтверждения → `setBoards` + `setStreak`.

---

### Sprint 5 — Notifications
> Статус: 🔲 не начат

- [ ] **Запрос разрешения** — предложить после первой завершённой сессии (`Notification.requestPermission()`).
- [ ] **Ежедневное напоминание** — хранить `notificationTime` в настройках, в Service Worker (`sw.js`) регистрировать `setTimeout` или `setInterval` для `self.registration.showNotification`.
- [ ] **Стрик под угрозой** — если `lastDate !== today` и время > 20:00 → уведомление "🔥 Не забудь позаниматься сегодня".

---

### Sprint 6 — Share Target (Android)
> Статус: 🔲 не начат

Только Android Chrome. iOS не поддерживает Share Target.

- [ ] **`manifest.webmanifest`** — добавить:
  ```json
  "share_target": {
    "action": "/",
    "method": "GET",
    "params": { "text": "word" }
  }
  ```
- [ ] **URL handler в `App.jsx`** — при старте читать `new URLSearchParams(location.search).get('word')`, если есть → открыть `ScreenNewCard` с `form.word` pre-filled.

---

## Полезные команды

```bash
npm run dev      # dev сервер на :5174
npm run build    # сборка в dist/
npm run preview  # превью сборки
node scripts/gen-icons.mjs  # регенерация PNG иконок из public/icon.svg
git push origin main        # → Vercel автодеплой
```
