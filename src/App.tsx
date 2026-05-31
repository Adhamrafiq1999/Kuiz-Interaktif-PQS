import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  BarChart2, 
  User, 
  Compass, 
  Menu, 
  X, 
  Trophy, 
  Flame, 
  Award, 
  Github,
  ChevronRight,
  Database,
  Smartphone,
  Download
} from 'lucide-react';

import { UserProgress } from './types';
import { INITIAL_PROGRESS, AVATARS } from './data';

// Import Tabs
import DashboardTab from './components/DashboardTab';
import FlashcardTab from './components/FlashcardTab';
import QuizTab from './components/QuizTab';
import NotesTab from './components/NotesTab';
import ProgressTab from './components/ProgressTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallHelp(true);
      setTimeout(() => setShowInstallHelp(false), 5000);
    }
  };

  // Check if already in standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('hafal_ulum_progress_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) {
          setProgress(parsed);
        }
      } catch (e) {
        console.error('Failed to parse progress from localStorage', e);
      }
    }
  }, []);

  // Save progress helper
  const handleUpdateProgress = (updater: (prev: UserProgress) => UserProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      localStorage.setItem('hafal_ulum_progress_v1', JSON.stringify(next));
      return next;
    });
  };

  // Reset progress helper
  const handleResetProgress = () => {
    localStorage.removeItem('hafal_ulum_progress_v1');
    localStorage.removeItem('match_best_time');
    setProgress(INITIAL_PROGRESS);
    setActiveTab('dashboard');
  };

  const currentAvatar = AVATARS.find(a => a.id === progress.avatarId) || AVATARS[0];

  // Define sidebar items with labels, icons and tags
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass, color: 'text-blue-500 bg-blue-50' },
    { id: 'flashcard', label: 'Flashcard', icon: BookOpen, color: 'text-violet-500 bg-violet-50' },
    { id: 'kuiz', label: 'Kuiz Interaktif', icon: HelpCircle, color: 'text-emerald-500 bg-emerald-50' },
    { id: 'nota', label: 'Nota Ringkas', icon: FileText, color: 'text-amber-500 bg-amber-50' },
    { id: 'progress', label: 'Progress Tracker', icon: BarChart2, color: 'text-rose-500 bg-rose-50' },
    { id: 'profile', label: 'Profile Pelajar', icon: User, color: 'text-sky-500 bg-sky-50' }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-display flex flex-col selection:bg-teal-500/30 selection:text-teal-200 relative overflow-hidden">
      
      {/* GLOWING AMBIENT BACKGROUND BLOBS */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-pink-500 rounded-full blur-[110px]"></div>
      </div>

      {/* ATAS: NAVBAR UTAMA (FROSTED) */}
      <header className="bg-white/10 border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-300 hover:text-white md:hidden cursor-pointer"
              title="Menu utama"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
            
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 via-cyan-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                UQ
              </div>
              <div>
                <span className="text-md font-extrabold tracking-tight text-white font-display block leading-none">Minda Ulum</span>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider leading-none mt-1 block">Al-Quran</span>
              </div>
            </div>
          </div>

          {/* Profil Ringkas Di Kanan */}
          <div className="flex items-center gap-4">
            {/* XP badges visible on md+ screen */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
                Tahap {progress.level}
              </span>
              <span className="border-l border-white/10 pl-2 text-xs text-slate-300 font-medium font-mono text-teal-300">
                {progress.xp} XP
              </span>
            </div>

            {!isStandalone && (
              <div className="relative">
                <button
                  onClick={handleInstallClick}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-[10px] sm:text-xs transition-all shadow-lg active:scale-95 group ${
                    deferredPrompt 
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 shadow-teal-500/20" 
                      : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                  }`}
                  title="Install App ke Telefon"
                >
                  <Download className={`w-3.5 h-3.5 ${deferredPrompt ? 'group-hover:translate-y-0.5' : ''} transition-transform`} />
                  <span className="hidden sm:inline">PASANG APP</span>
                  <Smartphone className="sm:hidden w-3.5 h-3.5" />
                </button>
                
                {showInstallHelp && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-white/10 p-2 rounded-lg shadow-2xl z-50 text-[10px] text-teal-300 animate-in fade-in slide-in-from-top-1">
                    <p className="font-bold">Cara Pasang:</p>
                    <p className="text-slate-400 mt-1">1. Buka dalam tab baru (bukan frame AI Studio).</p>
                    <p className="text-slate-400">2. Tekan butang 'Install' atau 'Add to Home Screen' di menu browser.</p>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 text-left p-1 rounded-xl transition cursor-pointer border border-transparent hover:border-white/15 hover:bg-white/5"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-md shrink-0 border border-white/10 ${currentAvatar.bg.replace('bg-indigo-100 text-indigo-700', 'bg-indigo-500 text-white').replace('bg-emerald-100 text-emerald-700', 'bg-emerald-500 text-white').replace('bg-amber-100 text-amber-700', 'bg-amber-500 text-white').replace('bg-rose-100 text-rose-700', 'bg-rose-500 text-white').replace('bg-purple-100 text-purple-700', 'bg-purple-500 text-white')}`}>
                {currentAvatar.emoji}
              </div>
              <div className="hidden md:block leading-tight">
                <span className="text-xs font-bold text-white block truncate max-w-[120px]">{progress.name}</span>
                <span className="text-[9px] text-slate-400 font-medium block">Ubah Profil →</span>
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* BODY LAYOUT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-6 items-start relative z-10">
        
        {/* SIDE BAR: LAPTOP SCREENS (FROSTED) */}
        <aside className="hidden md:block col-span-1 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-xl sticky top-22 space-y-6">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-black text-teal-400 tracking-wider">Mula Kembara</span>
            <p className="text-xs text-slate-300 leading-tight">Ketik menu di bawah untuk membuka lembaran interaktif yang dihajati.</p>
          </div>

          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group px-3.5 py-3 rounded-2xl text-left transition-all flex items-center gap-3 relative cursor-pointer font-sans outline-none ${
                    isActive
                      ? 'bg-white/20 text-white font-bold border border-white/15 shadow-lg shadow-teal-500/5'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl shrink-0 ${isActive ? 'bg-gradient-to-tr from-teal-400 to-cyan-500 text-white' : 'bg-white/10 text-slate-300'}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold leading-tight truncate">{item.label}</span>
                  </div>
                  
                  {/* Accent tag arrow */}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-300" />}
                </button>
              );
            })}
          </div>

          {/* Footer mini copyrights */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-1 text-[10px] text-slate-400">
            <span className="font-bold text-slate-300">Minda Ulum Al-Quran v2.2</span>
            <span>Estetika Frosted Glass untuk kegembiraan belajar ✨</span>
          </div>
        </aside>

        {/* MOBILE DRAWER: SIDE DRAWER (FROSTED) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Back backdrop shade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-40 md:hidden"
              />

              {/* Drawer slide (FROSTED) */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-[#1e293b]/90 backdrop-blur-2xl border-r border-white/10 p-5 z-55 flex flex-col justify-between shadow-2xl md:hidden text-white"
              >
                <div className="space-y-6">
                  {/* Title of Mobile Drawer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-400 to-purple-500 text-white flex items-center justify-center font-bold text-xs">UQ</div>
                      <span className="text-sm font-extrabold font-display">Minda Ulum</span>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* XP display */}
                  <div className="bg-white/10 border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 flex items-center gap-1">
                      👑 Tahap {progress.level}
                    </span>
                    <span className="font-mono font-bold text-teal-300">{progress.xp} XP</span>
                  </div>

                  {/* List of Mobile items */}
                  <div className="space-y-2">
                    {menuItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-3 rounded-2xl flex items-center gap-3 cursor-pointer outline-none transition ${
                            isActive
                              ? 'bg-white/20 text-white font-bold border border-white/10 shadow-lg'
                              : 'hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-gradient-to-tr from-teal-400 to-purple-500' : 'bg-white/10 text-slate-300'}`}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold leading-none block">{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 border-t border-white/10 pt-3">
                  Ulum Al-Quran Sekolah Menengah
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MIDDLE / MAIN TAB PORT CONTENT AREA */}
        <main className="col-span-1 md:col-span-3 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.99, y: -5 }}
              transition={{ duration: 0.15 }}
              className="w-full focus:outline-none"
            >
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  progress={progress} 
                  onUpdateProgress={handleUpdateProgress}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === 'flashcard' && (
                <FlashcardTab 
                  progress={progress} 
                  onUpdateProgress={handleUpdateProgress}
                />
              )}
              {activeTab === 'kuiz' && (
                <QuizTab 
                  progress={progress} 
                  onUpdateProgress={handleUpdateProgress}
                />
              )}
              {activeTab === 'nota' && (
                <NotesTab 
                  progress={progress} 
                  onUpdateProgress={handleUpdateProgress}
                />
              )}
              {activeTab === 'progress' && (
                <ProgressTab 
                  progress={progress} 
                  onResetProgress={handleResetProgress}
                />
              )}
              {activeTab === 'profile' && (
                <ProfileTab 
                  progress={progress} 
                  onUpdateProgress={handleUpdateProgress}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* ADMIN FLOATING BUTTON */}
      <Link 
        to="/admin" 
        className="fixed bottom-6 right-6 z-50 bg-teal-500 hover:bg-teal-400 text-slate-900 p-4 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
        title="Buka Panel Admin"
      >
        <Database className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden font-bold text-sm whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out">
          Admin Panel
        </span>
      </Link>
    </div>
  );
}
