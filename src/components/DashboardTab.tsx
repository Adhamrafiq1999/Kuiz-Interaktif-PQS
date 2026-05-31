import { motion } from 'motion/react';
import { Sparkles, Trophy, Flame, Award, BookOpen } from 'lucide-react';
import { UserProgress } from '../types';
import { getStoredFlashcards } from '../lib/storage';

interface DashboardTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({ progress, onUpdateProgress, setActiveTab }: DashboardTabProps) {
  // Calculate stats
  const totalCards = getStoredFlashcards().length;
  const memorizedCount = progress.completedFlashcards.length;
  const memorizedPercent = Math.round((memorizedCount / totalCards) * 100);

  // Daily target calc
  const dailyTarget = progress.dailyGoal; // e.g. 5
  const dailyDone = Math.min(memorizedCount, dailyTarget);
  const dailyPercent = Math.round((dailyDone / dailyTarget) * 100);

  // Timing-based greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Selamat Pagi';
    if (hours < 16) return 'Selamat Tengah Hari';
    if (hours < 19) return 'Selamat Petang';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      {/* Banner Utama */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-500/20 via-indigo-500/20 to-purple-600/20 border border-white/10 text-white p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-teal-400/10 border border-teal-500/30 text-teal-300 text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 fill-teal-400/50 animate-pulse" />
              Sains Ulum Al-Quran Tingkatan 4 & 5
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-2 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
              {getGreeting()}, {progress.name}!
            </h1>
            <p className="text-slate-200 max-w-xl text-sm sm:text-base leading-relaxed">
              Siap sedia untuk kuasai istilah Al-Quran dengan cara yang menarik, berwarna-warni dan penuh interaksi. Mari belajar sekarang!
            </p>
          </div>
          <div className="flex gap-4 self-start md:self-center">
            <button 
              onClick={() => setActiveTab('flashcard')}
              className="px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Mula Hafal 🚀
            </button>
            <button 
              onClick={() => setActiveTab('kuiz')}
              className="px-5 py-3 bg-white/10 border border-white/15 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-white/15 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Uji Minda 🧠
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid Statistik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Mata XP', 
            val: `${progress.xp} XP`, 
            subtitle: `Tahap ${progress.level}`, 
            icon: Trophy, 
            color: 'bg-amber-400/10 text-amber-300 border-amber-500/20',
            iconBg: 'bg-amber-400/20 text-amber-300'
          },
          { 
            title: 'Hafalan Istilah', 
            val: `${memorizedCount}/${totalCards}`, 
            subtitle: `${memorizedPercent}% Selesai`, 
            icon: BookOpen, 
            color: 'bg-teal-400/10 text-teal-300 border-teal-500/20',
            iconBg: 'bg-teal-400/20 text-teal-300'
          },
          { 
            title: 'Rentak Belajar', 
            val: `${progress.streak} Hari`, 
            subtitle: 'Istiqamah!', 
            icon: Flame, 
            color: 'bg-orange-400/10 text-orange-300 border-orange-500/20',
            iconBg: 'bg-orange-400/20 text-orange-300'
          },
          { 
            title: 'Lencana', 
            val: `${progress.unlockedBadges.length} Terbuka`, 
            subtitle: 'Kabinet Lencana', 
            icon: Award, 
            color: 'bg-purple-400/10 text-purple-300 border-purple-500/20',
            iconBg: 'bg-purple-400/20 text-purple-300'
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-5 rounded-3xl border bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 hover:scale-[1.02] transition-all flex flex-col justify-between ${item.color}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.title}</span>
              <div className={`p-1.5 rounded-lg ${item.iconBg}`}>
                <item.icon className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-display leading-tight">{item.val}</p>
              <span className="text-xs font-medium opacity-80">{item.subtitle}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Kolum Utama: Target Harian */}
        <div className="space-y-6">

          {/* Matlamat Sasar Harian */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                  Sasaran Belajar Harian
                </h3>
                <p className="text-xs text-slate-300">Kekalkan momentum hafalan anda untuk kuasai subjek.</p>
              </div>
              <span className="text-sm font-bold text-teal-300 bg-white/10 border border-white/10 px-2.5 py-1 rounded-xl">
                {dailyDone} / {dailyTarget} Kad
              </span>
            </div>

            {/* Slider / Progress Bar */}
            <div className="space-y-3">
              <div className="w-full bg-white/10 rounded-full h-3.5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyPercent}%` }}
                  className="bg-gradient-to-r from-orange-400 to-amber-400 h-full rounded-full shadow-inner"
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Mula Selesa</span>
                <span>{dailyPercent}% Selesai harian</span>
                <span>Cemerlang! 🔥</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
