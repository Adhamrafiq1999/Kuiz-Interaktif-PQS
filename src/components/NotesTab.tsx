import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, MapPin, RefreshCw, Zap, BookmarkCheck, Bookmark, Eye, CheckCircle } from 'lucide-react';
import { getStoredNotes } from '../lib/storage';
import { UserProgress } from '../types';

interface NotesTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function NotesTab({ progress, onUpdateProgress }: NotesTabProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const NOTES_DATA = getStoredNotes();
  const [readNotes, setReadNotes] = useState<string[]>([]); // list of note index titles read

  const handleToggleRead = (noteTitle: string) => {
    const isAlreadyRead = readNotes.includes(noteTitle);
    
    if (!isAlreadyRead) {
      setReadNotes(prev => [...prev, noteTitle]);
      
      // Award minor XP for reading note (+15 XP)
      onUpdateProgress(prev => {
        let nextXp = prev.xp + 15;
        let nextLevel = prev.level;
        
        if (nextXp >= nextLevel * 100) {
          nextXp -= nextLevel * 100;
          nextLevel += 1;
        }
        
        return {
          ...prev,
          xp: nextXp,
          level: nextLevel
        };
      });
    } else {
      setReadNotes(prev => prev.filter(title => title !== noteTitle));
    }
  };

  // Select icon based on label string
  const getIcon = (iconName: string, color: string) => {
    const baseStyle = `w-5 h-5 ${color}`;
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={baseStyle} />;
      case 'MapPin': return <MapPin className={baseStyle} />;
      case 'RefreshCw': return <RefreshCw className={baseStyle} />;
      case 'Zap': return <Zap className={baseStyle} />;
      default: return <BookOpen className={baseStyle} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Nota Ringkas Berwarna-warni</h1>
          <p className="text-xs text-slate-300 mt-1">
            Baca kupasan topik pendek bersepadu Ulum Al-Quran untuk membina stamina kefahaman sebelum kuiz dijalankan!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0">
          <BookmarkCheck className="w-4.5 h-4.5 text-emerald-400" />
          Mata Selesai Baca: {readNotes.length * 15} XP Bonus!
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SIDE BAR: NOTE TOPICS */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1 px-1">
            Senarai Modul Pembelajaran
          </span>

          <div className="space-y-2.5">
            {NOTES_DATA.map((cat) => {
              const isActive = activeCategory === cat.id;
              
              // Count completed sub-notes in category
              const subNotesInCat = cat.notes.map(n => n.title);
              const readCount = subNotesInCat.filter(title => readNotes.includes(title)).length;
              const isAllRead = readCount === cat.notes.length && cat.notes.length > 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                  className={`w-full p-4.5 rounded-2xl border text-left transition-all flex flex-col justify-between items-start cursor-pointer hover:shadow-xs relative gap-3 outline-none ${
                    isActive
                      ? 'bg-white/10 text-white border-white/25 select-none ring-1 ring-white/10'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex gap-3 items-center w-full">
                    <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/15' : 'bg-white/5 border border-white/5'}`}>
                      {getIcon(cat.icon, isActive ? 'text-teal-300' : 'text-slate-300')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="block text-xs sm:text-sm font-extrabold font-display leading-tight truncate">
                        {cat.name}
                      </strong>
                      <span className={`text-[10px] block mt-1 truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cat.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center w-full pt-1">
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${isActive ? 'text-teal-300' : 'text-cyan-400'}`}>
                      {cat.notes.length} Topik Kupasan
                    </span>

                    {readCount > 0 && (
                      <span className={`text-[10px] font-semibold flex items-center gap-1.5 ${isAllRead ? 'text-emerald-400 font-extrabold' : 'text-cyan-300'}`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {readCount}/{cat.notes.length} Dibaca
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAILS SCREEN */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {activeCategory === null ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-12 text-center h-full flex flex-col justify-center items-center space-y-3 text-white"
              >
                <Eye className="w-10 h-10 text-slate-450 animate-pulse" />
                <h3 className="font-bold text-slate-200">Pilih modul di sebelah kiri</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Buku risalah Ulum Al-Quran bersedia untuk dibuka. Klik pada pautan modul tajuk untuk memaparkan teks ringkasan lengkap.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {NOTES_DATA.find((cat) => cat.id === activeCategory)?.notes.map((note, idx) => {
                  const isRead = readNotes.includes(note.title);
                  
                  return (
                    <div
                      key={idx}
                      className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 text-white"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h2 className="text-md sm:text-lg font-extrabold font-display text-white leading-snug">
                          {note.title}
                        </h2>
                        
                        <button
                          onClick={() => handleToggleRead(note.title)}
                          className={`p-2 px-3 rounded-xl transition-all border outline-none cursor-pointer flex items-center gap-1.5 shrink-0 ${
                            isRead
                              ? 'bg-emerald-555 hover:bg-emerald-600 text-white border-emerald-500/30 text-xs font-bold'
                              : 'bg-white/5 text-slate-300 hover:text-teal-300 border-white/10 hover:border-teal-500/40 text-xs font-medium'
                          }`}
                        >
                          {isRead ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-white" />
                              Selesai Baca
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4" />
                              Tanda Baca (+15 XP)
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                        {note.content}
                      </p>

                      {/* Points Grid / Bullets */}
                      <ul className="space-y-2 pt-2">
                        {note.points.map((pt, pIdx) => (
                           <li key={pIdx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0 mt-1.5 shadow" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Quoted Dalil / Scholar Context */}
                      {note.context && (
                        <div className="bg-[#0f172a]/35 border-l-4 border-cyan-400 p-4 rounded-r-2xl text-xs text-slate-300 space-y-1.5 my-3 font-mono italic">
                          <strong className="block text-white font-bold not-italic font-sans text-[11px] uppercase tracking-wider text-teal-300">Konteks / Rujukan Dalil:</strong>
                          <p>"{note.context}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
