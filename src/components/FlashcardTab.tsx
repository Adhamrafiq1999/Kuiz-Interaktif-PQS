import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  BookOpen, 
  Compass, 
  Award,
  HelpCircle,
  ChevronDown,
  Trophy,
  Zap,
  Check,
  X,
  Play,
  RefreshCw,
  Lock,
  Unlock,
  Sparkles,
  Star,
  Clock
} from 'lucide-react';
import { Flashcard, UserProgress, QuizQuestion } from '../types';
import { getStoredFlashcards, getStoredQuiz, addActivityLog, getStoredWeekAccess, getStoredQuizSingleAttempt, getStoredQuizTimerLimit, sortWeeks } from '../lib/storage';
import AdventureQuizGame from './AdventureQuizGame';

const highlightKeywords = (text: string, keywords?: string[]) => {
  if (!keywords || keywords.length === 0) return text;
  
  // Escape keywords to avoid regex issues
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${keywords.map(escapeRegExp).join('|')})`, 'gi');
  
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (keywords.some(k => k.toLowerCase() === part.toLowerCase())) {
      return <span key={i} className="text-teal-400 font-black bg-teal-400/10 px-1 rounded">{part}</span>;
    }
    return part;
  });
};

interface FlashcardTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function FlashcardTab({ progress, onUpdateProgress }: FlashcardTabProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(getStoredFlashcards());
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(getStoredQuiz());
  const [weekAccess, setWeekAccess] = useState<Record<string, boolean>>(() => getStoredWeekAccess());
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<{
    week: string;
    subtopic: string;
    questions: QuizQuestion[];
  } | null>(null);
  const [quizSingleAttempt] = useState(() => getStoredQuizSingleAttempt());

  // Sync state periodically with storage
  useEffect(() => {
    const handleStorageChange = () => {
      setFlashcards(getStoredFlashcards());
      setQuizzes(getStoredQuiz());
      setWeekAccess(getStoredWeekAccess());
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const latestCards = getStoredFlashcards();
      const latestQuiz = getStoredQuiz();
      const latestWeekAccess = getStoredWeekAccess();
      
      if (JSON.stringify(latestCards) !== JSON.stringify(flashcards)) {
        setFlashcards(latestCards);
      }
      if (JSON.stringify(latestQuiz) !== JSON.stringify(quizzes)) {
        setQuizzes(latestQuiz);
      }
      if (JSON.stringify(latestWeekAccess) !== JSON.stringify(weekAccess)) {
        setWeekAccess(latestWeekAccess);
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [flashcards, quizzes]);

  // Normalize data to have week and subtopic values mapped correctly
  const normalizedCards = flashcards.map(c => ({
    ...c,
    week: c.week || "Minggu 1",
    subtopic: c.subtopic || "Pengenalan"
  }));

  const normalizedQuizzes = quizzes.map(q => ({
    ...q,
    week: q.week || "Minggu 1",
    subtopic: q.subtopic || "Pengenalan"
  }));

  // Unique weeks in data
  const weeks = sortWeeks(Array.from(new Set(normalizedCards.map((f) => f.week))).filter((w): w is string => !!w));
  if (weeks.length === 0) weeks.push("Minggu 1");

  const hasAutoExpanded = useRef(false);
  useEffect(() => {
    if (!hasAutoExpanded.current && weeks.length > 0) {
      const firstUnlocked = weeks.find((w) => weekAccess[w] !== false);
      if (firstUnlocked) {
        setExpandedWeeks([firstUnlocked]);
        hasAutoExpanded.current = true;
      }
    }
  }, [weeks, weekAccess]);

  const toggleWeek = (week: string) => {
    if (weekAccess[week] === false) {
      return;
    }
    setExpandedWeeks(prev =>
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    );
  };

  const handleToggleCardMemorized = (cardId: string) => {
    const isAlreadyMemorized = progress.completedFlashcards.includes(cardId);
    
    if (!isAlreadyMemorized) {
      addActivityLog(progress.name || 'Student', 'Menghafal istilah Flashcard baru', 'flashcard');
    }

    onUpdateProgress((prev) => {
      let nextCompleted = [...prev.completedFlashcards];
      let nextLevel = prev.level;
      let nextBadges = [...prev.unlockedBadges];

      if (isAlreadyMemorized) {
        // Demote
        nextCompleted = nextCompleted.filter((id) => id !== cardId);
      } else {
        // Memorize!
        nextCompleted.push(cardId);

        // Check cumulative cards badge
        if (nextCompleted.length >= 3 && !nextBadges.includes('b1')) {
          nextBadges.push('b1');
        }
        
        // Check "Sarjana Makkiyyah" (b2)
        const mmCardIds = normalizedCards.filter(f => f.category === 'makki-madani').map(f => f.id);
        const hasCompletedAllMM = mmCardIds.length > 0 && mmCardIds.every(id => nextCompleted.includes(id));
        if (hasCompletedAllMM && !nextBadges.includes('b2')) {
          nextBadges.push('b2');
        }
      }

      return {
        ...prev,
        completedFlashcards: nextCompleted,
        level: nextLevel,
        unlockedBadges: nextBadges
      };
    });
  };

  const validCompletedCards = progress.completedFlashcards.filter(id => normalizedCards.some(c => c.id === id));
  const completedCount = validCompletedCards.length;
  const totalCards = normalizedCards.length;
  const progressPercent = totalCards > 0 ? Math.round((completedCount / totalCards) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Learning & Assessment Center</h1>
          <p className="text-xs text-slate-300 mt-1">
            Review Al-Quran terms by week & subtopic, then test your knowledge with interactive quizzes!
          </p>
        </div>
        <div className="flex items-center gap-3 bg-teal-500/10 px-4 py-2.5 rounded-2xl border border-teal-500/20 text-white shadow-lg shadow-teal-500/5">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <div className="text-xs">
            <span className="block text-slate-400 uppercase font-semibold text-[9px] tracking-wider leading-none">Terms Memorized</span>
            <strong className="text-sm text-teal-300 font-display mt-0.5 block">
              {completedCount} / {totalCards} terms ({progressPercent}%)
            </strong>
          </div>
        </div>
      </div>

      {/* WEEKS ACCORDION LIST */}
      <div className="space-y-4">
        {weeks.map((week) => {
          const isUnlocked = weekAccess[week] !== false;
          const isExpanded = isUnlocked && expandedWeeks.includes(week);
          const weekCards = normalizedCards.filter(c => c.week === week);
          // Deriving dynamic subtopics for this week
          const weekSubtopics = Array.from(new Set(weekCards.map(c => c.subtopic))).filter((s): s is string => !!s);
          if (weekSubtopics.length === 0) weekSubtopics.push("Pengenalan");

          return (
            <div 
              key={week} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                isUnlocked 
                  ? "bg-white/5 border-white/10" 
                  : "bg-slate-950/20 border-dashed border-white/5 opacity-60"
              }`}
            >
              {/* Week Accordion Control */}
              <button
                type="button"
                onClick={() => toggleWeek(week)}
                disabled={!isUnlocked}
                className={`w-full p-5 flex items-center justify-between hover:bg-white/5 text-left transition-colors border-b ${
                  isExpanded ? 'border-white/10 bg-white/5' : 'border-transparent'
                } ${!isUnlocked ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    !isUnlocked 
                      ? 'bg-white/5 text-amber-500/60'
                      : isExpanded 
                        ? 'bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20' 
                        : 'bg-white/10 text-slate-400'
                  }`}>
                    {isUnlocked ? <Compass className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5 text-amber-500" />}
                  </div>
                  <div>
                    <h2 className={`font-extrabold text-lg font-display ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                      {week.replace("Minggu", "Week")} {!isUnlocked && <span className="text-xs font-normal text-amber-500/80 italic ml-1">(Access Locked)</span>}
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                      {isUnlocked ? `${weekSubtopics.length} Subtopics • ${weekCards.length} Memorization Cards` : 'Content is locked by teacher'}
                    </p>
                  </div>
                </div>
                {isUnlocked ? (
                  <div className={`p-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-transform duration-200 ${isExpanded ? 'rotate-180 text-teal-400' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold text-[10px] uppercase rounded-full tracking-wider select-none">
                    <Lock className="w-3 h-3 text-amber-450" />
                    <span>Locked</span>
                  </div>
                )}
              </button>

              {/* Subtopic Items */}
              {isExpanded && (
                <div className="p-5 bg-black/25 space-y-8">
                  {weekSubtopics.map((sub, sIdx) => {
                    const subtopicFilteredCards = weekCards.filter(c => c.subtopic === sub);
                    const subtopicQuizQuestions = normalizedQuizzes.filter(q => q.week === week && q.subtopic === sub);

                    return (
                      <div key={sub} className="p-5.5 rounded-3xl border border-white/5 bg-[#121824]/40 space-y-5">
                        
                        {/* Subtopic Indicator Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-white/5">
                          <div className="space-y-0.5">
                            <h3 className="text-base font-extrabold text-white font-display">Subtopic: {sub}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5/2 text-[10px] sm:self-center">
                            <span className="bg-teal-500/10 border border-teal-500/20 text-teal-300 font-bold px-2.5 py-1 rounded-full uppercase">
                              {subtopicFilteredCards.length} Memorization Cards
                            </span>
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-2.5 py-1 rounded-full uppercase">
                              {subtopicQuizQuestions.length} Quiz Questions
                            </span>
                          </div>
                        </div>

                        {/* Interactive Slider for this Subtopic */}
                        {subtopicFilteredCards.length > 0 ? (
                          <SubtopicCardSlider 
                            cards={subtopicFilteredCards}
                            progress={progress}
                            onToggleMemorized={handleToggleCardMemorized}
                          />
                        ) : (
                          <div className="p-6 text-center text-xs text-slate-500 bg-white/5 rounded-2xl italic">
                            No memorization cards in this subtopic yet.
                          </div>
                        )}

                        {/* Beautiful "Jom Jawab Kuiz!" button */}
                        <div className="pt-2">
                          {subtopicQuizQuestions.length > 0 ? (() => {
                            const subtopicKey = `${week}_${sub}`;
                            const isLocked = quizSingleAttempt && (progress.lockedQuizzes || []).includes(subtopicKey);
                                                       if (isLocked) {
                              return (
                                <div className="w-full py-4.5 px-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1.5 opacity-80 group grayscale">
                                  <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-widest">
                                    <Lock className="w-4 h-4" /> Quiz Locked (Single Attempt)
                                  </div>
                                  <div className="text-[10px] text-slate-600 font-bold">
                                    Attempt already submitted. Your score: {Math.round(progress.quizScores[subtopicKey] || 0)}%
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <button
                                type="button"
                                onClick={() => setActiveQuiz({
                                  week,
                                  subtopic: sub,
                                  questions: subtopicQuizQuestions
                                })}
                                className="w-full py-4.5 px-6 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-600 hover:brightness-110 font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-white shadow-xl shadow-purple-500/10 transition active:scale-98 cursor-pointer relative overflow-hidden group"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <Trophy className="w-4.5 h-4.5 text-amber-300 animate-pulse fill-amber-300/30" />
                                🏆 START SUBTOPIC QUIZ! ({subtopicQuizQuestions.length} QUESTIONS)
                              </button>
                            );
                          })() : (
                            <div className="border border-white/5 bg-slate-900/30 rounded-2xl p-4.5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                              <HelpCircle className="w-4 h-4 text-slate-500" />
                              <span>Interactive quiz is being prepared by the teacher for this subtopic.</span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* QUIZ ACTIVE SCREEN OVERLAY MODAL */}
      <AnimatePresence>
        {activeQuiz && (
          <ActiveQuizModal 
            activeQuiz={activeQuiz}
            progress={progress}
            onUpdateProgress={onUpdateProgress}
            onClose={() => setActiveQuiz(null)}
            quizSingleAttempt={quizSingleAttempt}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ================= SUBTOPIC FLASHCARD SLIDER COMPONENT =================
interface SubtopicCardSliderProps {
  cards: Flashcard[];
  progress: UserProgress;
  onToggleMemorized: (id: string) => void;
}

function SubtopicCardSlider({ cards, progress, onToggleMemorized }: SubtopicCardSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStars, setShowStars] = useState(false);

  useEffect(() => {
    // Reset index if cards list changes or shrinks
    if (currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards, currentIndex]);

  const currentCard = cards[currentIndex] || null;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleMemorize = (id: string) => {
    const isAlreadyMemorized = progress.completedFlashcards.includes(id);
    if (!isAlreadyMemorized) {
      setShowStars(true);
      setTimeout(() => setShowStars(false), 2000);
    }
    onToggleMemorized(id);
  };

  if (!currentCard) return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto w-full">
      
      {/* CARD BODY */}
      <div className="relative w-full h-[360px] sm:h-[320px] md:h-[280px] perspectives shrink-0">
        <motion.div
          onClick={() => setIsFlipped(!isFlipped)}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative cursor-pointer transform-style shadow-xl rounded-2xl"
        >
          {/* FRONT (Term) */}
          <div 
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-2xl p-5.5 flex flex-col justify-between border border-purple-400/30 bg-purple-900/40 backdrop-blur-md bg-gradient-to-br from-purple-500/20 via-transparent to-transparent text-white backface-hidden"
          >
            <div className="flex justify-between items-center text-[10px] text-purple-200 font-bold select-none uppercase">
              <span>CARD {currentIndex + 1} OF {cards.length}</span>
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            </div>

            <div className="text-center space-y-2 relative z-10 py-4">
              <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug drop-shadow-sm">
                {currentCard.term}
              </h4>
            </div>

            <div className="flex justify-between items-center text-[10px] text-purple-400/60 font-semibold select-none border-t border-white/5 pt-2">
              <span>Memorization Aid</span>
              {progress.completedFlashcards.includes(currentCard.id) && (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Memorized
                </span>
              )}
            </div>
          </div>

          {/* BACK (Definition) */}
          <div 
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
            className="absolute inset-0 rounded-2xl p-5.5 flex flex-col justify-between border border-emerald-400/30 bg-emerald-900/40 backdrop-blur-md bg-gradient-to-tr from-emerald-500/20 via-transparent to-transparent text-white backface-hidden"
          >
            <div className="text-center">
              <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider block mb-1">Meaning / Definition:</span>
              <p className="text-sm font-bold text-emerald-50 text-white leading-relaxed max-h-[190px] sm:max-h-[150px] md:max-h-[110px] overflow-y-auto pr-1 custom-scrollbar">
                {highlightKeywords(currentCard.definition, currentCard.keywords)}
              </p>
            </div>

            {currentCard.example && (
              <div className="bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20 text-center">
                <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-widest block leading-none mb-0.5">Context / Example:</span>
                <p className="text-[11px] text-emerald-100 italic leading-snug">
                  {currentCard.example}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] text-emerald-500/60 font-semibold select-none border-t border-white/5 pt-1.5 mt-1">
              <span className="font-bold">Term Details</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CONTROLS */}
      <div className="w-full flex items-center justify-between gap-3 relative">
        {/* Burst effect for stars when memorizing */}
        <AnimatePresence>
          {showStars && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1, 0.5, 0], 
                    x: (Math.random() - 0.5) * 150, 
                    y: (Math.random() - 0.5) * 150,
                    rotate: Math.random() * 360,
                    opacity: [1, 1, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute"
                >
                  <Star className={`w-4 h-4 fill-amber-400 text-amber-400 ${i % 2 === 0 ? 'scale-75' : ''}`} />
                </motion.div>
              ))}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1.2, 0.6, 0], 
                    x: (Math.random() - 0.5) * 120, 
                    y: (Math.random() - 0.5) * 120,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="absolute"
                >
                  <Sparkles className="w-3 h-3 text-teal-300" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handlePrev}
          className="p-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl w-12 h-12 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Istilah sebelumnya"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => handleMemorize(currentCard.id)}
          className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 relative overflow-hidden ${
            progress.completedFlashcards.includes(currentCard.id)
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/15'
              : 'bg-white/10 hover:bg-white/15 text-purple-300 border border-purple-500/20 shadow-black/10'
          }`}
        >
          {progress.completedFlashcards.includes(currentCard.id) ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              Memorized!
            </>
          ) : (
            <>
              <RotateCcw className="w-3.5 h-3.5" />
              Mark as Memorized
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="p-3 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl w-12 h-12 flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Istilah seterusnya"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}

// ================= INTERACTIVE ACTIVE QUIZ MODAL =================
interface ActiveQuizModalProps {
  activeQuiz: {
    week: string;
    subtopic: string;
    questions: QuizQuestion[];
  };
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
  onClose: () => void;
  quizSingleAttempt: boolean;
}

function ActiveQuizModal({ activeQuiz, progress, onUpdateProgress, onClose, quizSingleAttempt }: ActiveQuizModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Timer limit retrieved per question dynamically
  const [quizTimerLimit, setQuizTimerLimit] = useState(() => getStoredQuizTimerLimit());

  const currentQuestion = activeQuiz.questions[currentIndex] || null;

  useEffect(() => {
    if (activeQuiz && currentQuestion) {
      const resolvedLimit = currentQuestion.timerLimit || getStoredQuizTimerLimit();
      setQuizTimerLimit(resolvedLimit);
    }
  }, [currentIndex, currentQuestion?.id]);

  const handleGameAnswerSelected = (selectedIdx: number, timeLeftRemaining: number) => {
    setSelectedOption(selectedIdx);
    setHasSubmitted(true);
    if (selectedIdx === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    const isLast = currentIndex === activeQuiz.questions.length - 1;
    if (isLast) {
      handleCompleteQuiz();
    } else {
      const nextQ = activeQuiz.questions[currentIndex + 1] || null;
      const nextLimit = nextQ?.timerLimit || getStoredQuizTimerLimit();
      setQuizTimerLimit(nextLimit);
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  };

  const handleCompleteQuiz = () => {
    setQuizFinished(true);

    const finalPercent = (score / activeQuiz.questions.length) * 100;
    const isPerfect = score === activeQuiz.questions.length && activeQuiz.questions.length > 0;

    addActivityLog(progress.name || 'Student', `Menjawab kuiz subtopik "${activeQuiz.subtopic}"`, 'quiz');

    onUpdateProgress(prev => {
      const updatedScores = { ...prev.quizScores };
      const subtopicKey = `${activeQuiz.week}_${activeQuiz.subtopic}`;
      
      if (!updatedScores[subtopicKey] || finalPercent > updatedScores[subtopicKey]) {
        updatedScores[subtopicKey] = finalPercent;
      }

      let nextLevel = prev.level;
      let nextBadges = [...prev.unlockedBadges];
      let nextLocked = [...(prev.lockedQuizzes || [])];

      if (quizSingleAttempt && !nextLocked.includes(subtopicKey)) {
        nextLocked.push(subtopicKey);
      }

      if (isPerfect && !nextBadges.includes('b3')) {
        nextBadges.push('b3');
      }

      return {
        ...prev,
        quizScores: updatedScores,
        level: nextLevel,
        unlockedBadges: nextBadges,
        lockedQuizzes: nextLocked
      };
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#020617] overflow-y-auto px-4 py-4 sm:p-8 font-sans">
      <div className="min-h-full w-full flex flex-col justify-start md:justify-center items-center py-2 sm:py-6">
        <div className="w-full max-w-2xl">
          {!quizFinished ? (
            currentQuestion && (
              <AdventureQuizGame
                key={currentQuestion.id}
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={activeQuiz.questions.length}
                categoryName={`Subtopik: ${activeQuiz.subtopic}`}
                onAnswerSelected={handleGameAnswerSelected}
                onNextQuestion={handleNextQuestion}
                isLastQuestion={currentIndex === activeQuiz.questions.length - 1}
                timerLimit={quizTimerLimit}
              />
            )
          ) : (
            /* QUIZ TAMAT/COMPLETED METRICS */
            <div className="text-center space-y-6 py-8 px-6 bg-[#111827] border border-white/10 rounded-3xl shadow-2xl text-white relative">
              <div className="text-5xl animate-bounce">🎖️</div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-white font-display">Kuiz Selesai!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tahniah kerana berjaya menamatkan kuiz pengembaraan interaktif subtopik ini!
                </p>
              </div>

              {/* Score breakdown bar */}
              <div className="max-w-xs mx-auto">
                <div className="bg-white/4 p-4 rounded-xl border border-white/5">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Skor Diperolehi</span>
                  <strong className="text-xl text-white font-display">{score} / {activeQuiz.questions.length}</strong>
                </div>
              </div>

              {score === activeQuiz.questions.length ? (
                <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl p-3 text-xs font-bold flex items-center justify-center gap-2 max-w-sm mx-auto select-none">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  Skor Sempurna! Lencana 'Jaguh Ulum' Dibuka! 🎉
                </div>
              ) : (
                <div className="bg-white/3 text-slate-400 border border-white/5 rounded-xl p-3 text-[11px] max-w-sm mx-auto">
                  Skor anda telah dikemas kini ke papan pemuka pelajar secara automatik!
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-4.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-teal-500/15 transition cursor-pointer"
              >
                Selesai & Kembali Belajar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
