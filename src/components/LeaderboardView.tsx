import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Award, Search, Sparkles, BookOpen, Clock, Medal, GraduationCap, ChevronDown, Download, Printer } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { getStoredStudents, getStoredProgress, getInitials } from "../lib/storage";
import { exportLeaderboardToExcel, exportLeaderboardToPDF } from "../lib/exportUtils";
import { Student } from "../types";

interface LeaderboardViewProps {
  isAdmin?: boolean;
}

export default function LeaderboardView({ isAdmin = false }: LeaderboardViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortFilter, setSortFilter] = useState<"flashcards" | "quiz">("flashcards");
  const [selectedWeek, setSelectedWeek] = useState<string>("All Weeks");
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);

  // Load students and dynamic local progress integration
  useEffect(() => {
    const loadData = () => {
      const storedStudents = getStoredStudents();
      const localProgress = getStoredProgress();

      // Check if local student is already in the list to avoid duplicate names
      const exists = storedStudents.some(
        (s) => s.name.trim().toLowerCase() === localProgress.name.trim().toLowerCase()
      );

      let finalStudentsList = [...storedStudents];

      // If the local progress has a custom name and doesn't exist in saved admin list,
      // dynamically inject it so the active user can see themselves in the leaderboard!
      if (localProgress.name && localProgress.name !== "Nama Pelajar" && !exists) {
        // Derive some default quiz attempts from progress.quizScores if any
        const pseudoAttempts = Object.entries(localProgress.quizScores || {}).map(([category, score], idx) => ({
          id: `local_att_${idx}`,
          week: "Week 1",
          subtopic: category,
          score: score,
          status: score === 100 ? "Sempurna" as const : score >= 80 ? "Lulus" as const : "Gagal" as const,
          date: new Date().toISOString().split("T")[0] + " 12:00"
        }));

        const localUserAsStudent: Student = {
          id: "local_user",
          name: localProgress.name,
          email: "you@mindaulem.local",
          phone: "Device Phone",
          level: localProgress.level,
          joinedAt: new Date().toISOString().split("T")[0],
          completedFlashcardsCount: localProgress.completedFlashcards.length,
          avatarUrl: localProgress.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // beautiful neutral profile or user upload
          flashcardsByWeek: {
            "Week 1": localProgress.completedFlashcards.length
          },
          quizAttempts: pseudoAttempts
        };
        finalStudentsList.push(localUserAsStudent);
      }

      setStudents(finalStudentsList);
    };

    loadData();

    // Set up polling interval to always sync if state changes elsewhere
    const interval = setInterval(loadData, 1500);
    return () => clearInterval(interval);
  }, []);

  // Derive unique weeks
  const allWeeks = Array.from(new Set(students.flatMap(std => [
    ...Object.keys(std.flashcardsByWeek || {}),
    ...(std.quizAttempts || []).map(a => a.week)
  ]))).filter((w): w is string => typeof w === "string" && !!w).sort((a, b) => {
    const numA = parseInt(a.replace(/[^\d]/g, "")) || 0;
    const numB = parseInt(b.replace(/[^\d]/g, "")) || 0;
    return numA - numB;
  });
  const uniqueWeeks = ["All Weeks", ...allWeeks];

  // Compute stats for each student
  const studentsWithStats = students.map((std) => {
    // 1. Calculate total flashcards completed
    let finalFlashCount = 0;
    if (selectedWeek === "All Weeks") {
      const fMap = std.flashcardsByWeek || {};
      const totalFlashCount = Object.values(fMap).reduce<number>((sum, val: any) => sum + (Number(val) || 0), 0);
      finalFlashCount = Math.max(totalFlashCount, std.completedFlashcardsCount || 0);
    } else {
      finalFlashCount = (std.flashcardsByWeek || {})[selectedWeek] || 0;
    }

    // 2. Filter attempts by week
    let filteredAttempts = std.quizAttempts || [];
    if (selectedWeek !== "All Weeks") {
      filteredAttempts = filteredAttempts.filter(a => a.week === selectedWeek);
    }

    // 3. Calculate max and avg quiz scores
    const maxQuizScore = filteredAttempts.length > 0 ? Math.max(...filteredAttempts.map((a) => a.score)) : 0;
    const avgQuizScore =
      filteredAttempts.length > 0
        ? Math.round(filteredAttempts.reduce((sum, a) => sum + a.score, 0) / filteredAttempts.length)
        : 0;

    return {
      ...std,
      derivedFlashcardsCount: finalFlashCount,
      derivedMaxQuizScore: maxQuizScore,
      derivedAvgQuizScore: avgQuizScore,
      attemptsCount: filteredAttempts.length,
    };
  });

  // Filter & Sort
  const filteredStudents = studentsWithStats
    .filter((std) => std.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortFilter === "flashcards") {
        if (b.derivedFlashcardsCount !== a.derivedFlashcardsCount) {
          return b.derivedFlashcardsCount - a.derivedFlashcardsCount;
        }
        return b.level - a.level; // fallback sorting
      } else {
        if (b.derivedMaxQuizScore !== a.derivedMaxQuizScore) {
          return b.derivedMaxQuizScore - a.derivedMaxQuizScore;
        }
        return b.derivedAvgQuizScore - a.derivedAvgQuizScore; // second fallback
      }
    });

  // Podium Positions (Top 3)
  const podiumList = filteredStudents.slice(0, 3);
  // Remaining List
  const tableList = filteredStudents.slice(3);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes goldGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(245, 158, 11, 0.25), inset 0 0 10px rgba(245, 158, 11, 0.05);
            border-color: rgba(245, 158, 11, 0.3);
          }
          50% {
            box-shadow: 0 0 32px rgba(245, 158, 11, 0.65), inset 0 0 15px rgba(245, 158, 11, 0.2);
            border-color: rgba(245, 158, 11, 0.85);
          }
        }
        @keyframes silverGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(148, 163, 184, 0.2), inset 0 0 10px rgba(148, 163, 184, 0.05);
            border-color: rgba(148, 163, 184, 0.25);
          }
          50% {
            box-shadow: 0 0 28px rgba(148, 163, 184, 0.55), inset 0 0 15px rgba(148, 163, 184, 0.15);
            border-color: rgba(148, 163, 184, 0.7);
          }
        }
        @keyframes bronzeGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(180, 83, 9, 0.18), inset 0 0 10px rgba(180, 83, 9, 0.03);
            border-color: rgba(180, 83, 9, 0.25);
          }
          50% {
            box-shadow: 0 0 28px rgba(180, 83, 9, 0.5), inset 0 0 15px rgba(180, 83, 9, 0.15);
            border-color: rgba(180, 83, 9, 0.75);
          }
        }
        .animate-gold-glow {
          animation: goldGlow 3s infinite ease-in-out;
        }
        .animate-silver-glow {
          animation: silverGlow 3s infinite ease-in-out;
        }
        .animate-bronze-glow {
          animation: bronzeGlow 3s infinite ease-in-out;
        }
      `}</style>

      {/* HEADER EXPLANATION CARD */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-purple-500/10 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-2">
            <Trophy className="text-amber-400 w-6 h-6 fill-amber-400/20 animate-bounce-slow" />
            PQS Genius Leaderboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">Unlocking potential & healthy competition in mastering Ulum Al-Quran.</p>
        </div>

        {/* CONTROLS: FILTER SEGMENTED BUTTONS */}
        <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setSortFilter("flashcards")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              sortFilter === "flashcards"
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 shadow-md shadow-teal-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Flashcards
          </button>
          <button
            onClick={() => setSortFilter("quiz")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              sortFilter === "quiz"
                ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-900 shadow-md shadow-teal-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Scores
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS ROW */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between relative">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative">
          {/* Custom Frosted Dropdown for Week Selection */}
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <button
              onClick={() => setIsWeekDropdownOpen(!isWeekDropdownOpen)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white font-bold flex items-center justify-between gap-3 hover:bg-white/20 transition-all cursor-pointer outline-none"
            >
              <span className="truncate">{selectedWeek}</span>
              <ChevronDown className={`w-4 h-4 text-teal-400 transition-transform duration-300 ${isWeekDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isWeekDropdownOpen && (
                <>
                  {/* Backdrop for closing */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsWeekDropdownOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-[240px] overflow-y-auto custom-scrollbar"
                  >
                    {uniqueWeeks.map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setSelectedWeek(w);
                          setIsWeekDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-xs transition-colors hover:bg-teal-500/20 flex items-center justify-between group ${
                          selectedWeek === w ? 'text-teal-400 font-black bg-teal-500/10' : 'text-slate-300'
                        }`}
                      >
                        {w}
                        {selectedWeek === w && <Sparkles className="w-3 h-3 text-teal-400" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/10 mr-2">
              <button
                onClick={() => exportLeaderboardToExcel(filteredStudents, sortFilter, selectedWeek)}
                className="p-2 text-slate-400 hover:text-teal-400 transition cursor-pointer"
                title="Download Excel"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => exportLeaderboardToPDF(filteredStudents, sortFilter, selectedWeek)}
                className="p-2 text-slate-400 hover:text-teal-400 transition cursor-pointer"
                title="Print PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PODIUM GRAPHIC DISPLAY for TOP 3 */}
      {podiumList.length > 0 && searchQuery === "" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-2">
          {/* Rank 2 (Silver) */}
          {podiumList[1] && (
            <div className="order-2 md:order-1 bg-gradient-to-b from-slate-400/10 via-slate-900/90 to-slate-950/95 border border-slate-300/30 rounded-3xl p-5 text-center relative shadow-lg transform transition hover:scale-103 h-[250px] flex flex-col justify-between animate-silver-glow">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-slate-200 to-slate-400 text-slate-950 p-2.5 rounded-full shadow-lg shadow-slate-400/20 border border-slate-200">
                <Medal className="w-5 h-5 fill-slate-900/10 text-slate-900" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="relative inline-block">
                  {podiumList[1].avatarUrl ? (
                    <img
                      src={podiumList[1].avatarUrl}
                      alt={podiumList[1].name}
                      className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-slate-300 ring-4 ring-slate-400/15"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-705 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-300 text-md mx-auto">
                      {getInitials(podiumList[1].name)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 right-2 bg-slate-300 text-slate-900 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-slate-900 select-none">
                    2
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-tight">{podiumList[1].name}</h3>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-300 bg-slate-300/10 border border-slate-300/20 px-2 py-0.5 rounded-full mt-1">
                    <GraduationCap className="w-3 h-3 text-slate-300" /> Level {podiumList[1].level}
                  </span>
                </div>
              </div>

              <div className="bg-slate-300/5 border border-slate-300/10 rounded-2xl p-3 mt-2 space-y-1">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-sans font-semibold">
                  {sortFilter === "flashcards" ? "Memorised Flashcards" : "Maximum Quiz Score"}
                </p>
                <p className="text-lg font-black text-slate-200 font-display">
                  {sortFilter === "flashcards"
                    ? `${podiumList[1].derivedFlashcardsCount} Cards ✓`
                    : `${podiumList[1].derivedMaxQuizScore}% ✓`}
                </p>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {podiumList[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-550/15 via-slate-900/90 to-slate-950/95 border border-amber-500/30 rounded-3xl p-6 text-center relative shadow-2xl transform transition hover:scale-105 h-[280px] flex flex-col justify-between animate-gold-glow">
              {/* Highlight Crown */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 p-3 rounded-full shadow-xl shadow-yellow-500/30 border border-yellow-300">
                <Trophy className="w-6 h-6 fill-slate-950/30 animate-pulse" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="relative inline-block">
                  {podiumList[0].avatarUrl ? (
                    <img
                      src={podiumList[0].avatarUrl}
                      alt={podiumList[0].name}
                      className="w-18 h-18 rounded-full object-cover mx-auto border-4 border-amber-400 shadow-xl shadow-yellow-550/10 ring-4 ring-amber-400/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-18 h-18 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center font-black text-amber-300 text-lg mx-auto">
                      {getInitials(podiumList[0].name)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 right-2 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-slate-900 select-none">
                    1
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-amber-350 text-md truncate uppercase tracking-wide flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {podiumList[0].name}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full mt-1 shadow-inner">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" /> Level {podiumList[0].level}
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 space-y-1 shadow-lg">
                <p className="text-[9px] text-amber-400 uppercase tracking-widest font-sans font-bold">
                  {sortFilter === "flashcards" ? "Memorised Flashcards" : "Maximum Quiz Score"}
                </p>
                <p className="text-xl font-black text-amber-300 font-display">
                  {sortFilter === "flashcards"
                    ? `${podiumList[0].derivedFlashcardsCount} Cards ✓`
                    : `${podiumList[0].derivedMaxQuizScore}% ✓`}
                </p>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {podiumList[2] && (
            <div className="order-3 bg-gradient-to-b from-amber-800/10 via-slate-900/90 to-slate-950/95 border border-amber-700/30 rounded-3xl p-5 text-center relative shadow-lg transform transition hover:scale-103 h-[250px] flex flex-col justify-between animate-bronze-glow">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-b from-amber-700 to-amber-900 text-white p-2.5 rounded-full shadow-lg shadow-amber-800/20 border border-amber-600">
                <Medal className="w-5 h-5 fill-white/10 text-white" />
              </div>
              <div className="mt-4 space-y-3">
                <div className="relative inline-block">
                  {podiumList[2].avatarUrl ? (
                    <img
                      src={podiumList[2].avatarUrl}
                      alt={podiumList[2].name}
                      className="w-14 h-14 rounded-full object-cover mx-auto border-2 border-amber-700 ring-4 ring-amber-800/15"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-950/20 border-2 border-amber-700 flex items-center justify-center font-bold text-slate-300 text-md mx-auto">
                      {getInitials(podiumList[2].name)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 right-2 bg-amber-750 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full border border-slate-900 select-none">
                    3
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-tight">{podiumList[2].name}</h3>
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-905/10 border border-amber-900/20 px-2 py-0.5 rounded-full mt-1">
                    <GraduationCap className="w-3 h-3 text-amber-500" /> Level {podiumList[2].level}
                  </span>
                </div>
              </div>

              <div className="bg-amber-800/5 border border-amber-800/10 rounded-2xl p-3 mt-2 space-y-1">
                <p className="text-[9px] text-amber-500 uppercase tracking-widest font-sans font-semibold">
                  {sortFilter === "flashcards" ? "Memorised Flashcards" : "Maximum Quiz Score"}
                </p>
                <p className="text-lg font-black text-amber-400 font-display">
                  {sortFilter === "flashcards"
                    ? `${podiumList[2].derivedFlashcardsCount} Cards ✓`
                    : `${podiumList[2].derivedMaxQuizScore}% ✓`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAILED LEDGER LIST LONG TABLE */}
      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl shadow-xl mt-6">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 font-bold text-xs text-slate-400 uppercase tracking-widest bg-slate-900/40">
              <th className="p-4 text-center w-16">Rank</th>
              <th className="p-4 min-w-[220px]">Student Name</th>
              <th className="p-4 text-center min-w-[100px]">Level</th>
              <th className="p-4 min-w-[210px] text-center">Flashcards Memorised</th>
              <th className="p-4 min-w-[180px] text-center">Highest Quiz Score</th>
              <th className="p-4 text-center min-w-[110px]">Attempts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStudents.map((student, index) => {
              const rank = index + 1;
              const fMap = student.flashcardsByWeek || {};
              const weeksList = Object.keys(fMap);

              // Conditional highlighting for top ranks
              let rankStyle = "text-slate-400 font-sans font-bold";
              let rowStyle = "hover:bg-white/[0.02] transition-colors group";

              if (rank === 1) {
                rankStyle = "text-amber-400 font-black text-sm bg-amber-500/10 rounded-full w-7 h-7 flex items-center justify-center border border-amber-400/20 mx-auto";
                rowStyle = "bg-amber-500/[0.02] hover:bg-amber-500/[0.04] transition-colors group border-l-2 border-amber-400/30";
              } else if (rank === 2) {
                rankStyle = "text-slate-300 font-black text-sm bg-slate-100/10 rounded-full w-7 h-7 flex items-center justify-center border border-slate-300/20 mx-auto";
                rowStyle = "bg-slate-300/[0.01] hover:bg-slate-300/[0.03] transition-colors group border-l-2 border-slate-300/30";
              } else if (rank === 3) {
                rankStyle = "text-amber-600 font-black text-sm bg-amber-800/10 rounded-full w-7 h-7 flex items-center justify-center border border-amber-800/20 mx-auto";
                rowStyle = "bg-amber-800/[0.01] hover:bg-amber-800/[0.03] transition-colors group border-l-2 border-amber-700/30";
              }

              return (
                <tr key={student.id || index} className={rowStyle}>
                  {/* Rank */}
                  <td className="p-4 text-center">
                    <div className={rankStyle}>{rank}</div>
                  </td>

                  {/* Profile & Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-teal-400 transition-colors"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-xs">
                          {getInitials(student.name)}
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-white text-xs tracking-tight group-hover:text-teal-300 transition-colors uppercase font-display">
                          {student.name}
                          {student.id === "local_user" && (
                            <span className="text-[9px] bg-teal-500 text-slate-950 font-black px-1 py-0.2 rounded ml-1.5 uppercase tracking-wider select-none">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-teal-500/5 to-teal-500/15 border border-teal-500/10 text-teal-300 font-bold text-[10px] px-2 py-0.5 rounded-lg">
                      Lvl {student.level}
                    </span>
                  </td>

                  {/* Completed Flashcards (Sum & Details) */}
                  <td className="p-4 text-center">
                    <div className="inline-block text-center">
                      <div className="text-xs font-black text-white font-sans tracking-wide">
                        {student.derivedFlashcardsCount} <span className="text-[10px] text-slate-400 font-medium">Cards</span>
                      </div>
                      {weeksList.length > 0 && (
                        <div className="text-[9px] text-slate-500 max-w-[180px] truncate mt-0.5">
                          {weeksList.map((wk) => `${wk.replace("Week ", "W").replace("Minggu ", "M")}:${fMap[wk]}`).join(", ")}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Max Quiz Score */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-black font-sans tracking-wide px-2.5 py-0.5 rounded-lg border ${
                      student.derivedMaxQuizScore === 100
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : student.derivedMaxQuizScore >= 80
                          ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                          : student.derivedMaxQuizScore > 0
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-white/5 text-slate-500 border-white/5"
                    }`}>
                      {student.derivedMaxQuizScore > 0 ? `${student.derivedMaxQuizScore}%` : "None"}
                    </span>
                  </td>

                  {/* Quiz Attempts count */}
                  <td className="p-4 text-center">
                    <span className="text-slate-400 font-sans text-xs font-semibold">
                      {student.attemptsCount} <span className="text-[10px] text-slate-500">times</span>
                    </span>
                  </td>
                </tr>
              );
            })}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                  No student records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
