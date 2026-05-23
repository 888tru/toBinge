import React from 'react';
import { T } from './tokens.js';
import { I } from './icons.jsx';
import {
  Shell, Header, PlusButton, Eyebrow,
  SHELL_TOP, NAV_HEIGHT, HOME_IND,
  Reveal, ExpandPill, AnswerButton, levelColor,
} from './components.jsx';

// ═══════════════════════════════════════════════════════════════
// SCREEN 1 · HOME
// ═══════════════════════════════════════════════════════════════
export function ScreenHome({ boards = [], streak = 7, onOpenBoard, onAddBoard }) {
  const empty = boards.length === 0;
  return (
    <Shell>
      <Header logo trailing={<PlusButton onClick={onAddBoard} />} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px 22px' }}>
        <span style={{ fontSize: 16 }}>🔥</span>
        <span style={{ fontSize: 13, color: T.textDim }}>
          <span style={{ color: T.text, fontWeight: 500 }}>{streak} дней</span> подряд
        </span>
      </div>

      {empty ? (
        <div style={{
          margin: '40px 20px', padding: '64px 24px',
          background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        }}>
          <div style={{ color: T.textFaint }}>{I.book(40)}</div>
          <div style={{ fontSize: 15, color: T.textDim, textAlign: 'center' }}>Создай первую доску</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
          {boards.map(b => <BoardCard key={b.id} board={b} onClick={() => onOpenBoard?.(b.id)} />)}
        </div>
      )}
    </Shell>
  );
}

