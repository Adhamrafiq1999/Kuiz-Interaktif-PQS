import { Flashcard, QuizQuestion, Badge, NoteCategory, UserProgress } from './types';

export const ULUM_CATEGORIES = [
  { id: 'all', name: 'All Terms', icon: 'BookOpen' },
  { id: 'nuzul', name: 'Revelation of Al-Quran', icon: 'Sparkles', color: 'from-blue-500 to-indigo-600' },
  { id: 'makki-madani', name: 'Makkiyyah & Madaniyyah', icon: 'MapPin', color: 'from-emerald-500 to-green-600' },
  { id: 'nasikh-mansukh', name: 'Nasikh & Mansukh', icon: 'RefreshCw', color: 'from-amber-500 to-orange-600' },
  { id: 'ijaz', name: 'I\'jaz (Inimitability) of Al-Quran', icon: 'Zap', color: 'from-purple-500 to-pink-600' },
  { id: 'tafsir', name: 'Tafsir & Ta\'wil', icon: 'Eye', color: 'from-rose-500 to-red-600' }
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'f1',
    term: 'Nuzul Al-Quran',
    definition: 'The process of the revelation of the Al-Quran from Allah SWT to Prophet Muhammad SAW through the angel Jibril AS.',
    category: 'nuzul',
    example: 'The revelation from Lauh Mahfuz to Baitul Izzah all at once on the night of Lailatul Qadar.'
  },
  {
    id: 'f2',
    term: 'Baitul Izzah',
    definition: 'The lowest heaven where the Al-Quran was sent down all at once from Lauh Mahfuz before being revealed in stages to the Prophet SAW.',
    category: 'nuzul',
    example: 'Revealed on the Night of Lailatul Qadar (the blessed night).'
  },
  {
    id: 'f3',
    term: 'Makkiyyah',
    definition: 'Verses or chapters of the Al-Quran revealed BEFORE the migration (Hijrah) of Prophet Muhammad SAW to Madinah, even if not revealed in Makkah.',
    category: 'makki-madani',
    example: 'Most chapters are short, emphasizing faith (aqidah), belief, the Day of Judgment, and less about laws.'
  },
  {
    id: 'f4',
    term: 'Madaniyyah',
    definition: 'Verses or chapters of the Al-Quran revealed AFTER the migration (Hijrah) of Prophet Muhammad SAW to Madinah, even if not revealed in Madinah.',
    category: 'makki-madani',
    example: 'Most verses are longer, explaining Islamic laws (shariah), worship, calling the People of the Book, and state administration.'
  },
  {
    id: 'f5',
    term: 'Nasikh',
    definition: 'Islamic rule or verse of the Al-Quran that cancels or replaces an older rule that came before it.',
    category: 'nasikh-mansukh',
    example: 'The term "Nasikh" means the changer or canceller of an original rule with a new command.'
  },
  {
    id: 'f6',
    term: 'Mansukh',
    definition: 'An older Islamic rule or verse that is cancelled or replaced by a new Islamic proof (Nasikh).',
    category: 'nasikh-mansukh',
    example: 'Changing the prayer direction (Qiblah) from Baitul-Maqdis to Masjidil Haram is an example of mansukh.'
  },
  {
    id: 'f7',
    term: 'I\'jaz Al-Quran',
    definition: 'The miraculous nature of the Al-Quran which makes it impossible for mankind to produce anything like it, whether in literary, scientific, or historical aspects.',
    category: 'ijaz',
    example: 'Scientific facts about clouds, deep oceans, and embryo development in the womb recently discovered by modern science.'
  },
  {
    id: 'f8',
    term: 'Tafsir',
    definition: 'The literal or outer explanation that clarifies the meaning of Al-Quran verses, historical stories, and laws based on clear linguistic understanding.',
    category: 'tafsir',
    example: 'Tafsir explains the surface meanings such as the reasons for revelation (asbabun nuzul) and original vocabulary.'
  },
  {
    id: 'f9',
    term: 'Ta\'wil',
    definition: 'Shifting the meaning of a word or verse in the Al-Quran from its literal (outer) meaning to a deeper (inner) meaning that is more reasonable.',
    category: 'tafsir',
    example: 'Requires deep wisdom; for example, interpreting "Allah\'s Hand" to mean His power or mercy.'
  },
  {
    id: 'f10',
    term: 'Asbabun Nuzul',
    definition: 'The specific reason, background, event, or question that led to the revelation of one or more Al-Quran verses.',
    category: 'nuzul',
    example: 'Questions by the Jews about the Soul or the Companions of the Cave triggered the revelation of Surah Al-Kahfi.'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the meaning of "Baitul Izzah" in the sequence of the revelation of the Al-Quran?',
    options: [
      'The place where the Al-Quran was rewritten by the Prophet\'s companions',
      'The lowest heaven where the Al-Quran was revealed all at once from Lauh Mahfuz',
      'The first mosque built in the city of Madinah',
      'The house of knowledge established during the era of Caliph Uthman'
    ],
    correctAnswer: 1,
    explanation: 'Baitul Izzah is the lowest heaven. The Al-Quran was revealed all at once from Lauh Mahfuz to Baitul Izzah on Lailatul Qadar, and then revealed in stages to the earth over 23 years.',
    category: 'nuzul'
  },
  {
    id: 'q2',
    question: 'What is the main characteristic that distinguishes MAKKIYYAH chapters?',
    options: [
      'They discuss inheritance laws in great detail',
      'They were written after the Prophet\'s migration (Hijrah) to Madinah',
      'They are usually short, concise, and emphasize faith (aqidah) and tauhid',
      'They must contain the phrase "O you who believe"'
    ],
    correctAnswer: 2,
    explanation: 'Makkiyyah chapters focus on building the foundation of faith (aqidah), belief, the Day of Judgment, and their stories are short compared to Madaniyyah which discuss laws.',
    category: 'makki-madani'
  },
  {
    id: 'q3',
    question: 'In the topic of "Nasikh & Mansukh", which is the correct definition of the term MANSUKH?',
    options: [
      'An Islamic rule that cancels the old rule',
      'An old Islamic rule that is cancelled by a new proof',
      'Handwritten scripture that is automatically erased',
      'A disconnected chain of Prophet\'s narrations'
    ],
    correctAnswer: 1,
    explanation: 'Mansukh refers to the cancelled or replaced rule, while Nasikh means the new rule that replaces the old one.',
    category: 'nasikh-mansukh'
  },
  {
    id: 'q4',
    question: 'If a verse was revealed after the Hijrah, but its location of revelation was inside Makkah (such as during the Opening of Makkah), what is its category?',
    options: [
      'Makkiyyah',
      'Madaniyyah',
      'Mixed Makki-Madani',
      'Travel Verse'
    ],
    correctAnswer: 1,
    explanation: 'The definitive classification is based on TIME (Hijrah). All verses revealed after the Hijrah are Madaniyyah, regardless of where they were revealed.',
    category: 'makki-madani'
  },
  {
    id: 'q5',
    question: 'What is meant by "Ta\'wil"?',
    options: [
      'Translated word-for-word from Arabic to another language',
      'The art of writing Al-Quran calligraphy decorated with gold',
      'Explaining the deeper (inner) meaning of an Al-Quran verse based on reasoning and proofs',
      'Reading the Al-Quran with a very melodious recitation style'
    ],
    correctAnswer: 2,
    explanation: 'Ta’wil involves deep interpretation to shift the literal meaning to an appropriate inner meaning supported by sound proofs, unlike literal Tafsir.',
    category: 'tafsir'
  },
  {
    id: 'q6',
    question: 'Which of the following covers scientific miracles in the Al-Quran (e.g. embryo stage, sun orbit)?',
    options: [
      'Nasikh & Mansukh',
      'I\'jaz Al-Quran (I\'jaz Ilmi)',
      'Asbabun Nuzul Makro',
      'Tajwid Harfi'
    ],
    correctAnswer: 1,
    explanation: 'Scientific Miracles (I\'jaz Ilmi) prove that the Al-Quran is divine revelation by containing scientific truths that could not have been known 1400 years ago.',
    category: 'ijaz'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'First Seeker of Revelation',
    description: 'Complete your first 3 flashcards',
    icon: 'Feather',
    color: 'bg-indigo-500 text-white',
    condition: 'Collect 3 memorised cards'
  },
  {
    id: 'b2',
    name: 'Makkiyyah Scholar',
    description: 'Memorise all Makkiyyah & Madaniyyah terms',
    icon: 'Compass',
    color: 'bg-emerald-500 text-white',
    condition: 'Mark all Makki-Madani cards as memorised'
  },
  {
    id: 'b3',
    name: 'Mastery of Ulum (Perfect Score)',
    description: 'Get a 100% score in any quiz round',
    icon: 'Trophy',
    color: 'bg-amber-500 text-white',
    condition: 'Complete a quiz with no mistakes'
  },
  {
    id: 'b4',
    name: 'Match-It Champion',
    description: 'Match all terms in the matching game in under 15 seconds',
    icon: 'Zap',
    color: 'bg-cyan-500 text-white',
    condition: 'Complete the matching game under 15 seconds'
  },
  {
    id: 'b5',
    name: 'Consistent Learner',
    description: 'Reach a daily study streak of 3 consecutive days',
    icon: 'Flame',
    color: 'bg-orange-500 text-white',
    condition: 'Maintain your daily study streak'
  }
];

