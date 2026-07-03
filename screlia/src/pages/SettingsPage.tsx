import React, { useState } from 'react';
import { useSettings, Theme, SearchEngine } from '../context/SettingsContext';
import { Filter, Globe, Sliders, Languages, Palette, Search, Award, Heart, Key, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { LANGUAGES } from '../constants/languages';
import { useTranslation } from '../hooks/useTranslation';

export default function SettingsPage() {
  const { filters, updateFilters } = useSettings();
  const { t, isEnglish } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'search'>('general');

  const themes: { id: Theme; name: string; color: string }[] = [
    { id: 'light', name: 'Light', color: '#ffffff' },
    { id: 'dark', name: 'Dark', color: '#18181b' },
    { id: 'midnight', name: 'Midnight', color: '#0f172a' },
    { id: 'forest', name: 'Forest', color: '#052e16' },
    { id: 'system', name: 'System', color: '#64748b' },
  ];

  const engines: { id: SearchEngine; name: string }[] = [
    { id: 'google', name: 'Google' },
    { id: 'bing', name: 'Bing' },
    { id: 'duckduckgo', name: 'DuckDuckGo' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2 mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 inline-block">
          {t('settings_title')}
        </h2>
        <p className="text-theme-secondary text-lg">{t('settings_desc')}</p>
      </div>

      <div className="flex gap-2 p-1 bg-theme-secondary/30 rounded-2xl border border-theme w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'general' ? 'bg-indigo-600 text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50'
          }`}
        >
          {isEnglish ? "General" : "Genel"}
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'api' ? 'bg-indigo-600 text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50'
          }`}
        >
          {isEnglish ? "API Config" : "API Yapılandırması"}
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'search' ? 'bg-indigo-600 text-white shadow-md' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50'
          }`}
        >
          {isEnglish ? "Search Filters" : "Arama Filtreleri"}
        </button>
      </div>

      <div className="space-y-8">
        {activeTab === 'general' && (
          <>
            {/* Appearance */}
            <div className="bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-6 border-b border-theme bg-theme-primary/30">
                <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  {t('appearance')}
                </h3>
                <p className="text-sm text-theme-secondary mt-1">
                  {t('appearance_desc')}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => updateFilters({ theme: theme.id })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        filters.theme === theme.id
                          ? 'border-indigo-600 bg-indigo-50/10 shadow-md'
                          : 'border-transparent hover:bg-theme-primary/50 hover:shadow-sm'
                      }`}
                    >
                      <div 
                        className="w-12 h-12 rounded-full border border-zinc-200 shadow-sm transition-transform duration-300 hover:rotate-12"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-sm font-medium text-theme-primary">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language */}
            <div className="bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-6 border-b border-theme bg-theme-primary/30">
                <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  <Languages className="w-5 h-5 text-indigo-600" />
                  {t('language_accessibility')}
                </h3>
                <p className="text-sm text-theme-secondary mt-1">
                  {t('language_desc')}
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-primary">{t('response_language')}</label>
                  <select
                    value={filters.language}
                    onChange={(e) => updateFilters({ language: e.target.value })}
                    className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Search Engine */}
            <div className="bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-6 border-b border-theme bg-theme-primary/30">
                <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  <Search className="w-5 h-5 text-indigo-600" />
                  {t('search_engine_title')}
                </h3>
                <p className="text-sm text-theme-secondary mt-1">
                  {t('search_engine_desc')}
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  {engines.map((engine) => (
                    <button
                      key={engine.id}
                      onClick={() => updateFilters({ searchEngine: engine.id })}
                      className={`p-4 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                        filters.searchEngine === engine.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-theme-primary/50 text-theme-secondary border-theme hover:border-indigo-300 hover:bg-theme-primary hover:text-theme-primary hover:shadow-sm'
                      }`}
                    >
                      {engine.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-theme-secondary mt-4">
                  {t('search_engine_note')}
                </p>
              </div>
            </div>
            
            {/* Credits (Küçük Künye) */}
            <div className="pt-4 text-center mt-8">
              <p className="text-xs text-theme-secondary font-medium tracking-wide">
                <span>MULTITOOL v2.0 &bull; {t('dev_designer')}</span>
              </p>
            </div>
          </>
        )}

        {activeTab === 'api' && (
          <div className="bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="p-6 border-b border-theme bg-theme-primary/30 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                  <Key className="w-5 h-5 text-indigo-600" />
                  {t('api_config')}
                </h3>
                <p className="text-sm text-theme-secondary mt-1">
                  {t('api_config_desc')}
                </p>
              </div>
              {filters.isPremium && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  {t('premium_active')}
                </span>
              )}
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-theme-primary">{t('ai_model')} {filters.isPremium ? "" : "(Premium required for ChatGPT/Claude)"}</label>
                <div className="flex bg-theme-primary/50 text-theme-secondary p-1 rounded-xl border border-theme">
                  <button 
                    onClick={() => updateFilters({ aiModel: 'gemini' })}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${filters.aiModel === 'gemini' ? 'bg-indigo-600 text-white shadow' : 'hover:text-theme-primary hover:bg-theme-secondary'}`}
                  >
                    Gemini (Google)
                  </button>
                  <button 
                    onClick={() => filters.isPremium ? updateFilters({ aiModel: 'chatgpt' }) : alert(isEnglish ? "ChatGPT support requires Premium. Please enable from Profile." : "ChatGPT desteği Premium gerektirir. Lütfen Profil'den etkinleştirin.")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${filters.aiModel === 'chatgpt' ? 'bg-indigo-600 text-white shadow' : 'hover:text-theme-primary hover:bg-theme-secondary'} ${!filters.isPremium && 'opacity-60 cursor-not-allowed'}`}
                  >
                    ChatGPT
                  </button>
                  <button 
                    onClick={() => filters.isPremium ? updateFilters({ aiModel: 'claude' }) : alert(isEnglish ? "Claude support requires Premium. Please enable from Profile." : "Claude desteği Premium gerektirir. Lütfen Profil'den etkinleştirin.")}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${filters.aiModel === 'claude' ? 'bg-indigo-600 text-white shadow' : 'hover:text-theme-primary hover:bg-theme-secondary'} ${!filters.isPremium && 'opacity-60 cursor-not-allowed'}`}
                  >
                    Claude (Anthropic)
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-primary">{t('gemini_api_key')}</label>
                  <input
                    type="password"
                    value={filters.apiKey || ""}
                    onChange={(e) => updateFilters({ apiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                  />
                </div>
                
                {filters.isPremium && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-theme-primary">{t('chatgpt_api_key')}</label>
                      <input
                        type="password"
                        value={filters.chatgptApiKey || ""}
                        onChange={(e) => updateFilters({ chatgptApiKey: e.target.value })}
                        placeholder="sk-..."
                        className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-theme-primary">{t('claude_api_key')}</label>
                      <input
                        type="password"
                        value={filters.claudeApiKey || ""}
                        onChange={(e) => updateFilters({ claudeApiKey: e.target.value })}
                        placeholder="sk-ant-..."
                        className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                      />
                    </div>
                  </>
                )}
                
                <p className="text-xs text-theme-secondary">
                  {t('api_keys_note')}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="bg-theme-secondary/80 backdrop-blur-xl rounded-2xl border border-theme shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="p-6 border-b border-theme bg-theme-primary/30">
              <h3 className="text-lg font-medium text-theme-primary flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                <Filter className="w-5 h-5 text-indigo-600" />
                {t('search_filters')}
              </h3>
              <p className="text-sm text-theme-secondary mt-1">
                {t('search_filters_desc')}
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 group/input">
                  <label className="text-sm font-medium text-theme-primary group-hover/input:text-indigo-600 transition-colors">{t('included_keywords')}</label>
                  <input
                    type="text"
                    value={filters.includedKeywords}
                    onChange={(e) => updateFilters({ includedKeywords: e.target.value })}
                    placeholder="örn. eğitim, rehber, ders"
                    className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                  />
                  <p className="text-xs text-theme-secondary">{t('included_keywords_desc')}</p>
                </div>

                <div className="space-y-2 group/input">
                  <label className="text-sm font-medium text-theme-primary group-hover/input:text-indigo-600 transition-colors">{t('excluded_keywords')}</label>
                  <input
                    type="text"
                    value={filters.excludedKeywords}
                    onChange={(e) => updateFilters({ excludedKeywords: e.target.value })}
                    placeholder="örn. pinterest, reklam, sponsorlu"
                    className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                  />
                  <p className="text-xs text-theme-secondary">{t('excluded_keywords_desc')}</p>
                </div>
              </div>

              <div className="space-y-2 group/input">
                <label className="text-sm font-medium text-theme-primary flex items-center gap-2 group-hover/input:text-indigo-600 transition-colors">
                  <Globe className="w-4 h-4" />
                  {t('preferred_sites')}
                </label>
                <input
                  type="text"
                  value={filters.preferredDomains}
                  onChange={(e) => updateFilters({ preferredDomains: e.target.value })}
                  placeholder="örn. eksisozluk.com, reddit.com"
                  className="w-full p-3 bg-theme-primary/50 text-theme-primary border border-theme rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-300 hover:bg-theme-primary hover:shadow-sm"
                />
                <p className="text-xs text-theme-secondary">{t('preferred_sites_desc')}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-primary flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  {t('result_relevance')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateFilters({ relevance: 'broad' })}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                      filters.relevance === 'broad'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-theme-primary/50 text-theme-secondary border-theme hover:border-indigo-300 hover:bg-theme-primary hover:text-theme-primary hover:shadow-sm'
                    }`}
                  >
                    {t('broad')}
                  </button>
                  <button
                    onClick={() => updateFilters({ relevance: 'precise' })}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] ${
                      filters.relevance === 'precise'
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                        : 'bg-theme-primary/50 text-theme-secondary border-theme hover:border-indigo-300 hover:bg-theme-primary hover:text-theme-primary hover:shadow-sm'
                    }`}
                  >
                    {t('precise')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
