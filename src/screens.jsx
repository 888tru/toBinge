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
  const progress = Math.min(1, board.done / Math.max(1, board.total));
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', cursor: 'pointer', position: 'relative',
      background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard,
      padding: '18px 18px 22px', color: T.text, fontFamily: T.sans,
      display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
    }}>
      <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{board.name}</div>
      <div style={{ fontSize: 13, color: T.textDim }}>
        {board.total} карточек · <span style={{ color: T.accent }}>{board.due} сегодня</span>
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
export function ScreenBoard({ board, tab = 'words', onBack, onTab, onStudy, onImport, onAdd, onOpenCard }) {
  const wordCount   = (board.cards || []).filter(c => c.type === 'word').length;
  const phraseCount = (board.cards || []).filter(c => c.type === 'phrase').length;
  return (
    <Shell>
      <Header back onBack={onBack} title={board.name} trailing={<PlusButton onClick={onAdd} />} />

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
          <div style={{ fontSize: 15, color: T.text, fontWeight: 500 }}>{board.due} на повторение</div>
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
    </Shell>
  );
}

// ═══════════════════════════════════════════════════════════════
// SCREEN 3 · IMPORT
// ═══════════════════════════════════════════════════════════════
export function ScreenImport({ pasted, onPaste, draftCards = [], onRemoveDraft, onAdd, onBack, copied, onCopyPrompt }) {
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

        <div style={{
          border: `1.5px dashed ${T.borderStrong}`, borderRadius: T.rCard,
          padding: '32px 20px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.015)',
        }}>
          <span style={{ color: T.textDim }}>{I.upload(28, T.textDim)}</span>
          <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>Загрузи JSON файл</div>
          <div style={{ fontSize: 12, color: T.textDim }}>или вставь текст ниже</div>
        </div>

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

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ExpandPill icon={I.globe}  label="Перевод" open={showTrans} onClick={onToggleTrans} />
            <ExpandPill icon={I.bookSm} label="Пример"  open={showEx}    onClick={onToggleEx}   />
          </div>

          <Reveal open={showTrans}>
            <div style={{ paddingTop: 4 }}>
              <Eyebrow color={T.accent} style={{ marginBottom: 6 }}>перевод</Eyebrow>
              <div style={{ fontSize: 15, color: T.text }}>{card.translation}</div>
            </div>
          </Reveal>
          <Reveal open={showEx}>
            <div style={{ paddingTop: 4 }}>
              <Eyebrow color={T.accent} style={{ marginBottom: 6 }}>пример</Eyebrow>
              <div style={{ fontSize: 14, color: T.text, fontStyle: 'italic', lineHeight: 1.5 }}>"{card.example}"</div>
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ padding: '16px 20px', paddingBottom: HOME_IND + 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <AnswerButton color={T.red}    bg={T.redDim}    label="Снова"  sub="< 1 мин" onClick={() => onAnswer('again')} />
        <AnswerButton color={T.orange} bg={T.orangeDim} label="Сложно" sub="10 мин"  onClick={() => onAnswer('hard')}  />
        <AnswerButton color={T.green}  bg={T.accentDim} label="Легко"  sub="4 дня"   onClick={() => onAnswer('easy')}  />
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
          <div style={{ paddingTop: 14, borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Eyebrow color={T.textFaint}>перевод</Eyebrow>
            <div style={{ fontSize: 15, color: T.text }}>{card.translation}</div>
          </div>
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
// SCREEN 9 · PROGRESS
// ═══════════════════════════════════════════════════════════════
export function ScreenProgress({ streak = 7, days30, weak, levels }) {
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
            <div style={{ fontSize: 56, fontWeight: 700, color: T.accent, lineHeight: 1, fontFamily: T.mono, letterSpacing: '-0.04em' }}>{streak}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>дней подряд</div>
              <div style={{ fontSize: 12, color: T.textDim }}>лучший: 14</div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 24 }}>🔥</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const filled = i < streak;
              const label  = ['П','В','С','Ч','П','С','В'][i];
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
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: T.mono }}>{days30.reduce((a, b) => a + b, 0)} карточек</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 78, padding: '0 0 4px' }}>
            {days30.map((v, i) => {
              const max = Math.max(...days30, 1);
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

        {/* weak spots */}
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Слабые места</Eyebrow>
          <div style={{ background: T.surface1, border: `1px solid ${T.border}`, borderRadius: T.rCard, overflow: 'hidden' }}>
            {weak.map((w, i) => (
              <div key={w.word} style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < weak.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: T.text, flex: 1 }}>{w.word}</span>
                <span style={{
                  fontSize: 11, color: T.red, fontFamily: T.mono,
                  padding: '3px 8px', borderRadius: 4, background: T.redDim,
                }}>×{w.misses}</span>
              </div>
            ))}
          </div>
        </div>

        {/* levels */}
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Уровни</Eyebrow>
          <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: T.surface1, marginBottom: 12 }}>
            {levels.map((l, i) => (
              <div key={l.id} style={{
                flex: l.count, background: levelColor(l.id),
                borderRight: i < levels.length - 1 ? '2px solid #0f0f0f' : 0,
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
      </div>
    </Shell>
  );
}
