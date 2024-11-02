// src/NoteEditor.tsx
import React, { useEffect, useRef, forwardRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Socket } from 'socket.io-client';
import { Note } from '../types'



type Props = {
  selectedNote: Note;
  socket: Socket;
  ref: HTMLElement | null;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

const NoteEditor: React.FC<Props> = forwardRef({ selectedNote, socket }, ref) => {
  const editorRef = useRef<Quill | null>(null);
  const quillElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!quillElementRef.current) return;

    // Initialize the editor
    const editor = new Quill(quillElementRef.current, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    editorRef.current = editor;

    editor.disable();
    editor.setText('Loading...');

    const handleTextChange = (delta: DeltaStatic, oldDelta: DeltaStatic, source: string) => {
      if (source !== 'user') return;
      socket.emit('editNote', { noteId: selectedNote.id, delta });
    };

    editor.on('text-change', handleTextChange);

    socket.emit('joinNote', selectedNote.id);

    const handleNoteContent = (data: { noteId: string; content: any }) => {
      if (data.noteId === selectedNote.id) {
        editor.setContents(data.content);
        editor.enable();
      }
    };

    const handleNoteUpdated = (data: { noteId: string; delta: any }) => {
      if (data.noteId === selectedNote.id) {
        editor.updateContents(data.delta);
      }
    };

    socket.on('noteContent', handleNoteContent);
    socket.on('noteUpdated', handleNoteUpdated);

    return () => {
      socket.emit('leaveNote', selectedNote.id);
      socket.off('noteContent', handleNoteContent);
      socket.off('noteUpdated', handleNoteUpdated);
      editor.off('text-change', handleTextChange);
      editorRef.current = null;
    };
  }, [selectedNote.id, socket]);

  return <div className="editor" ref={quillElementRef}></div>;
};

export default NoteEditor;