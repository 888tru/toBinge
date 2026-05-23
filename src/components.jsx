import { T } from './tokens.js';
import { I } from './icons.jsx';

export const SHELL_TOP    = 0;
export const NAV_HEIGHT   = 70;
export const HOME_IND     = 34;

// ── Eyebrow label ───────────────────────────────────────────────
export function Eyebrow({ children, color, style }) {
  return (
    <div style={{
      fontFamily: T.sans, fontSize: 11, fontWeight: 500,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: color || T.textDim, ...style,
    }}>{children}</div>
  );
}

// ── Shell ────────────────────────────────────────────────────────
export function Shell({ children, withNav = true, padBottom = true, style }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: T.bg, color: T.text,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column',
      paddingTop: SHELL_TOP, position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        paddingBottom: padBottom
          ? (withNav ? NAV_HEIGHT + HOME_IND + 4 : HOME_IND + 8)
          : 0,
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Bottom nav (static, non-interactive — Prototype overrides it) ─
export function BottomNav({ active = 'boards', onChange }) {
  const items = [
    { id: 'boards',   label: 'Доски',    icon: I.boards   },
    { id: 'study',    label: 'Изучение', icon: I.study    },
    { id: 'progress', label: 'Прогресс', icon: I.progress },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: NAV_HEIGHT + HOME_IND, paddingBottom: HOME_IND,
      background: 'rgba(15,15,15,0.92)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderTop: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      zIndex: 30,
    }}>
      {items.map(item => {
        const on = item.id === active;
        return (
          <button key={item.id} onClick={() => onChange?.(item.id)} style={{
            background: 'transparent', border: 0,
            color: on ? T.accent : T.textDim,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 14px', cursor: 'pointer', fontFamily: T.sans,
          }}>
            <span style={{ pointerEvents: 'none' }}>{item.icon(22, 'currentColor')}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', pointerEvents: 'none' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Custom nav driven by app state ───────────────────────────────
export function CustomNav({ active, onChange }) {
  const items = [
    { id: 'boards',   label: 'Доски',    icon: I.boards   },
    { id: 'study',    label: 'Изучение', icon: I.study    },
    { id: 'progress', label: 'Прогресс', icon: I.progress },
  ];
  return (
    <div style={{
      height: NAV_HEIGHT + HOME_IND, paddingBottom: HOME_IND,
      background: 'rgba(15,15,15,0.92)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      borderTop: `1px solid ${T.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {items.map(item => {
        const on = item.id === active;
        return (
          <button key={item.id} onClick={() => onChange(item.id)} style={{
            background: 'transparent', border: 0,
            color: on ? T.accent : T.textDim,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '8px 14px', cursor: 'pointer', fontFamily: T.sans,
          }}>
            <span style={{ pointerEvents: 'none' }}>{item.icon(22, 'currentColor')}</span>
            <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', pointerEvents: 'none' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────
export function Header({ logo, back, title, trailing, onBack, sub }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 20px 14px',
    }}>
      {logo && (
        <div style={{
          fontFamily: T.mono, fontSize: 22, fontWeight: 500,
          color: T.accent, letterSpacing: '-0.02em', flex: 1,
        }}>toBinge</div>
      )}
      {back && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 10,
          background: T.surface1, border: `1px solid ${T.border}`,
          color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>{I.back(18)}</button>
      )}
      {title && (
        <div style={{ flex: 1, fontSize: 17, fontWeight: 500, color: T.text, letterSpacing: '-0.01em' }}>
          {title}
          {sub && <div style={{ fontSize: 12, color: T.textDim, fontWeight: 400, marginTop: 2 }}>{sub}</div>}
        </div>
      )}
      {trailing}
    </div>
  );
}

export const PlusButton = ({ onClick }) => (
  <button onClick={onClick} style={{
    width: 36, height: 36, borderRadius: 10,
    background: T.surface1, border: `1px solid ${T.border}`,
    color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  }}>{I.plus(20)}</button>
);

// ── Toast ────────────────────────────────────────────────────────
export function Toast({ message, visible }) {
  return (
    <div style={{
      position: 'absolute', left: 20, right: 20,
      bottom: visible ? NAV_HEIGHT + HOME_IND + 8 : -60,
      padding: '12px 16px', borderRadius: T.rPill,
      background: T.surface2, border: `1px solid ${T.borderStrong}`,
      color: T.text, fontFamily: T.sans, fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 10,
      transition: 'bottom .35s cubic-bezier(.3,.6,.3,1), opacity .25s',
      opacity: visible ? 1 : 0,
      zIndex: 50, pointerEvents: 'none',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <span style={{ color: T.accent }}>{I.check(14, T.accent)}</span>
      {message}
    </div>
  );
}

// ── Study sub-components ─────────────────────────────────────────
export function Reveal({ open, children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'grid-template-rows .3s cubic-bezier(.4,0,.2,1), opacity .25s',
      opacity: open ? 1 : 0,
    }}>
      <div style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

export function ExpandPill({ icon, label, open, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '7px 12px', borderRadius: T.rPillFull,
      background: open ? T.accentDim : T.surface2,
      border: `1px solid ${open ? T.accent : T.border}`,
      color: open ? T.accent : T.textDim,
      fontFamily: T.sans, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    }}>
      {icon(14, 'currentColor')}
      {label}
    </button>
  );
}

export function AnswerButton({ color, bg, label, sub, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 20px', borderRadius: T.rPill,
      background: 'transparent', border: `1.5px solid ${color}`,
      color: T.text, fontFamily: T.sans, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      transition: 'background .15s',
    }}
      onMouseEnter={e => e.currentTarget.style.background = bg}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color }}>{label}</span>
      <span style={{ fontSize: 12, color: T.textDim, fontFamily: T.mono }}>{sub}</span>
    </button>
  );
}

export const levelColor = lvl => ({
  new: '#3a3a3a', learning: '#f5c451', know: '#5b8def', master: '#d4f564',
}[lvl] || '#3a3a3a');
