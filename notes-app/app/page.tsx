'use client';

import { useEffect, useState } from 'react';

interface Note {
  id: string;
  name: string;
  content?: string;
  modified: number;
  size: number;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Omit<Note, 'content'>[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes?id=${id}`);
      const note = await res.json();
      setCurrentNote(note);
      setContent(note.content);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to load note:', error);
    }
  };

  const saveNote = async () => {
    if (!currentNote) return;
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentNote.id, content }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setCurrentNote(updated);
        setIsDirty(false);
        await loadNotes();
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const createNote = () => {
    const name = prompt('Note name (letters, numbers, dashes only):');
    if (!name) return;
    
    const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sanitized) {
      alert('Invalid note name');
      return;
    }
    
    const initialContent = `# ${sanitized}\n\n`;
    const newNote: Note = {
      id: sanitized,
      name: `${sanitized}.md`,
      content: initialContent,
      modified: Date.now(),
      size: 0,
    };
    
    setCurrentNote(newNote);
    setContent(initialContent);
    setIsDirty(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsDirty(newContent !== currentNote?.content);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Notes</h1>
          <button
            onClick={createNote}
            className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + New Note
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-gray-500">Loading...</div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-gray-500">No notes yet</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notes.map((note) => (
                <li
                  key={note.id}
                  onClick={() => loadNote(note.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    currentNote?.id === note.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{note.id}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(note.modified).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        {currentNote ? (
          <>
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{currentNote.name}</h2>
              <button
                onClick={saveNote}
                disabled={!isDirty || isSaving}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  isDirty
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSaving ? 'Saving...' : isDirty ? 'Save *' : 'Saved'}
              </button>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 p-6 font-mono text-sm resize-none focus:outline-none"
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a note or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
