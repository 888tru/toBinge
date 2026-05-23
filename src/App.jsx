import { useState, useEffect } from 'react';
import { T } from './tokens.js';
import { CustomNav, Toast, NAV_HEIGHT, HOME_IND } from './components.jsx';
import { usePWA } from './usePWA.js';
import { InstallBanner, UpdateBanner } from './PWABanners.jsx';
import {
  SAMPLE_BOARDS, SAMPLE_CARDS, SAMPLE_DRAFT,
  SAMPLE_DAYS30, SAMPLE_WEAK, SAMPLE_LEVELS,
} from './data.js';
import {
  ScreenHome, ScreenBoard, ScreenImport, ScreenNewCard,
  ScreenModePick, ScreenStudyFront, ScreenStudyBack,
  ScreenDictation, ScreenProgress,
} from './screens.jsx';

export default function App() {
  const { canInstall, triggerInstall, needRefresh, updateServiceWorker } = usePWA();
  const [installDismissed, setInstallDismissed] = useState(false);
  const [updateDismissed,  setUpdateDismissed]  = useState(false);

  const [boards, setBoards] = useState(() =>
    SAMPLE_BOARDS.map(b => ({ ...b, cards: b.id === 'b1' ? SAMPLE_CARDS : [] }))
  );
  const [route,         setRoute]         = useState('home');
  const [navTab,        setNavTab]        = useState('boards');
  const [activeBoardId, setActiveBoardId] = useState('b1');
  const [boardTab,      setBoardTab]      = useState('words');

  // import
  const [pasted,  setPasted]  = useState('');
  const [draft,   setDraft]   = useState(SAMPLE_DRAFT);
  const [copied,  setCopied]  = useState(null);

  // new card form
  const [form,       setForm]       = useState({ word: '', definition: '', translation: '', example: '' });
  const [focusField, setFocusField] = useState(null);

  // study setup
  const [duration, setDuration] = useState(15);
  const [mode,     setMode]     = useState('classic');

  // study runtime
  const [studyIdx,    setStudyIdx]    = useState(0);
  const [studyFlipped,setStudyFlipped]= useState(false);
  const [showTrans,   setShowTrans]   = useState(false);
  const [showEx,      setShowEx]      = useState(false);
  const [dictInput,   setDictInput]   = useState('');
  const [dictResult,  setDictResult]  = useState(null);

  // toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
    if (navTab === 'progress') setRoute('progress');
    if (navTab === 'boards')   setRoute('home');
    if (navTab === 'study' && activeBoard) setRoute('modepick');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navTab]);

  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];
  const studyDeck   = (activeBoard?.cards || [])
    .filter(c => c.type === (boardTab === 'words' ? 'word' : 'phrase'))
    .slice(0, 12);
  const studyCard   = studyDeck[studyIdx] || studyDeck[0];

  const goBack = () => {
    if      (route === 'board')                              { setRoute('home');    setNavTab('boards'); }
    else if (route === 'import' || route === 'new' || route === 'modepick') setRoute('board');
    else if (route === 'study')                                setRoute('modepick');
    else if (route === 'progress')                           { setRoute('home');    setNavTab('boards'); }
  };

  const onOpenBoard  = (id) => { setActiveBoardId(id); setRoute('board'); };
  const onStartStudy = () => {
    setStudyIdx(0); setStudyFlipped(false); setShowTrans(false); setShowEx(false);
    setDictInput(''); setDictResult(null);
    setRoute('study');
  };

  const onAnswer = (rating) => {
    showToast(rating === 'easy' ? 'Через 4 дня' : rating === 'hard' ? 'Через 10 минут' : 'Снова в очереди');
    advance();
  };
  const advance = () => {
    setStudyFlipped(false); setShowTrans(false); setShowEx(false);
    setDictInput(''); setDictResult(null);
    if (studyIdx + 1 >= studyDeck.length) {
      showToast('Сессия завершена · ' + studyDeck.length + ' карточек');
      setRoute('board'); setStudyIdx(0);
    } else {
      setStudyIdx(i => i + 1);
    }
  };

  const onCheckDictation = () => {
    if (!dictInput.trim()) return;
    const ok = dictInput.trim().toLowerCase() === studyCard.word.toLowerCase();
    setDictResult(ok ? 'correct' : 'wrong');
    if (ok) showToast('Правильно!');
  };

  const onCopyPrompt = (id) => {
    setCopied(id);
    showToast(id === 'words' ? 'Промт для слов скопирован' : 'Промт для выражений скопирован');
    setTimeout(() => setCopied(null), 1600);
  };

  const onAddImported = () => {
    const id = activeBoard.id;
    setBoards(bs => bs.map(b => b.id === id ? {
      ...b,
      total: b.total + draft.length,
      due:   b.due   + draft.length,
      cards: [
        ...draft.map((d, i) => ({
          id: `imp-${Date.now()}-${i}`, type: 'word', word: d.word,
          definition: d.definition, translation: '', example: '', level: 'new',
        })),
        ...(b.cards || []),
      ],
    } : b));
    showToast(`+${draft.length} карточек добавлено`);
    setDraft([]); setPasted(''); setRoute('board');
  };

  const onSaveCard = () => {
    if (!form.word || !form.definition) { showToast('Заполни обязательные поля'); return; }
    const id = activeBoard.id;
    setBoards(bs => bs.map(b => b.id === id ? {
      ...b, total: b.total + 1, due: b.due + 1,
      cards: [{
        id: `new-${Date.now()}`, type: 'word', word: form.word,
        definition: form.definition, translation: form.translation,
        example: form.example, level: 'new',
      }, ...(b.cards || [])],
    } : b));
    setForm({ word: '', definition: '', translation: '', example: '' });
    showToast('Карточка сохранена');
    setRoute('board');
  };

  let screen = null;
  if (route === 'home') {
    screen = <ScreenHome boards={boards} onOpenBoard={onOpenBoard} onAddBoard={() => showToast('Создание доски — soon')} />;
  } else if (route === 'board') {
    screen = <ScreenBoard board={activeBoard} tab={boardTab} onBack={goBack}
      onTab={setBoardTab} onStudy={() => setRoute('modepick')}
      onImport={() => setRoute('import')} onAdd={() => setRoute('new')}
      onOpenCard={() => showToast('Открытие карточки — soon')} />;
  } else if (route === 'import') {
    screen = <ScreenImport pasted={pasted} onPaste={setPasted}
      draftCards={draft} onRemoveDraft={(i) => setDraft(d => d.filter((_, j) => j !== i))}
      onAdd={onAddImported} onBack={goBack}
      copied={copied} onCopyPrompt={onCopyPrompt} />;
  } else if (route === 'new') {
    screen = <ScreenNewCard form={form}
      onChange={(k, v) => setForm(f => ({ ...f, [k]: v }))}
      onSave={onSaveCard} onBack={goBack}
      focus={focusField} onFocus={setFocusField} />;
  } else if (route === 'modepick') {
    screen = <ScreenModePick board={activeBoard} duration={duration} mode={mode}
      onDuration={setDuration} onMode={setMode} onStart={onStartStudy} onBack={goBack} />;
  } else if (route === 'study') {
    if (mode === 'dictation') {
      screen = <ScreenDictation card={studyCard} idx={studyIdx} total={studyDeck.length}
        input={dictInput} onInput={setDictInput} onCheck={onCheckDictation}
        result={dictResult} onBack={goBack} onNext={advance} />;
    } else if (!studyFlipped) {
      screen = <ScreenStudyFront card={studyCard} idx={studyIdx} total={studyDeck.length}
        onFlip={() => setStudyFlipped(true)} onBack={goBack} />;
    } else {
      screen = <ScreenStudyBack card={studyCard} idx={studyIdx} total={studyDeck.length}
        onAnswer={onAnswer} onBack={goBack}
        showTrans={showTrans} showEx={showEx}
        onToggleTrans={() => setShowTrans(v => !v)}
        onToggleEx={() => setShowEx(v => !v)} />;
    }
  } else if (route === 'progress') {
    screen = <ScreenProgress streak={7} days30={SAMPLE_DAYS30} weak={SAMPLE_WEAK} levels={SAMPLE_LEVELS} />;
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

      {/* PWA: уведомление об обновлении */}
      {needRefresh && !updateDismissed && (
        <UpdateBanner
          onUpdate={() => updateServiceWorker(true)}
          onDismiss={() => setUpdateDismissed(true)}
        />
      )}

      {/* PWA: предложение установить */}
      {canInstall && !installDismissed && !needRefresh && (
        <InstallBanner
          onInstall={triggerInstall}
          onDismiss={() => setInstallDismissed(true)}
        />
      )}
    </div>
  );
}
