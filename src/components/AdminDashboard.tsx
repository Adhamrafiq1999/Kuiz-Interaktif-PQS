import { useState, useEffect } from "react";
import {
  getStoredFlashcards,
  saveStoredFlashcards,
  getStoredQuiz,
  saveStoredQuiz,
  getStoredNotes,
  saveStoredNotes,
  getStoredProgress,
  getStoredStudents,
  saveStoredStudents,
} from "../lib/storage";
import { Database, Plus, Trash2, Edit2, ShieldAlert, LayoutDashboard, Users, Activity, TrendingUp, ArrowLeft, Mail, Phone, GraduationCap, Save, X, BookOpen, HelpCircle, FileText, BarChart2, ChevronDown, ChevronUp } from "lucide-react";
import { Flashcard, QuizQuestion, NoteCategory, Student } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 relative">
          <div className="flex items-center gap-2 px-2 pb-4 border-b border-white/10 mb-2">
            <Database className="text-teal-400 w-5 h-5" />
            <h1 className="font-bold text-lg">Admin Panel</h1>
          </div>

          <button
            onClick={() => setActiveTab("dashboard")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "dashboard" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "dashboard" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "students" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "students" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Students</span>
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "flashcards" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "flashcards" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "quiz" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "quiz" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Quiz Questions</span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "notes" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "notes" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Nota</span>
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "progress" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "progress" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Progress Student</span>
          </button>

          <div className="mt-8 pt-4 border-t border-white/10">
            <Link 
              to="/" 
              className="p-3 w-full text-left rounded-xl transition flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Aplikasi
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6">
          {activeTab === "dashboard" && <AdminMetrics />}
          {activeTab === "students" && <AdminStudents />}
          {activeTab === "flashcards" && <AdminFlashcards />}
          {activeTab === "quiz" && <AdminQuiz />}
          {activeTab === "notes" && <AdminNotes />}
          {activeTab === "progress" && <AdminProgress />}
        </main>
      </div>
    </div>
  );
}

// ================= ADMIN STUDENTS (CRUD) =================
function AdminStudents() {
  const [students, setStudents] = useState<Student[]>(getStoredStudents());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});

  const handleSave = () => {
    let updatedStudents;
    if (editingStudent) {
      updatedStudents = students.map((s) => 
        s.id === editingStudent.id ? { ...s, ...formData } as Student : s
      );
    } else {
      const newStudent: Student = {
        id: "std_" + Date.now(),
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        level: formData.level || 1,
        joinedAt: new Date().toISOString().split('T')[0],
      };
      updatedStudents = [...students, newStudent];
    }
    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Adakah anda pasti mahu memadam profil student ini?")) {
      const updatedStudents = students.filter((s) => s.id !== id);
      setStudents(updatedStudents);
      saveStoredStudents(updatedStudents);
    }
  };

  const startEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setIsAdding(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setIsAdding(false);
    setFormData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Pengurusan Pelajar</h2>
          <p className="text-xs text-slate-400 mt-1">Daftar, kemaskini dan urus maklumat pelajar dalam sistem.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-teal-500 text-slate-900 px-4 py-2 font-bold rounded-xl hover:bg-teal-400 transition"
        >
          <Plus className="w-4 h-4" /> Tambah Student
        </button>
      </div>

      {isAdding && (
        <div className="bg-white/10 border border-teal-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-teal-400">{editingStudent ? "Kemaskini Student" : "Tambah Student Baru"}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Nama Penuh</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="cth: Ahmad Ali"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Emel</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="cth: ahmad@gmail.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">No. Telefon</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="cth: 0123456789"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Level</label>
              <input
                type="number"
                value={formData.level || 1}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={resetForm} className="px-5 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10">Batal</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-teal-500 text-slate-900 hover:bg-teal-400">
              <Save className="w-4 h-4" /> Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Level</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-white/5 transition group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{student.name}</div>
                      <div className="text-[10px] text-slate-500">ID: {student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Mail className="w-3 h-3 text-teal-500" /> {student.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Phone className="w-3 h-3 text-cyan-500" /> {student.phone}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 font-bold text-xs ring-1 ring-teal-500/30">
                    {student.level}
                  </span>
                </td>
                <td className="p-4 text-xs text-slate-400 font-mono">
                  {student.joinedAt}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => startEdit(student)}
                      className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-400/10 rounded-lg transition"
                      title="Edit Student"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      title="Padam Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-sm">
            Tiada rekod student dijumpai. Sila tambah student baru.
          </div>
        )}
      </div>
    </div>
  );
}

