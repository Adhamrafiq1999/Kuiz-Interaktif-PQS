import { Flashcard, QuizQuestion, Badge, NoteCategory, UserProgress } from './types';

export const ULUM_CATEGORIES = [
  { id: 'all', name: 'Semua Istilah', icon: 'BookOpen' },
  { id: 'nuzul', name: 'Nuzul Al-Quran', icon: 'Sparkles', color: 'from-blue-500 to-indigo-600' },
  { id: 'makki-madani', name: 'Makkiyyah & Madaniyyah', icon: 'MapPin', color: 'from-emerald-500 to-green-600' },
  { id: 'nasikh-mansukh', name: 'Nasikh & Mansukh', icon: 'RefreshCw', color: 'from-amber-500 to-orange-600' },
  { id: 'ijaz', name: 'I\'jaz Al-Quran', icon: 'Zap', color: 'from-purple-500 to-pink-600' },
  { id: 'tafsir', name: 'Tafsir & Ta\'wil', icon: 'Eye', color: 'from-rose-500 to-red-600' }
];

export const FLASHCARDS: Flashcard[] = [
  {
    id: 'f1',
    term: 'Nuzul Al-Quran',
    definition: 'Proses penurunan wahyu Al-Quran daripada Allah SWT kepada Nabi Muhammad SAW melalui perantaraan malaikat Jibril AS.',
    category: 'nuzul',
    example: 'Peringkat penurunan dari Lauh Mahfuz ke Baitul Izzah sekaligus pada malam Lailatul Qadar.',
    difficulty: 'Mudah'
  },
  {
    id: 'f2',
    term: 'Baitul Izzah',
    definition: 'Langit dunia di mana Al-Quran diturunkan secara sekaligus dari Lauh Mahfuz sebelum diturunkan secara berperingkat kepada Rasulullah SAW.',
    category: 'nuzul',
    example: 'Diturunkan pada Malam Lailatul Qadar (malam yang berkat).',
    difficulty: 'Sederhana'
  },
  {
    id: 'f3',
    term: 'Makkiyyah',
    definition: 'Ayat atau surah Al-Quran yang diturunkan SEBELUM berlakunya peristiwa Hijrah Rasulullah SAW ke Madinah, walaupun tidak diturunkan di Mekah.',
    category: 'makki-madani',
    example: 'Kebanyakan surahnya pendek, menekankan akidah, iman, hari kiamat, dan bersedikit tentang hukum-hakam.',
    difficulty: 'Sederhana'
  },
  {
    id: 'f4',
    term: 'Madaniyyah',
    definition: 'Ayat atau surah Al-Quran yang diturunkan SELEPAS berlakunya peristiwa Hijrah Rasulullah SAW ke Madinah, walaupun tidak diturunkan di Madinah.',
    category: 'makki-madani',
    example: 'Ayatnya lebih panjang, menerangkan hukum syariah, ibadah, dakwah kepada Ahli Kitab, dan soal kenegaraan.',
    difficulty: 'Sederhana'
  },
  {
    id: 'f5',
    term: 'Nasikh',
    definition: 'Ayat atau hukum Al-Quran atau ketetapan syarak yang MEMBATALKAN atau MENGGANTIKAN hukum lama yang telah terdahulu.',
    category: 'nasikh-mansukh',
    example: 'Istilah "Nasikh" bermaksud pengubah/pembatal hukum asal dengan arahan yang baru.',
    difficulty: 'Sukar'
  },
  {
    id: 'f6',
    term: 'Mansukh',
    definition: 'Hukum atau ketetapan syarak terdahulu yang DIBATALKAN atau DIAGKAT oleh dalil syarak yang baru (Nasikh).',
    category: 'nasikh-mansukh',
    example: 'Pertukaran arah kiblat dari Baitul-Maqdis ke Masjidil Haram merupakan contoh mansukh (hukum asal diganti).',
    difficulty: 'Sukar'
  },
  {
    id: 'f7',
    term: 'I\'jaz Al-Quran',
    definition: 'Sifat mukjizat Al-Quran yang melemahkan manusia daripada mendatangkan sesuatu yang serupa dengannya, sama ada dari sudut sastera, saintifik, atau sejarah.',
    category: 'ijaz',
    example: 'Fakta ilmiah tentang kejadian awan, laut dalam, dan perkembangan janin di dalam rahim yang baru ditemui sains moden.',
    difficulty: 'Sederhana'
  },
  {
    id: 'f8',
    term: 'Tafsir',
    definition: 'Zahir atau penjelasan literal yang menerangkan makna ayat Al-Quran, kisah sejarah, dan hukum berdasarkan kefahaman jelas dari luar bahasa Arab.',
    category: 'tafsir',
    example: 'Tafsir menerangkan makna permukaan seperti asbabun nuzul dan kosa kata asal ayat.',
    difficulty: 'Mudah'
  },
  {
    id: 'f9',
    term: 'Ta\'wil',
    definition: 'Mengalihkan makna perkataan atau lafaz ayat Al-Quran daripada makna luaran (zahir) kepada makna batin (tersirat) yang lebih munasabah.',
    category: 'tafsir',
    example: 'Memerlukan ijtihad yang mendalam, contohnya menafsirkan istilah "Tangan Allah" sebagai kekuasaan atau rahmat-Nya.',
    difficulty: 'Sukar'
  },
  {
    id: 'f10',
    term: 'Asbabun Nuzul',
    definition: 'Sebab, latar belakang, peristiwa atau persoalan khusus yang mendasari penurunan sesuatu atau beberapa ayat Al-Quran.',
    category: 'nuzul',
    example: 'Pertanyaan orang Yahudi tentang Ruh atau pemuda Kahfi mencetuskan turunnya surah Al-Kahfi.',
    difficulty: 'Sederhana'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Apakah maksud "Baitul Izzah" dari sudut urutan peringkat penulisan/penurunan Al-Quran?',
    options: [
      'Tempat Al-Quran ditulis semula oleh para sahabat Nabi',
      'Langit dunia tempat Al-Quran diturunkan secara sekaligus dari Lauh Mahfuz',
      'Masjid pertama yang dibina di bumi Madinah Al-Munawwarah',
      'Maktabah ilmu yang ditubuhkan pada zaman Khalifah Uthman Al-Affan'
    ],
    correctAnswer: 1,
    explanation: 'Baitul Izzah ialah langit dunia. Al-Quran diturunkan sekaligus dari Lauh Mahfuz ke Baitul Izzah pada Malam Lailatul Qadar, kemudian diturunkan berperingkat ke dunia selama 23 tahun.',
    category: 'nuzul'
  },
  {
    id: 'q2',
    question: 'Apakah ciri utama membezakan surah kategori MAKKIYYAH?',
    options: [
      'Membincangkan secara panjang lebar tentang hukum hakam faraid',
      'Ditulis selepas peristiwa Hijrah Nabi ke Madinah',
      'Kebiasaannya surahnya pendek, padat, dan menekankan isu akidah serta tauhid',
      'Wajib mempunyai lafaz "Ya ayyuhalladzina amanu"'
    ],
    correctAnswer: 2,
    explanation: 'Surah Makkiyyah memfokuskan kepada pembinaan asas akidah (iman), hari kiamat, akhlak, dan kisahnya pendek berbanding Madaniyyah yang membincangkan syariat sosial.',
    category: 'makki-madani'
  },
  {
    id: 'q3',
    question: 'Dalam tajuk "Nasikh wal Mansukh", yang manakah definisi yang tepat bagi istilah MANSUKH?',
    options: [
      'Hukum syarak yang membatalkan ketetapan lama',
      'Hukum syarak lama yang dibatalkan oleh dalil baru',
      'Tulisan tangan mushaf yang terpadam sendiri',
      'Salasilah periwayatan hadis nabi yang terputus'
    ],
    correctAnswer: 1,
    explanation: 'Mansukh merujuk kepada hukum yang dibatalkan atau diganti, sedangkan Nasikh bermaksud hukum baru yang datang membatalkan hukum lama.',
    category: 'nasikh-mansukh'
  },
  {
    id: 'q4',
    question: 'Jika suatu ayat turun selepas peristiwa Hijrah, tetapi lokasi penurunannya berlaku di dalam bandar Makkah (contoh semasa Pembukaan Kota Makkah), apakah kategorinya?',
    options: [
      'Makkiyyah',
      'Madaniyyah',
      'Maki-Madani Campuran',
      'Ayat Safariyah'
    ],
    correctAnswer: 1,
    explanation: 'Klasifikasi yang muktamad didasarkan pada ASPEK WAKTU (Hijrah). Semua ayat yang turun selepas Hijrah adalah Madaniyyah, tanpa mengira tempat penurunannya.',
    category: 'makki-madani'
  },
  {
    id: 'q5',
    question: 'Apakah yang dimaksudkan dengan "Ta\'wil"?',
    options: [
      'Terjemahan bahasa Arab ke bahasa lain secara kata-demi-kata',
      'Seni penulisan kaligrafi Al-Quran berhias emas',
      'Penerangan makna tersirat (batin) ayat Al-Quran bersandarkan dalil munasabah',
      'Membaca Al-Quran dengan taranum yang sangat merdu'
    ],
    correctAnswer: 2,
    explanation: 'Ta’wil melibatkan ijtihad mendalam untuk mengalih lafaz zahir ke makna batin munasabah yang disokong oleh dalil syarak yang kukuh, berbeza dengan Tafsir zahir.',
    category: 'tafsir'
  },
  {
    id: 'q6',
    question: 'Aspek kemukjizatan sains dalam Al-Quran (kejadian janin, peredaran matahari) tergolong di bawah perbincangan apa?',
    options: [
      'Nasikh wal Mansukh',
      'I\'jaz Al-Quran (I\'jaz Ilmi)',
      'Asbadun Nuzul Makro',
      'Tajwid Harfi'
    ],
    correctAnswer: 1,
    explanation: 'I\'jaz Ilmi (Sains) membuktikan Al-Quran merupakan wahyu ilahi kerana mengandungi kebenaran saintifik yang tidak mungkin diketahui 1400 tahun dahulu.',
    category: 'ijaz'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Pencari Wahyu Pertama',
    description: 'Selesaikan 3 flashcard pertama anda',
    icon: 'Feather',
    color: 'bg-indigo-500 text-white',
    condition: 'Kumpulkan 3 kad hafalan'
  },
  {
    id: 'b2',
    name: 'Sarjana Makkiyyah',
    description: 'Hafal semua istilah Makkiyyah & Madaniyyah',
    icon: 'Compass',
    color: 'bg-emerald-500 text-white',
    condition: 'Tanda hafal semua kad Makki-Madani'
  },
  {
    id: 'b3',
    name: 'Jaguh Ulum (Perfect Score)',
    description: 'Dapatkan 100% markah dalam mana-mana pusingan kuiz',
    icon: 'Trophy',
    color: 'bg-amber-500 text-white',
    condition: 'Selesaikan kuiz tanpa sebarang salah'
  },
  {
    id: 'b4',
    name: 'Juara Match-It',
    description: 'Padankan semua istilah dalam game padanan kurang dari 15 saat',
    icon: 'Zap',
    color: 'bg-cyan-500 text-white',
    condition: 'Selesaikan game di bawah 15 saat'
  },
  {
    id: 'b5',
    name: 'Pelajar Istiqamah',
    description: 'Capai streak harian sebanyak 3 hari berturut-turut',
    icon: 'Flame',
    color: 'bg-orange-500 text-white',
    condition: 'Kekalkan rentak belajar harian'
  },
  {
    id: 'b6',
    name: 'Ulama Ulum Quran',
    description: 'Kumpul sebanyak 500 XP mata ganjaran terkumpul',
    icon: 'Award',
    color: 'bg-purple-500 text-white',
    condition: 'Kumpul 500 XP'
  }
];

