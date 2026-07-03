import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { ShoppingBag, Search, Plus, Check, Clock, Brain, Compass, Code, LayoutGrid, Star, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Addon {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'entertainment' | 'developer' | 'utilities';
  icon: React.ReactNode;
  rating: number;
  downloads: string;
}

const ADDONS: Addon[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description: 'Boost your focus with customizable work and break intervals.',
    category: 'productivity',
    icon: <Clock className="w-8 h-8 text-rose-500" />,
    rating: 4.8,
    downloads: '12k',
  },
  {
    id: 'json_formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data instantly.',
    category: 'developer',
    icon: <Code className="w-8 h-8 text-blue-500" />,
    rating: 4.9,
    downloads: '8.5k',
  },
  {
    id: 'mind_map',
    name: 'Mind Mapper',
    description: 'Visualize your ideas and notes in a clear mind map structure.',
    category: 'productivity',
    icon: <Brain className="w-8 h-8 text-purple-500" />,
    rating: 4.7,
    downloads: '5k',
  },
  {
    id: 'color_picker',
    name: 'Color Studio',
    description: 'Pick colors, generate palettes, and convert formats.',
    category: 'developer',
    icon: <Compass className="w-8 h-8 text-teal-500" />,
    rating: 4.6,
    downloads: '15k',
  },
  {
    id: 'regex_tester',
    name: 'Regex Tester',
    description: 'Test your regular expressions in real-time.',
    category: 'developer',
    icon: <Search className="w-8 h-8 text-orange-500" />,
    rating: 4.9,
    downloads: '6.2k',
  },
  {
    id: 'quick_calc',
    name: 'Quick Calc',
    description: 'Advanced calculator directly in your sidebar.',
    category: 'utilities',
    icon: <LayoutGrid className="w-8 h-8 text-indigo-500" />,
    rating: 4.5,
    downloads: '20k',
  }
];

export default function StorePage() {
  const { filters, updateFilters } = useSettings();
  const { t, isEnglish } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const installedAddonsList = filters.installedAddons ? filters.installedAddons.split(',').filter(Boolean) : [];

  const handleToggleInstall = (addonId: string) => {
    let newList;
    if (installedAddonsList.includes(addonId)) {
      newList = installedAddonsList.filter(id => id !== addonId);
    } else {
      newList = [...installedAddonsList, addonId];
    }
    updateFilters({ installedAddons: newList.join(',') });
  };

  const filteredAddons = ADDONS.filter(addon => {
    const matchesCategory = activeCategory === 'all' || addon.category === activeCategory;
    const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: isEnglish ? 'All' : 'Tümü' },
    { id: 'productivity', label: isEnglish ? 'Productivity' : 'Üretkenlik' },
    { id: 'developer', label: isEnglish ? 'Developer' : 'Geliştirici' },
    { id: 'utilities', label: isEnglish ? 'Utilities' : 'Araçlar' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-theme-primary flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600" />
            {isEnglish ? 'Add-on Store' : 'Eklenti Mağazası'}
          </h2>
          <p className="text-theme-secondary mt-2 max-w-2xl">
            {isEnglish ? 'Discover and install powerful add-ons to supercharge your MULTITOOL experience.' : 'MULTITOOL deneyiminizi güçlendirmek için güçlü eklentileri keşfedin ve yükleyin.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 space-y-6 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
            <input 
              type="text" 
              placeholder={isEnglish ? "Search add-ons..." : "Eklenti ara..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-theme-secondary/80 border border-theme rounded-xl text-theme-primary focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="bg-theme-secondary/50 rounded-2xl p-2 border border-theme shadow-sm">
            <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-theme-secondary">
              {isEnglish ? 'Categories' : 'Kategoriler'}
            </h3>
            <div className="space-y-1 mt-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    activeCategory === category.id 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                      : "text-theme-primary hover:bg-theme-primary"
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-indigo-500/20 shadow-sm">
            <h3 className="font-bold text-theme-primary mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {isEnglish ? 'Quick Stats' : 'Hızlı İstatistikler'}
            </h3>
            <p className="text-sm text-theme-secondary">
              <span className="font-semibold text-indigo-600">{installedAddonsList.length}</span> {isEnglish ? 'add-ons installed.' : 'eklenti yüklü.'}
            </p>
          </div>
        </div>

        {/* Store Grid */}
        <div className="flex-1">
          {filteredAddons.length === 0 ? (
            <div className="text-center py-20 bg-theme-secondary/50 rounded-3xl border border-dashed border-theme">
              <Compass className="w-12 h-12 text-theme-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium text-theme-primary mb-2">
                {isEnglish ? 'No add-ons found' : 'Eklenti bulunamadı'}
              </h3>
              <p className="text-theme-secondary">
                {isEnglish ? 'Try adjusting your search or category filter.' : 'Aramanızı veya kategori filtrenizi değiştirmeyi deneyin.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAddons.map((addon) => {
                const isInstalled = installedAddonsList.includes(addon.id);
                
                return (
                  <motion.div
                    key={addon.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-theme-secondary/80 rounded-3xl p-6 border border-theme shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 bg-theme-primary rounded-2xl flex items-center justify-center border border-theme shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {addon.icon}
                      </div>
                      <div className="flex items-center gap-1.5 bg-theme-primary px-2.5 py-1 rounded-full border border-theme shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium text-theme-primary">{addon.rating}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6 flex-1">
                      <h3 className="text-lg font-bold text-theme-primary mb-2 group-hover:text-indigo-600 transition-colors">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-theme-secondary leading-relaxed">
                        {addon.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-theme">
                      <span className="text-xs text-theme-secondary font-medium">
                        {addon.downloads} {isEnglish ? 'downloads' : 'indirme'}
                      </span>
                      <button
                        onClick={() => handleToggleInstall(addon.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
                          isInstalled 
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg shadow-indigo-500/20"
                        )}
                      >
                        {isInstalled ? (
                          <>
                            <Check className="w-4 h-4" />
                            {isEnglish ? 'Installed' : 'Yüklü'}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            {isEnglish ? 'Install' : 'Yükle'}
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
