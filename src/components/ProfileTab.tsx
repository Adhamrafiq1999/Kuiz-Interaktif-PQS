import { useState } from 'react';
import { motion } from 'motion/react';
import { User, Target, ShieldCheck, HelpCircle, Save, Check } from 'lucide-react';
import { AVATARS } from '../data';
import { UserProgress } from '../types';

interface ProfileTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function ProfileTab({ progress, onUpdateProgress }: ProfileTabProps) {
  const [profileName, setProfileName] = useState(progress.name);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSelectAvatar = (avatarId: string) => {
    onUpdateProgress(prev => ({
      ...prev,
      avatarId: avatarId
    }));
  };

  const handleSaveProfile = () => {
    onUpdateProgress(prev => ({
      ...prev,
      name: profileName || 'Pelajar Cemerlang'
    }));
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 4000);
  };

  const handleGoalChange = (val: number) => {
    onUpdateProgress(prev => ({
      ...prev,
      dailyGoal: val
    }));
  };

  const currentAvatar = AVATARS.find(a => a.id === progress.avatarId) || AVATARS[0];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* HEADER BAR */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Mengurus Profil Pembelajar</h1>
          <p className="text-xs text-slate-300 mt-1">
            Suaikan nama panggilan, avatar ceria, dan tetapkan sasaran harian mengikut kepantasan memori anda.
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-6 text-white">
        
        {/* AVATAR DISPLAY & SELECTION */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block px-0.5">
            Pilih Watak / Avatar Pembelajar
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-[#0f172a]/30 rounded-2xl border border-white/5">
            {/* LARGE AVATAR SHOWCASE */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border border-white/10 ${currentAvatar.bg}`}>
              {currentAvatar.emoji}
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <strong className="text-md font-bold text-white font-display">{currentAvatar.name}</strong>
              <p className="text-xs text-slate-350">Watak aktif anda di dalam Dashboard Ulum Al-Quran.</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3.5">
            {AVATARS.map((av) => {
              const isSelected = av.id === progress.avatarId;
              
              return (
                <button
                  key={av.id}
                  onClick={() => handleSelectAvatar(av.id)}
                  className={`w-full aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all cursor-pointer relative border outline-none ${
                    isSelected
                      ? `${av.bg} border-teal-400 scale-105 shadow-inner ring-2 ring-teal-400/35`
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                  title={av.name}
                >
                  <span>{av.emoji}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 rounded-full p-0.5 shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* NAMA PROFILE INTERFACE */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block px-0.5">
            Nama Penuh / Nama Panggilan
          </label>
          <div className="flex gap-2.5">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Masukkan nama anda..."
              maxLength={24}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white font-semibold placeholder-slate-400"
            />
            <button
              onClick={handleSaveProfile}
              className="px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition select-none cursor-pointer hover:brightness-110 shadow-lg shadow-teal-500/10"
            >
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
          
          {/* Saved feedback micro animation */}
          {showSavedFeedback && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-450 font-semibold flex items-center gap-1.5 pt-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Berjaya menyimpan maklumat profil anda!
            </motion.p>
          )}
        </div>

        {/* SASARAN DAILY GOAL TUNING */}
        <div className="space-y-4 pt-4 border-t border-white/15">
          <div className="flex justify-between items-baseline">
            <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block px-0.5">
              Sasaran Hafalan Istilah Harian
            </label>
            <strong className="text-sm text-teal-300 bg-teal-500/15 border border-teal-500/20 px-2.5 py-1 rounded-xl font-display leading-none shadow-sm">
              {progress.dailyGoal} Kad / Hari
            </strong>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min={3}
              max={10}
              step={1}
              value={progress.dailyGoal}
              onChange={(e) => handleGoalChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400 outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>Sederhana (3 Kad)</span>
              <span>Aktif (5 Kad)</span>
              <span>Ulama Muda (10 Kad)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
