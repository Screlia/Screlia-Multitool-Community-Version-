import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Trash2, Calendar, FileText, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

export default function NotesPage() {
  const { notes, deleteNote } = useNotes();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-theme-primary">My Notes</h2>
        <p className="text-theme-secondary">Highlights and saved text from your searches.</p>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-20 bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-dashed border-theme shadow-sm">
          <div className="w-16 h-16 bg-theme-primary/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-theme-secondary" />
          </div>
          <h3 className="text-lg font-medium text-theme-primary">No notes yet</h3>
          <p className="text-theme-secondary mt-1">Highlight text on the Search page to save notes.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="group bg-theme-secondary/80 backdrop-blur-xl p-6 rounded-2xl border border-theme shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
              >
                <div className="flex-1 prose prose-sm prose-zinc dark:prose-invert max-w-none mb-4 text-theme-primary">
                  <ReactMarkdown>{note.text}</ReactMarkdown>
                </div>
                
                <div className="pt-4 border-t border-theme flex items-center justify-between text-xs text-theme-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {note.source && (
                      <span className="bg-theme-primary/50 px-2 py-1 rounded text-theme-secondary truncate max-w-[100px]" title={note.source}>
                        {note.source}
                      </span>
                    )}
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-2 text-theme-secondary hover:text-red-600 hover:bg-red-50/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
