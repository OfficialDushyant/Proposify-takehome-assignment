import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Socket } from 'socket.io-client';
import { vi } from 'vitest';
import NoteEditor from './NoteEditor';

interface Note {
  id: string;
  content: string;
  lastEditedBy: string;
}

// Mock Socket.io client
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
} as unknown as Socket;

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

describe('NoteEditor Component', () => {
  const testNote: Note = {
    id: 'test-note-id',
    content: '<p>Initial content</p>',
    lastEditedBy: 'User1',
  };

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<NoteEditor selectedNote={testNote} socket={mockSocket} />);
    const editorElement = screen.getByRole('textbox');
    expect(editorElement).toBeInTheDocument();
  });

  test('loads initial content', () => {
    render(<NoteEditor selectedNote={testNote} socket={mockSocket} />);
    expect(mockSocket.emit).toHaveBeenCalledWith('joinNote', testNote.id);
    expect(mockSocket.on).toHaveBeenCalledWith('noteContent', expect.any(Function));
  });

  test('emits editNote event on content change', () => {
    render(<NoteEditor selectedNote={testNote} socket={mockSocket} />);
    const editorElement = screen.getByTestId('editor');
  
    // Simulate user input
    fireEvent.change(editorElement, { target: { value: '<p>Updated content</p>' } });
  
    expect(mockSocket.emit).toHaveBeenCalledWith('editNote', {
      noteId: testNote.id,
      content: '<p>Updated content</p>',
    });
  });

  test('updates content when noteUpdated event is received', async() => {
    render(<NoteEditor selectedNote={testNote} socket={mockSocket} />);

    // Find the 'noteUpdated' handler
    const noteUpdatedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'noteUpdated'
    )?.[1];

    // Simulate receiving an updated note
    const updatedNote: Note = {
      id: 'test-note-id',
      content: '<p>New content from another user</p>',
      lastEditedBy: 'User2',
    };

    if (noteUpdatedHandler) {
      noteUpdatedHandler(updatedNote);
    }

    // Check if the textarea has the new content
    await waitFor(() => {
        const editorElement = screen.getByTestId('editor') as HTMLTextAreaElement;
        expect(editorElement.value).toBe('<p>New content from another user</p>');
      });
  });

  test('cleans up event listeners on unmount', () => {
    const { unmount } = render(<NoteEditor selectedNote={testNote} socket={mockSocket} />);
    unmount();

    expect(mockSocket.emit).toHaveBeenCalledWith('leaveNote', testNote.id);
    expect(mockSocket.off).toHaveBeenCalledWith('noteContent', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('noteUpdated', expect.any(Function));
  });
});