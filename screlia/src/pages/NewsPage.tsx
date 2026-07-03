import React, { useState, useEffect } from 'react';
import { getAI, MODELS } from '../services/gemini';
import { Newspaper, Loader2, ExternalLink, RefreshCw, Clock } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Type } from '@google/genai';

const CATEGORIES = [
  "En Son Haberler",
  "Teknoloji",
  "İş Dünyası",
  "Bilim",
  "Sağlık",
  "Eğlence",
  "Spor"
];

interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  time: string;
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("En Son Haberler");
  const [newsData, setNewsData] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useSettings();

  const fetchNews = async (category: string) => {
    setLoading(true);
    setNewsData(null);
    setError(null);

    try {
      const genAI = getAI(filters.apiKey);
      
      const response = await genAI.models.generateContent({
        model: MODELS.search,
        contents: `${category} kategorisinde en güncel haber başlıkları`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "En güncel haber makalelerinin listesi",
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING, description: "Haber başlığı" },
                summary: { type: Type.STRING, description: "Kısa 1-2 cümlelik özet" },
                source: { type: Type.STRING, description: "Yayıncı veya kaynak adı" },
                time: { type: Type.STRING, description: "Ne zaman yayınlandığı (örn., '2 saat önce')" }
              },
              required: ["headline", "summary", "source", "time"]
            }
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as NewsArticle[];
        setNewsData(data);
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      console.error("News fetch error:", err);
      setError("Haberler alınamadı. Lütfen API anahtarınızı kontrol edin veya tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-theme-primary flex items-center gap-2">
            <Newspaper className="w-8 h-8 text-indigo-600" />
            Haber Merkezi
          </h2>
          <p className="text-theme-secondary">Google Arama destekli en güncel manşetler.</p>
        </div>
        <button 
          onClick={() => fetchNews(activeCategory)}
          disabled={loading}
          className="p-3 text-theme-secondary hover:text-indigo-600 hover:bg-indigo-50/10 rounded-xl transition-all duration-300 border border-transparent hover:border-indigo-200"
          title="Yenile"
        >
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border",
              activeCategory === category
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                : "bg-theme-secondary/80 backdrop-blur-md text-theme-secondary border-theme hover:border-indigo-300 hover:text-theme-primary hover:bg-theme-primary/50"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Content */}
      {error && (
        <div className="p-4 bg-red-50/10 border border-red-200/20 text-red-500 rounded-2xl text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-theme-secondary animate-pulse font-medium">En son haberler getiriliyor...</p>
        </div>
      ) : newsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.map((article, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-theme-secondary/80 backdrop-blur-xl p-6 rounded-3xl border border-theme shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-indigo-50/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                  {article.source}
                </span>
                <div className="flex items-center text-xs text-theme-secondary gap-1">
                  <Clock className="w-3 h-3" />
                  {article.time}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-theme-primary mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                {article.headline}
              </h3>
              
              <p className="text-theme-secondary text-sm flex-1 leading-relaxed">
                {article.summary}
              </p>
              
              <div className="mt-6 pt-4 border-t border-theme flex items-center text-sm font-medium text-indigo-600 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer">
                Haberin Tamamını Oku
                <ExternalLink className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
