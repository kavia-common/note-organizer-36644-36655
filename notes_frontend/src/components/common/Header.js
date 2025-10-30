import React from 'react';

/**
 * PUBLIC_INTERFACE
 */
export default function Header({ online = true, message = '', onToggleTheme, theme = 'light' }) {
  /** App header with connectivity indicator */
  return (
    <header className="header">
      <div className="brand">
        <div className="avatar">📝</div>
        <div className="title-wrap">
          <h1 className="app-title">Ocean Notes</h1>
          <span className={`status ${online ? 'online' : 'offline'}`}>
            <span className="dot" /> {online ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
      <div className="header-actions">
        {message && <div className="env-warning" role="alert">{message}</div>}
        <button className="btn ghost" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
}
