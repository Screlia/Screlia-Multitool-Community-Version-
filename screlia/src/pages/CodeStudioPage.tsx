import React, { useState } from 'react';
import { ai, getAI } from '../services/gemini';
import { generateAIContent } from '../services/aiManager';
import { Code, Loader2, Send, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export default function CodeStudioPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { filters } = useSettings();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const systemInstruction = `Sen uzman bir yazılım mühendisi ve kod asistanısın. 
      Yüksek kaliteli, verimli ve iyi belgelenmiş kod sağla. 
      Kodu vermeden önce çözümünü kısaca açıkla.
      Yanıt dili: ${filters.language || "Türkçe"}.`;
      
      const res = await generateAIContent(prompt, filters, systemInstruction, 'code');
      setResult(res.text);
    } catch (error: any) {
      console.error("Code generation error:", error);
      const errorMessage = error.message || "Kod üretilirken bir hata oluştu. Lütfen API anahtarınızı kontrol edin.";
      setResult(`Hata: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 h-full flex flex-col">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
          <Code className="w-8 h-8 text-indigo-600" />
          Kod Stüdyosu
        </h2>
        <p className="text-theme-secondary">Gelişmiş yapay zeka ile kod üretin, hata ayıklayın ve refaktör edin.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Input Section */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          <form onSubmit={handleGenerate} className="flex-1 flex flex-col gap-4 bg-theme-secondary/80 backdrop-blur-xl p-6 rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-2 flex-1 flex flex-col group">
              <label className="text-sm font-medium text-theme-primary group-hover:text-indigo-600 transition-colors">Ne inşa etmek istersiniz?</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="İhtiyacınız olan işlevi, bileşeni veya betiği açıklayın..."
                className="w-full flex-1 p-4 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              Kod Üret
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:w-2/3 bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-theme flex items-center justify-between bg-theme-primary/30 backdrop-blur-sm">
            <h3 className="font-medium text-theme-primary flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" />
              Çıktı
            </h3>
            {result && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 text-xs font-medium text-theme-secondary hover:text-indigo-600 hover:bg-indigo-50/10 px-2 py-1 rounded-lg transition-all duration-200"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Kopyalandı!" : "Kodu Kopyala"}
              </button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {result ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-sm max-w-none prose-zinc dark:prose-invert"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-indigo-100/50 rounded-2xl flex items-center justify-center animate-pulse">
                  <Code className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-theme-secondary">Üretilen kod burada görünecek.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
