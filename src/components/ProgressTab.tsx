import { motion } from 'motion/react';
import { Award, Trophy, Compass, Check, Flame, BarChart2, Zap, HelpCircle, RefreshCw } from 'lucide-react';
import { BADGES } from '../data';
import { getStoredFlashcards, getStoredQuiz } from '../lib/storage';
import { UserProgress } from '../types';

interface ProgressTabProps {
  progress: UserProgress;
  onResetProgress: () => void;
}

export default function ProgressTab({ progress, onResetProgress }: ProgressTabProps) {
  // Calculate completion
  const memorizedCount = progress.completedFlashcards.length;
  const FLASHCARDS = getStoredFlashcards();
  const totalCards = FLASHCARDS.length;
  const cardPercent = Math.round((memorizedCount / totalCards) * 100);

  // Badge counts
  const badgesCount = progress.unlockedBadges.length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Analytics & Progress</h1>
          <p className="text-xs text-slate-300 mt-1">
            Track your achievements, study streaks, and honor badges unlocked along your journey.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROGRESS METERS */}
        <div className="md:col-span-1 space-y-6">
          {/* TAHAP / PERINGKAT */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-cyan-400 fill-cyan-400/25" />
              Mastery Level
            </h3>

            <div className="space-y-3">
              <div className="text-center bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 uppercase font-extrabold tracking-wider block">Level Category</span>
                <strong className="text-xl text-white font-display">LEVEL {progress.level}</strong>
              </div>
            </div>
          </div>

          {/* HAFIZ CARD PROGRESS */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-purple-400" />
              Term Memorization Tracker
            </h3>

            <div className="space-y-3 justify-center text-center">
              {/* Radial Metric via Custom SVG */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                     className="text-white/10"
                     strokeWidth="3"
                     stroke="currentColor"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Foreground indicator */}
                  <motion.path
                     className="text-teal-400"
                     strokeWidth="3.2"
                     strokeDasharray={`${cardPercent}, 100`}
                     strokeLinecap="round"
                     stroke="currentColor"
                     fill="none"
                     d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black font-display text-white">{cardPercent}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Memorised</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                You have memorized <strong className="text-teal-300">{memorizedCount}</strong> out of <strong className="text-teal-300">{totalCards}</strong> key terms in the syllabus.
              </p>
            </div>
          </div>

          {/* RESET DATA ADMIN CONTROL */}
          <div className="bg-red-500/15 border border-red-500/25 rounded-3xl p-5 space-y-3 text-center text-white">
            <span className="text-[10px] text-red-350 uppercase font-extrabold block">Danger Zone</span>
            <p className="text-[11px] text-slate-300 leading-normal max-w-xs mx-auto">
              This action will reset your memorized terms, badges, and quiz scores on this device.
            </p>
            <button
               onClick={() => {
                 if (confirm('Are you sure you want to reset all your progress data?')) {
                   onResetProgress();
                 }
               }}
               className="px-4 py-2 bg-gradient-to-r from-red-550 to-rose-600 hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 mx-auto cursor-pointer transition shadow-lg shadow-red-500/10"
            >
              <RefreshCw className="w-3 h-3" /> Reset All Progress
            </button>
          </div>
        </div>

        {/* KABINET LENCANA CABINET */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2 text-md sm:text-lg">
              <Award className="w-5 h-5 text-amber-400" />
              Honor Badges Cabinet ({badgesCount} / {BADGES.length})
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              These badges are automatically unlocked based on your study achievements and discipline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {BADGES.map((badge) => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-3xl border transition relative flex gap-3 ${
                    isUnlocked
                      ? 'bg-white/10 border-white/15 shadow-xl'
                      : 'bg-white/5 border-white/5 opacity-35'
                  }`}
                >
                  {/* Badge Icon */}
                  <div
                    className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center self-start shadow-md ${
                      isUnlocked ? badge.color : 'bg-white/5 text-slate-500 border border-white/5'
                    }`}
                  >
                    {/* Render emojis or generic awards */}
                    <span className="text-xl">
                      {badge.icon === 'Trophy' ? '🏆' : badge.icon === 'Zap' ? '⚡' : badge.icon === 'Flame' ? '🔥' : badge.icon === 'Compass' ? '🧭' : badge.icon === 'Feather' ? '🪶' : '🎖️'}
                    </span>
                  </div>

                  {/* Badge Info */}
                  <div className="space-y-1 pr-6 flex-1">
                    <strong className={`block text-xs sm:text-sm font-extrabold ${isUnlocked ? 'text-white font-display' : 'text-slate-400'}`}>
                      {badge.name}
                    </strong>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {badge.description}
                    </p>
                    <span className="block text-[9px] font-bold uppercase text-teal-300 tracking-wider pt-0.5">
                      Syarat: {badge.condition}
                    </span>
                  </div>

                  {/* Status indicator */}
                  {isUnlocked && (
                    <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full p-1 shadow-sm">
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
