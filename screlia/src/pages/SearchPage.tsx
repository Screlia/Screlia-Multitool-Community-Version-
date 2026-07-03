import React, { useState, useEffect } from 'react';
import { ai, MODELS, getAI } from '../services/gemini';
import { generateAIContent } from '../services/aiManager';
import { Search, ArrowRight, Loader2, Globe, Sparkles, Plus, X, Image as ImageIcon, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { useNotes } from '../context/NotesContext';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { SmoothText } from '../components/SmoothText';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [searchMode, setSearchMode] = useState<'ai' | 'traditional' | 'images'>('ai');
  const [userId, setUserId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const { filters } = useSettings();
  const { addNote } = useNotes();

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });

    const handleFocusSearch = () => {
      inputRef.current?.focus();
    };

    window.addEventListener('focusSearch', handleFocusSearch);

    return () => {
      unsubscribe();
      window.removeEventListener('focusSearch', handleFocusSearch);
    };
  }, []);

  // Handle text selection for note taking
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text: sel.toString(),
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY - 40 // Position above selection
        });
      } else {
        setSelection(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const saveSelection = () => {
    if (selection) {
      addNote(selection.text, "Search Result Highlight");
      setSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const executeSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResult(null);
    setGroundingChunks([]);
    setSummary(null);

    try {
      // Apply filters to query
      let enhancedQuery = searchQuery;
      if (filters.includedKeywords) enhancedQuery += ` ${filters.includedKeywords}`;
      if (filters.excludedKeywords) enhancedQuery += ` -${filters.excludedKeywords.split(',').join(' -')}`;
      if (filters.preferredDomains) {
        const domains = filters.preferredDomains.split(',').map(d => `site:${d.trim()}`).join(' OR ');
        enhancedQuery += ` (${domains})`;
      }

      // Add relevance instruction and language
      let systemInstruction = `
        Sen gelişmiş bir Multitool arama motoru asistanısın.
        Kullanıcı ${filters.searchEngine} mantığında bir arama yapıyor.
        Yanıt dili KESİNLİKLE: ${filters.language || "Türkçe"}.
        
        ${filters.relevance === 'precise' 
          ? "Lütfen yalnızca arama sonuçlarına bağlı kalarak doğrudan, kısa ve kesin bilgiler ver."
          : "Lütfen farklı perspektifleri ele alarak kapsamlı ve detaylı bir sentez sun."}
      `;

      if (searchMode === 'images') {
        systemInstruction += `
          Kullanıcı özellikle görsel arıyor.
          Lütfen bulduğun ilgili görselleri Markdown formatında ( ![Görsel Açıklaması](URL) ) şeklinde mutlaka göster. Doğrudan görsel linkleri bulamazsan, görsel içermesi muhtemel sayfaların özetini ver.
        `;
        enhancedQuery += " images";
      } else if (searchMode === 'traditional') {
        systemInstruction += `
          Geleneksel web arama modu: Kaynakların kısa bir genel özetini ver, ağırlıklı olarak araç sitelerini ve linkleri belirt. (Kullanıcı arayüzde siteleri görecek).
        `;
      } else {
        systemInstruction += `
          Yapay Zeka arama modu: Gelen verileri kullanarak okunaklı, iyi formatlanmış (Markdown ile başlıklar, listeler) ve zenginleştirilmiş bir metin oluştur. Varsa zıt görüşleri veya önemli ayrıntıları vurgula.
        `;
      }

      const res = await generateAIContent(enhancedQuery, filters, systemInstruction, 'search');

      setResult(res.text);
      if (res.chunks) {
        setGroundingChunks(res.chunks);
      }
    } catch (error: any) {
      console.error("Search error:", error);
      const errorMessage = error.message || "Arama sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      setResult(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  const generateSummary = async () => {
    if (!result) return;
    setSummarizing(true);
    try {
      const response = await ai.models.generateContent({
        model: MODELS.fast,
        contents: `Aşağıdaki metni 3-4 kısa madde işareti ile özetle. Dil: ${filters.language || "Türkçe"}:\n\n${result}`,
      });
      setSummary(response.text);
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setSummarizing(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResult(null);
    setGroundingChunks([]);
    setSummary(null);
  };

  const engineName = filters.searchEngine.charAt(0).toUpperCase() + filters.searchEngine.slice(1);

  return (
    <div className={cn("min-h-full flex flex-col relative", !result && "justify-center")}>
      {/* Floating Note Button */}
      <AnimatePresence>
        {selection && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              position: 'absolute', 
              left: selection.x, 
              top: selection.y,
              zIndex: 50
            }}
            onClick={saveSelection}
            className="flex items-center gap-2 px-3 py-2 bg-theme-secondary text-theme-primary border border-theme rounded-xl shadow-xl text-sm font-medium hover:bg-theme-primary transition-colors pointer-events-auto backdrop-blur-xl"
          >
            <Plus className="w-4 h-4" />
            Notu Kaydet
          </motion.button>
        )}
      </AnimatePresence>

      {/* Search Header / Centered View */}
      <div className={cn("transition-all duration-700 ease-in-out w-full max-w-3xl mx-auto space-y-8 relative z-10", result ? "pt-0" : "pb-32")}>
        {!result && (
          <div className="text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 mb-12"
            >
              <span className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-theme-primary to-theme-secondary drop-shadow-sm" style={{ color: 'var(--text-primary)' }}>
                {engineName}
              </span>
            </motion.div>
          </div>
        )}

        <form onSubmit={handleSearch} className="relative group">
          <div className="flex justify-center mb-8">
            <div className="bg-theme-secondary/80 backdrop-blur-2xl p-1.5 rounded-[1.5rem] border border-theme inline-flex shadow-lg hover:shadow-xl transition-shadow duration-500">
              <button
                type="button"
                onClick={() => setSearchMode('ai')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-500 tracking-tight",
                  searchMode === 'ai' 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105" 
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50"
                )}
              >
                Yapay Zeka
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('traditional')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-500 tracking-tight",
                  searchMode === 'traditional' 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105" 
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50"
                )}
              >
                Web Sonuçları
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('images')}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-500 tracking-tight",
                  searchMode === 'images' 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 scale-105" 
                    : "text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50"
                )}
              >
                Görseller
              </button>
            </div>
          </div>
          
          <div className="relative flex items-center group/input">
            {/* Glowing Aura */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-[2.5rem] blur-lg opacity-20 group-focus-within/input:opacity-40 transition-opacity duration-500" />
            
            <Search className="absolute left-6 text-theme-secondary w-6 h-6 group-focus-within/input:text-indigo-500 transition-colors duration-500 z-10" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  if (!loading && query.trim()) {
                    executeSearch(query);
                  }
                }
              }}
              placeholder={`${engineName} üzerinde ara veya URL yaz`}
              className="w-full pl-16 pr-16 py-6 bg-theme-secondary/90 backdrop-blur-2xl text-theme-primary border border-theme rounded-[2.5rem] shadow-2xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-500 text-xl font-medium tracking-tight placeholder:text-theme-secondary/50 placeholder:font-normal relative z-0"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 p-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-primary/50 rounded-full transition-all duration-300 z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-500 shadow-lg hover:shadow-indigo-500/40 z-10"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Active Filters Indicator */}
          {(filters.includedKeywords || filters.preferredDomains) && !result && (
            <div className="mt-6 flex justify-center gap-2">
              <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-600 text-xs font-semibold tracking-wide uppercase rounded-full border border-indigo-500/20 backdrop-blur-md">
                Filtreler Aktif
              </span>
            </div>
          )}
        </form>
      </div>

      {/* Results View */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mx-auto mt-8 space-y-6 pb-20"
        >
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-theme pb-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-theme-secondary/80">
                Yaklaşık {groundingChunks.length} sonuç bulundu
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (result) {
                    navigator.clipboard.writeText(result);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-theme-secondary hover:text-indigo-600 bg-theme-primary/50 border border-theme rounded-[0.8rem] transition-all hover:bg-theme-secondary"
              >
                {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{isCopied ? "Kopyalandı" : "Metni Kopyala"}</span>
              </button>
              <button
                onClick={generateSummary}
                disabled={summarizing || !!summary}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50/10 border border-indigo-200/20 rounded-[0.8rem] hover:bg-indigo-50/20 disabled:opacity-50 transition-all font-semibold"
              >
                {summarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {summary ? "Özetlendi" : "Sayfayı Özetle"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {searchMode === 'images' ? (
                <div className="bg-theme-secondary p-8 rounded-2xl border border-theme shadow-sm">
                  <div className="prose prose-zinc dark:prose-invert max-w-none text-theme-primary">
                    <p className="text-sm text-theme-secondary mb-4 italic">
                      Not: Görsel arama sonuçları yapay zekanın arama verilerinden bağlantıları ne kadar iyi çıkarabildiğine bağlıdır.
                    </p>
                    <SmoothText text={result} />
                  </div>
                </div>
              ) : searchMode === 'traditional' ? (
                <div className="space-y-6">
                  {groundingChunks.length > 0 ? (
                    groundingChunks.map((chunk, idx) => (
                      chunk.web?.uri && (
                        <div key={idx} className="bg-theme-secondary p-6 rounded-2xl border border-theme hover:border-indigo-500/30 transition-colors group">
                          <a 
                            href={chunk.web.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-theme-primary rounded-full">
                                <Globe className="w-3 h-3 text-theme-secondary" />
                              </div>
                              <span className="text-xs text-theme-secondary truncate max-w-[200px]">
                                {new URL(chunk.web.uri).hostname}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-indigo-600 group-hover:underline mb-2">
                              {chunk.web.title}
                            </h3>
                            <p className="text-sm text-theme-primary line-clamp-2">
                              {/* Snippet is not always available in grounding chunks, so we rely on title/url */}
                              {new URL(chunk.web.uri).hostname} sitesindeki bu sonuca gitmek için tıklayın.
                            </p>
                          </a>
                        </div>
                      )
                    ))
                  ) : (
                    <div className="text-center py-12 text-theme-secondary">
                      Web sonucu bulunamadı. Yapay Zeka modunu deneyin.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary Box */}
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-indigo-50/10 border border-indigo-200/30 p-6 rounded-2xl backdrop-blur-md hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <h4 className="text-sm font-semibold text-indigo-600 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Yapay Zeka Özeti
                      </h4>
                      <div className="prose prose-sm prose-indigo max-w-none text-theme-primary">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}

                  {/* Main Result */}
                  <div className="bg-theme-secondary/80 backdrop-blur-xl p-8 rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-500">
                    <div className="prose prose-zinc dark:prose-invert max-w-none text-theme-primary">
                      <SmoothText text={result} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Sources */}
            <div className="space-y-6">
              {groundingChunks.length > 0 && (
                <div className="bg-theme-secondary/80 backdrop-blur-md p-6 rounded-2xl border border-theme sticky top-8 shadow-sm hover:shadow-md transition-all duration-300">
                  <h3 className="text-sm font-medium text-theme-secondary uppercase tracking-wider mb-4">Kaynaklar</h3>
                  <div className="space-y-3">
                    {groundingChunks.map((chunk, idx) => (
                      chunk.web?.uri && (
                        <a
                          key={idx}
                          href={chunk.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-theme-primary/50 transition-all duration-300 group border border-transparent hover:border-theme hover:shadow-sm hover:-translate-x-1"
                        >
                          <div className="p-2 bg-theme-primary rounded-lg group-hover:bg-indigo-50/10 transition-colors duration-300 shrink-0 shadow-sm">
                            <Globe className="w-4 h-4 text-theme-secondary group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-theme-primary truncate group-hover:text-indigo-600 transition-colors duration-300">
                              {chunk.web.title}
                            </p>
                            <p className="text-xs text-theme-secondary truncate opacity-70 group-hover:opacity-100 transition-opacity">
                              {new URL(chunk.web.uri).hostname}
                            </p>
                          </div>
                        </a>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
