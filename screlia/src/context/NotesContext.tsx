import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Note {
  id: string;
  text: string;
  source?: string;
  createdAt: number;
}

interface NotesContextType {
  notes: Note[];
  addNote: (text: string, source?: string) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('screlia_notes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('screlia_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (text: string, source?: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      text,
      source,
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
