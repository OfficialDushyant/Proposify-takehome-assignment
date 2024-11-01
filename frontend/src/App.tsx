// src/App.tsx
import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './index.css';

interface User {
  id: string;
  username: string;
}

interface Note {
  content: string;
  lastEditedBy: string;
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const quillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = io('http://localhost:4000');
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quillRef.current == null) return;

    const editor = new Quill(quillRef.current, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    editor.disable();
    editor.setText('Loading...');

    socket.on('noteUpdate', (note: Note) => {
      console.log(note.content)
      editor.setContents(editor.clipboard.convert({html: note.content}));
      editor.enable();
    });

    socket.on('connect', () => {
      const username = prompt('Enter your username');
      if (username) {
        socket.emit('authenticate', username);
      }
    });

    socket.on('authenticated', (userData: User) => {
      setUser(userData);
    });

    const handler = (delta: any, oldDelta: any, source: string) => {
      if (source !== 'user') return;
      socket.emit('editNote', { content: editor.root.innerHTML });
    };

    editor.on('text-change', handler);

    return () => {
      socket.off('noteUpdate');
      editor.off('text-change', handler);
    };
  }, [socket]);

  return (
    <div className="container">
      <h1>Real-Time Collaborative Note</h1>
      <div ref={quillRef}></div>
    </div>
  );
}

export default App;