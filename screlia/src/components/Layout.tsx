import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  MessageSquare, 
  Settings,
  Menu,
  X,
  NotebookPen,
  Sparkles,
  MessageSquarePlus,
  CloudRain,
  Newspaper,
  Plus,
  LogOut,
  User as UserIcon,
  Loader2,
  Lock,
  ShoppingBag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsProvider } from '../context/SettingsContext';
import { NotesProvider } from '../context/NotesContext';
import { FeedbackModal } from './FeedbackModal';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { useTranslation } from '../hooks/useTranslation';

// Custom Logo Component
const ScreliaLogo = ({ className }: { className?: string }) => (
  <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg", className)}>
    <Sparkles className="text-white w-5 h-5" />
  </div>
);

function LayoutContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{title: string, desc?: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('focusSearch'));
        }, 50);
      }
      

    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const showToast = (title: string, desc?: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ title, desc, type });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleLogin = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      showToast("Giriş Başarılı", `Hoş geldin, ${result.user.displayName}!`, 'success');
    } catch (error: any) {
      console.error("Giriş başarısız:", error);
      if (error?.code === 'auth/popup-blocked') {
        showToast("Uyarı", "Giriş penceresi engellendi. Lütfen bu site için açılır pencerelere izin verin.", 'error');
      } else if (error?.code === 'auth/cancelled-popup-request' || error?.code === 'auth/popup-closed-by-user') {
        // Ignored. User closed the popup manually.
      } else if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
        // Transient SDK state issue
      } else {
        showToast("Hata", "Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.", 'error');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast("Çıkış Yapıldı", "Başarıyla çıkış yaptınız.", 'success');
      navigate('/');
    } catch (error) {
      console.error("Çıkış başarısız:", error);
      showToast("Hata", "Çıkış yapılamadı.", 'error');
    }
  };

  const navItems = [
    { to: "/chat", icon: MessageSquare, label: t('chat'), shortcut: "2" },
    { to: "/studios", icon: Sparkles, label: t('studios'), authRequired: true, shortcut: "3" },
    { to: "/weather", icon: CloudRain, label: t('weather'), authRequired: true, shortcut: "4" },
    { to: "/news", icon: Newspaper, label: t('news'), authRequired: true, shortcut: "5" },
    { to: "/notes", icon: NotebookPen, label: t('notes'), authRequired: true, shortcut: "6" },
  ];

  const currentNavItem = navItems.find(item => item.to === location.pathname);
  const isProtectedPath = currentNavItem?.authRequired || location.pathname === '/profile';

  return (
    <div className="flex h-screen bg-theme-primary text-theme-primary overflow-hidden transition-colors duration-500 relative p-0 md:p-4 gap-4">
      {/* Liquid Background Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-blue-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={{ width: 280 }}
        animate={{ width: isSidebarCollapsed ? 80 : 280 }}
        className="hidden md:flex flex-col bg-theme-secondary/80 backdrop-blur-xl rounded-[2rem] transition-all duration-300 relative z-20 shadow-xl shadow-black/5 overflow-hidden border-none"
      >
        <div className="p-4 flex items-center justify-between overflow-hidden h-[72px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-theme-primary rounded-full transition-colors flex-shrink-0"
              title="Menüyü Daralt"
            >
              <Menu className="w-5 h-5 text-theme-secondary hover:text-theme-primary" />
            </button>
            <motion.div 
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              className={cn("flex items-center gap-3", isSidebarCollapsed && "hidden")}
            >
              <ScreliaLogo className="w-8 h-8 shadow-sm" />
              <p className="text-lg font-bold tracking-tighter text-theme-primary">MULTITOOL</p>
            </motion.div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <NavLink 
            to="/"
            end
            className={({ isActive }) => cn(
              "flex items-center justify-between border shadow-sm hover:shadow rounded-2xl transition-all h-12 overflow-hidden group",
              isActive ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-theme-primary border-theme text-theme-primary",
              isSidebarCollapsed ? "w-12 px-0 justify-center" : "w-full px-4"
            )}
            title={t('search_engine')}
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 flex-shrink-0 text-indigo-500" />
              <motion.span 
                animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                className="font-medium tracking-tight overflow-hidden whitespace-nowrap"
              >
                {t('search_engine')}
              </motion.span>
            </div>

          </NavLink>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          <p className={cn("px-4 py-2 text-xs font-semibold text-theme-secondary/70 uppercase tracking-widest", isSidebarCollapsed && "hidden")}>Menü</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 whitespace-nowrap group relative overflow-hidden",
                  isActive
                    ? "bg-indigo-500/10 text-indigo-600 shadow-sm"
                    : "text-theme-secondary hover:bg-theme-primary/80 hover:text-theme-primary"
                )
              }
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 flex-shrink-0", ({ isActive }: { isActive: boolean }) => isActive && "text-indigo-600")} />
                <motion.span 
                  animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                  className="overflow-hidden relative z-10 tracking-tight"
                >
                  {item.label}
                </motion.span>
              </div>
              <div className="flex items-center gap-2">
                {!user && item.authRequired && !isSidebarCollapsed && (
                  <Lock className="w-3 h-3 opacity-50 shrink-0" />
                )}
              </div>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-theme/50 space-y-1">
          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-medium text-theme-secondary hover:bg-theme-primary/80 hover:text-theme-primary w-full transition-all duration-200 whitespace-nowrap group relative overflow-hidden"
            title={isSidebarCollapsed ? t('feedback') : undefined}
          >
            <div className="flex items-center gap-3">
              <MessageSquarePlus className="w-5 h-5 flex-shrink-0" />
              <motion.span 
                animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                className="overflow-hidden relative z-10 tracking-tight"
              >
                {t('feedback')}
              </motion.span>
            </div>

          </button>

          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center justify-between px-3 py-3 rounded-2xl text-sm font-medium text-theme-secondary hover:bg-theme-primary/80 hover:text-theme-primary w-full transition-all duration-200 whitespace-nowrap group relative overflow-hidden"
            title={isSidebarCollapsed ? t('settings') : undefined}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 flex-shrink-0" />
              <motion.span 
                animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                className="overflow-hidden relative z-10 tracking-tight"
              >
                {t('settings')}
              </motion.span>
            </div>

          </button>
          
          <div className="pt-2 mt-2 border-t border-theme/50">
            {user ? (
              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center justify-between px-3 py-2 rounded-2xl text-sm font-medium text-theme-secondary hover:bg-theme-primary/80 hover:text-theme-primary w-full transition-all duration-200 whitespace-nowrap group relative overflow-hidden"
                title={isSidebarCollapsed ? t('profile') : undefined}
              >
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full flex-shrink-0" />
                  ) : (
                    <UserIcon className="w-5 h-5 flex-shrink-0" />
                  )}
                  <motion.span 
                    animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                    className="overflow-hidden tracking-tight truncate text-left"
                  >
                    {user.displayName || t('profile')}
                  </motion.span>
                </div>

              </button>
            ) : (
              <button 
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-bold text-indigo-600 hover:bg-indigo-500/10 w-full transition-all duration-200 whitespace-nowrap group disabled:opacity-50"
                title={isSidebarCollapsed ? t('login') : undefined}
              >
                <div className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 rounded-full flex-shrink-0">
                  {isAuthLoading ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
                <motion.span 
                  animate={{ opacity: isSidebarCollapsed ? 0 : 1, width: isSidebarCollapsed ? 0 : 'auto' }}
                  className="overflow-hidden tracking-tight"
                >
                  {isAuthLoading ? "Giriş Yapılıyor..." : t('login')}
                </motion.span>
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-theme-secondary/80 backdrop-blur-xl border-b border-theme z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-theme-primary">
             {isMobileMenuOpen ? <X /> : <Menu />}
           </button>
           <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
             MULTITOOL
           </h1>
        </div>
        <button className="p-2 rounded-full hover:bg-theme-secondary text-indigo-500" onClick={() => navigate('/chat')}>
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 bg-theme-secondary/95 backdrop-blur-2xl z-40 p-4 flex flex-col"
          >
            <nav className="space-y-1 flex-1">
              <NavLink
                to="/"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                    isActive
                      ? "bg-indigo-500/10 text-indigo-600"
                      : "text-theme-secondary hover:bg-theme-primary/50"
                  )
                }
              >
                <Search className="w-5 h-5" />
                {t('search_engine')}
              </NavLink>

              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl text-base font-medium transition-colors",
                      isActive
                        ? "bg-indigo-500/10 text-indigo-600"
                        : "text-theme-secondary hover:bg-theme-primary/50"
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  {!user && item.authRequired && (
                    <Lock className="w-4 h-4 opacity-50 shrink-0" />
                  )}
                </NavLink>
              ))}
              
              <div className="border-t border-theme/50 my-2 mt-4 pt-2">
                <button 
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-theme-secondary hover:bg-theme-primary/50 w-full"
                >
                  <MessageSquarePlus className="w-5 h-5" />
                  {t('feedback')}
                </button>
                <button 
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-theme-secondary hover:bg-theme-primary/50 w-full"
                >
                  <Settings className="w-5 h-5" />
                  {t('settings')}
                </button>
                {user && (
                   <button 
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-theme-secondary hover:bg-theme-primary/50 w-full"
                  >
                    <UserIcon className="w-5 h-5" />
                    {t('profile')}
                  </button>
                )}
              </div>
            </nav>
            <div className="border-t border-theme/50 pt-2 pb-4 space-y-1">
              {user ? (
                 <button 
                   onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                   className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium text-red-500 hover:bg-red-500/10 w-full"
                 >
                   <LogOut className="w-5 h-5" />
                   Çıkış Yap
                 </button>
              ) : (
                <button 
                   onClick={async () => { 
                     await handleLogin(); 
                     setIsMobileMenuOpen(false); 
                   }}
                   disabled={isAuthLoading}
                   className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-indigo-600 hover:bg-indigo-500/10 w-full disabled:opacity-50"
                 >
                   <UserIcon className="w-5 h-5" />
                   {isAuthLoading ? "Giriş Yapılıyor..." : t('login')}
                 </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:rounded-[2rem] bg-theme-secondary md:border border-theme shadow-2xl shadow-black/5 relative z-10 flex flex-col">
        {/* Auth Banner */}
        {!isAuthLoading && !user && (
          <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-4 py-3 flex items-center justify-center gap-3 md:pt-3 pt-20">
             <Sparkles className="w-5 h-5 text-indigo-500 hidden sm:block" />
             <p className="text-sm font-medium text-indigo-600 flex-1 text-center sm:text-left">
               Daha iyi bir deneyim, verilerinizi kaydetmek ve API anahtarınızı kalıcı saklamak için giriş yapın.
             </p>
             <button 
               onClick={handleLogin}
               className="text-sm font-bold bg-indigo-500 text-white px-4 py-1.5 rounded-full hover:bg-indigo-600 transition-colors whitespace-nowrap"
             >
               {t('login')}
             </button>
          </div>
        )}

        {/* Protection Content Layer */}
        {(!isAuthLoading && !user && isProtectedPath) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-theme-secondary h-full pt-16 md:pt-8 w-full max-w-7xl mx-auto">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-theme-primary mb-3">Sınırlı Erişim</h2>
            <p className="text-theme-secondary max-w-md mb-8">
              Bu özelliğe erişmek için lütfen giriş yapın. Giriş yapmadığınızda uygulamanın yalnızca arama ve sohbet bölümlerini (kısıtlı olarak) kullanabilirsiniz.
            </p>
            <button 
              onClick={handleLogin}
              className="bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              <UserIcon className="w-5 h-5" />
              Şimdi Giriş Yap
            </button>
          </div>
        ) : (
          <div className={cn("flex-1 overflow-auto p-4 md:p-8 w-full max-w-7xl mx-auto", (!user ? "" : "pt-20 md:pt-8"))}>
            <Outlet />
          </div>
        )}
      </main>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border backdrop-blur-xl flex items-start gap-3 max-w-sm",
              toastMsg.type === 'error' 
                ? "bg-red-500/10 border-red-500/20 text-red-500" 
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
            )}
          >
            <div className="mt-1">
              {toastMsg.type === 'error' ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold">{toastMsg.title}</h4>
              {toastMsg.desc && <p className="text-sm opacity-90 mt-0.5">{toastMsg.desc}</p>}
            </div>
            <button 
              onClick={() => setToastMsg(null)}
              className="ml-auto p-1 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Layout() {
  return (
    <SettingsProvider>
      <NotesProvider>
        <LayoutContent />
      </NotesProvider>
    </SettingsProvider>
  );
}