// ================= ADMIN METRICS (Dashboard) =================
function AdminMetrics() {
  const progress = getStoredProgress();
  const flashcards = getStoredFlashcards();
  const quizzes = getStoredQuiz();
  const students = getStoredStudents();
  
  // Dummy data for performance chart (in a real app this would be historical analytics)
  const performanceData = [
    { name: 'Mon', xp: 120, quizScore: 85 },
    { name: 'Tue', xp: 200, quizScore: 90 },
    { name: 'Wed', xp: 150, quizScore: 80 },
    { name: 'Thu', xp: 300, quizScore: 100 },
    { name: 'Fri', xp: 250, quizScore: 95 },
    { name: 'Sat', xp: 400, quizScore: 100 },
    { name: 'Sun', xp: progress.xp || 100, quizScore: 95 },
  ];

  const recentActivities = [
    { id: 1, student: progress.name || 'Student Utama', action: `Memperoleh +30 XP dalam Modul Kuiz`, time: '10 minit yang lalu', type: 'xp' },
    { id: 2, student: progress.name || 'Student Utama', action: `Menghafal 5 istilah Flashcard baru`, time: '1 jam yang lalu', type: 'flashcard' },
    { id: 3, student: progress.name || 'Student Utama', action: `Terbuka lencana 'Jaguh Hafazan'`, time: '2 hari yang lalu', type: 'badge' },
    { id: 4, student: 'Akmal Hakimi', action: `Menjawab 100% betul kuiz Makki & Madani`, time: '3 hari yang lalu', type: 'quiz' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Dashboard Metrik</h2>
        <p className="text-xs text-slate-400 mt-1">Gambaran keseluruhan prestasi dan data sistem aplikasi Ulum Al-Quran.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-teal-400">
            <Users className="w-5 h-5" />
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-300">Total Pelajar Aktif</div>
          <div className="text-3xl font-black text-white">{students.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-cyan-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Jumlah Flashcard</div>
          <div className="text-3xl font-black text-white">{flashcards.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Jumlah Kuiz Tersedia</div>
          <div className="text-3xl font-black text-white">{quizzes.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Purata XP Pelajar</div>
          <div className="text-3xl font-black text-white">3,240</div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 font-display">Analisis Prestasi Pelajar (Mingguan)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="xp" name="XP Terkumpul" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="quizScore" name="Purata Markah Kuiz (%)" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-display">Aktiviti Terkini</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <strong className="text-sm font-bold text-white block">{activity.student}</strong>
                  <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{activity.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ================= ADMIN FLASHCARDS =================
function AdminFlashcards() {
  const [data, setData] = useState<Flashcard[]>(getStoredFlashcards());
  const [themes, setThemes] = useState<string[]>([]);
  const [expandedThemes, setExpandedThemes] = useState<string[]>([]);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    // Unique categories from data + any empty themes we've added
    const existingThemes = Array.from(new Set(data.map((f) => f.category)));
    setThemes((prev) => {
      const combined = Array.from(new Set([...prev, ...existingThemes]));
      return combined.length > 0 ? combined : ["Umum"];
    });
  }, [data]);

  const toggleTheme = (theme: string) => {
    setExpandedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const addTheme = () => {
    const trimmed = newThemeName.trim();
    if (!trimmed) return;
    if (themes.includes(trimmed)) {
      alert("Tema ini sudah wujud.");
      return;
    }
    setThemes([...themes, trimmed]);
    setNewThemeName("");
    setExpandedThemes([...expandedThemes, trimmed]);
  };

  const deleteTheme = (themeToDelete: string) => {
    const cardsInTheme = data.filter((f) => f.category === themeToDelete);
    if (cardsInTheme.length > 0) {
      if (!confirm(`Terdapat ${cardsInTheme.length} kad dalam tema ini. Padam tema dan semua kad di dalamnya?`)) {
        return;
      }
    } else {
      if (!confirm(`Padam tema "${themeToDelete}"?`)) return;
    }
    
    const newData = data.filter((f) => f.category !== themeToDelete);
    setData(newData);
    setThemes(themes.filter((t) => t !== themeToDelete));
    setExpandedThemes(expandedThemes.filter((t) => t !== themeToDelete));
    saveStoredFlashcards(newData);
  };

  const addCardToTheme = (theme: string) => {
    const newCard: Flashcard = {
      id: "f_" + Date.now(),
      term: "Istilah Baru",
      definition: "",
      category: theme,
      example: "",
      difficulty: "Mudah",
    };
    const newData = [newCard, ...data];
    setData(newData);
  };

  const handleUpdateCard = (id: string, updates: Partial<Flashcard>) => {
    const newData = data.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setData(newData);
  };

  const handleDeleteCard = (id: string) => {
    const newData = data.filter((f) => f.id !== id);
    setData(newData);
  };

  const handleSave = () => {
    saveStoredFlashcards(data);
    alert("Semua perubahan telah disimpan!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-white italic tracking-tight">Flashcard Themes</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Penyusunan Istilah mengikut Tema Besar</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-6 py-2.5 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" /> SIMPAN SEMUA
        </button>
      </div>

      {/* Add New Theme Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
        <input
          type="text"
          value={newThemeName}
          onChange={(e) => setNewThemeName(e.target.value)}
          placeholder="Nama Tema Besar Baru..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500/50 transition"
          onKeyDown={(e) => e.key === "Enter" && addTheme()}
        />
        <button
          onClick={addTheme}
          className="bg-white/10 hover:bg-white/20 text-teal-300 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Tema
        </button>
      </div>

      {/* Themes Accordion */}
      <div className="space-y-4">
        {themes.map((theme) => {
          const isExpanded = expandedThemes.includes(theme);
          const themeCards = data.filter((f) => f.category === theme);

          return (
            <div key={theme} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
              {/* Accordion Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5 border-b border-white/10' : ''}`}
                onClick={() => toggleTheme(theme)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-teal-500 text-slate-900' : 'bg-white/10 text-slate-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{theme}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{themeCards.length} Cards Found</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTheme(theme);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                    title="Padam Tema"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-black/20">
                  <div className="flex justify-end">
                    <button
                      onClick={() => addCardToTheme(theme)}
                      className="text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3 h-3" /> Tambah Card Baru
                    </button>
                  </div>

                  <div className="space-y-3">
                    {themeCards.map((card) => (
                      <div key={card.id} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3 group hover:border-white/10 transition">
                        <div className="flex gap-3">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Term / Istilah</label>
                            <input
                              value={card.term}
                              onChange={(e) => handleUpdateCard(card.id, { term: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-teal-300 font-bold focus:border-teal-500 outline-none transition"
                              placeholder="Masukkan istilah..."
                            />
                          </div>
                          <div className="w-32 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Difficulty</label>
                            <select
                              value={card.difficulty}
                              onChange={(e) => handleUpdateCard(card.id, { difficulty: e.target.value as any })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-slate-300 outline-none"
                            >
                              <option value="Mudah">Mudah</option>
                              <option value="Sederhana">Sederhana</option>
                              <option value="Sukar">Sukar</option>
                            </select>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="mt-6 p-2 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Definition / Takrifan</label>
                          <textarea
                            value={card.definition}
                            onChange={(e) => handleUpdateCard(card.id, { definition: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-200 h-20 resize-none outline-none focus:border-teal-500/30 transition"
                            placeholder="Terangkan makna istilah ini..."
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Example / Contoh Penggunaan</label>
                          <input
                            value={card.example}
                            onChange={(e) => handleUpdateCard(card.id, { example: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-400 outline-none italic"
                            placeholder="Contoh ayat atau konteks..."
                          />
                        </div>
                      </div>
                    ))}
                    {themeCards.length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-sm italic">
                        Tiada kad dalam tema ini. Sila tambah kad baru.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= ADMIN QUIZ =================
function AdminQuiz() {
  const [data, setData] = useState<QuizQuestion[]>(getStoredQuiz());
  const [themes, setThemes] = useState<string[]>([]);
  const [expandedThemes, setExpandedThemes] = useState<string[]>([]);
  const [newThemeName, setNewThemeName] = useState("");

  useEffect(() => {
    // Unique categories/modules from quiz data
    const existingThemes = Array.from(new Set(data.map((q) => q.category)));
    setThemes((prev) => {
      const combined = Array.from(new Set([...prev, ...existingThemes]));
      return combined.length > 0 ? combined : ["Umum"];
    });
  }, [data]);

  const toggleTheme = (theme: string) => {
    setExpandedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const addTheme = () => {
    const trimmed = newThemeName.trim();
    if (!trimmed) return;
    if (themes.includes(trimmed)) {
      alert("Modul ini sudah wujud.");
      return;
    }
    setThemes([...themes, trimmed]);
    setNewThemeName("");
    setExpandedThemes([...expandedThemes, trimmed]);
  };

  const deleteTheme = (themeToDelete: string) => {
    const questionsInTheme = data.filter((q) => q.category === themeToDelete);
    if (questionsInTheme.length > 0) {
      if (!confirm(`Terdapat ${questionsInTheme.length} soalan dalam modul ini. Padam modul dan semua soalan di dalamnya?`)) {
        return;
      }
    } else {
      if (!confirm(`Padam modul "${themeToDelete}"?`)) return;
    }
    
    const newData = data.filter((q) => q.category !== themeToDelete);
    setData(newData);
    setThemes(themes.filter((t) => t !== themeToDelete));
    setExpandedThemes(expandedThemes.filter((t) => t !== themeToDelete));
    saveStoredQuiz(newData);
  };

  const addQuestionToTheme = (theme: string) => {
    const newQuestion: QuizQuestion = {
      id: "q_" + Date.now(),
      question: "Soalan Baru",
      options: ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      correctAnswer: 0,
      explanation: "",
      category: theme,
    };
    const newData = [newQuestion, ...data];
    setData(newData);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    const newData = data.map((q) => (q.id === id ? { ...q, ...updates } : q));
    setData(newData);
  };

  const handleDeleteQuestion = (id: string) => {
    const newData = data.filter((q) => q.id !== id);
    setData(newData);
  };

  const handleSave = () => {
    saveStoredQuiz(data);
    alert("Semua soalan kuiz telah disimpan!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-white italic tracking-tight">Quiz Modules</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Penyusunan Kuiz mengikut Modul Pembelajaran</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-6 py-2.5 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" /> SIMPAN SEMUA
        </button>
      </div>

      {/* Add New Module Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
        <input
          type="text"
          value={newThemeName}
          onChange={(e) => setNewThemeName(e.target.value)}
          placeholder="Nama Modul/Tema Kuiz Baru..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500/50 transition"
          onKeyDown={(e) => e.key === "Enter" && addTheme()}
        />
        <button
          onClick={addTheme}
          className="bg-white/10 hover:bg-white/20 text-teal-300 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Modul
        </button>
      </div>

      {/* Quiz Modules Accordion */}
      <div className="space-y-4">
        {themes.map((theme) => {
          const isExpanded = expandedThemes.includes(theme);
          const themeQuestions = data.filter((q) => q.category === theme);

          return (
            <div key={theme} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
              {/* Accordion Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5 border-b border-white/10' : ''}`}
                onClick={() => toggleTheme(theme)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-teal-500 text-slate-900' : 'bg-white/10 text-slate-400'}`}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{theme}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{themeQuestions.length} Questions Prepared</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTheme(theme);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                    title="Padam Modul"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-black/20">
                  <div className="flex justify-end">
                    <button
                      onClick={() => addQuestionToTheme(theme)}
                      className="text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3 h-3" /> Tambah Soalan Baru
                    </button>
                  </div>

                  <div className="space-y-4">
                    {themeQuestions.map((q) => (
                      <div key={q.id} className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-4 group hover:border-white/10 transition relative">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question / Soalan</label>
                            <textarea
                              value={q.question}
                              onChange={(e) => handleUpdateQuestion(q.id, { question: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-teal-100 font-bold focus:border-teal-500 outline-none transition"
                              placeholder="Masukkan teks soalan..."
                              rows={2}
                            />
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="mt-6 p-2 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-center gap-2 p-2 rounded-lg border transition ${q.correctAnswer === oIdx ? 'bg-teal-500/10 border-teal-500/40' : 'bg-white/5 border-white/10'}`}>
                              <input
                                type="radio"
                                name={`correct_${q.id}`}
                                checked={q.correctAnswer === oIdx}
                                onChange={() => handleUpdateQuestion(q.id, { correctAnswer: oIdx })}
                                className="w-4 h-4 accent-teal-500 cursor-pointer"
                              />
                              <input
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options];
                                  newOpts[oIdx] = e.target.value;
                                  handleUpdateQuestion(q.id, { options: newOpts });
                                }}
                                className="bg-transparent border-none p-1 text-sm flex-1 text-slate-300 outline-none"
                                placeholder={`Pilihan ${oIdx + 1}`}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explanation / Penjelasan Jawapan</label>
                          <textarea
                            value={q.explanation}
                            onChange={(e) => handleUpdateQuestion(q.id, { explanation: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-slate-400 italic resize-none outline-none focus:border-teal-500/20 transition"
                            placeholder="Terangkan mengapa jawapan ini betul (dipaparkan selepas student menjawab)..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                    {themeQuestions.length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-sm italic">
                        Tiada soalan dalam modul ini. Sila tambah soalan baru.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= ADMIN NOTES =================
function AdminNotes() {
  const [data, setData] = useState<NoteCategory[]>(getStoredNotes());
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [newCatName, setNewCatName] = useState("");

  const toggleCat = (id: string) => {
    setExpandedCats((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const addCat = () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const newCat: NoteCategory = {
      id: "cat_" + Date.now(),
      name: trimmed,
      icon: "BookOpen", // Default
      description: "Penerangan kategori...",
      color: "bg-teal-500",
      notes: [],
    };
    setData([...data, newCat]);
    setNewCatName("");
    setExpandedCats([...expandedCats, newCat.id]);
  };

  const deleteCat = (id: string) => {
    if (confirm("Padam kategori ini dan semua nota di dalamnya?")) {
      const newData = data.filter((c) => c.id !== id);
      setData(newData);
      setExpandedCats(expandedCats.filter((t) => t !== id));
    }
  };

  const updateCat = (id: string, updates: Partial<NoteCategory>) => {
    const newData = data.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setData(newData);
  };

  const addNote = (catId: string) => {
    const newData = data.map((c) => {
      if (c.id === catId) {
        return {
          ...c,
          notes: [
            ...c.notes,
            {
              title: "Judul Nota Baru",
              content: "",
              points: ["Point Pertama"],
              context: "",
            },
          ],
        };
      }
      return c;
    });
    setData(newData);
  };

  const updateNote = (catId: string, noteIdx: number, updates: any) => {
    const newData = data.map((c) => {
      if (c.id === catId) {
        const newNotes = [...c.notes];
        newNotes[noteIdx] = { ...newNotes[noteIdx], ...updates };
        return { ...c, notes: newNotes };
      }
      return c;
    });
    setData(newData);
  };

  const deleteNote = (catId: string, noteIdx: number) => {
    const newData = data.map((c) => {
      if (c.id === catId) {
        const newNotes = c.notes.filter((_, idx) => idx !== noteIdx);
        return { ...c, notes: newNotes };
      }
      return c;
    });
    setData(newData);
  };

  const handleSave = () => {
    saveStoredNotes(data);
    alert("Semua nota telah berjaya disimpan!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display text-white italic tracking-tight">Management Notes</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Urus Artikel, Nota dan Panduan Pembelajaran</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-6 py-2.5 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" /> SIMPAN SEMUA
        </button>
      </div>

      {/* Add New Category Form */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-center">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Nama Kategori Nota Baru..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-teal-500/50 transition"
          onKeyDown={(e) => e.key === "Enter" && addCat()}
        />
        <button
          onClick={addCat}
          className="bg-white/10 hover:bg-white/20 text-teal-300 font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Kategori
        </button>
      </div>

      <div className="space-y-4">
        {data.map((cat) => {
          const isExpanded = expandedCats.includes(cat.id);
          return (
            <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
              {/* Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5 border-b border-white/10' : ''}`}
                onClick={() => toggleCat(cat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-teal-500 text-slate-900' : 'bg-white/10 text-slate-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{cat.notes.length} Articles</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCat(cat.id);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Content */}
              {isExpanded && (
                <div className="p-4 space-y-6 bg-black/20">
                  {/* Category Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Subtext / Deskripsi Kategori</label>
                      <input 
                        value={cat.description}
                        onChange={(e) => updateCat(cat.id, { description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Warna Tema (Tailwind Class)</label>
                      <input 
                        value={cat.color}
                        onChange={(e) => updateCat(cat.id, { color: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none"
                        placeholder="cth: bg-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <h4 className="text-xs font-black text-teal-400 uppercase tracking-widest">Senarai Nota / Artikel</h4>
                    <button
                      onClick={() => addNote(cat.id)}
                      className="text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3 h-3" /> Tambah Nota
                    </button>
                  </div>

                  <div className="space-y-4">
                    {cat.notes.map((note, nIdx) => (
                      <div key={nIdx} className="bg-white/5 border border-white/5 rounded-xl p-5 space-y-4 group hover:border-white/10 transition pb-6">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tajuk Nota</label>
                            <input
                              value={note.title}
                              onChange={(e) => updateNote(cat.id, nIdx, { title: e.target.value })}
                              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-teal-300 font-bold focus:border-teal-500 outline-none transition"
                            />
                          </div>
                          <button
                            onClick={() => deleteNote(cat.id, nIdx)}
                            className="mt-6 p-2 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kandungan Utama (Highlight)</label>
                          <textarea
                            value={note.content}
                            onChange={(e) => updateNote(cat.id, nIdx, { content: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-slate-200 h-20 outline-none resize-none"
                            placeholder="Tulis ringkasan atau perenggan utama..."
                          />
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Poin-Poin Penting</label>
                            <button 
                              onClick={() => {
                                const newPoints = [...note.points, "Point baru"];
                                updateNote(cat.id, nIdx, { points: newPoints });
                              }}
                              className="text-[10px] text-teal-500 hover:underline"
                            >
                              + Tambah Poin
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {note.points.map((p, pIdx) => (
                              <div key={pIdx} className="flex gap-2">
                                <input
                                  value={p}
                                  onChange={(e) => {
                                    const newPoints = [...note.points];
                                    newPoints[pIdx] = e.target.value;
                                    updateNote(cat.id, nIdx, { points: newPoints });
                                  }}
                                  className="flex-1 bg-white/5 border border-white/5 rounded p-2 text-xs text-slate-400 outline-none"
                                />
                                <button
                                  onClick={() => {
                                    const newPoints = note.points.filter((_, idx) => idx !== pIdx);
                                    updateNote(cat.id, nIdx, { points: newPoints });
                                  }}
                                  className="text-slate-600 hover:text-red-500"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Konteks / Dalil (Optional)</label>
                          <input
                            value={note.context || ""}
                            onChange={(e) => updateNote(cat.id, nIdx, { context: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-slate-400 italic outline-none"
                            placeholder="cth: Surah Al-Baqarah: 1"
                          />
                        </div>
                      </div>
                    ))}
                    {cat.notes.length === 0 && (
                      <div className="py-8 text-center text-slate-500 text-sm italic">
                        Tiada nota dalam kategori ini. Sila tambah nota baru.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= ADMIN PROGRESS =================
function AdminProgress() {
  const [data, setData] = useState(getStoredProgress());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-yellow-400" />
          Progress Student (Read Only Snapshot)
        </h2>
      </div>
      <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong className="text-slate-400 block">Nama Profil</strong>{" "}
            {data.name}
          </div>
          <div>
            <strong className="text-slate-400 block">Level / XP</strong> Lvl{" "}
            {data.level} / {data.xp} XP
          </div>
          <div>
            <strong className="text-slate-400 block">Kad Dihafal</strong>{" "}
            {data.completedFlashcards.length} kad
          </div>
          <div>
            <strong className="text-slate-400 block">Lencana Terkunci</strong>{" "}
            {data.unlockedBadges.length} badge
          </div>
        </div>
        <p className="text-xs text-slate-500 italic mt-4">
          *Progress diselaraskan secara langsung melalui peranti student
          berdasarkan `localStorage`. Anda melihat snapshot semasa.
        </p>
      </div>
    </div>
  );
}
