import { T } from './tokens.js';
import { I } from './icons.jsx';

// ── Banner: "Добавить на главный экран" ─────────────────────────
export function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', left: 16, right: 16, bottom: 100,
      background: T.surface1, border: `1px solid ${T.borderStrong}`,
      borderRadius: T.rCard, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 100, fontFamily: T.sans,
      animation: 'slideUp .3s cubic-bezier(.3,.6,.3,1)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: T.accentDim, border: `1px solid ${T.accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {I.book(22, T.accent)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>
          Добавить на главный экран
        </div>
        <div style={{ fontSize: 12, color: T.textDim, lineHeight: 1.4 }}>
          Открывай toBinge как обычное приложение
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button onClick={onInstall} style={{
          background: T.accent, color: '#0f0f0f', border: 0,
          padding: '8px 14px', borderRadius: T.rPill,
          fontFamily: T.sans, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}>Добавить</button>
        <button onClick={onDismiss} style={{
          background: 'transparent', color: T.textDim, border: 0,
          padding: '4px 0', fontFamily: T.sans, fontSize: 12, cursor: 'pointer',
          textAlign: 'center',
        }}>Не сейчас</button>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── Banner: "Доступно обновление" ───────────────────────────────
export function UpdateBanner({ onUpdate, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', left: 16, right: 16, top: 56,
      background: T.surface2, border: `1px solid ${T.accent}`,
      borderRadius: T.rCard, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      zIndex: 100, fontFamily: T.sans,
      animation: 'slideDown .3s cubic-bezier(.3,.6,.3,1)',
    }}>
      <span style={{ color: T.accent, flexShrink: 0 }}>{I.arrowR(18, T.accent)}</span>

      <div style={{ flex: 1, fontSize: 13, color: T.text }}>
        <span style={{ fontWeight: 600 }}>Новая версия доступна </span>
        <span style={{ color: T.textDim }}>— перезагрузи</span>
      </div>

      <button onClick={onUpdate} style={{
        background: T.accent, color: '#0f0f0f', border: 0,
        padding: '7px 12px', borderRadius: T.rPill,
        fontFamily: T.sans, fontSize: 12, fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>Обновить</button>

      <button onClick={onDismiss} style={{
        background: 'transparent', border: 0, color: T.textDim,
        cursor: 'pointer', padding: 4, flexShrink: 0,
      }}>{I.x(14, T.textDim)}</button>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-12px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>
    </div>
  );
}
