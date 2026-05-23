import { useState, useEffect, useMemo } from 'react';
import { T } from './tokens.js';
import { CustomNav, Toast, HOME_IND } from './components.jsx';
import { usePWA } from './usePWA.js';
import { InstallBanner, UpdateBanner } from './PWABanners.jsx';
import { sm2, levenshtein } from './sm2.js';
import {
  ScreenHome, ScreenBoard, ScreenImport, ScreenNewCard, ScreenCardDetail,
  ScreenNewBoard, ScreenModePick, ScreenStudyFront, ScreenStudyBack,
  ScreenDictation, ScreenStudyChoice, ScreenProgress,
} from './screens.jsx';

// ── localStorage persistence ─────────────────────────────────────
function loadBoards() {
  try {
    const raw = localStorage.getItem('tobinge-boards');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveBoards(boards) {
  localStorage.setItem('tobinge-boards', JSON.stringify(boards));
}

// ── Streak tracking ──────────────────────────────────────────────
const STREAK_DEFAULTS = { count: 0, bestStreak: 0, lastDate: null, days30: [], studyDates: [], freezeUsedWeek: null };

function getISOWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return `${d.getUTCFullYear()}-W${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
}

function loadStreak() {
  try {
    const raw = localStorage.getItem('tobinge-streak');
    return { ...STREAK_DEFAULTS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...STREAK_DEFAULTS };
  }
}

function recordStudySession(cardsStudied) {
  const today       = new Date().toISOString().slice(0, 10);
  const yesterday   = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const currentWeek = getISOWeek(today);
  const prev        = loadStreak();

  let count          = prev.count || 0;
  let freezeUsedWeek = prev.freezeUsedWeek || null;

  if (prev.lastDate === today) {
    // already studied today — count unchanged
  } else if (prev.lastDate === yesterday) {
    count += 1;
  } else {
    const gapDays = prev.lastDate
      ? Math.round((new Date(today) - new Date(prev.lastDate)) / 86400000)
      : 999;
    if (gapDays === 2 && freezeUsedWeek !== currentWeek) {
      count += 1;                   // streak freeze: 1 missed day allowed per week
      freezeUsedWeek = currentWeek;
    } else {
      count = 1;
    }
  }

  const bestStreak = Math.max(count, prev.bestStreak || 0);

  // Study dates (keep 90 days)
  const studyDates = [...(prev.studyDates || [])];
  if (!studyDates.includes(today)) studyDates.push(today);
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const filteredDates = studyDates.filter(d => d >= cutoff);

  // 30-day bar chart array
  const days30 = [...(prev.days30 || [])];
  if (prev.lastDate === today) {
    days30[days30.length - 1] = (days30[days30.length - 1] || 0) + cardsStudied;
  } else {
    const gap = prev.lastDate
      ? Math.min(30, Math.round((new Date(today) - new Date(prev.lastDate)) / 86400000) - 1)
      : 0;
    for (let i = 0; i < gap; i++) days30.push(0);
    days30.push(cardsStudied);
    if (days30.length > 30) days30.splice(0, days30.length - 30);
  }

  const next = { count, bestStreak, lastDate: today, days30, studyDates: filteredDates, freezeUsedWeek };
  localStorage.setItem('tobinge-streak', JSON.stringify(next));
  return next;
}

// ── Generate unique id ───────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

export default function App() {
  const { canInstall, triggerInstall, needRefresh, updateServiceWorker } = usePWA();
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updateDismissed,  setUpdateDismissed]  = useState(false);

  // ── Core state ───────────────────────────────────────────────────
  const [boards, setBoards] = useState(loadBoards);
  const [streak, setStreak] = useState(loadStreak);

  // Persist boards on every change
  useEffect(() => { saveBoards(boards); }, [boards]);

  const [route,         setRoute]         = useState('home');
  const [navTab,        setNavTab]        = useState('boards');
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [boardTab,      setBoardTab]      = useState('words');
  const [activeCardId,  setActiveCardId]  = useState(null);

  // ── Import ───────────────────────────────────────────────────────
  const [pasted, setPasted] = useState('');
  const [draft,  setDraft]  = useState([]);
  const [copied, setCopied] = useState(null);

  // ── New / edit card form ─────────────────────────────────────────
  const [form,       setForm]       = useState({ word: '', definition: '', translation: '', example: '' });
  const [focusField, setFocusField] = useState(null);

  // ── New board form ───────────────────────────────────────────────
  const [boardForm, setBoardForm] = useState({ name: '', color: '#d4f564' });

  // ── Study setup ──────────────────────────────────────────────────
  const [duration,     setDuration]     = useState(15);
  const [mode,         setMode]         = useState('classic');
  const [sessionDeck,  setSessionDeck]  = useState([]);

  // ── Study runtime ────────────────────────────────────────────────
  const [studyIdx,     setStudyIdx]     = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [showTrans,    setShowTrans]    = useState(false);
  const [showEx,       setShowEx]       = useState(false);
  const [dictInput,    setDictInput]    = useState('');
  const [dictResult,   setDictResult]   = useState(null);
  const [choiceResult, setChoiceResult] = useState(null); // null | 'correct' | 'wrong'
  const [sessionCards, setSessionCards] = useState(0);

  // ── Toast ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2200);
  };

  // ── Nav sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (navTab === 'progress') { setRoute('progress'); return; }
    if (navTab === 'boards')   { setRoute('home');     return; }
    if (navTab === 'study') {
      if (!activeBoard) { showToast('Сначала создай доску'); setNavTab('boards'); return; }
      if (!activeBoard.cards?.length) { showToast('Добавь карточки в доску'); setNavTab('boards'); return; }
      setRoute('modepick');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navTab]);

  // ── Derived ──────────────────────────────────────────────────────
  const activeBoard = boards.find(b => b.id === activeBoardId) || null;
  const activeCard  = activeBoard?.cards?.find(c => c.id === activeCardId) || null;

  const studyDeck = useMemo(() => {
    if (!activeBoard) return [];
    const today      = new Date().toISOString().slice(0, 10);
    const typeFilter = boardTab === 'words' ? 'word' : 'phrase';
    const cards      = (activeBoard.cards || []).filter(c => c.type === typeFilter);
    const due        = cards.filter(c => !c.dueDate || c.dueDate <= today);
    const fresh      = cards.filter(c => c.dueDate  && c.dueDate >  today);
    const limit      = Math.ceil((duration / 30) * 20 + 5);
    return [...due, ...fresh].slice(0, limit);
  }, [activeBoard, boardTab, duration]);

  const studyCard = sessionDeck[studyIdx] ?? null;

  // ── Progress computed from real data ─────────────────────────────
  const allCards = useMemo(() => boards.flatMap(b => b.cards || []), [boards]);
  const levels = useMemo(() => [
    { id: 'new',      label: 'Учу',     count: allCards.filter(c => c.level === 'new'      || !c.level).length },
    { id: 'learning', label: 'Знакомо', count: allCards.filter(c => c.level === 'learning').length },
    { id: 'know',     label: 'Знаю',    count: allCards.filter(c => c.level === 'know').length     },
    { id: 'master',   label: 'Владею',  count: allCards.filter(c => c.level === 'master').length   },
  ], [allCards]);
  const weakSpots = useMemo(() =>
    allCards.filter(c => (c.lapses || 0) > 0)
      .sort((a, b) => (b.lapses || 0) - (a.lapses || 0))
      .slice(0, 5),
  [allCards]);

  // ── Handlers ─────────────────────────────────────────────────────
  const goBack = () => {
    const map = {
      board:    () => { setRoute('home');    setNavTab('boards'); },
      import:   () => setRoute('board'),
      new:      () => setRoute('board'),
      newboard: () => setRoute('home'),
      modepick: () => setRoute('board'),
      study:    () => setRoute('modepick'),
      carddetail:() => setRoute('board'),
      progress: () => { setRoute('home');    setNavTab('boards'); },
    };
    (map[route] || (() => setRoute('home')))();
  };

  const onOpenBoard  = (id) => { setActiveBoardId(id); setRoute('board'); };
  const onOpenCard   = (id) => { setActiveCardId(id);  setRoute('carddetail'); };

  const onStartStudy = () => {
    if (!studyDeck.length) { showToast('Нет карточек для изучения'); return; }
    setSessionDeck([...studyDeck]);
    setStudyIdx(0); setStudyFlipped(false); setShowTrans(false); setShowEx(false);
    setDictInput(''); setDictResult(null); setChoiceResult(null); setSessionCards(0);
    setRoute('study');
  };

  const resetCard = () => {
    setStudyFlipped(false); setShowTrans(false); setShowEx(false);
    setDictInput(''); setDictResult(null); setChoiceResult(null);
  };

  const advance = (studied = true) => {
    resetCard();
    const next = studyIdx + 1;
    if (studied) setSessionCards(n => n + 1);
    if (next >= studyDeck.length) {
      const count = sessionCards + (studied ? 1 : 0);
      const s = recordStudySession(count);
      setStreak(s);
      showToast(`Сессия завершена · ${count} карточек`);
      setRoute('board');
      setStudyIdx(0);
    } else {
      setStudyIdx(next);
    }
  };

  const onAnswer = (rating) => {
    const card = studyCard;
    if (card && activeBoard) {
      const updated = sm2(card, rating);
      setBoards(bs => bs.map(b => b.id === activeBoard.id ? {
        ...b, cards: b.cards.map(c => c.id === card.id ? updated : c),
      } : b));
    }
    const msgs = { easy: 'Легко!', hard: 'Сложно — повторим позже', again: 'Снова в очередь' };
    showToast(msgs[rating]);
    advance(true);
  };

  const onCheckDictation = () => {
    if (!dictInput.trim() || !studyCard) return;
    const a  = dictInput.trim().toLowerCase();
    const b  = studyCard.word.toLowerCase();
    const ok = a === b || levenshtein(a, b) <= 1;
    setDictResult(ok ? 'correct' : 'wrong');
    if (activeBoard) {
      const updated = sm2(studyCard, ok ? 'easy' : 'again');
      setBoards(bs => bs.map(board => board.id === activeBoard.id ? {
        ...board, cards: board.cards.map(c => c.id === studyCard.id ? updated : c),
      } : board));
    }
    if (ok) showToast('Правильно!');
  };

  const onChoicePick = (definition) => {
    if (!studyCard || choiceResult) return;
    const ok = definition === studyCard.definition;
    setChoiceResult(ok ? 'correct' : 'wrong');
    if (activeBoard) {
      const updated = sm2(studyCard, ok ? 'easy' : 'again');
      setBoards(bs => bs.map(board => board.id === activeBoard.id ? {
        ...board, cards: board.cards.map(c => c.id === studyCard.id ? updated : c),
      } : board));
    }
    setTimeout(() => advance(true), 700);
  };

  const PROMPTS = {
    words:   'Создай 20 английских слов для изучения. Ответь строго в JSON:\n[{"word":"...","definition":"definition in English","translation":"перевод на русский","example":"example sentence"}]',
    phrases: 'Создай 20 английских выражений и фраз. Ответь строго в JSON:\n[{"word":"the phrase","definition":"meaning in English","translation":"перевод на русский","example":"example sentence"}]',
  };

  const onCopyPrompt = (id) => {
    navigator.clipboard.writeText(PROMPTS[id] || '').catch(() => {});
    setCopied(id);
    showToast('Промт скопирован');
    setTimeout(() => setCopied(null), 1600);
  };

  const onAddImported = () => {
    if (!activeBoard || !draft.length) return;
    setBoards(bs => bs.map(b => b.id === activeBoard.id ? {
      ...b,
      total: b.total + draft.length,
      due:   b.due   + draft.length,
      cards: [
        ...draft.map(d => ({
          id: uid(), type: 'word', word: d.word,
          definition: d.definition, translation: d.translation || '',
          example: d.example || '', level: 'new',
        })),
        ...(b.cards || []),
      ],
    } : b));
    showToast(`+${draft.length} карточек добавлено`);
    setDraft([]); setPasted(''); setRoute('board');
  };

  const onSaveCard = () => {
    if (!form.word.trim() || !form.definition.trim()) { showToast('Заполни слово и определение'); return; }
    if (!activeBoard) return;
    const cardType = boardTab === 'phrases' ? 'phrase' : 'word';
    setBoards(bs => bs.map(b => b.id === activeBoard.id ? {
      ...b, total: b.total + 1, due: b.due + 1,
      cards: [{ id: uid(), type: cardType, word: form.word.trim(),
        definition: form.definition.trim(), translation: form.translation.trim(),
        example: form.example.trim(), level: 'new' }, ...(b.cards || [])],
    } : b));
    setForm({ word: '', definition: '', translation: '', example: '' });
    showToast('Карточка сохранена');
    setRoute('board');
  };

  const onUpdateCard = (updated) => {
    if (!activeBoard) return;
    setBoards(bs => bs.map(b => b.id === activeBoard.id ? {
      ...b,
      cards: b.cards.map(c => c.id === updated.id ? updated : c),
    } : b));
    showToast('Карточка обновлена');
    setRoute('board');
  };

  const onDeleteCard = (cardId) => {
    if (!activeBoard) return;
    setBoards(bs => bs.map(b => b.id === activeBoard.id ? {
      ...b,
      total: Math.max(0, b.total - 1),
      cards: b.cards.filter(c => c.id !== cardId),
    } : b));
    showToast('Карточка удалена');
    setRoute('board');
  };

  const onDeleteBoard = (boardId) => {
    setBoards(bs => bs.filter(b => b.id !== boardId));
    showToast('Доска удалена');
    setActiveBoardId(null);
    setRoute('home');
    setNavTab('boards');
  };

  const onSaveBoard = () => {
    if (!boardForm.name.trim()) { showToast('Введи название доски'); return; }
    const newBoard = {
      id: uid(), name: boardForm.name.trim(), color: boardForm.color,
      total: 0, due: 0, done: 0, cards: [],
    };
    setBoards(bs => [newBoard, ...bs]);
    setBoardForm({ name: '', color: '#d4f564' });
    showToast('Доска создана');
    setActiveBoardId(newBoard.id);
    setRoute('board');
  };

  // Try to parse JSON when user pastes
  useEffect(() => {
    if (!pasted.trim()) { setDraft([]); return; }
    try {
      const parsed = JSON.parse(pasted);
      if (Array.isArray(parsed)) {
        setDraft(parsed.filter(d => d.word && d.definition).map(d => ({
          word: String(d.word), definition: String(d.definition),
          translation: d.translation ? String(d.translation) : '',
          example:     d.example     ? String(d.example)     : '',
        })));
      }
    } catch {
      setDraft([]);
    }
  }, [pasted]);

  // ── Screen routing ────────────────────────────────────────────────
  let screen = null;

  if (route === 'home') {
    screen = <ScreenHome
      boards={boards} streak={streak.count}
      onOpenBoard={onOpenBoard}
      onAddBoard={() => { setBoardForm({ name: '', color: '#d4f564' }); setRoute('newboard'); }}
    />;
  } else if (route === 'newboard') {
    screen = <ScreenNewBoard
      form={boardForm} onChange={(k, v) => setBoardForm(f => ({ ...f, [k]: v }))}
      onSave={onSaveBoard} onBack={goBack}
    />;
  } else if (route === 'board') {
    screen = <ScreenBoard
      board={activeBoard} tab={boardTab} onBack={goBack}
      onTab={setBoardTab} onStudy={() => {
        if (!activeBoard?.cards?.length) { showToast('Добавь карточки чтобы начать'); return; }
        setRoute('modepick');
      }}
      onImport={() => { setPasted(''); setDraft([]); setRoute('import'); }}
      onAdd={() => { setForm({ word: '', definition: '', translation: '', example: '' }); setRoute('new'); }}
      onOpenCard={onOpenCard}
      onDelete={() => onDeleteBoard(activeBoardId)}
    />;
  } else if (route === 'carddetail') {
    screen = <ScreenCardDetail
      card={activeCard} onBack={goBack}
      onSave={onUpdateCard} onDelete={onDeleteCard}
    />;
  } else if (route === 'import') {
    screen = <ScreenImport
      pasted={pasted} onPaste={setPasted}
      draftCards={draft} onRemoveDraft={(i) => setDraft(d => d.filter((_, j) => j !== i))}
      onAdd={onAddImported} onBack={goBack}
      copied={copied} onCopyPrompt={onCopyPrompt}
    />;
  } else if (route === 'new') {
    screen = <ScreenNewCard
      form={form} onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
      onSave={onSaveCard} onBack={goBack}
      focus={focusField} onFocus={setFocusField}
    />;
  } else if (route === 'modepick') {
    screen = <ScreenModePick
      board={activeBoard} duration={duration} mode={mode}
      onDuration={setDuration} onMode={setMode}
      onStart={onStartStudy} onBack={goBack}
    />;
  } else if (route === 'study') {
    if (!studyCard) {
      // Должно быть защищено в onStartStudy, но на всякий случай
      setRoute('board');
    } else if (mode === 'dictation') {
      screen = <ScreenDictation
        card={studyCard} idx={studyIdx} total={sessionDeck.length}
        input={dictInput} onInput={setDictInput} onCheck={onCheckDictation}
        result={dictResult} onBack={goBack} onNext={() => advance(true)}
      />;
    } else if (mode === 'choice') {
      screen = <ScreenStudyChoice
        card={studyCard} idx={studyIdx} total={sessionDeck.length}
        deck={sessionDeck} result={choiceResult}
        onPick={onChoicePick} onBack={goBack}
      />;
    } else {
      // classic
      if (!studyFlipped) {
        screen = <ScreenStudyFront
          card={studyCard} idx={studyIdx} total={sessionDeck.length}
          onFlip={() => setStudyFlipped(true)} onBack={goBack}
        />;
      } else {
        screen = <ScreenStudyBack
          card={studyCard} idx={studyIdx} total={sessionDeck.length}
          onAnswer={onAnswer} onBack={goBack}
          showTrans={showTrans} showEx={showEx}
          onToggleTrans={() => setShowTrans(v => !v)}
          onToggleEx={() => setShowEx(v => !v)}
        />;
      }
    }
  } else if (route === 'progress') {
    screen = <ScreenProgress
      streak={streak.count} bestStreak={streak.bestStreak || 0}
      days30={streak.days30} studyDates={streak.studyDates || []}
      levels={levels} allCards={allCards} weakSpots={weakSpots}
    />;
  }

  const showNav = ['home', 'progress'].includes(route);

  return (
    <div style={{
      width: '100%', maxWidth: 430,
      height: '100dvh',
      position: 'relative', overflow: 'hidden',
      background: T.bg,
    }}>
      {screen}

      {showNav && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 35 }}>
          <CustomNav active={navTab} onChange={setNavTab} />
        </div>
      )}

      <Toast message={toast} visible={!!toast} />

      {needRefresh && !updateDismissed && (
        <UpdateBanner
          onUpdate={() => updateServiceWorker(true)}
          onDismiss={() => setUpdateDismissed(true)}
        />
      )}

      {canInstall && !installDismissed && !needRefresh && (
        <InstallBanner
          onInstall={triggerInstall}
          onDismiss={() => setInstallDismissed(true)}
        />
      )}
    </div>
  );
}
