// src/NoteEditor.tsx
import React, { useEffect, useState } from 'react';
import { type Socket }from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Note } from '../types';


interface Props {
  selectedNote: Note;
  socket: Socket;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

const NoteEditor: React.FC<Props> = ({ selectedNote, socket }) => {
    const [content, setContent] = useState<string>('');
  
    useEffect(() => {
      socket.emit('joinNote', selectedNote.id);
  
      const handleNoteContent = (note: Note) => {
        setContent(note.content);
      };
  
      const handleNoteUpdated = (note: Note) => {
        if (note.id === selectedNote.id) {
          setContent(note.content);
        }
      };
  
      socket.on('noteContent', handleNoteContent);
      socket.on('noteUpdated', handleNoteUpdated);
  
      return () => {
        socket.emit('leaveNote', selectedNote.id);
        socket.off('noteContent', handleNoteContent);
        socket.off('noteUpdated', handleNoteUpdated);
      };
    }, [selectedNote.id]);
  
    const handleChange = (value: string) => {
      setContent(value);
      socket.emit('editNote', { noteId: selectedNote.id, content: value });
    };
  
    return (
      <ReactQuill
        value={content}
        onChange={handleChange}
        modules={{ toolbar: TOOLBAR_OPTIONS }}
        key={selectedNote.id}
      />
    );
  };
  
  export default NoteEditor;