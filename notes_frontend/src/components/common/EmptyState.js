import React from 'react';

/**
 * PUBLIC_INTERFACE
 */
export default function EmptyState({ onCreate }) {
  /** Empty state prompting to create a note */
  return (
    <div className="empty-state">
      <div className="empty-card">
        <div className="empty-icon">📄</div>
        <h2>No note selected</h2>
        <p>Create a new note to get started.</p>
        <button className="btn primary" onClick={onCreate}>New note</button>
      </div>
    </div>
  );
}
