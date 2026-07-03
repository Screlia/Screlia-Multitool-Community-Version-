import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export type Theme = 'light' | 'dark' | 'midnight' | 'forest' | 'system';
export type SearchEngine = 'google' | 'bing' | 'duckduckgo';

interface SearchFilters {
  includedKeywords: string;
  excludedKeywords: string;
  preferredDomains: string;
  relevance: 'broad' | 'precise';
  language: string;
  theme: Theme;
  searchEngine: SearchEngine;
  apiKey: string;
  chatgptApiKey?: string;
  claudeApiKey?: string;
  aiModel?: 'gemini' | 'chatgpt' | 'claude';
  isPremium?: boolean;
  installedAddons: string;
}

interface SettingsContextType {
  filters: SearchFilters;
  updateFilters: (newFilters: Partial<SearchFilters>) => void;
}

const defaultFilters: SearchFilters = {
  includedKeywords: '',
  excludedKeywords: '',
  preferredDomains: '',
  relevance: 'broad',
  language: 'Türkçe',
  theme: 'system',
  searchEngine: 'google',
  apiKey: '',
  aiModel: 'gemini',
  isPremium: false,
  chatgptApiKey: '',
  claudeApiKey: '',
  installedAddons: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const saved = localStorage.getItem('screlia_settings');
    return saved ? { ...defaultFilters, ...JSON.parse(saved) } : defaultFilters;
  });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/settings', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setFilters(prev => ({
              ...prev,
              ...data,
              // Make sure to ignore nullish db responses
              apiKey: data.apiKey ?? prev.apiKey,
              language: data.language ?? prev.language,
              searchEngine: data.searchEngine ?? prev.searchEngine,
              relevance: data.relevance ?? prev.relevance,
              theme: data.theme ?? prev.theme,
              includedKeywords: data.includedKeywords ?? prev.includedKeywords,
              excludedKeywords: data.excludedKeywords ?? prev.excludedKeywords,
              preferredDomains: data.preferredDomains ?? prev.preferredDomains,
              aiModel: data.aiModel ?? prev.aiModel,
              chatgptApiKey: data.chatgptApiKey ?? prev.chatgptApiKey,
              claudeApiKey: data.claudeApiKey ?? prev.claudeApiKey,
              installedAddons: data.installedAddons ?? prev.installedAddons,
            }));
          }
        } catch (error) {
          console.error("Error loading settings from Cloud SQL:", error);
        }
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('screlia_settings', JSON.stringify(filters));
    
    if (userId) {
      // Save all settings to Cloud SQL backend
      auth.currentUser?.getIdToken().then(token => {
        fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(filters)
        }).catch(err => console.error("Error saving settings to db:", err));
      });
    }

    const applyTheme = () => {
      let themeToApply = filters.theme;
      if (filters.theme === 'system') {
        themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', themeToApply);
    };

    applyTheme();

    if (filters.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [filters, userId]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <SettingsContext.Provider value={{ filters, updateFilters }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
