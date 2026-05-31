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
  const memorizedCount = progress.completedFlashcards.length;
  const FLASHCARDS = getStoredFlashcards();
  const totalCards = FLASHCARDS.length;
  const cardPercent = Math.round((memorizedCount / totalCards) * 100);

  // Calculate XP ratio for current level (each level requires level * 100 XP, or simply flat 100 XP)
  const xpNeeded = progress.level * 100;
  const xpPercent = Math.round((progress.xp / xpNeeded) * 100);

  // Badge counts
  const badgesCount = progress.unlockedBadges.length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Analitis & Kemajuan</h1>
          <p className="text-xs text-slate-300 mt-1">
            Jejaki pencapaian cemerlang anda, rentak belajar, dan koleksi lencana kehormatan yang telah didedahkan.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* PROGRESS METERS */}
        <div className="md:col-span-1 space-y-6">
          {/* TAHAP DAN XP */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4.5 h-4.5 text-cyan-400 fill-cyan-400/25 animate-pulse" />
              Peringkat Penguasaan
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-slate-400">Kumpulan Kredit XP</span>
                <span className="text-xs font-bold text-cyan-300">{progress.xp} / {xpNeeded} XP</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercent}%` }}
                  className="bg-gradient-to-r from-teal-400 to-cyan-500 h-full rounded-full"
                />
              </div>

              <div className="text-center bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20">
                <span className="text-[10px] text-cyan-400 uppercase font-extrabold tracking-wider block">Kategori Tahap</span>
                <strong className="text-xl text-white font-display">TAHAP {progress.level}</strong>
              </div>
            </div>
          </div>

          {/* HAFIZ CARD PROGRESS */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 text-white">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-purple-400" />
              Petunjuk Hafalan Istilah
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
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Hafal</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Anda berjaya menghafal <strong className="text-teal-300">{memorizedCount}</strong> daripada <strong className="text-teal-300">{totalCards}</strong> istilah utama dalam buku silibus.
              </p>
            </div>
          </div>

          {/* RESET DATA ADMIN CONTROL */}
          <div className="bg-red-500/15 border border-red-500/25 rounded-3xl p-5 space-y-3 text-center text-white">
            <span className="text-[10px] text-red-350 uppercase font-extrabold block">Zon Bahaya Pembersihan</span>
            <p className="text-[11px] text-slate-300 leading-normal max-w-xs mx-auto">
              Tindakan ini akan memadam rekod hafalan, lencana, mata XP harian dan skor kuiz di dalam peranti ini.
            </p>
            <button
              onClick={() => {
                if (confirm('Adakah anda pasti mahu memadam semua rekod kemajuan? Semua XP akan kembali ke sifar.')) {
                  onResetProgress();
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-red-550 to-rose-600 hover:brightness-110 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 mx-auto cursor-pointer transition shadow-lg shadow-red-500/10"
            >
              <RefreshCw className="w-3 h-3" /> Set Semula Semua Rekod
            </button>
          </div>
        </div>

        {/* KABINET LENCANA CABINET */}
        <div className="md:col-span-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-white">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2 text-md sm:text-lg">
              <Award className="w-5 h-5 text-amber-400" />
              Kabinet Lencana Kehormatan ({badgesCount} / {BADGES.length})
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Lencana ini dibuka secara automatik berdasarkan pencapaian dan disiplin pembelajaran anda.
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
