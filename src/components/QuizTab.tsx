import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, HelpCircle, Check, X, RefreshCw, Award, ArrowRight, Zap, Play } from 'lucide-react';
import { getStoredQuiz } from '../lib/storage';
import { ULUM_CATEGORIES } from '../data';
import { UserProgress } from '../types';

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
  const [sessionXP, setSessionXP] = useState(0);

  // Filter questions based on chosen category
  const QUIZ_QUESTIONS = getStoredQuiz();
  const filteredQuestions = QUIZ_QUESTIONS.filter(
    q => selectedCategory === 'all' || q.category === selectedCategory
  );

  const currentQuestion = filteredQuestions[currentQuestionIndex] || null;

  const handleStartQuiz = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setSessionXP(0);
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
      setSessionXP(prev => prev + 30); // 30 XP per correct answer
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = currentQuestionIndex === filteredQuestions.length - 1;

    if (isLastQuestion) {
      handleFinishQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasSubmitted(false);
    }
  };

  const handleFinishQuiz = () => {
    setQuizFinished(true);

    const finalScorePercent = (score / filteredQuestions.length) * 100;
    const isPerfect = score === filteredQuestions.length && filteredQuestions.length > 0;

    onUpdateProgress(prev => {
      const updatedScores = { ...prev.quizScores };
      
      // Save high score for category
      const currentCat = selectedCategory || 'all';
      if (!updatedScores[currentCat] || finalScorePercent > updatedScores[currentCat]) {
        updatedScores[currentCat] = finalScorePercent;
      }

      // Add total points/XP
      let nextXp = prev.xp + sessionXP;
      let nextLevel = prev.level;
      let nextBadges = [...prev.unlockedBadges];

      // Level check
      while (nextXp >= nextLevel * 100) {
        nextXp -= nextLevel * 100;
        nextLevel += 1;
      }

      // BADGE UNLOCK: "Jaguh Ulum" (b3) for 100% score
      if (isPerfect && !nextBadges.includes('b3')) {
        nextBadges.push('b3');
      }

      return {
        ...prev,
        quizScores: updatedScores,
        xp: nextXp,
        level: nextLevel,
        unlockedBadges: nextBadges
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
            Kuiz Interaktif Ulum Al-Quran
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
                Setiap jawapan yang betul memberikan anda ganjaran <strong className="text-teal-400">+30 XP</strong>. Cabar diri anda untuk skor sempurna demi mengunci Lencana Trophy khas!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ y: -3 }}
              onClick={() => handleStartQuiz('all')}
              className="p-5 rounded-3xl border bg-white/5 hover:bg-white/10 border-white/15 text-left cursor-pointer flex flex-col justify-between min-h-[140px] text-white shadow-xl transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-500/25 flex items-center justify-center text-teal-300 mb-3 font-bold">
                <Trophy className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <b className="block text-sm text-white font-bold">Semua Campuran</b>
                <span className="text-[10px] text-slate-400 mt-1 block">Gabungan istilah rawak ({QUIZ_QUESTIONS.length} Soalan)</span>
              </div>
            </motion.button>

            {ULUM_CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
const QUIZ_QUESTIONS = getStoredQuiz();
              const qCount = QUIZ_QUESTIONS.filter(q => q.category === cat.id).length;
              return (
                <motion.button
                  key={cat.id}
                  whileHover={qCount > 0 ? { y: -3 } : undefined}
                  onClick={() => qCount > 0 ? handleStartQuiz(cat.id) : null}
                  disabled={qCount === 0}
                  className={`p-5 rounded-3xl border text-left flex flex-col justify-between min-h-[140px] text-white shadow-xl transition-all ${
                    qCount > 0 
                      ? 'bg-white/5 hover:bg-white/10 border-white/15 cursor-pointer' 
                      : 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 mb-3`}>
                    <Play className="w-4 h-4 fill-purple-400/20" />
                  </div>
                  <div>
                    <b className="block text-sm text-white font-bold">{cat.name}</b>
                    <span className="text-[10px] text-purple-300 mt-1 block">
                      {qCount > 0 ? `${qCount} Soalan Tersedia` : 'Akan Datang'}
                    </span>
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

          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">Markah Betul</span>
              <strong className="text-2xl text-white font-display">
                {score} / {filteredQuestions.length}
              </strong>
            </div>
            <div className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/15 text-teal-300">
              <span className="text-[10px] uppercase font-bold text-teal-400 block leading-none mb-1">Ganjaran XP</span>
              <strong className="text-2xl font-display font-black">+{sessionXP} XP</strong>
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
        /* QUIZ ACTIVE SCREEN */
        <div className="max-w-xl mx-auto space-y-6">
          {/* Question Status Counter */}
          <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
            <span>Kategori: {ULUM_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Campuran'}</span>
            <span>Soalan {currentQuestionIndex + 1} dari {filteredQuestions.length}</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
            />
          </div>

          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/10 border border-white/10 p-6 shadow-2xl rounded-3xl space-y-5 text-white backdrop-blur-md"
            >
              {/* Question Statement */}
              <div className="space-y-1.5">
                <span className="inline-block bg-teal-400/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  {currentQuestion.category.toUpperCase()}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white leading-normal">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options Stack */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isCurSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === currentQuestion.correctAnswer;
                  
                  // Styles depending on state
                  let btnStyle = 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10';
                  if (isCurSelected && !hasSubmitted) {
                    btnStyle = 'border-cyan-400 bg-cyan-500/20 text-white font-bold ring-1 ring-cyan-400/30';
                  } else if (hasSubmitted) {
                    if (isCorrectAnswer) {
                      btnStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold';
                    } else if (isCurSelected) {
                      btnStyle = 'border-red-500 bg-red-500/20 text-red-200 font-medium';
                    } else {
                      btnStyle = 'border-white/5 bg-white/5 text-slate-500 opacity-45';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={hasSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm tracking-wide transition-all select-none flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasSubmitted && isCorrectAnswer && (
                        <Check className="w-4 h-4 text-emerald-450 shrink-0 font-black" />
                      )}
                      {hasSubmitted && isCurSelected && !isCorrectAnswer && (
                        <X className="w-4 h-4 text-red-400 shrink-0 font-black" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SUBMIT OR NEXT CONTROLLER */}
              <div className="pt-2">
                {!hasSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`w-full py-4.5 rounded-2xl font-bold text-xs tracking-wider uppercase transition text-center shadow cursor-pointer ${
                      selectedOption === null
                        ? 'bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed'
                        : 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 hover:brightness-110 shadow-teal-500/10'
                    }`}
                  >
                    Sahkan Jawapan 🔐
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* EXPLANATION / HIKMAH DRAWER */}
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-blue-500/10 text-blue-200 border border-blue-500/20 p-4 rounded-2xl text-xs space-y-1"
                    >
                      <strong className="block text-indigo-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-indigo-500/20 text-indigo-400" />
                        Penerangan Sains:
                      </strong>
                      <p className="leading-relaxed font-sans">{currentQuestion.explanation}</p>
                    </motion.div>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1 cursor-pointer transition hover:brightness-110 shadow-lg shadow-purple-500/10"
                    >
                      {currentQuestionIndex === filteredQuestions.length - 1
                        ? 'Lihat Keputusan Akhir 🏁'
                        : 'Soalan Seterusnya →'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
