import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, AlertCircle, BookOpen, Compass, Award } from 'lucide-react';
import { Flashcard, UserProgress } from '../types';
import { getStoredFlashcards } from '../lib/storage';
import { ULUM_CATEGORIES } from '../data';

interface FlashcardTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function FlashcardTab({ progress, onUpdateProgress }: FlashcardTabProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter flashcards by active category
const FLASHCARDS = getStoredFlashcards();
  const filteredCards = FLASHCARDS.filter(
    (fc) => activeCategory === 'all' || fc.category === activeCategory
  );

  // Safely index cards
  const currentCard = filteredCards[currentIndex] || null;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    }, 150);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleMemorized = (cardId: string) => {
    const isAlreadyMemorized = progress.completedFlashcards.includes(cardId);
    
    onUpdateProgress((prev) => {
      let nextCompleted = [...prev.completedFlashcards];
      let nextXp = prev.xp;
      let nextLevel = prev.level;
      let nextBadges = [...prev.unlockedBadges];

      if (isAlreadyMemorized) {
        // Demote
        nextCompleted = nextCompleted.filter((id) => id !== cardId);
        nextXp = Math.max(0, nextXp - 20);
      } else {
        // Memorize!
        nextCompleted.push(cardId);
        nextXp += 20; // 20 XP for memorizing card

        // Level Up check
        if (nextXp >= nextLevel * 100) {
          nextXp -= nextLevel * 100;
          nextLevel += 1;
        }

        // BADGE UNLOCK: "Pencari Wahyu Pertama" (b1) for 3 memorized cards
        if (nextCompleted.length >= 3 && !nextBadges.includes('b1')) {
          nextBadges.push('b1');
        }

        // BADGE UNLOCK: "Sarjana Makkiyyah" (b2) for completing Makki-madani terms
const FLASHCARDS = getStoredFlashcards();
        const mmCardIds = FLASHCARDS.filter(f => f.category === 'makki-madani').map(f => f.id);
        const hasCompletedAllMM = mmCardIds.every(id => nextCompleted.includes(id));
        if (hasCompletedAllMM && !nextBadges.includes('b2')) {
          nextBadges.push('b2');
        }

        // BADGE UNLOCK: "Ulama Ulum Quran" (b6) for 500 cumulative XP (simplified as aggregate)
        const totalEstimatedXp = nextLevel * 100 + nextXp;
        if (totalEstimatedXp >= 500 && !nextBadges.includes('b6')) {
          nextBadges.push('b6');
        }
      }

      return {
        ...prev,
        completedFlashcards: nextCompleted,
        xp: nextXp,
        level: nextLevel,
        unlockedBadges: nextBadges
      };
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Mudah':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
      case 'Sederhana':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/35';
      case 'Sukar':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/35';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  // Progress calculations of current filtered category
  const memorizedInCat = filteredCards.filter((fc) => progress.completedFlashcards.includes(fc.id)).length;
  const filteredTotal = filteredCards.length;
  const filteredPercent = filteredTotal > 0 ? Math.round((memorizedInCat / filteredTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Pusingan Kad Imbasan (Flashcard)</h1>
          <p className="text-xs text-slate-300 mt-1">
            Ketuk kad untuk melihat maksud istilah, kemudian tanda hafal untuk mengumpul mata XP ganjaran!
          </p>
        </div>
        <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2.5 rounded-2xl border border-teal-500/20 text-white shadow-lg shadow-teal-500/5">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <div className="text-xs">
            <span className="block text-slate-400 uppercase font-semibold text-[9px] tracking-wider leading-none">Kemajuan Kategori</span>
            <strong className="text-sm text-teal-300 font-display mt-0.5 block">
              {memorizedInCat} / {filteredTotal} Istilah ({filteredPercent}%)
            </strong>
          </div>
        </div>
      </div>

      {/* CATEGORY SWITCHER */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {ULUM_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all shadow-md cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 border-white/10 scale-[1.03] shadow-teal-500/10'
                  : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {filteredTotal === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-3 text-white">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-200">Tiada istilah ditemui</h3>
          <p className="text-xs text-slate-450">Kategori ini belum diisi. Sila pilih kategori lain untuk memulakan pusingan flashcard.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-6 max-w-xl mx-auto">
          {/* THE FLIP CARD */}
          {currentCard && (
            <div className="relative w-full h-[320px] perspectives shrink-0">
              <motion.div
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="w-full h-full relative cursor-pointer transform-style shadow-2xl rounded-3xl"
              >
                {/* FRONT SIDE (Term) */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-3xl p-6 flex flex-col justify-between border border-white/15 bg-white/10 backdrop-blur-xl bg-gradient-to-br from-white/5 via-transparent to-transparent text-white"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kad {currentIndex + 1} dari {filteredTotal}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase transition ${getDifficultyColor(currentCard.difficulty)}`}>
                      {currentCard.difficulty}
                    </span>
                  </div>

                  <div className="text-center space-y-3 relative z-10">
                    <span className="inline-block bg-teal-400/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase mb-2">
                      {ULUM_CATEGORIES.find(c => c.id === currentCard.category)?.name || activeCategory}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mb-1">
                      {currentCard.term}
                    </h2>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Compass className="w-4 h-4 text-violet-400" />
                      Ulum Al-Quran
                    </span>
                    {progress.completedFlashcards.includes(currentCard.id) && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Dihafal
                      </span>
                    )}
                  </div>
                </div>

                {/* BACK SIDE (Definition) */}
                <div 
                  style={{ transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 backface-hidden rounded-3xl p-6 flex flex-col justify-between border border-white/15 bg-white/10 backdrop-blur-xl bg-gradient-to-tr from-white/5 via-violet-500/5 to-transparent text-white"
                >
                  <div className="flex justify-start">
                    <div className="h-1.5 w-12 rounded-full bg-teal-500/30"></div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Maksud / Definisi:</span>
                      <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        {currentCard.definition}
                      </p>
                    </div>

                    <div className="space-y-1 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block">Konteks / Contoh:</span>
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        {currentCard.example}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end items-center text-xs text-cyan-300/80 font-medium">
                    <span className="text-xs bg-teal-400/15 border border-teal-500/35 px-2.5 py-1 rounded-xl font-bold text-teal-300 flex items-center gap-1">
                      +20 XP Hafal
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* FLIP CARD STYLE INJECTOR ONLY ONCE */}
          <style dangerouslySetInnerHTML={{__html: `
            .perspectives {
              perspective: 1000px;
            }
            .transform-style {
              transform-style: preserve-3d;
            }
            .backface-hidden {
              backface-visibility: hidden;
            }
          `}} />

          {/* CONTROLS AREA */}
          <div className="w-full flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="p-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl w-14 h-14 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Kad sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {currentCard && (
              <button
                onClick={() => toggleMemorized(currentCard.id)}
                className={`flex-1 py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                  progress.completedFlashcards.includes(currentCard.id)
                    ? 'bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 text-white shadow-emerald-500/10'
                    : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-teal-500/10'
                }`}
              >
                {progress.completedFlashcards.includes(currentCard.id) ? (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                    Telah Dihafal! (Klik untuk buang)
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4.2 h-4.2 text-slate-950" />
                    Tahu Maksud & Hafal! (+20 XP)
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleNext}
              className="p-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-2xl w-14 h-14 flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Kad seterusnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium">
            Tips: Gunakan butang anak panah di atas untuk melompat kad. Tanda hijau bermakna anda sudah menghafalnya.
          </div>
        </div>
      )}
    </div>
  );
}
