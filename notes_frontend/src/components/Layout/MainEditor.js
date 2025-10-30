import React, { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 */
export default function MainEditor({ note, onChange }) {
  /** Main editor with title and content editing */
  const [local, setLocal] = useState({ title: '', content: '' });

  useEffect(() => {
    setLocal({ title: note?.title || '', content: note?.content || '' });
  }, [note?.id]); // reset when note changes

  useEffect(() => {
    // reflect external updates
    setLocal({ title: note?.title || '', content: note?.content || '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.title, note?.content]);

  if (!note) return null;

  return (
    <section className="editor">
      <input
        className="title-input"
        value={local.title}
        onChange={(e) => {
          const title = e.target.value;
          setLocal((p) => ({ ...p, title }));
          onChange({ ...local, title });
        }}
        placeholder="Title"
      />
      <textarea
        className="content-input"
        value={local.content}
        onChange={(e) => {
          const content = e.target.value;
          setLocal((p) => ({ ...p, content }));
          onChange({ ...local, content });
        }}
        placeholder="Write your note..."
      />
    </section>
  );
}
