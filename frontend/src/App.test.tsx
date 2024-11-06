import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import App from './App';


// Mock 'socket.io-client'
vi.mock('socket.io-client', () => {
  const emitMock = vi.fn();
  const onMock = vi.fn();
  const offMock = vi.fn();
  const disconnectMock = vi.fn();

  const socketMock = {
    emit: emitMock,
    on: onMock,
    off: offMock,
    disconnect: disconnectMock,
  };

  const io = vi.fn(() => socketMock);

  return {
    default: io, // Export 'io' as default export
  };
});

// Mock 'react-quill'
vi.mock('react-quill', () => {
  const ReactQuillMock = vi.fn((props) => (
    <textarea
      data-testid="editor"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    />
  ));
  return { default: ReactQuillMock };
});

// Import mocks
import io from 'socket.io-client';


describe('App Component', () => {
  const emitMock = io().emit;
  const onMock = io().on;
  let connectCallback = vi.fn();

  beforeEach(() => {    
    vi.clearAllMocks();
    // Mock 'prompt' function
    (global as any).prompt = vi.fn().mockReturnValueOnce('testuser');

    connectCallback = vi.fn();
  });

  it('creates a new note', async () => {
    // Mock implementation for socket.on
    onMock.mockImplementation((event, callback) => {
      if (event === 'connect') {
        connectCallback = callback;
      } else if (event === 'noteList') {
        callback([]);
      } else if (event === 'noteCreated') {
        callback({
          id: 'note-id',
          label: 'New Note',
          content: '',
          lastEditedBy: '',
        });
      }
    });

    render(<App />);

    // Manually invoke the 'connect' event handler
    if (connectCallback) {
      connectCallback();
    }

    // Wait for the prompt to be called and user to be set
    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalledWith('Enter your username');
    });

    // Mock 'prompt' for note title
    (global as any).prompt.mockReturnValueOnce('New Note');

    // Simulate user clicking 'Create New Note' button
    fireEvent.click(screen.getByText('Create New Note'));

    // Check if the emit method was called with 'createNote' event
    expect(emitMock).toHaveBeenCalledWith('createNote', 'New Note');

    // Simulate the 'noteCreated' event being received
    onMock.mock.calls
      .filter(([event]) => event === 'noteCreated')
      .forEach(([, callback]) => callback({
        id: 'note-id',
        label: 'New Note',
        content: '',
        lastEditedBy: '',
      }));

    // Wait for the note to appear in the list
      await expect(screen.getByText('New Note')).toBeInTheDocument();
      
  });

it('deletes a note', async () => {
  vi.clearAllMocks();

  // Mock 'prompt' function
  (global as any).prompt = vi.fn().mockReturnValueOnce('testuser');

  const eventHandlers: { [key: string]: Function } = {};

  onMock.mockImplementation((event, callback) => {
    eventHandlers[event] = callback;
  });

  render(<App />);

  // Manually invoke the 'connect' event handler
  if (eventHandlers['connect']) {
    eventHandlers['connect']()
  }

  // Check that 'authenticate' was emitted
  expect(emitMock).toHaveBeenCalledWith('authenticate', 'testuser');

  // Simulate the 'authenticated' event from the server
  if (eventHandlers['authenticated']) {
    eventHandlers['authenticated']({ id: 'user-id', username: 'testuser' });
  }

  // Simulate the 'noteList' event from the server
  if (eventHandlers['noteList']) {
    eventHandlers['noteList']([
      {
        id: 'note-id',
        label: 'Existing Note',
        content: '',
        lastEditedBy: '',
      },
    ]);
  }

  // Wait for the note to appear in the list
  await waitFor(() => {
    expect(screen.getByText('Existing Note')).toBeInTheDocument();
  });

  // Simulate user clicking the 'Delete' button next to the note
  fireEvent.click(screen.getByText('Delete'));

  // Check if the emit method was called with 'deleteNote' event
  expect(emitMock).toHaveBeenCalledWith('deleteNote', 'note-id');

  // Simulate the 'noteDeleted' event being received
  if (eventHandlers['noteDeleted']) {
    eventHandlers['noteDeleted']('note-id');
  }

  // Wait for the note to be removed from the list
  await waitFor(() => {
    expect(screen.queryByText('Existing Note')).not.toBeInTheDocument();
  });
});
});
