import { Flashcard, QuizQuestion, NoteCategory, UserProgress, Student } from '../types';
import { FLASHCARDS, QUIZ_QUESTIONS, NOTES_DATA, INITIAL_PROGRESS } from '../data';

export const getStoredActivityLogs = (): any[] => {
  const d = localStorage.getItem('app_activity_logs_v2');
  return d ? JSON.parse(d) : [];
};

export const addActivityLog = (student: string, action: string, type: string) => {
  const logs = getStoredActivityLogs();
  const newLog = {
    id: 'act_' + Date.now() + Math.floor(Math.random()*1000),
    student,
    action,
    time: new Date().toISOString(),
    type
  };
  localStorage.setItem('app_activity_logs_v2', JSON.stringify([newLog, ...logs].slice(0, 50)));
};

export const getStoredStudents = (): Student[] => {
  const d = localStorage.getItem('app_students_v2');
  let loaded = d ? JSON.parse(d) : null;
  if (!loaded) {
    loaded = [
      { 
        id: '1', 
        name: 'Ahmad Faiz', 
        email: 'ahmad@example.com', 
        phone: '012-3456789', 
        level: 5, 
        joinedAt: '2024-01-10', 
        completedFlashcardsCount: 10,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        flashcardsByWeek: {
          'Minggu 1': 10
        },
        quizAttempts: [
          { id: 'att_1', week: 'Minggu 1', subtopic: 'Pengenalan', score: 100, status: 'Sempurna', date: '2026-05-28 14:30' }
        ]
      },
      { 
        id: '2', 
        name: 'Siti Nurhaliza', 
        email: 'siti@example.com', 
        phone: '019-8765432', 
        level: 3, 
        joinedAt: '2024-02-15', 
        completedFlashcardsCount: 4,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        flashcardsByWeek: {
          'Minggu 1': 4
        },
        quizAttempts: [
          { id: 'att_3', week: 'Minggu 1', subtopic: 'Pengenalan', score: 40, status: 'Gagal', date: '2026-05-29 16:45' }
        ]
      },
      { 
        id: '3', 
        name: 'Zul Ariffin', 
        email: 'zul@example.com', 
        phone: '011-2233445', 
        level: 8, 
        joinedAt: '2023-12-01', 
        completedFlashcardsCount: 10,
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
        flashcardsByWeek: {
          'Minggu 1': 10
        },
        quizAttempts: [
          { id: 'att_4', week: 'Minggu 1', subtopic: 'Pengenalan', score: 100, status: 'Sempurna', date: '2026-05-27 10:00' }
        ]
      }
    ];
  }

  // Normalize legacy data dynamically
  return loaded.map((s: any) => ({
    ...s,
    quizAttempts: (s.quizAttempts || []).map((a: any) => ({
      ...a,
      subtopic: ["Nuzul Al-Quran", "Makkiyyah & Madaniyyah", "Nasikh & Mansukh", "I'jaz Al-Quran", "Tafsir & Ta'wil"].includes(a.subtopic) 
        ? "Pengenalan" 
        : (a.subtopic || "Pengenalan")
    }))
  }));
};

export const saveStoredStudents = (d: Student[]) => {
  localStorage.setItem('app_students_v2', JSON.stringify(d));
};

export const getStoredFlashcards = (): Flashcard[] => {
  const d = localStorage.getItem('app_flashcards_v2');
  return d ? JSON.parse(d) : FLASHCARDS;
};
export const saveStoredFlashcards = (d: Flashcard[]) => {
  localStorage.setItem('app_flashcards_v2', JSON.stringify(d));
};

export const getStoredQuiz = (): QuizQuestion[] => {
  const d = localStorage.getItem('app_quiz_v2');
  return d ? JSON.parse(d) : QUIZ_QUESTIONS;
};
export const saveStoredQuiz = (d: QuizQuestion[]) => {
  localStorage.setItem('app_quiz_v2', JSON.stringify(d));
};

export const getStoredQuizTimerLimit = (): number => {
  const d = localStorage.getItem('app_quiz_timer_duration');
  return d ? parseInt(d, 10) : 15; // default 15s
};

export const saveStoredQuizTimerLimit = (sec: number) => {
  localStorage.setItem('app_quiz_timer_duration', String(sec));
};

export const getStoredQuizSingleAttempt = (): boolean => {
  const d = localStorage.getItem('app_quiz_single_attempt');
  return d === 'true'; // default false
};

export const saveStoredQuizSingleAttempt = (isSingle: boolean) => {
  localStorage.setItem('app_quiz_single_attempt', String(isSingle));
};

export const getStoredNotes = (): NoteCategory[] => {
  const d = localStorage.getItem('app_notes');
  return d ? JSON.parse(d) : NOTES_DATA;
};
export const saveStoredNotes = (d: NoteCategory[]) => {
  localStorage.setItem('app_notes', JSON.stringify(d));
};

export const getStoredProgress = (): UserProgress => {
  const d = localStorage.getItem('hafal_ulum_progress_v1');
  return d ? JSON.parse(d) : INITIAL_PROGRESS;
};
export const saveStoredProgress = (d: UserProgress) => {
  localStorage.setItem('hafal_ulum_progress_v1', JSON.stringify(d));
};

export const getStoredWeekAccess = (): Record<string, boolean> => {
  const d = localStorage.getItem('app_week_access');
  return d ? JSON.parse(d) : {};
};

export const saveStoredWeekAccess = (d: Record<string, boolean>) => {
  localStorage.setItem('app_week_access', JSON.stringify(d));
};

export const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
};

export const sortWeeks = (weeksList: string[]): string[] => {
  return [...weeksList].sort((a, b) => {
    const numA = parseInt(a.replace(/^\D+/g, ''), 10);
    const numB = parseInt(b.replace(/^\D+/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
};
