export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
  example: string;
  week?: string;
  subtopic?: string;
  keywords?: string[]; // Highlightable keywords in the definition
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  week?: string;
  subtopic?: string;
  timerLimit?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  condition: string;
}

export interface UserProgress {
  name: string;
  level: number;
  streak: number;
  completedFlashcards: string[]; // ids of memorized terms
  quizScores: Record<string, number>; // quiz category to highscore
  unlockedBadges: string[]; // ids of badges
  avatarId: string;
  avatarUrl?: string;
  dailyGoal: number; // target completed cards or questions per day
  lockedQuizzes: string[]; // subtopic/quiz keys that cannot be retaken (e.g. "Minggu 1_Pengenalan")
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  joinedAt: string;
  completedFlashcardsCount?: number;
  avatarUrl?: string;
  flashcardsByWeek?: Record<string, number>;
  quizAttempts?: {
    id: string;
    week: string;
    subtopic: string;
    score: number; // 0 to 100
    status: 'Lulus' | 'Gagal' | 'Sempurna';
    date: string;
  }[];
}

export interface NoteCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  notes: {
    title: string;
    content: string;
    points: string[];
    context?: string;
  }[];
}