export const NOTES_DATA: NoteCategory[] = [
  {
    id: 'nuzul_notes',
    name: 'History of Al-Quran\'s Revelation',
    icon: 'Sparkles',
    description: 'Understand how the Al-Quran was revealed, its stages, and the wisdom of its gradual descent.',
    color: 'bg-blue-500',
    notes: [
      {
        title: '3 Stages of Al-Quran\'s Revelation',
        content: 'The Al-Quran was not revealed to earth all at once, but through three main phases to preserve the majesty of Allah\'s word and strengthen the hearts of its readers.',
        points: [
          'First Stage: From Allah SWT directly to Lauh Mahfuz all at once.',
          'Second Stage: Revealed from Lauh Mahfuz to Baitul Izzah (the lowest heaven) all at once on the Night of Lailatul Qadar.',
          'Third Stage: Revealed from Baitul Izzah to Prophet Muhammad SAW in stages over a period of approximately 23 years (13 years in Makkah, 10 years in Madinah).'
        ],
        context: 'Proof in Surah Al-Qadr (Verse 1): "Indeed, We sent the Qur\'an down during the Night of Decree."'
      },
      {
        title: 'Wisdom of Stage-by-Stage Revelation',
        content: 'There is great wisdom why the revelation came down piece by piece:',
        points: [
          'To strengthen the heart of Prophet Muhammad SAW when facing fierce opposition from the idolaters.',
          'To make memorisation and understanding easier for the Companions (as they were non-literate list-based people).',
          'To establish Islamic laws in gradual steps (tadrij) to avoid shocking the pre-Islamic society.',
          'To prove the miracle of Allah\'s words which answered current questions in real-time.'
        ]
      }
    ]
  },
  {
    id: 'makki_notes',
    name: 'Makkiyyah & Madaniyyah',
    icon: 'MapPin',
    description: 'Scientific analysis distinguishing between Makkah and Madinah eras.',
    color: 'bg-emerald-500',
    notes: [
      {
        title: 'Main Distinction Formula',
        content: 'Not just geographical factors, but the time of migration (Hijrah) is the absolute separator in Ulum.',
        points: [
          'MAKKIYYAH: Revealed before the Hijrah started, focusing on building faith, rejecting shirk, stories of previous people, and verses of prostration.',
          'MADANIYYAH: Revealed after the Hijrah events, focusing on practical Islamic laws (eid prayers, marriage, criminal justice, defense), interactions with other faiths, and state administration.'
        ],
        context: 'Imam Al-Jabar said: "Every verse that mentions jihad or hypocrites is Madaniyyah, whereas the address \'O Mankind\' is usually Makkiyyah."'
      }
    ]
  },
  {
    id: 'nasikh_notes',
    name: 'Nasikh & Mansukh',
    icon: 'RefreshCw',
    description: 'The concept of changing laws to suit the conditions of the Muslim community.',
    color: 'bg-amber-500',
    notes: [
      {
        title: 'Types of Naskh (Abrogation)',
        content: 'Abrogation (Replacement) in the holy book is divided into three main categories:',
        points: [
          'Abrogation of both the Law and the Verse: Both the practical rule and the text recitation are cancelled.',
          'Abrogation of the Law but not the Verse: The text is still recited, but the active command is cancelled (For example: early stages of alcohol prohibition).',
          'Abrogation of the Verse but not the Law: The text is no longer in the Mushaf, but the practical law is still implemented.'
        ],
        context: 'Wisdom: Demonstrates the flexibility of shariah laws and tests the obedience of Muslims.'
      }
    ]
  },
  {
    id: 'ijaz_notes',
    name: 'The Miracle of I\'jaz Al-Quran',
    icon: 'Zap',
    description: 'Scientific and literary reasons why mankind fails to replicate the Al-Quran.',
    color: 'bg-purple-500',
    notes: [
      {
        title: 'Aspects of I\'jaz',
        content: 'The miracle of the Al-Quran is proven through various solid dimensions:',
        points: [
          'Linguistic Miracle (Lughawi): Outstanding linguistic structure, rhymes, and styles that surpassed the greatest pre-Islamic poets.',
          'Scientific Miracle (Ilmi): Explicit declarations of physical science (meeting of two seas, embryo growth stages, universe expansion) proven by modern 20th-century science.',
          'Unseen Miracle (Ghaibi): Future historical predictions (Victory of Rome over Persia) and revelations of unknown past histories.'
        ]
      }
    ]
  }
];

export const INITIAL_PROGRESS: UserProgress = {
  name: 'Excellent Student',
  level: 1,
  streak: 2,
  completedFlashcards: ['f1'],
  quizScores: {
    'Week 1_Introduction': 80
  },
  unlockedBadges: ['b1'],
  avatarId: 'avatar1',
  dailyGoal: 5,
  lockedQuizzes: []
};

export const AVATARS = [
  { id: 'avatar1', emoji: '🧑‍🎓', name: 'Active Learner', bg: 'bg-indigo-100 text-indigo-700' },
  { id: 'avatar2', emoji: '🧕', name: 'Quran Scholar', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'avatar3', emoji: '🧐', name: 'Ulum Researcher', bg: 'bg-amber-100 text-amber-700' },
  { id: 'avatar4', emoji: '🦁', name: 'Dakwah Lion', bg: 'bg-rose-100 text-rose-700' },
  { id: 'avatar5', emoji: '🧙‍♂️', name: 'Sheikh Al-Qari', bg: 'bg-purple-100 text-purple-700' }
];
