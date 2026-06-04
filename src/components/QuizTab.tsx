import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, HelpCircle, Check, X, RefreshCw, Award, ArrowRight, Zap, Play, Clock, Lock } from 'lucide-react';
import { getStoredQuiz, addActivityLog, getStoredQuizTimerLimit, getStoredQuizSingleAttempt } from '../lib/storage';
import { ULUM_CATEGORIES } from '../data';
import { UserProgress } from '../types';
import AdventureQuizGame from './AdventureQuizGame';

interface QuizTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function QuizTab({ progress, onUpdateProgress }: QuizTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const quizSingleAttempt = getStoredQuizSingleAttempt();

  // Countdown timer parameters
  const [quizTimerLimit, setQuizTimerLimit] = useState(() => getStoredQuizTimerLimit());

  // Sync / set timer values when active question updates
  const QUIZ_QUESTIONS = getStoredQuiz();
  const filteredQuestions = QUIZ_QUESTIONS.filter(
    q => selectedCategory === 'all' || q.category === selectedCategory
  );

  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;

  // Initialize and Reset timer based on current question
  useEffect(() => {
    if (selectedCategory && currentQuestion) {
      const resolvedLimit = currentQuestion.timerLimit || getStoredQuizTimerLimit();
      setQuizTimerLimit(resolvedLimit);
    }
  }, [selectedCategory, currentQuestionIndex, currentQuestion?.id]);

  const handleStartQuiz = (catId: string) => {
    const QUIZ_QUESTIONS_TEMP = getStoredQuiz();
    const tempFiltered = QUIZ_QUESTIONS_TEMP.filter(
      q => catId === 'all' || q.category === catId
    );
    const firstQ = tempFiltered[0] || null;
    const initialLimit = firstQ?.timerLimit || getStoredQuizTimerLimit();

    setQuizTimerLimit(initialLimit);
    setSelectedCategory(catId);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleGameAnswerSelected = (selectedIdx: number, timeLeftRemaining: number) => {
    setSelectedOption(selectedIdx);
    setHasSubmitted(true);
    if (selectedIdx === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleOptionClick = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || hasSubmitted) return;

    setHasSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

    if (isLastQuestion) {
      handleFinishQuiz();
    } else {
      const nextQ = filteredQuestions[currentQuestionIndex + 1] || null;
      const nextLimit = nextQ?.timerLimit || getStoredQuizTimerLimit();
      setQuizTimerLimit(nextLimit);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);

    const finalScorePercent = (score / filteredQuestions.length) * 100;
    const isPerfect = score === filteredQuestions.length && filteredQuestions.length > 0;

    addActivityLog(progress.name || 'Student', `Menjawab kuiz`, 'quiz');

    onUpdateProgress(prev => {
      const updatedScores = { ...prev.quizScores };
      
      // Save high score for category
      const currentCat = selectedCategory || 'all';
      if (!updatedScores[currentCat] || finalScorePercent > updatedScores[currentCat]) {
        updatedScores[currentCat] = finalScorePercent;
      }

      let nextLevel = prev.level;
      let nextBadges = [...prev.unlockedBadges];
      let nextLocked = [...(prev.lockedQuizzes || [])];

      if (quizSingleAttempt && !nextLocked.includes(currentCat)) {
        nextLocked.push(currentCat);
      }

      // BADGE UNLOCK: "Jaguh Ulum" (b3) for 100% score
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

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400 fill-amber-400/50 animate-bounce" />
            Kuiz Interaktif PQS Genius
          </h1>
          <p className="text-xs text-slate-350 mt-1">
            Jawab soalan di bawah untuk membuktikan kefahaman mendalam anda mengenai kategori berkaitan.
          </p>
        </div>
      </div>

      {/* QUIZ SETUP SCREEN */}
      {selectedCategory === null ? (
        <div className="space-y-6">
          <div className="bg-[#1e293b]/40 border border-white/10 p-6 sm:p-8 rounded-3xl text-center space-y-4 backdrop-blur-xl">
            <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <HelpCircle className="w-8 h-8 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-lg font-bold text-white font-display">Pilih Kategori Kuiz</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Cabar diri anda untuk skor sempurna demi mengunci Lencana Trophy khas!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Mixed All Quiz */}
            {(() => {
              const isLocked = quizSingleAttempt && (progress.lockedQuizzes || []).includes('all');
              return (
                <motion.button
                  whileHover={!isLocked ? { y: -3 } : undefined}
                  onClick={() => !isLocked && handleStartQuiz('all')}
                  className={`p-5 rounded-3xl border text-left flex flex-col justify-between min-h-[140px] text-white shadow-xl transition-all ${
                    isLocked ? 'bg-white/5 border-white/5 opacity-60 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/15 cursor-pointer'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-500/25 flex items-center justify-center text-teal-300 mb-3 font-bold">
                    {isLocked ? <Lock className="w-5 h-5 text-slate-500" /> : <Trophy className="w-5 h-5 text-teal-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <b className="block text-sm text-white font-bold">Semua Campuran</b>
                       {isLocked && <span className="text-[9px] bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase">Selesai</span>}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Gabungan istilah rawak ({QUIZ_QUESTIONS.length} Soalan)</span>
                    {isLocked && <span className="text-[9px] text-teal-400 font-bold mt-1 block italic">Skor: {Math.round((progress.quizScores['all'] || 0))}%</span>}
                  </div>
                </motion.button>
              );
            })()}

            {ULUM_CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
              const qCount = QUIZ_QUESTIONS.filter(q => q.category === cat.id).length;
              const isLocked = quizSingleAttempt && (progress.lockedQuizzes || []).includes(cat.id);
              
              return (
                <motion.button
                  key={cat.id}
                  whileHover={(qCount > 0 && !isLocked) ? { y: -3 } : undefined}
                  onClick={() => (qCount > 0 && !isLocked) ? handleStartQuiz(cat.id) : null}
                  disabled={qCount === 0 || isLocked}
                  className={`p-5 rounded-3xl border text-left flex flex-col justify-between min-h-[140px] text-white shadow-xl transition-all ${
                    (qCount > 0 && !isLocked)
                      ? 'bg-white/5 hover:bg-white/10 border-white/15 cursor-pointer' 
                      : (isLocked ? 'bg-white/5 border-white/5 opacity-60 cursor-not-allowed' : 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed')
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${isLocked ? 'bg-slate-500/10 border border-slate-500/20' : 'bg-purple-500/10 border border-purple-500/25'} flex items-center justify-center text-purple-300 mb-3`}>
                    {isLocked ? <Lock className="w-4 h-4 text-slate-500" /> : <Play className="w-4 h-4 fill-purple-400/20" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <b className="block text-sm text-white font-bold">{cat.name}</b>
                       {isLocked && <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-black uppercase">Selesai</span>}
                    </div>
                    <span className="text-[10px] text-purple-300 mt-1 block">
                      {qCount > 0 ? `${qCount} Soalan Tersedia` : 'Akan Datang'}
                    </span>
                    {isLocked && <span className="text-[9px] text-teal-400 font-bold mt-1 block italic">Skor: {Math.round((progress.quizScores[cat.id] || 0))}%</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : quizFinished ? (
        /* END OF QUIZ RESULT BOARD */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center max-w-xl mx-auto space-y-6 shadow-2xl text-white"
        >
          <div className="text-5xl animate-bounce">🎖️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-display">Tamat Pusingan Kuiz!</h2>
            <p className="text-xs text-slate-350 max-w-sm mx-auto">
              Tahniah kerana berjaya menyelesaikan cabaran pembelajaran istilah Ulum Al-Quran.
            </p>
          </div>

          <div className="max-w-xs mx-auto">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">Markah Betul</span>
              <strong className="text-2xl text-white font-display">
                {score} / {filteredQuestions.length}
              </strong>
            </div>
          </div>

          {score === filteredQuestions.length ? (
            <div className="bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-2xl p-3.5 text-xs font-semibold flex items-center justify-center gap-2 max-w-sm mx-auto">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              Skor Sempurna! Anda berjaya membuka Lencana 'Jaguh Ulum'. 🎉
            </div>
          ) : (
            <div className="bg-white/5 text-slate-300 rounded-2xl p-3 text-xs max-w-sm mx-auto">
              Sasar 100% betul dalam satu kuiz untuk mendedahkan trofi pencapaian cemerlang!
            </div>
          )}

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-5 py-3 bg-white/15 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Pilih Kategori Baru
            </button>
            <button
              onClick={() => handleStartQuiz(selectedCategory)}
              className="px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 rounded-xl text-xs font-bold hover:brightness-110 shadow-lg shadow-teal-500/10 transition flex items-center gap-1.5 cursor-pointer"
            >
              Ulang Kuiz Ini ↩️
            </button>
          </div>
        </motion.div>
      ) : (
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-[#020617] overflow-y-auto px-4 py-4 sm:p-8 font-sans">
            <div className="min-h-full w-full flex flex-col justify-start md:justify-center items-center py-2 sm:py-6">
              <div className="w-full max-w-2xl">
                {currentQuestion && (
                  <AdventureQuizGame
                    key={currentQuestion.id}
                    question={currentQuestion}
                    currentIndex={currentQuestionIndex}
                    totalQuestions={filteredQuestions.length}
                    categoryName={ULUM_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Campuran'}
                    onAnswerSelected={handleGameAnswerSelected}
                    onNextQuestion={handleNextQuestion}
                    isLastQuestion={currentQuestionIndex === filteredQuestions.length - 1}
                    timerLimit={quizTimerLimit}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
}