function BoardCard({ board, onClick }) {
  const today        = new Date().toISOString().slice(0, 10);
  const cards        = board.cards || [];
  const dueCount     = cards.filter(c => !c.dueDate || c.dueDate <= today).length;
  const learnedCount = cards.filter(c => c.level === 'know' || c.level === 'master').length;
  const progress     = cards.length > 0 ? learnedCount / cards.length : 0;
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', cursor: 'pointer', position: 'relative',
      background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
      padding: '18px 18px 22px', color: T.text, fontFamily: T.sans,
      display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
    }}>
      <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{board.name}</div>
      <div style={{ fontSize: 13, color: T.textDim }}>
        {cards.length} карточек · <span style={{ color: T.accent }}>{dueCount} сегодня</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,0.04)' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', background: board.color || T.accent }} />
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 2 · BOARD INTERIOR
// ═══════════════════════════════════════════════════════════════
export function ScreenBoard({ board, tab = 'words', onBack, onTab, onStudy, onImport, onAdd, onOpenCard, onDelete }) {
  const { useState: useS } = React;
  const [confirmDelete, setConfirmDelete] = useS(false);
  const today       = new Date().toISOString().slice(0, 10);
  const dueCount    = (board.cards || []).filter(c => !c.dueDate || c.dueDate <= today).length;
  const wordCount   = (board.cards || []).filter(c => c.type === 'word').length;
  const phraseCount = (board.cards || []).filter(c => c.type === 'phrase').length;
  return (
    <Shell>
      <Header back onBack={onBack} title={board.name} trailing={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setConfirmDelete(true)} style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'transparent', border: `1px solid ${T.border}`,
            color: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>{I.trash(16, T.red)}</button>
          <PlusButton onClick={onAdd} />
        </div>
      } />

      {/* tabs */}
      <div style={{ display: 'flex', gap: 24, padding: '0 20px', borderBottom: `1px solid ${T.border}` }}>
        {[
          { id: 'words',   label: 'Слова',      n: wordCount   },
          { id: 'phrases', label: 'Выражения',   n: phraseCount },
        ].map(t => {
          const on = t.id === tab;
          return (
            <button key={t.id} onClick={() => onTab?.(t.id)} style={{
              background: 'transparent', border: 0, padding: '14px 0',
              color: on ? T.text : T.textDim, fontFamily: T.sans, fontWeight: 500,
              fontSize: 15, cursor: 'pointer', position: 'relative',
            }}>
              {t.label} <span style={{ color: T.textFaint, fontFamily: T.mono, fontSize: 13 }}>[{t.n}]</span>
              {on && <div style={{
                position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
                background: T.accent, borderRadius: 2,
              }} />}
            </button>
          );
        })}
      </div>

      {/* due bar */}
      <div style={{
        margin: '16px 20px 0', padding: '14px 16px',
        background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontSize: 15, color: T.text, fontWeight: 500 }}>{dueCount} на повторение</div>
          <div style={{ fontSize: 12, color: T.textDim }}>Готово к проработке</div>
        </div>
        <button onClick={onStudy} style={{
          background: T.accent, color: '#0f0f0f', border: 0,
          padding: '10px 16px', borderRadius: T.rPill, fontWeight: 600, fontSize: 14,
          fontFamily: T.sans, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>Учить {I.arrowR(14, '#0f0f0f')}</button>
      </div>

      {/* import button */}
      <button onClick={onImport} style={{
        margin: '10px 20px 18px', padding: '12px 16px',
        background: 'transparent', border: `1px solid ${T.borderStrong}`,
        color: T.text, borderRadius: T.rPill, fontFamily: T.sans, fontSize: 14,
        fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>{I.download(16, T.text)} Импорт JSON</button>

      {/* card list */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        {(board.cards || [])
          .filter(c => tab === 'words' ? c.type === 'word' : c.type === 'phrase')
          .map((c, i, arr) => (
            <button key={c.id} onClick={() => onOpenCard?.(c.id)} style={{
              background: 'transparent', border: 0,
              borderBottom: i === arr.length - 1 ? 'none' : `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
              color: T.text, fontFamily: T.sans, textAlign: 'left', cursor: 'pointer',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{c.word}</div>
                <div style={{ fontSize: 13, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.definition}</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: levelColor(c.level), flexShrink: 0 }} />
            </button>
          ))}
      </div>

      {/* confirm delete board overlay */}
      {confirmDelete && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', zIndex: 60,
        }}>
          <div style={{
            width: '100%', background: T.surface1,
            borderRadius: `${T.rCard}px ${T.rCard}px 0 0`,
            padding: '24px 20px', paddingBottom: HOME_IND + 20,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Удалить доску?</div>
            <div style={{ fontSize: 13, color: T.textDim }}>«{board.name}» и все {(board.cards || []).length} карточек будут удалены. Это нельзя отменить.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <button onClick={onDelete} style={{
                padding: '14px', borderRadius: T.rPill,
                background: T.red, color: '#fff', border: 0,
                fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>Удалить</button>
              <button onClick={() => setConfirmDelete(false)} style={{
                padding: '14px', borderRadius: T.rPill,
                background: T.surface2, color: T.text, border: 0,
                fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 · IMPORT
// ═══════════════════════════════════════════════════════════════
export function ScreenImport({ pasted, onPaste, draftCards = [], onRemoveDraft, onAdd, onBack, copied, onCopyPrompt }) {
  const fileRef = React.useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onPaste?.(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Shell withNav={false}>
      <Header back onBack={onBack} title="Импорт" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { id: 'words',   label: 'Промт для слов' },
            { id: 'phrases', label: 'Промт для выражений' },
          ].map(p => {
            const ok = copied === p.id;
            return (
              <button key={p.id} onClick={() => onCopyPrompt?.(p.id)} style={{
                padding: '18px 14px', borderRadius: T.rCard,
                background: ok ? T.accentDim : T.surface1,
                border: `1px solid ${ok ? T.accent : T.border}`,
                color: T.text, fontFamily: T.sans, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', gap: 8, textAlign: 'left', transition: 'all .15s',
              }}>
                <span style={{ color: ok ? T.accent : T.textDim, height: 18 }}>
                  {ok ? I.check(16, T.accent) : I.download(16, T.textDim)}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>

        <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} style={{
          border: `1.5px dashed ${T.borderStrong}`, borderRadius: T.rCard,
          padding: '32px 20px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)',
          cursor: 'pointer', width: '100%',
        }}>
          <span style={{ color: T.textDim }}>{I.upload(28, T.textDim)}</span>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>Загрузи JSON файл</div>
          <div style={{ fontSize: 12, color: T.textDim }}>или вставь текст ниже</div>
        </button>

        <textarea
          value={pasted || ''}
          onChange={e => onPaste?.(e.target.value)}
          placeholder='[{"word":"ambiguous","definition":"open to multiple interpretations"},…]'
          style={{
            width: '100%', minHeight: 110, resize: 'vertical',
            background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
            padding: '14px 16px', color: T.text, fontFamily: T.mono, fontSize: 12,
            outline: 'none', boxSizing: 'border-box', lineHeight: 1.5,
          }}
        />

        {draftCards.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Eyebrow>Превью · {draftCards.length}</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {draftCards.map((c, i) => (
                <div key={i} style={{
                  padding: '10px 12px 10px 14px', background: T.surface1,
                  border: `1px solid ${T.border}`, borderRadius: T.rSmall,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.word}</div>
                    <div style={{ fontSize: 12, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.definition}</div>
                  </div>
                  <button onClick={() => onRemoveDraft?.(i)} style={{
                    background: 'transparent', border: 0, color: T.textDim, cursor: 'pointer', padding: 4, borderRadius: 4,
                  }}>{I.x(14, T.textDim)}</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 90 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px', paddingBottom: HOME_IND + 14,
        background: 'linear-gradient(to top, #0f0f0f 60%, rgba(15,15,15,0))',
      }}>
        <button onClick={onAdd} disabled={draftCards.length === 0} style={{
          width: '100%', padding: '16px', borderRadius: T.rPill,
          background: draftCards.length ? T.accent : T.surface2,
          color: draftCards.length ? '#0f0f0f' : T.textFaint, border: 0,
          fontFamily: T.sans, fontSize: 15, fontWeight: 600,
          cursor: draftCards.length ? 'pointer' : 'default',
        }}>Добавить {draftCards.length || 0} карточек</button>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 4 · NEW CARD
// ═══════════════════════════════════════════════════════════════
export function ScreenNewCard({ form, onChange, onSave, onBack, focus, onFocus }) {
  const field = (key, label, opts = {}) => {
    const focused = focus === key;
    const baseStyle = {
      background: T.surface1,
      border: `1px solid ${focused ? T.accent : T.border}`,
      borderRadius: T.rCard, color: T.text, fontFamily: T.sans,
      outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>
          {label}
          {opts.optional && (
            <span style={{ marginLeft: 6, color: T.textFaint, fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>необязательное</span>
          )}
        </Eyebrow>
        {opts.multi ? (
          <textarea
            value={form[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            onFocus={() => onFocus?.(key)}
            onBlur={() => onFocus?.(null)}
            style={{ ...baseStyle, padding: '14px 16px', fontSize: 15, minHeight: 80, resize: 'vertical' }}
          />
        ) : (
          <input
            value={form[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            onFocus={() => onFocus?.(key)}
            onBlur={() => onFocus?.(null)}
            style={{
              ...baseStyle,
              padding: opts.big ? '18px 18px' : '14px 16px',
              fontSize: opts.big ? 22 : 15,
              fontWeight: opts.big ? 600 : 400,
              width: '100%',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <Shell withNav={false}>
      <Header back onBack={onBack} title="Новое слово" />
      <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {field('word',        'Слово',                 { big: true })}
        {field('definition',  'Определение',            { multi: true })}
        {field('translation', 'Перевод',               { optional: true })}
        {field('example',     'Пример использования',  { multi: true, optional: true })}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px', paddingBottom: HOME_IND + 14,
        background: 'linear-gradient(to top, #0f0f0f 60%, rgba(15,15,15,0))',
      }}>
        <button onClick={onSave} style={{
          width: '100%', padding: '16px', borderRadius: T.rPill,
          background: T.accent, color: '#0f0f0f', border: 0,
          fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Сохранить</button>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 5 · MODE PICKER
// ═══════════════════════════════════════════════════════════════
export function ScreenModePick({ board, duration, mode, onDuration, onMode, onStart, onBack }) {
  return (
    <Shell withNav={false}>
      <Header back onBack={onBack} title={board.name} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14 }}>Сколько времени?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[5, 15, 30].map(m => {
              const on = m === duration;
              return (
                <button key={m} onClick={() => onDuration(m)} style={{
                  flex: 1, padding: '12px 0', borderRadius: T.rPill,
                  background: on ? T.accent : T.surface1,
                  color: on ? '#0f0f0f' : T.text,
                  border: `1px solid ${on ? T.accent : T.border}`,
                  fontFamily: T.sans, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>{m} мин</button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 14 }}>Режим</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { id: 'classic',   label: 'Классика', icon: I.card,     desc: 'Открой → оцени' },
              { id: 'dictation', label: 'Диктант',  icon: I.keyboard, desc: 'Напиши слово'    },
              { id: 'choice',    label: 'Выбор',    icon: I.list,     desc: 'Из 4 вариантов'  },
            ].map(m => {
              const on = m.id === mode;
              return (
                <button key={m.id} onClick={() => onMode(m.id)} style={{
                  background: on ? T.accentDim : T.surface1,
                  border: `1px solid ${on ? T.accent : T.border}`,
                  borderRadius: T.rCard, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  color: T.text, fontFamily: T.sans, cursor: 'pointer', textAlign: 'center',
                }}>
                  <span style={{ color: on ? T.accent : T.textDim }}>{m.icon(24, 'currentColor')}</span>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.3 }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px', paddingBottom: HOME_IND + 14,
        background: 'linear-gradient(to top, #0f0f0f 60%, rgba(15,15,15,0))',
      }}>
        <button onClick={onStart} style={{
          width: '100%', padding: '16px', borderRadius: T.rPill,
          background: T.accent, color: '#0f0f0f', border: 0,
          fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>Начать {I.arrowR(16, '#0f0f0f')}</button>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// Shared study header
// ═══════════════════════════════════════════════════════════════
function StudyHeader({ idx, total, onBack }) {
  const pct = ((idx + 1) / total) * 100;
  return (
    <>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'rgba(255,255,255,0.05)', zIndex: 40,
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: T.accent,
          transition: 'width .4s cubic-bezier(.3,.1,.3,1)',
        }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px 18px' }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'transparent', border: `1px solid ${T.border}`,
          color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>{I.back(18)}</button>
        <div style={{
          flex: 1, textAlign: 'center',
          fontFamily: T.mono, fontSize: 14, color: T.textDim, letterSpacing: '0.06em',
        }}>{String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
        <div style={{ width: 36 }} />
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 6 · STUDY FRONT
// ═══════════════════════════════════════════════════════════════
export function ScreenStudyFront({ card, idx, total, onFlip, onBack }) {
  return (
    <Shell withNav={false} padBottom={false}>
      <StudyHeader idx={idx} total={total} onBack={onBack} />
      <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <button onClick={onFlip} style={{
          flex: '0 0 60%', minHeight: 380,
          background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 24, color: T.text, fontFamily: T.sans, cursor: 'pointer', textAlign: 'center',
          position: 'relative',
        }}>
          <Eyebrow color={T.textFaint} style={{ position: 'absolute', top: 20, left: 20 }}>слово</Eyebrow>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: T.text, lineHeight: 1.15 }}>{card.word}</div>
          <div style={{ fontSize: 12, color: T.textFaint, position: 'absolute', bottom: 22 }}>нажми чтобы открыть</div>
        </button>
        <div style={{ flex: 1 }} />
      </div>
      <div style={{ height: HOME_IND + 8 }} />
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 7 · STUDY BACK
// ═══════════════════════════════════════════════════════════════
export function ScreenStudyBack({ card, idx, total, onAnswer, onBack, showTrans, showEx, onToggleTrans, onToggleEx }) {
  const interval   = card.interval   ?? 0;
  const ef         = card.easeFactor ?? 2.5;
  const hardI      = interval <= 1 ? 1 : Math.round(interval * 1.2);
  const easyI      = interval === 0 ? 1 : interval === 1 ? 6 : Math.round(interval * ef);
  const fmtI       = n => n === 1 ? '1 день' : n < 7 ? `${n} дн` : n < 30 ? `${Math.round(n / 7)} нед` : `${Math.round(n / 30)} мес`;
  return (
    <Shell withNav={false} padBottom={false}>
      <StudyHeader idx={idx} total={total} onBack={onBack} />

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Eyebrow color={T.textFaint}>{card.word}</Eyebrow>
            <Eyebrow color={T.accent}>определение</Eyebrow>
          </div>
          <div style={{ fontSize: 16, color: T.text, lineHeight: 1.45 }}>{card.definition}</div>

          {(card.translation || card.example) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {card.translation && <ExpandPill icon={I.globe}  label="Перевод" open={showTrans} onClick={onToggleTrans} />}
              {card.example    && <ExpandPill icon={I.bookSm} label="Пример"  open={showEx}    onClick={onToggleEx}   />}
            </div>
          )}

          {card.translation && (
            <Reveal open={showTrans}>
              <div style={{ paddingTop: 4 }}>
                <Eyebrow color={T.accent} style={{ marginBottom: 6 }}>перевод</Eyebrow>
                <div style={{ fontSize: 15, color: T.text }}>{card.translation}</div>
              </div>
            </Reveal>
          )}
          {card.example && (
            <Reveal open={showEx}>
              <div style={{ paddingTop: 4 }}>
                <Eyebrow color={T.accent} style={{ marginBottom: 6 }}>пример</Eyebrow>
                <div style={{ fontSize: 14, color: T.text, fontStyle: 'italic', lineHeight: 1.5 }}>"{card.example}"</div>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px 20px', paddingBottom: HOME_IND + 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnswerButton color={T.red}    bg={T.redDim}    label="Снова"  sub="1 день"      onClick={() => onAnswer('again')} />
        <AnswerButton color={T.orange} bg={T.orangeDim} label="Сложно" sub={fmtI(hardI)} onClick={() => onAnswer('hard')}  />
        <AnswerButton color={T.green}  bg={T.accentDim} label="Легко"  sub={fmtI(easyI)} onClick={() => onAnswer('easy')}  />
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 8 · DICTATION
// ═══════════════════════════════════════════════════════════════
export function ScreenDictation({ card, idx, total, input, onInput, onCheck, result, onBack, onNext }) {
  const cardBorder = result === 'correct' ? T.green : result === 'wrong' ? T.red : T.border;
  const cardBg     = result === 'correct' ? T.accentDim : result === 'wrong' ? T.redDim : T.surface1;
  return (
    <Shell withNav={false} padBottom={false}>
      <StudyHeader idx={idx} total={total} onBack={onBack} />

      <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: T.rCard,
          padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 16,
          transition: 'background .25s, border-color .25s',
        }}>
          <Eyebrow color={T.textFaint}>определение</Eyebrow>
          <div style={{ fontSize: 16, color: T.text, lineHeight: 1.45 }}>{card.definition}</div>
          {card.translation && (
            <div style={{ paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Eyebrow color={T.textFaint}>перевод</Eyebrow>
              <div style={{ fontSize: 15, color: T.text }}>{card.translation}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            value={input || ''}
            onChange={e => onInput(e.target.value)}
            placeholder="Напиши слово…"
            style={{
              background: T.surface1,
              border: `1px solid ${result === 'wrong' ? T.red : result === 'correct' ? T.green : T.borderStrong}`,
              borderRadius: T.rCard, padding: '16px 18px', color: T.text,
              fontFamily: T.sans, fontSize: 17, outline: 'none', boxSizing: 'border-box',
              transition: 'border-color .2s', width: '100%',
            }}
          />
          {result === 'wrong' && (
            <div style={{
              padding: '10px 14px', borderRadius: T.rSmall,
              background: T.redDim, border: `1px solid ${T.red}`,
              fontSize: 13, color: T.text,
            }}>
              Правильный ответ: <span style={{ color: T.green, fontWeight: 600 }}>{card.word}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: '14px 20px', paddingBottom: HOME_IND + 12 }}>
        {result ? (
          <button onClick={onNext} style={{
            width: '100%', padding: '16px', borderRadius: T.rPill,
            background: T.accent, color: '#0f0f0f', border: 0,
            fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>Дальше {I.arrowR(16, '#0f0f0f')}</button>
        ) : (
          <button onClick={onCheck} style={{
            width: '100%', padding: '16px', borderRadius: T.rPill,
            background: input ? T.accent : T.surface2,
            color: input ? '#0f0f0f' : T.textFaint, border: 0,
            fontFamily: T.sans, fontSize: 15, fontWeight: 600,
            cursor: input ? 'pointer' : 'default',
          }}>Проверить</button>
        )}
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 9 · PROGRESS (real data)
// ═══════════════════════════════════════════════════════════════
export function ScreenProgress({ streak = 0, bestStreak = 0, days30 = [], studyDates = [], levels = [], allCards = [], weakSpots = [] }) {
  const totalCards = allCards.length;
  const chart = days30.length ? days30 : Array(7).fill(0);

  return (
    <Shell>
      <Header title="Прогресс" />

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* streak */}
        <div style={{
          background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          padding: '20px', display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontSize: 56, fontWeight: 700, color: streak ? T.accent : T.textFaint, lineHeight: 1, fontFamily: T.mono, letterSpacing: '-0.04em' }}>
              {streak}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>дней подряд</div>
              <div style={{ fontSize: 12, color: T.textDim }}>{streak ? 'Продолжай!' : 'Позанимайся сегодня'}</div>
            </div>
            <div style={{ flex: 1 }} />
            {bestStreak > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginRight: 4 }}>
                <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Рекорд</div>
                <div style={{ fontSize: 20, fontWeight: 600, fontFamily: T.mono, color: T.textDim }}>{bestStreak}</div>
              </div>
            )}
            <div style={{ fontSize: 24 }}>{streak >= 3 ? '🔥' : '📚'}</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const d        = new Date(Date.now() - (6 - i) * 86400000);
              const dateStr  = d.toISOString().slice(0, 10);
              const filled   = studyDates.includes(dateStr);
              const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
              const label    = dayNames[d.getDay()];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: filled ? T.accent : 'transparent',
                    border: `1.5px solid ${filled ? T.accent : T.border}`,
                  }} />
                  <span style={{ fontSize: 10, color: T.textFaint, fontFamily: T.mono }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-day bar chart */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Eyebrow>30 дней</Eyebrow>
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}>
              {chart.reduce((a, b) => a + b, 0)} карточек
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 78, padding: '0 0 4px' }}>
            {chart.map((v, i) => {
              const max = Math.max(...chart, 1);
              const h   = Math.max(2, (v / max) * 72);
              return (
                <div key={i} style={{
                  flex: 1, height: h,
                  background: v ? T.accent : 'rgba(255,255,255,0.06)',
                  borderRadius: 2, opacity: v ? 0.4 + 0.6 * (v / max) : 1,
                }} />
              );
            })}
          </div>
        </div>

        {/* levels */}
        {totalCards > 0 ? (
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Уровни · {totalCards} карточек</Eyebrow>
            <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: T.surface1, marginBottom: 12 }}>
              {levels.filter(l => l.count > 0).map((l, i, arr) => (
                <div key={l.id} style={{
                  flex: l.count, background: levelColor(l.id),
                  borderRight: i < arr.length - 1 ? '2px solid #0f0f0f' : 0,
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {levels.map(l => (
                <div key={l.id} style={{
                  flex: 1, padding: '10px', borderRadius: T.rSmall,
                  background: T.surface1, border: `1px solid ${T.border}`,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: levelColor(l.id) }} />
                    <span style={{ fontSize: 10, color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>{l.label}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: T.text, fontFamily: T.mono }}>{l.count}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '40px 24px', background: T.surface1, border: `1px solid ${T.border}`,
            borderRadius: T.rCard, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ color: T.textFaint }}>{I.book(36)}</div>
            <div style={{ fontSize: 14, color: T.textDim }}>Добавь карточки, чтобы видеть статистику</div>
          </div>
        )}

        {weakSpots.length > 0 && (
          <div>
            <Eyebrow style={{ marginBottom: 12 }}>Слабые места</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {weakSpots.map(c => (
                <div key={c.id} style={{
                  padding: '12px 16px', background: T.surface1,
                  border: `1px solid ${T.border}`, borderRadius: T.rSmall,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>{c.word}</div>
                    <div style={{ fontSize: 12, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.definition}</div>
                  </div>
                  <span style={{
                    fontSize: 12, color: T.red, fontFamily: T.mono, fontWeight: 600,
                    background: T.redDim, padding: '3px 8px', borderRadius: T.rPill, flexShrink: 0,
                  }}>{c.lapses}×</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 10 · NEW BOARD
// ═══════════════════════════════════════════════════════════════
const BOARD_COLORS = ['#d4f564', '#5b8def', '#ff9f43', '#e879f9', '#ff5757', '#64c8f5'];

export function ScreenNewBoard({ form, onChange, onSave, onBack }) {
  return (
    <Shell withNav={false}>
      <Header back onBack={onBack} title="Новая доска" />

      <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow>Название</Eyebrow>
          <input
            value={form.name || ''}
            onChange={e => onChange('name', e.target.value)}
            placeholder="Например: Сериал Severance"
            autoFocus
            style={{
              background: T.surface1, border: `1px solid ${T.borderStrong}`,
              borderRadius: T.rCard, padding: '18px 18px', color: T.text,
              fontFamily: T.sans, fontSize: 22, fontWeight: 600,
              outline: 'none', boxSizing: 'border-box', width: '100%',
            }}
          />
        </div>

        {/* color */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Eyebrow>Цвет</Eyebrow>
          <div style={{ display: 'flex', gap: 12 }}>
            {BOARD_COLORS.map(c => (
              <button key={c} onClick={() => onChange('color', c)} style={{
                width: 40, height: 40, borderRadius: '50%', background: c,
                border: form.color === c ? `3px solid ${T.text}` : '3px solid transparent',
                cursor: 'pointer', flexShrink: 0,
                boxShadow: form.color === c ? `0 0 0 2px ${T.bg}, 0 0 0 4px ${c}` : 'none',
                transition: 'box-shadow .15s',
              }} />
            ))}
          </div>
        </div>

        {/* preview */}
        {form.name && (
          <div style={{
            padding: '18px 18px 22px', background: T.surface1,
            border: `1px solid ${T.border}`, borderRadius: T.rCard,
            display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{form.name}</div>
            <div style={{ fontSize: 13, color: T.textDim }}>0 карточек · 0 сегодня</div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: form.color }} />
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px', paddingBottom: HOME_IND + 14,
        background: 'linear-gradient(to top, #0f0f0f 60%, rgba(15,15,15,0))',
      }}>
        <button onClick={onSave} disabled={!form.name?.trim()} style={{
          width: '100%', padding: '16px', borderRadius: T.rPill,
          background: form.name?.trim() ? T.accent : T.surface2,
          color: form.name?.trim() ? '#0f0f0f' : T.textFaint, border: 0,
          fontFamily: T.sans, fontSize: 15, fontWeight: 600,
          cursor: form.name?.trim() ? 'pointer' : 'default',
        }}>Создать доску</button>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 11 · CARD DETAIL / EDIT
// ═══════════════════════════════════════════════════════════════
export function ScreenCardDetail({ card, onBack, onSave, onDelete }) {
  const { useState: useS } = React;
  const [form, setForm] = useS(() => card ? { ...card } : {});
  const [focus, setFocus] = useS(null);
  const [confirmDelete, setConfirmDelete] = useS(false);

  if (!card) return null;

  const field = (key, label, opts = {}) => {
    const focused = focus === key;
    const base = {
      background: T.surface1,
      border: `1px solid ${focused ? T.accent : T.border}`,
      borderRadius: T.rCard, color: T.text, fontFamily: T.sans,
      outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
    };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Eyebrow>
          {label}
          {opts.optional && <span style={{ marginLeft: 6, color: T.textFaint, fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>необязательное</span>}
        </Eyebrow>
        {opts.multi ? (
          <textarea value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            onFocus={() => setFocus(key)} onBlur={() => setFocus(null)}
            style={{ ...base, padding: '14px 16px', fontSize: 15, minHeight: 80, resize: 'vertical' }} />
        ) : (
          <input value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            onFocus={() => setFocus(key)} onBlur={() => setFocus(null)}
            style={{ ...base, padding: opts.big ? '18px' : '14px 16px', fontSize: opts.big ? 22 : 15, fontWeight: opts.big ? 600 : 400, width: '100%' }} />
        )}
      </div>
    );
  };

  const levelLabels = { new: 'Учу', learning: 'Знакомо', know: 'Знаю', master: 'Владею' };

  return (
    <Shell withNav={false}>
      <Header back onBack={onBack} title="Карточка"
        trailing={
          <button onClick={() => setConfirmDelete(true)} style={{
            background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10,
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.red, cursor: 'pointer',
          }}>{I.x(16, T.red)}</button>
        }
      />

      <div style={{ padding: '4px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* level badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: levelColor(card.level) }} />
          <span style={{ fontSize: 12, color: T.textDim }}>{levelLabels[card.level] || 'Учу'}</span>
        </div>

        {field('word',        'Слово',                { big: true })}
        {field('definition',  'Определение',           { multi: true })}
        {field('translation', 'Перевод',               { optional: true })}
        {field('example',     'Пример использования',  { multi: true, optional: true })}
      </div>

      {/* confirm delete overlay */}
      {confirmDelete && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', zIndex: 60,
        }}>
          <div style={{
            width: '100%', background: T.surface1,
            borderRadius: `${T.rCard}px ${T.rCard}px 0 0`,
            padding: '24px 20px', paddingBottom: HOME_IND + 20,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>Удалить карточку?</div>
            <div style={{ fontSize: 13, color: T.textDim }}>«{card.word}» — это действие нельзя отменить.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <button onClick={() => onDelete(card.id)} style={{
                padding: '14px', borderRadius: T.rPill,
                background: T.red, color: '#fff', border: 0,
                fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
              }}>Удалить</button>
              <button onClick={() => setConfirmDelete(false)} style={{
                padding: '14px', borderRadius: T.rPill,
                background: T.surface2, color: T.text, border: 0,
                fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: 'pointer',
              }}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '14px 20px', paddingBottom: HOME_IND + 14,
        background: 'linear-gradient(to top, #0f0f0f 60%, rgba(15,15,15,0))',
      }}>
        <button onClick={() => onSave(form)} style={{
          width: '100%', padding: '16px', borderRadius: T.rPill,
          background: T.accent, color: '#0f0f0f', border: 0,
          fontFamily: T.sans, fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Сохранить изменения</button>
      </div>
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 12 · STUDY CHOICE (4 варианта)
// ═══════════════════════════════════════════════════════════════
export function ScreenStudyChoice({ card, idx, total, deck, result, onPick, onBack }) {
  const { useMemo } = React;

  const choices = useMemo(() => {
    const others = deck
      .filter(c => c.id !== card.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.definition);
    const all = [...others, card.definition];
    // Fisher-Yates shuffle
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.id]);

  const getChoiceStyle = (def) => {
    if (!result) return { border: `1.5px solid ${T.border}`, background: T.surface1, color: T.text };
    if (def === card.definition) return { border: `1.5px solid ${T.green}`, background: T.accentDim, color: T.text };
    return { border: `1.5px solid ${T.border}`, background: T.surface1, color: T.textDim };
  };

  return (
    <Shell withNav={false} padBottom={false}>
      <StudyHeader idx={idx} total={total} onBack={onBack} />

      <div style={{ padding: '16px 20px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* word card */}
        <div style={{
          background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
          padding: '32px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <Eyebrow color={T.accent}>выбери определение</Eyebrow>
          <div style={{ fontSize: 34, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', textAlign: 'center' }}>{card.word}</div>
        </div>

        {/* 4 choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {choices.map((def, i) => (
            <button key={i} onClick={() => onPick(def)} disabled={!!result} style={{
              ...getChoiceStyle(def),
              padding: '14px 18px', borderRadius: T.rCard,
              fontFamily: T.sans, fontSize: 14, lineHeight: 1.4,
              cursor: result ? 'default' : 'pointer', textAlign: 'left',
              transition: 'background .2s, border-color .2s',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              {result && def === card.definition && (
                <span style={{ color: T.green, flexShrink: 0, marginTop: 1 }}>{I.check(14, T.green)}</span>
              )}
              {def}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: HOME_IND + 12 }} />
    </Shell>
  );
}

