export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
  example: string;
  difficulty: 'Mudah' | 'Sederhana' | 'Sukar';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
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
  xp: number;
  streak: number;
  completedFlashcards: string[]; // ids of memorized terms
  quizScores: Record<string, number>; // quiz category to highscore
  unlockedBadges: string[]; // ids of badges
  avatarId: string;
  dailyGoal: number; // target completed cards or questions per day
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  joinedAt: string;
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