export const NOTES_DATA: NoteCategory[] = [
  {
    id: 'nuzul_notes',
    name: 'Sejarah Penurunan Al-Quran',
    icon: 'Sparkles',
    description: 'Memahami bagaimana Al-Quran diturunkan, peringkatnya, dan hikmah berperingkat.',
    color: 'bg-blue-500',
    notes: [
      {
        title: '3 Peringkat Penurunan Al-Quran',
        content: 'Al-Quran tidak diturunkan sekaligus ke bumi, melainkan melalui tiga fasa utama demi menjaga keagungan firman Allah dan menetapkan hati pembaca.',
        points: [
          'Peringkat Pertama: Dari Allah SWT terus ke Lauh Mahfuz secara sekaligus.',
          'Peringkat Kedua: Diturunkan dari Lauh Mahfuz ke Baitul Izzah (langit dunia) sekaligus pada Malam Lailatul Qadar.',
          'Peringkat Ketiga: Diturunkan dari Baitul Izzah kepada Nabi Muhammad SAW secara beransur-ansur selama lebih kurang 23 tahun (13 tahun di Mekah, 10 tahun di Madinah).'
        ],
        context: 'Dalil Surah Al-Qadr (Ayat 1): "Sesungguhnya Kami telah menurunkan (Al-Quran) ini pada Malam Lailatul Qadar."'
      },
      {
        title: 'Hikmah Penurunan Beransur-ansur',
        content: 'Ada kebijaksanaan besar mengapa wahyu turun sekeping demi sekeping:',
        points: [
          'Menetapkan jiwa Rasulullah SAW dalam menghadapi tentangan hebat kaum Musyrikin.',
          'Memudahkan hafalan dan pemahaman para Sahabat (kerana mereka kaum Ummi/buta huruf).',
          'Pensyariatan hukum Islam secara bertahap (tadrij) bagi mengelak kejutan pada masyarakat jahiliyah.',
          'Membuktikan mukjizat kalam Allah yang sentiasa menjawab persoalan semasa secara real-time.'
        ]
      }
    ]
  },
  {
    id: 'makki_notes',
    name: 'Makkiyyah & Madaniyyah',
    icon: 'MapPin',
    description: 'Analisis saintifik membezakan tempoh dakwah Makkah dan Madinah.',
    color: 'bg-emerald-500',
    notes: [
      {
        title: 'Formula Perbezaan Utama',
        content: 'Bukan sekadar faktor geografi, tetapi faktor masa penghijrahan menjadi pemisah mutlak sains ulum.',
        points: [
          'MAKKIYYAH: Diturunkan sebelum Hijrah bermula, memfokuskan pembinaan akidah, penolakan syirik, kisah umat terdahulu, dan ayat sajadah.',
          'MADANIYYAH: Diturunkan selepas peristiwa Hijrah, memfokuskan hukum syarak amali (solat raya, kahwin, jenayah, perang), interaksi dengan Yahudi Nasrani, dan tata-negara.'
        ],
        context: 'Imam Al-Jabar berkata: "Setiap ayat yang menyebut tentang jihad atau munafik pastinya Madaniyyah, manakala seruan \'Wahai Manusia\' biasanya Makkiyyah."'
      }
    ]
  },
  {
    id: 'nasikh_notes',
    name: 'Nasikh & Mansukh',
    icon: 'RefreshCw',
    description: 'Teori penggantian hukum demi kesesuaian keadaan umat manusia.',
    color: 'bg-amber-500',
    notes: [
      {
        title: 'Pembahagian Jenis Naskh',
        content: 'Naskh (penggantian) di dalam kitab suci terbahagi kepada empat kategori utama:',
        points: [
          'Naskh Hukum dan Tilawah: Kedua-dua hukum dan ayat bacaan dibatalkan.',
          'Naskh Hukum sahaja, Tilawah kekal: Lafaz ayat masih dibaca dalam solat, tetapi arahan hukumnya sudah mansukh (Contoh: hukum minum arak fasa awal).',
          'Naskh Tilawah sahaja, Hukum kekal: Tulisannya tiada dalam mushaf semasa, tetapi pengamalan hukumnya tetap dijalankan.'
        ],
        context: 'Hikmah: Menunjukkan fleksibiliti syariat dan ujian ketaatan bagi umat Islam.'
      }
    ]
  },
  {
    id: 'ijaz_notes',
    name: 'Mukjizat I\'jaz Al-Quran',
    icon: 'Zap',
    description: 'Sebab-sebab saintifik dan sastera mengapa manusia gagal meniru Al-Quran.',
    color: 'bg-purple-500',
    notes: [
      {
        title: 'Pecahan Aspek I\'jaz',
        content: 'Kemukjizatan Al-Quran bukanlah pseudosains, tetapi terbukti dari pelbagai dimensi kukuh:',
        points: [
          'I\'jaz Lughawi (Bahasa): Struktur linguistik, rima, dan gaya sastera Arab yang mengatasi penyair terunggul jahiliyah.',
          'I\'jaz Ilmi (Sains): Nyataan eksplisit sains fizikal (pertembungan dua air laut, proses pertumbuhan janin, teori letupan besar alam) yang baru dibuktikan sains moden abad-20.',
          'I\'jaz Ghaibi: Ramalan sejarah masa depan (Kemenangan Rom ke atas Parsi) dan pendedahan sejarah silam yang tidak diketahui orang Arab.'
        ]
      }
    ]
  }
];

export const INITIAL_PROGRESS: UserProgress = {
  name: 'Pelajar Cemerlang',
  level: 1,
  xp: 40,
  streak: 2,
  completedFlashcards: ['f1'],
  quizScores: {
    'nuzul': 80
  },
  unlockedBadges: ['b1'],
  avatarId: 'avatar1',
  dailyGoal: 5
};

export const AVATARS = [
  { id: 'avatar1', emoji: '🧑‍🎓', name: 'Pelajar Aktif', bg: 'bg-indigo-100 text-indigo-700' },
  { id: 'avatar2', emoji: '🧕', name: 'Aswani Quran', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'avatar3', emoji: '🧐', name: 'Penyelidik Ulum', bg: 'bg-amber-100 text-amber-700' },
  { id: 'avatar4', emoji: '🦁', name: 'Singa Dakwah', bg: 'bg-rose-100 text-rose-700' },
  { id: 'avatar5', emoji: '🧙‍♂️', name: 'Syeikh Al-Qari', bg: 'bg-purple-100 text-purple-700' }
];
