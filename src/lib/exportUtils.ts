import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Student } from '../types';

/**
 * EXCEL EXPORTS
 */

export const exportStudentsToExcel = (students: Student[]) => {
  const data = students.map(s => ({
    'ID': s.id,
    'Nama': s.name,
    'Emel': s.email,
    'No. Telefon': s.phone,
    'Tahap': s.level,
    'Tarikh Sertai': s.joinedAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Pelajar');
  XLSX.writeFile(workbook, 'Senarai_Pelajar_PQS_Genius.xlsx');
};

export const exportProgressToExcel = (
  students: Student[], 
  displayWeeks: number[], 
  displaySubtopics: string[]
) => {
  const data = students.map(s => {
    const fMap = s.flashcardsByWeek || {};
    const totalFlash = Object.values(fMap).reduce<number>((sum, val: any) => sum + (Number(val) || 0), 0);
    
    const row: any = {
      'Student Name': s.name,
      'Level': s.level,
    };

    // Flashcards
    displayWeeks.forEach(w => {
      row[`W${w} Memorized`] = fMap[`Minggu ${w}`] || 0;
    });
    row['Total Memorized'] = totalFlash;

    // Quizzes
    displaySubtopics.forEach(sub => {
      const attempts = (s.quizAttempts || []).filter(a => (a.subtopic || 'Pengenalan') === sub);
      const att = attempts.length > 0 ? attempts[attempts.length - 1] : null;
      const getStatusLabel = (status?: string) => {
        if (!status) return "-";
        if (status === "Sempurna") return "Perfect";
        if (status === "Lulus") return "Pass";
        if (status === "Gagal") return "Fail";
        return status;
      };
      row[`Quiz: ${sub} (Score)`] = att ? `${att.score}%` : '-';
      row[`Quiz: ${sub} (Status)`] = att ? getStatusLabel(att.status) : '-';
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student_Progress');
  XLSX.writeFile(workbook, 'PQS_Genius_Student_Progress_Report.xlsx');
};

export const exportLeaderboardToExcel = (students: any[], sortFilter: string, week: string) => {
  const data = students.map((s, idx) => ({
    'Rank': idx + 1,
    'Nama Pelajar': s.name,
    'Tahap': s.level,
    'Flashcards Dihafal': s.derivedFlashcardsCount,
    'Skor Kuiz Maks (%)': s.derivedMaxQuizScore,
    'Purata Kuiz (%)': s.derivedAvgQuizScore,
    'Jumlah Cubaan': s.attemptsCount
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaderboard');
  const filename = `Leaderboard_PQS_Genius_${week.replace(/\s+/g, '_')}_${sortFilter}.xlsx`;
  XLSX.writeFile(workbook, filename);
};

/**
 * PDF EXPORTS (PRINT)
 */

export const exportStudentsToPDF = (students: Student[]) => {
  const doc = new jsPDF();
  doc.text('Laporan Senarai Pelajar PQS Genius', 14, 15);
  doc.setFontSize(10);
  doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 14, 22);

  const head = [['ID', 'Nama', 'Emel', 'No. Telefon', 'Level', 'Tarikh Sertai']];
  const body = students.map(s => [s.id, s.name, s.email, s.phone, s.level, s.joinedAt]);

  autoTable(doc, {
    startY: 30,
    head,
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [45, 212, 191] }
  });

  doc.save('Senarai_Pelajar_PQS_Genius.pdf');
};

export const exportProgressToPDF = (
  students: Student[], 
  displayWeeks: number[], 
  displaySubtopics: string[]
) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  doc.text('PQS Genius Student Progress Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, 14, 22);

  const getStatusLabel = (status?: string) => {
    if (!status) return "-";
    if (status === "Sempurna") return "Perfect";
    if (status === "Lulus") return "Pass";
    if (status === "Gagal") return "Fail";
    return status;
  };

  const headRow1 = ['Profile', 'Level', ...displayWeeks.map(w => `W${w} Flashcards`), 'Total Memorized', ...displaySubtopics.map(sub => `Quiz: ${sub}`)];
  
  const body = students.map(s => {
    const fMap = s.flashcardsByWeek || {};
    const totalFlash = Object.values(fMap).reduce<number>((sum, val: any) => sum + (Number(val) || 0), 0);
    
    const quizResults = displaySubtopics.map(sub => {
      const attempts = (s.quizAttempts || []).filter(a => (a.subtopic || 'Pengenalan') === sub);
      const att = attempts.length > 0 ? attempts[attempts.length - 1] : null;
      return att ? `${att.score}% (${getStatusLabel(att.status)})` : '-';
    });

    return [
      s.name,
      s.level,
      ...displayWeeks.map(w => fMap[`Minggu ${w}`] || 0),
      totalFlash,
      ...quizResults
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [headRow1],
    body,
    styles: { fontSize: 6 },
    headStyles: { fillColor: [45, 212, 191] },
    columnStyles: {
      0: { cellWidth: 30 }
    }
  });

  doc.save('PQS_Genius_Student_Progress_Report.pdf');
};

export const exportLeaderboardToPDF = (students: any[], sortFilter: string, week: string) => {
  const doc = new jsPDF();
  doc.text(`Leaderboard PQS Genius (${week})`, 14, 15);
  doc.setFontSize(10);
  doc.text(`Kriteria: ${sortFilter === 'flashcards' ? 'Flashcard Terbanyak' : 'Markah Kuiz Tertinggi'}`, 14, 22);
  doc.text(`Tarikh: ${new Date().toLocaleDateString('ms-MY')}`, 14, 27);

  const head = [['Rank', 'Nama Pelajar', 'Tahap', 'Flashcards', 'Markah Max', 'Purata', 'Cubaan']];
  const body = students.map((s, idx) => [
    idx + 1,
    s.name,
    s.level,
    s.derivedFlashcardsCount,
    `${s.derivedMaxQuizScore}%`,
    `${s.derivedAvgQuizScore}%`,
    s.attemptsCount
  ]);

  autoTable(doc, {
    startY: 35,
    head,
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [45, 212, 191] }
  });

  doc.save(`Leaderboard_PQS_Genius_${week.replace(/\s+/g, '_')}.pdf`);
};
