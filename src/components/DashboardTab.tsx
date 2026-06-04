import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Flame, Award, BookOpen, Calendar, CircleHelp, CheckCircle2 } from 'lucide-react';
import { UserProgress } from '../types';
import { getStoredFlashcards, sortWeeks } from '../lib/storage';

interface DashboardTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardTab({ progress, onUpdateProgress, setActiveTab }: DashboardTabProps) {
  // Calculate stats
  const flashcards = getStoredFlashcards();
  const normalizedCards = flashcards.map(c => ({
    ...c,
    week: c.week || "Minggu 1",
    subtopic: c.subtopic || "Pengenalan"
  }));

  const totalCards = normalizedCards.length;
  const memorizedCount = progress.completedFlashcards.filter(id => normalizedCards.some(c => c.id === id)).length;
  const memorizedPercent = totalCards > 0 ? Math.round((memorizedCount / totalCards) * 100) : 0;

  // Unique weeks in data
  const rawWeeks = Array.from(new Set(normalizedCards.map((f) => f.week))).filter((w): w is string => !!w);
  if (rawWeeks.length === 0) rawWeeks.push("Minggu 1");
  const weeks = sortWeeks(rawWeeks);

  // Track selected week for weekly target
  const [selectedWeek, setSelectedWeek] = useState<string>(weeks[0] || "Minggu 1");

  // Filter cards for the selected week
  const weekCards = normalizedCards.filter(c => c.week === selectedWeek);
  const weekTotal = weekCards.length;
  const weekCompletedCount = weekCards.filter(c => progress.completedFlashcards.includes(c.id)).length;
  const weekRemainingCount = Math.max(0, weekTotal - weekCompletedCount);
  const weekPercent = weekTotal > 0 ? Math.round((weekCompletedCount / weekTotal) * 100) : 0;

  // Timing-based greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 16) return 'Good Afternoon';
    if (hours < 19) return 'Good Evening';
    return 'Good Night';
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
              PQS Genius: Al-Quran & As-Sunnah Education
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-2 bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">
              {getGreeting()}, {progress.name}!
            </h1>
            <p className="text-slate-200 max-w-xl text-sm sm:text-base leading-relaxed">
              Get ready to master Al-Quran terms in an exciting, colorful, and interactive way. Let's learn now!
            </p>
          </div>
          <div className="flex gap-4 self-start md:self-center">
            <button 
              onClick={() => setActiveTab('flashcard')}
              className="px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-teal-500/20 hover:brightness-110 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Start Memorizing 🚀
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid Statistik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Student Level', 
            val: `Lvl ${progress.level}`, 
            subtitle: `Aspirator`, 
            icon: Trophy, 
            color: 'bg-amber-400/10 text-amber-300 border-amber-500/20',
            iconBg: 'bg-amber-400/20 text-amber-300'
          },
          { 
            title: 'Memorized Terms', 
            val: `${memorizedCount}/${totalCards}`, 
            subtitle: `${memorizedPercent}% Completed`, 
            icon: BookOpen, 
            color: 'bg-teal-400/10 text-teal-300 border-teal-500/20',
            iconBg: 'bg-teal-400/20 text-teal-300'
          },
          { 
            title: 'Study Streak', 
            val: `${progress.streak} ${progress.streak === 1 ? 'Day' : 'Days'}`, 
            subtitle: 'Consistent!', 
            icon: Flame, 
            color: 'bg-orange-400/10 text-orange-300 border-orange-500/20',
            iconBg: 'bg-orange-400/20 text-orange-300'
          },
          { 
            title: 'Badges', 
            val: `${progress.unlockedBadges.length} Unlocked`, 
            subtitle: 'Badge Collection', 
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
        {/* Kolum Utama: Sasaran Hafalan Mingguan */}
        <div className="space-y-6">

          {/* Matlamat Sasaran Mingguan */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-extrabold text-lg flex items-center gap-2 font-display">
                  <Calendar className="w-5.5 h-5.5 text-teal-400 animate-pulse" />
                  Weekly Memorization Goal
                </h3>
                <p className="text-xs text-slate-300 mt-0 pt-0">Select a study week to track your term memorization progress.</p>
              </div>

              {/* Selector Weeks */}
              <div className="flex flex-wrap gap-2">
                {weeks.map((week) => {
                  const isSelected = selectedWeek === week;
                  return (
                    <button
                      key={week}
                      type="button"
                      onClick={() => setSelectedWeek(week)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 shadow-lg shadow-teal-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      {week.replace("Minggu", "Week")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider / Progress Bar */}
            <div className="space-y-4 bg-slate-950/20 p-5 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">Memorization Progress ({selectedWeek.replace("Minggu", "Week")})</span>
                <span className="text-slate-350">
                  {weekCompletedCount} / {weekTotal} terms memorized (
                  <span className={`font-black font-mono ${
                    weekPercent < 35 
                      ? "text-red-400" 
                      : weekPercent < 75 
                        ? "text-amber-400" 
                        : "text-emerald-400"
                  }`}>
                    {weekPercent}%
                  </span>
                  )
                </span>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-5 overflow-hidden p-0.5 border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${weekPercent}%` }}
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full shadow-lg shadow-emerald-500/10"
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                <span className="text-red-400/90">Start (0%)</span>
                <span className="text-slate-300 font-bold">
                  {weekRemainingCount === 0 
                    ? "Congratulations! All terms have been memorized! ✨" 
                    : `${weekRemainingCount} more terms to memorize this week`
                  }
                </span>
                <span className="text-emerald-400/90">Done (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
