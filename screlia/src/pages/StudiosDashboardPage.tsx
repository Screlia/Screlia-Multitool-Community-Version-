import React from 'react';
import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { 
  Code, 
  CloudRain, 
  Newspaper,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Bot
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface StudioType {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  color: string;
  bg: string;
}

const STUDIOS: StudioType[] = [
  {
    id: 'code',
    title: 'Code Studio',
    description: 'Generate, debug, and refactor code with advanced AI.',
    icon: Code,
    to: '/code',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10 text-blue-500'
  },
  {
    id: 'weather',
    title: 'Hava Durumu',
    description: 'Güncel hava durumu ve atmosferik koşullar.',
    icon: CloudRain,
    to: '/weather',
    color: 'from-sky-400 to-blue-600',
    bg: 'bg-sky-500/10 text-sky-500'
  },
  {
    id: 'news',
    title: 'Haber Merkezi',
    description: 'Farklı kategorilerde en güncel haberler.',
    icon: Newspaper,
    to: '/news',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 text-amber-500'
  },
  {
    id: 'store',
    title: 'Eklentiler',
    description: 'MULTITOOL için geliştirilmiş araçları keşfedin ve yükleyin.',
    icon: ShoppingBag,
    to: '/store',
    color: 'from-fuchsia-500 to-purple-600',
    bg: 'bg-fuchsia-500/10 text-fuchsia-500'
  }
];

const COMING_SOON = [
  {
    id: 'agents',
    title: 'Agent System',
    description: 'Autonomous AI agents to automate your complex workflows.',
    icon: Bot,
    color: 'from-gray-500 to-slate-600',
    bg: 'bg-gray-500/10 text-gray-500'
  }
];

export default function StudiosDashboardPage() {
  const { isEnglish } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <div className="space-y-4 text-center py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <Sparkles className="w-10 h-10 text-indigo-500" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-theme-primary to-theme-secondary"
          style={{ color: 'var(--text-primary)' }}
        >
          Studios
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-theme-secondary max-w-2xl mx-auto font-medium"
        >
          {isEnglish ? 'Explore our collection of specialized AI tools designed to enhance your workflow and creativity.' : 'İş akışınızı ve yaratıcılığınızı geliştirmek için tasarlanmış özel araç koleksiyonumuzu keşfedin.'}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {STUDIOS.map((studio, index) => {
          const Icon = studio.icon;
          return (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group h-full"
            >
              <NavLink
                to={studio.to}
                className="block h-full bg-theme-secondary/60 backdrop-blur-2xl p-8 rounded-[2rem] border border-theme shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Hover Spotlight Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${studio.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Corner Glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${studio.color} opacity-20 blur-[50px] rounded-full transition-transform duration-700 group-hover:scale-150`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/10 ${studio.bg} backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-theme-primary mb-3 tracking-tight group-hover:text-indigo-500 transition-colors duration-300">
                    {studio.title}
                  </h3>
                  
                  <p className="text-theme-secondary mb-10 line-clamp-2 leading-relaxed">
                    {studio.description}
                  </p>
                  
                  <div className="flex items-center text-sm font-semibold text-indigo-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    {isEnglish ? 'Open Studio' : 'Stüdyoyu Aç'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </NavLink>
            </motion.div>
          );
        })}

        {COMING_SOON.map((studio, index) => {
          const Icon = studio.icon;
          return (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (STUDIOS.length + index) * 0.1, duration: 0.5 }}
              className="h-full relative group"
            >
              <div className="block h-full bg-theme-secondary/30 backdrop-blur-2xl p-8 rounded-[2rem] border border-theme border-dashed opacity-75 relative overflow-hidden cursor-not-allowed">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-theme/50 ${studio.bg}`}>
                      <Icon className="w-8 h-8 opacity-70" />
                    </div>
                    <span className="px-3 py-1 bg-theme-primary/50 border border-theme text-theme-secondary text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      {isEnglish ? 'Coming Soon' : 'Yakında'}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-theme-primary mb-3 tracking-tight text-theme-secondary">
                    {studio.title}
                  </h3>
                  
                  <p className="text-theme-secondary/70 mb-10 line-clamp-2 leading-relaxed">
                    {studio.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
