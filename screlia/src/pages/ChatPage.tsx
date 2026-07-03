import React, { useState, useRef, useEffect } from 'react';
import { MODELS, getAI } from '../services/gemini';
import { generateAIContent } from '../services/aiManager';
import { Send, Loader2, User, Bot, Sparkles, Paperclip, X, History, Plus, Trash2, MessageSquare, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';

import { SmoothText } from '../components/SmoothText';
import { auth, db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, serverTimestamp, getDocsFromServer } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface Message {
  role: 'user' | 'model';
  text: string;
  image?: string;
  createdAt?: number;
}

interface ChatSessionData {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'ai' | 'image' | 'vision'>('ai');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { filters } = useSettings();
  const { t, isEnglish } = useTranslation();
  const [chatSession, setChatSession] = useState<any>(null);

  // History State
  const [sessions, setSessions] = useState<ChatSessionData[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadSessionsFromFirestore(user.uid);
      } else {
        setUserId(null);
        setSessions([]);
        setMessages([]);
        setCurrentSessionId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadSessionsFromFirestore = async (uid: string) => {
    try {
      const q = query(
        collection(db, 'chats'),
        where('userId', '==', uid)
      );
      const querySnapshot = await getDocs(q);
      const loadedSessions: ChatSessionData[] = [];
      
      const sessionPromises = querySnapshot.docs.map(async (chatDoc) => {
        const data = chatDoc.data();
        const msgQ = query(collection(db, `chats/${chatDoc.id}/messages`));
        const msgSnap = await getDocs(msgQ);
        const msgs = msgSnap.docs.map(doc => doc.data() as Message)
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        
        loadedSessions.push({
          id: chatDoc.id,
          title: data.title,
          updatedAt: data.updatedAt,
          messages: msgs
        });
      });

      await Promise.all(sessionPromises);
      loadedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(loadedSessions);
    } catch (error) {
      console.error("Failed to load chat history from Firestore", error);
    }
  };

  // Initialize chat session with current settings and history
  useEffect(() => {
    try {
      const genAI = getAI(filters.apiKey);
      
      let history: any[] | undefined = undefined;
      if (currentSessionId) {
        const session = sessions.find(s => s.id === currentSessionId);
        if (session && session.messages.length > 0) {
          history = session.messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }));
        }
      }

      const chat = genAI.chats.create({
        model: MODELS.chat,
        history: history,
        config: {
          systemInstruction: `You are Screlia, a helpful and intelligent AI assistant. Respond in ${filters.language || "English"}.`,
        }
      });
      setChatSession(chat);
    } catch (error) {
      console.error("Failed to init chat:", error);
    }
  }, [filters.language, filters.apiKey, currentSessionId, sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAttachedImage(result);
        const base64 = result.split(',')[1];
        setAttachedImageBase64(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setAttachedImage(null);
    setAttachedImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsHistoryOpen(false);
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(id);
      setIsHistoryOpen(false);
    }
  };

  const deleteSessionLocal = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  const deleteSession = async (id: string) => {
    deleteSessionLocal(id);
    if (userId) {
      try {
        await deleteDoc(doc(db, 'chats', id));
      } catch (error) {
        console.error("Failed to delete from Firestore", error);
      }
    }
  };

  const clearAllSessions = async () => {
    if (window.confirm(isEnglish ? 'Are you sure you want to delete all chat history?' : 'Tüm sohbet geçmişini silmek istediğinize emin misiniz?')) {
      const currentIds = sessions.map(s => s.id);
      setSessions([]);
      startNewChat();
      if (userId) {
        for (const id of currentIds) {
          try {
             await deleteDoc(doc(db, 'chats', id));
          } catch(e) {
            console.error("Failed to delete", id);
          }
        }
      }
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || loading || !chatSession) return;

    const userMessageText = input.trim();
    const currentImage = attachedImage;
    const currentImageBase64 = attachedImageBase64;

    setInput('');
    clearAttachment();
    
    const newUserMsg: Message = { 
      role: 'user', 
      text: userMessageText,
      image: currentImage || undefined,
      createdAt: Date.now()
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setLoading(true);

    let sessionId = currentSessionId;
    const ts = Date.now();

    if (!sessionId) {
      sessionId = ts.toString() + Math.random().toString(36).substr(2, 5);
      setCurrentSessionId(sessionId);
      const newSession: ChatSessionData = {
        id: sessionId,
        title: userMessageText.slice(0, 30) + (userMessageText.length > 30 ? '...' : ''),
        messages: updatedMessages,
        updatedAt: ts
      };
      setSessions(prev => [newSession, ...prev]);
      
      // Save to Firestore
      if (userId) {
        try {
          await setDoc(doc(db, 'chats', sessionId), {
            userId,
            title: newSession.title,
            updatedAt: ts
          });
          const msgBase = { ...newUserMsg };
          delete msgBase.image;
          await setDoc(doc(db, `chats/${sessionId}/messages`, ts.toString()), msgBase);
        } catch(e) {
          console.error("Save to Firestore failed", e);
        }
      }
    } else {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: updatedMessages, updatedAt: ts }
          : s
      ));
      if (userId) {
         try {
           await updateDoc(doc(db, 'chats', sessionId), { updatedAt: ts });
           const msgBase = { ...newUserMsg };
           delete msgBase.image;
           await setDoc(doc(db, `chats/${sessionId}/messages`, ts.toString()), msgBase);
         } catch(e) {}
      }
    }

    try {
      let resultText = "";
      let resultImage: string | undefined = undefined;

      if (chatMode === 'image') {
        const res = await generateAIContent(userMessageText, filters, undefined, 'image');
        resultText = res.text;
        resultImage = res.image;
      } else {
        if (currentImageBase64) {
          // Send with standard gemini chat if image is present
          const msgParts: any[] = [];
          if (currentImageBase64) {
            msgParts.push({
              inlineData: {
                data: currentImageBase64,
                mimeType: "image/jpeg"
              }
            });
          }
          if (userMessageText) {
            msgParts.push({ text: userMessageText });
          }
          
          if (chatSession) {
            const result = await chatSession.sendMessage({ message: msgParts });
            resultText = result.text;
          }
        } else {
          if (filters.aiModel && filters.aiModel !== 'gemini') {
            // Include chat history inside the prompt context manually as string
            let previousConvo = updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
            const fullPrompt = `${previousConvo}\nUser: ${userMessageText}`;
            const res = await generateAIContent(fullPrompt, filters, undefined, 'chat');
            resultText = res.text;
          } else {
            const result = await chatSession?.sendMessage({ message: userMessageText });
            resultText = result?.text || "";
          }
        }
      }

      const modelTs = Date.now();
      const newModelMsg: Message = { role: 'model', text: resultText, image: resultImage, createdAt: modelTs };
      const finalMessages = [...updatedMessages, newModelMsg];
      
      setMessages(finalMessages);
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, messages: finalMessages, updatedAt: modelTs }
          : s
      ));

      if (userId) {
        try {
           await updateDoc(doc(db, 'chats', sessionId), { updatedAt: modelTs });
           await setDoc(doc(db, `chats/${sessionId}/messages`, modelTs.toString()), newModelMsg);
        } catch(e) {}
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.message || (isEnglish ? "An error occurred. Please check your API key settings." : "Bir hata oluştu. Lütfen API anahtarı ayarlarınızı kontrol edin.");
      setMessages(prev => [...prev, { role: 'model', text: `${isEnglish ? "Error:" : "Hata:"} ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Header with History Controls */}
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          {t('chat')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary border border-theme rounded-xl hover:bg-indigo-50/10 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('new_chat')}</span>
          </button>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary border border-theme rounded-xl hover:bg-indigo-50/10 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300 shadow-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{t('history')}</span>
          </button>
        </div>
      </div>

      {/* History Modal - UPDATED THEME */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-theme-primary/60 transition-opacity" 
              onClick={() => setIsHistoryOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-theme-secondary border border-theme rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              <div className="p-6 pb-4 border-b border-theme flex justify-between items-center bg-gradient-to-b from-indigo-500/5 to-transparent">
                <div>
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-500" />
                    {t('history')}
                  </h3>
                  <p className="text-sm text-theme-secondary mt-1">{isEnglish ? "Your saved conversations" : "Kayıtlı sohbetleriniz"}</p>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-theme-primary rounded-full transition-colors bg-theme-secondary border border-theme shadow-sm"
                >
                  <X className="w-5 h-5 text-theme-secondary hover:text-theme-primary" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!userId ? (
                   <div className="flex flex-col items-center justify-center py-12 text-center">
                     <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                       <User className="w-8 h-8 text-indigo-500" />
                     </div>
                     <p className="font-medium text-theme-primary mb-2">
                       {isEnglish ? "Sign in to save history" : "Geçmişi kaydetmek için giriş yapın"}
                     </p>
                     <p className="text-sm text-theme-secondary max-w-[250px]">
                       {isEnglish ? "Your chats will be safely stored and synced across devices." : "Sohbetleriniz güvenle saklanır ve tüm cihazlarınızla eşitlenir."}
                     </p>
                   </div>
                ) : sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-theme-primary rounded-full border border-theme flex items-center justify-center mb-4 shadow-sm">
                      <MessageSquare className="w-6 h-6 text-theme-secondary" />
                    </div>
                    <p className="font-medium text-theme-primary">
                      {isEnglish ? "No previous conversations" : "Önceki konuşma bulunmamaktadır"}
                    </p>
                  </div>
                ) : (
                  sessions.map(session => (
                    <div 
                      key={session.id} 
                      onClick={() => loadSession(session.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group relative overflow-hidden",
                        currentSessionId === session.id 
                          ? "bg-indigo-50 border-indigo-200 shadow-sm dark:bg-indigo-500/10 dark:border-indigo-500/30" 
                          : "bg-theme-primary/40 border-theme hover:border-indigo-300/50 hover:bg-theme-primary hover:shadow-sm"
                      )}
                    >
                      <div className="truncate pr-4 flex-1 relative z-10">
                        <p className={cn(
                          "font-medium truncate transition-colors",
                          currentSessionId === session.id ? "text-indigo-700 dark:text-indigo-400" : "text-theme-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                        )}>
                          {session.title || t('new_chat')}
                        </p>
                        <p className="text-xs text-theme-secondary mt-1 flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 block"></span>
                           {new Date(session.updatedAt).toLocaleString(isEnglish ? 'en-US' : 'tr-TR', { 
                             month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                           })}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} 
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all relative z-10 focus:opacity-100"
                        title={isEnglish ? "Delete Chat" : "Sohbeti Sil"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      {currentSessionId === session.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {sessions.length > 0 && userId && (
                <div className="p-4 border-t border-theme bg-theme-secondary">
                  <button 
                    onClick={clearAllSessions} 
                    className="w-full py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:border-red-300 dark:hover:border-red-500/30 rounded-2xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    {isEnglish ? "Clear All History" : "Tüm Geçmişi Temizle"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-[2rem] flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
              <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-theme-primary mb-1">
                {isEnglish ? "Welcome to MULTITOOL Chat" : "MULTITOOL Sohbete Hoş Geldiniz"}
              </h3>
              <p className="text-theme-secondary max-w-sm mx-auto">
                {isEnglish ? "Ask me anything, generate images, or analyze pictures. I'm here to help." : "Bana her şeyi sorabilirsiniz, görsel oluşturabilir veya inceleyebilirsiniz. Yardım etmek için buradayım."}
              </p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-4 max-w-3xl group",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110",
              msg.role === 'user' ? "bg-theme-primary text-theme-secondary border border-theme" : "bg-indigo-600 text-white"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-4 rounded-2xl prose prose-sm max-w-none flex flex-col gap-2 transition-all duration-300 hover:shadow-md",
              msg.role === 'user' 
                ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20" 
                : "bg-theme-secondary border border-theme shadow-sm rounded-tl-none text-theme-primary dark:prose-invert"
            )}>
              {msg.image && (
                <img src={msg.image} alt="User upload" className="max-w-full rounded-lg max-h-60 object-contain bg-black/10 hover:scale-[1.02] transition-transform duration-300" />
              )}
              {msg.role === 'model' ? (
                <SmoothText text={msg.text} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              )}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex gap-4 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-theme-secondary border border-theme shadow-sm rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-theme-secondary rounded-full animate-bounce bg-indigo-400" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-theme-secondary rounded-full animate-bounce bg-indigo-400" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-theme-secondary rounded-full animate-bounce bg-indigo-400" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex bg-theme-secondary p-1 rounded-2xl w-fit mb-2 shadow-sm border border-theme">
          <button
            type="button"
            onClick={() => setChatMode('ai')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2",
              chatMode === 'ai' || chatMode === 'vision' ? "bg-indigo-600 text-white shadow" : "text-theme-secondary hover:text-theme-primary"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {isEnglish ? "Chat / Vision" : "Sohbet / Vision"}
          </button>
          <button
            type="button"
            onClick={() => setChatMode('image')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-xl transition-all flex items-center gap-2",
              chatMode === 'image' ? "bg-indigo-600 text-white shadow" : "text-theme-secondary hover:text-theme-primary"
            )}
          >
            <ImageIcon className="w-4 h-4" />
            {isEnglish ? "Generate Image" : "Görsel Oluştur"}
          </button>
        </div>
        {attachedImage && (
          <div className="flex items-center gap-2 p-2 bg-theme-secondary border border-theme rounded-lg w-fit shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <img src={attachedImage} alt="Preview" className="w-10 h-10 object-cover rounded hover:scale-110 transition-transform duration-300" />
            <button onClick={clearAttachment} className="p-1 hover:bg-theme-primary rounded-full transition-colors">
              <X className="w-4 h-4 text-theme-secondary hover:text-red-500 transition-colors" />
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="relative flex items-end gap-2 group/form">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-4 bg-theme-secondary text-theme-secondary border border-theme rounded-2xl hover:text-indigo-600 hover:border-indigo-600 hover:shadow-md hover:scale-105 transition-all duration-300"
            title={isEnglish ? "Attach Image" : "Görsel Ekle"}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  if (!loading && (input.trim() || attachedImage)) {
                    handleSend(e as any);
                  }
                }
              }}
              placeholder={userId ? t('message_placeholder') : (isEnglish ? "Sign in to save chat..." : "Sohbeti kaydetmek için giriş yapın...")}
              disabled={loading}
              className="w-full pl-6 pr-14 py-4 bg-theme-primary/50 text-theme-primary border border-theme/50 rounded-2xl shadow-sm hover:border-theme focus:bg-theme-primary focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-300 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachedImage)}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-md hover:shadow-indigo-500/30"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
