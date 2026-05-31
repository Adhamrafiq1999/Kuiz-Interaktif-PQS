import { Flashcard, QuizQuestion, NoteCategory, UserProgress, Student } from '../types';
import { FLASHCARDS, QUIZ_QUESTIONS, NOTES_DATA, INITIAL_PROGRESS } from '../data';

export const getStoredStudents = (): Student[] => {
  const d = localStorage.getItem('app_students');
  return d ? JSON.parse(d) : [
    { id: '1', name: 'Ahmad Faiz', email: 'ahmad@example.com', phone: '0123456789', level: 5, joinedAt: '2024-01-10' },
    { id: '2', name: 'Siti Nurhaliza', email: 'siti@example.com', phone: '0198765432', level: 3, joinedAt: '2024-02-15' },
    { id: '3', name: 'Zul Ariffin', email: 'zul@example.com', phone: '0112233445', level: 8, joinedAt: '2023-12-01' }
  ];
};

export const saveStoredStudents = (d: Student[]) => {
  localStorage.setItem('app_students', JSON.stringify(d));
};

export const getStoredFlashcards = (): Flashcard[] => {
  const d = localStorage.getItem('app_flashcards');
  return d ? JSON.parse(d) : FLASHCARDS;
};
export const saveStoredFlashcards = (d: Flashcard[]) => {
  localStorage.setItem('app_flashcards', JSON.stringify(d));
};

export const getStoredQuiz = (): QuizQuestion[] => {
  const d = localStorage.getItem('app_quiz');
  return d ? JSON.parse(d) : QUIZ_QUESTIONS;
};
export const saveStoredQuiz = (d: QuizQuestion[]) => {
  localStorage.setItem('app_quiz', JSON.stringify(d));
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
