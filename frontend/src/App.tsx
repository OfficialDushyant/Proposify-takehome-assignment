// src/App.tsx
import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import NoteEditor from './components/NoteEditor'; // Import the new component

interface User {
  id: string;
  username: string;
}

interface Note {
  id: string;
  label: string;
  content: string;
  lastEditedBy: string;
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    const s = io('http://localhost:4000');
    setSocket(s);

    s.on('noteList', (notes: Note[]) => {
      setNotes(notes);
    });

    s.on('noteCreated', (note: Note) => {
      setNotes((prevNotes) => [...prevNotes, note]);
    });

    s.on('noteDeleted', (noteId: string) => {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    });

    s.on('connect', () => {
      const username = prompt('Enter your username');
      if (username) {
        s.emit('authenticate', username);
      }
    });

    s.on('authenticated', (userData: User) => {
      setUser(userData);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleCreateNote = () => {
    const noteTitle = prompt('Enter note title');
    if (noteTitle && socket) {
      socket.emit('createNote', noteTitle);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (socket) {
      socket.emit('deleteNote', noteId);
    }
  };

  const handleSelectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    setSelectedNote(note || null);
  };

  return (
    <div className="container">
      {user? <h1>Welcome, {user.username}.</h1> : null}
      <h1>Real-Time Collaborative Notes</h1>
      <button onClick={handleCreateNote}>Create New Note</button>
      <div className="main-content">
        <div className="note-list">
          <h2>Notes</h2>
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <button onClick={() => handleSelectNote(note.id)}>
                 {note.label}
                </button>
                <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="editor-container">
          {selectedNote && socket ? (
            <NoteEditor selectedNote={selectedNote} socket={socket} key={selectedNote.id} />
          ) : (
            <div>Please select a note to edit.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;