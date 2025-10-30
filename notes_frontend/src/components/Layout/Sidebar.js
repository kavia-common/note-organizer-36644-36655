import React from 'react';

/**
 * PUBLIC_INTERFACE
 */
export default function Sidebar({ notes, selectedId, onSelect, onCreate, onDelete, search, onSearch }) {
  /** Sidebar list of notes with search and actions */
  return (
    <aside className="sidebar">
      <div className="sidebar-actions">
        <input
          className="input"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <button className="btn primary" onClick={onCreate}>+ New</button>
      </div>
      <ul className="notes-list">
        {notes.map((n) => (
          <li
            key={n.id}
            className={`note-item ${selectedId === n.id ? 'active' : ''}`}
            onClick={() => onSelect(n.id)}
          >
            <div className="note-title">{n.title || 'Untitled'}</div>
            <div className="note-meta">
              <span className="note-date">{new Date(n.updated_at || n.created_at).toLocaleString()}</span>
              <button
                className="btn danger ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(n.id);
                }}
                aria-label="Delete note"
                title="Delete note"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="note-empty">No notes</li>
        )}
      </ul>
    </aside>
  );
}
