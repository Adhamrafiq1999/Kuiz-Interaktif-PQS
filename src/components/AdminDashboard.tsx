import { useState, useEffect, Fragment } from "react";
import { motion } from "motion/react";
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
  getStoredActivityLogs, 
  getStoredWeekAccess, 
  saveStoredWeekAccess, 
  getStoredQuizTimerLimit, 
  saveStoredQuizTimerLimit,
  getStoredQuizSingleAttempt,
  saveStoredQuizSingleAttempt,
  getInitials,
  sortWeeks,
} from "../lib/storage";
import { exportStudentsToExcel, exportStudentsToPDF, exportProgressToExcel, exportProgressToPDF } from "../lib/exportUtils";
import { Database, Plus, Trash2, Edit2, ShieldAlert, LayoutDashboard, Users, Activity, TrendingUp, ArrowLeft, Mail, Phone, GraduationCap, Save, X, BookOpen, HelpCircle, FileText, BarChart2, ChevronDown, ChevronUp, CheckCircle2, Share2, Copy, ExternalLink, Lock, Unlock, Calendar, Trophy, User, Image as ImageIcon, Clock, Upload, Camera, Download, Printer, Settings, Menu } from "lucide-react";
import { useRef } from "react";
import { Flashcard, QuizQuestion, NoteCategory, Student } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";
import StudentRegisterForm from "./StudentRegisterForm";
import LeaderboardView from "./LeaderboardView";

// ================= CUSTOM IFRAME-SAFE DIALOGUE & TOAST HELPER COMPONENTS =================
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-400 w-5 h-5 shrink-0" />
            {title}
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-2 text-sm pt-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 font-bold rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 transition active:scale-95"
          >
            Batal
          </button>
          <button 
            onClick={() => { onConfirm(); onCancel(); }} 
            className="px-4 py-2 font-black rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:brightness-110 transition shadow-lg shadow-red-500/20 active:scale-95"
          >
            Ya, Padam
          </button>
        </div>
      </div>
    </div>
  );
}

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
}

function Toast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 px-5 py-3 rounded-xl font-black flex items-center gap-2 shadow-xl shadow-teal-500/30 border border-teal-400/30">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span className="text-xs uppercase tracking-wider">{message}</span>
    </div>
  );
}

const highlightKeywordsAdmin = (text: string, keywords?: string[]) => {
  if (!keywords || keywords.length === 0) return text;
  
  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const filteredKeywords = keywords.map(k => k.trim()).filter(k => k !== "");
  if (filteredKeywords.length === 0) return text;

  const regex = new RegExp(`(${filteredKeywords.map(escapeRegExp).join('|')})`, 'gi');
  
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (filteredKeywords.some(k => k.toLowerCase() === part.toLowerCase())) {
      return <span key={i} className="text-teal-400 font-extrabold bg-teal-400/20 px-1 rounded border border-teal-500/30">{part}</span>;
    }
    return part;
  });
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col selection:bg-teal-500/30 selection:text-teal-200 relative overflow-x-clip">
      
      {/* GLOWING AMBIENT BACKGROUND BLOBS */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500 rounded-full blur-[140px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[35%] h-[35%] bg-pink-500 rounded-full blur-[110px]"></div>
      </div>

      {/* ATAS: NAVBAR UTAMA (FROSTED) - STICKY */}
      <header className="bg-white/10 border-b border-white/10 sticky top-0 z-40 backdrop-blur-xl shadow-lg transform-gpu backface-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
          
          {/* Logo Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-slate-300 hover:text-white md:hidden cursor-pointer"
              title="Menu utama"
            >
              {isMobileMenuOpen ? <X className="w-5.5 h-5.5 text-teal-400" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
            
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 via-cyan-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform font-display">
                UQ
              </div>
              <div>
                <span className="text-md font-extrabold tracking-tight text-white font-display block leading-none">PQS</span>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider leading-none mt-1 block">Genius</span>
              </div>
            </div>
          </div>

          {/* Admin PQS Genius Title di Kanan (Sederhana, Bold, Front Letter Uppercase Only) */}
          <div className="text-sm sm:text-base font-bold text-white tracking-wide">
            Admin PQS Genius
          </div>

        </div>
      </header>

      {/* BODY LAYOUT CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6 items-start relative z-10">
        
        {/* Mobile Hamburger Content */}
        {isMobileMenuOpen && (
          <div className="flex md:hidden flex-col gap-2 w-full mb-4">
            <div className="flex flex-col gap-1.5 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl animate-fade-in">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "dashboard" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === "dashboard" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("students");
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "students" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === "students" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Students</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("flashcards");
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "flashcards" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === "flashcards" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                  <BookOpen className="w-4 h-4 text-slate-100" />
                </div>
                <span className="font-bold text-sm">Flashcards</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("progress");
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "progress" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === "progress" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                  <BarChart2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Student Progress</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("leaderboard");
                  setIsMobileMenuOpen(false);
                }}
                className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "leaderboard" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
              >
                <div className={`p-1.5 rounded-lg ${activeTab === "leaderboard" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Leaderboard</span>
              </button>

              <div className="mt-2 space-y-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    setActiveTab("settings");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 w-full text-left rounded-xl transition flex items-center gap-3 ${activeTab === "settings" ? "bg-teal-500/20 text-teal-300 border border-teal-500/10" : "hover:bg-white/5 text-slate-400 border border-transparent"}`}
                >
                  <div className={`p-1.5 rounded-lg ${activeTab === "settings" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm">System Settings</span>
                </button>

                <Link 
                  to="/" 
                  className="p-3 w-full text-left rounded-xl transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" /> Back to Application
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar (Desktop only) */}
        <aside className="hidden md:flex md:w-64 md:sticky md:top-24 md:h-[calc(100vh-8rem)] bg-white/5 border border-white/10 rounded-2xl p-4 flex-col gap-2 shrink-0 animate-fade-in overflow-y-auto">
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
            onClick={() => setActiveTab("progress")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "progress" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "progress" ? "bg-teal-500 text-slate-950" : "bg-white/10"}`}>
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Student Progress</span>
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`p-3 text-left rounded-xl transition flex items-center gap-3 ${activeTab === "leaderboard" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
          >
            <div className={`p-1.5 rounded-lg ${activeTab === "leaderboard" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
              <Trophy className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm">Leaderboard</span>
          </button>

          <div className="mt-auto space-y-2 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab("settings")}
              className={`p-3 w-full text-left rounded-xl transition flex items-center gap-3 ${activeTab === "settings" ? "bg-teal-500/20 text-teal-300" : "hover:bg-white/5 text-slate-400"}`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === "settings" ? "bg-teal-500 text-slate-900" : "bg-white/10"}`}>
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm">System Settings</span>
            </button>

            <Link 
              to="/" 
              className="p-3 w-full text-left rounded-xl transition flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Application
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-2xl p-6">
          {activeTab === "dashboard" && <AdminMetrics />}
          {activeTab === "students" && <AdminStudents />}
          {activeTab === "flashcards" && <AdminFlashcards />}
          {activeTab === "progress" && <AdminProgress />}
          {activeTab === "leaderboard" && <LeaderboardView isAdmin={true} />}
          {activeTab === "settings" && <AdminSettings />}
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
  const [isSharingForm, setIsSharingForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMsg("Failed: Please select image files only.");
      setShowToast(true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setToastMsg("Failed: Image size exceeds the 10MB limit.");
      setShowToast(true);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64Str = canvas.toDataURL('image/jpeg', 0.8);
          setFormData(prev => ({ ...prev, avatarUrl: base64Str }));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Sync with localStorage dynamically for live submission updates
  useEffect(() => {
    const handleStorage = () => {
      setStudents(getStoredStudents());
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => {
      const latest = getStoredStudents();
      if (JSON.stringify(latest) !== JSON.stringify(students)) {
        setStudents(latest);
      }
    }, 1500);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [students]);

  // Toast & Safe Confirmation state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleSave = () => {
    let updatedStudents;
    const isEdit = !!editingStudent;
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
        avatarUrl: formData.avatarUrl,
        completedFlashcardsCount: formData.completedFlashcardsCount || 0,
      };
      updatedStudents = [...students, newStudent];
    }
    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);
    setToastMsg(isEdit ? "Student profile successfully updated!" : "New student successfully added!");
    setShowToast(true);
    resetForm();
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Student",
      message: `Are you sure you want to delete student profile "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        const updatedStudents = students.filter((s) => s.id !== id);
        setStudents(updatedStudents);
        saveStoredStudents(updatedStudents);
        setToastMsg("Student profile successfully deleted!");
        setShowToast(true);
      },
    });
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Student Management</h2>
          <p className="text-xs text-slate-400 mt-1">Register, update, and manage student information in the system.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportStudentsToExcel(students)}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 px-3.5 py-2.5 font-bold rounded-xl border border-white/10 transition active:scale-95 cursor-pointer text-sm"
            title="Download Excel"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => exportStudentsToPDF(students)}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-300 px-3.5 py-2.5 font-bold rounded-xl border border-white/10 transition active:scale-95 cursor-pointer text-sm"
            title="Print PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSharingForm(true)}
            className="flex items-center justify-center bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 px-3.5 py-2.5 font-bold rounded-xl border border-teal-500/30 transition shadow-sm active:scale-95 cursor-pointer text-sm"
            title="Share/Preview Form"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-teal-500 text-slate-900 px-4 py-2.5 font-bold rounded-xl hover:bg-teal-400 transition active:scale-95 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white/10 border border-teal-500/30 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-teal-400">{editingStudent ? "Update Student" : "Add New Student"}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Upload Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Profile Picture (Upload File)</label>
              <div className="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 w-fit">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex items-center justify-center relative group">
                  {formData.avatarUrl ? (
                    <>
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setFormData({ ...formData, avatarUrl: undefined })}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Camera className="w-6 h-6 text-slate-700" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-black rounded-lg transition-all"
                >
                  UPLOAD
                </button>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">MAX LIMIT: 10MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileProcess(file);
                  }}
                />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Full Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="e.g., Ahmad Ali"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Email</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="e.g., ahmad@gmail.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Phone Number</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-teal-500 outline-none"
                placeholder="e.g., 0123456789"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-2">
            <button onClick={resetForm} className="px-5 py-2 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-teal-500 text-slate-900 hover:bg-teal-400">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Phone No</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-white/5 transition group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-400 text-sm overflow-hidden">
                      {student.avatarUrl ? (
                        <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        getInitials(student.name)
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{student.name}</div>
                      <div className="text-[10px] text-slate-500">ID: {student.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Mail className="w-3 h-3 text-teal-500" /> {student.email}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <Phone className="w-3 h-3 text-cyan-500" /> {student.phone}
                  </div>
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
                      onClick={() => handleDelete(student.id, student.name)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                      title="Delete Student"
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
            No student record found. Please add a new student.
          </div>
        )}
      </div>

      {/* Confirmation and Toast Alerts */}
      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
      <Toast 
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Borang Pelajar Share & Preview Dialog Modal */}
      {isSharingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-teal-500/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <div>
                <h3 className="text-lg font-bold text-white font-display">Share & Preview Student Form</h3>
                <p className="text-xs text-slate-400 mt-1">Test or share the registration link directly with students.</p>
              </div>
              <button
                onClick={() => setIsSharingForm(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Share details */}
            <div className="p-6 bg-slate-950/40 border-b border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1 overflow-hidden flex-1">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block">Public Form Link</span>
                  <p className="text-xs text-teal-300 font-mono select-all truncate max-w-sm sm:max-w-md">
                    {window.location.origin}/register
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/register`);
                      setToastMsg("Link successfully copied!");
                      setShowToast(true);
                    }}
                    className="flex items-center gap-1.5 bg-teal-500 text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-teal-400 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <a
                    href="/register"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open New Tab
                  </a>
                </div>
              </div>
            </div>

            {/* Live Form Preview wrapper */}
            <div className="p-4 sm:p-6 bg-[#0f172a]/50">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-3 block mb-1">Form Preview (Live Preview)</span>
              <StudentRegisterForm isPreview={true} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ================= ADMIN METRICS (Dashboard) =================
function AdminMetrics() {
  const progress = getStoredProgress();
  const flashcards = getStoredFlashcards();
  const quizzes = getStoredQuiz();
  const students = getStoredStudents();
  
  // Real activity logs inside State to support real-time cross-tab & live updates
  const [realActivities, setRealActivities] = useState<any[]>(getStoredActivityLogs());
  
  useEffect(() => {
    const handleStorageChange = () => {
      setRealActivities(getStoredActivityLogs());
    };
    
    // Listen to localStorage updates across different tabs/viewports
    window.addEventListener('storage', handleStorageChange);
    
    // Also run a lightweight background poller every 1.5 seconds in case of single tab changes
    const interval = setInterval(() => {
      const latestLogs = getStoredActivityLogs();
      if (JSON.stringify(latestLogs) !== JSON.stringify(realActivities)) {
        setRealActivities(latestLogs);
      }
    }, 1500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [realActivities]);
  
  const recentActivities = (realActivities.length > 0 ? realActivities : [
    { id: 'dummy_1', student: progress.name || 'Primary Student', action: `Answered questions in the Quiz Module`, time: new Date().toISOString(), type: 'quiz' },
    { id: 'dummy_2', student: progress.name || 'Primary Student', action: `Memorised 5 new Flashcard terms`, time: new Date(Date.now() - 3600000).toISOString(), type: 'flashcard' }
  ]).slice(0, 5);

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      return isoString;
    }
  };

  // Dummy data for performance chart (in a real app this would be historical analytics)
  const performanceData = [
    { name: 'Mon', completion: 12, quizScore: 85 },
    { name: 'Tue', completion: 20, quizScore: 90 },
    { name: 'Wed', completion: 15, quizScore: 80 },
    { name: 'Thu', completion: 30, quizScore: 100 },
    { name: 'Fri', completion: 25, quizScore: 95 },
    { name: 'Sat', completion: 40, quizScore: 100 },
    { name: 'Sun', completion: progress.completedFlashcards.length || 10, quizScore: 95 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-white">Metric Dashboard</h2>
        <p className="text-xs text-slate-400 mt-1">Overview of performance and data for the PQS Genius application system.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-teal-400">
            <Users className="w-5 h-5" />
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-300">Total Active Students</div>
          <div className="text-3xl font-black text-white">{students.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-cyan-400">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Total Flashcards</div>
          <div className="text-3xl font-black text-white">{flashcards.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-purple-400">
            <Activity className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Total Quizzes Available</div>
          <div className="text-3xl font-black text-white">{quizzes.length}</div>
        </div>

        <div className="bg-white/10 border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex justify-between items-start text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-300">Average Level</div>
          <div className="text-3xl font-black text-white">4</div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 font-display">Student Performance Analysis (Weekly)</h3>
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
              <Bar dataKey="completion" name="Terms Memorised" fill="#2dd4bf" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="quizScore" name="Average Quiz Score (%)" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>



      {/* RECENT ACTIVITIES */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-display">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <strong className="text-sm font-bold text-white block">{activity.student}</strong>
                  <span className="text-[10px] text-slate-400 font-medium">{formatTime(activity.time)}</span>
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
  const [data, setData] = useState<Flashcard[]>(() => {
    const raw = getStoredFlashcards();
    // Normalize properties to ensure everyone has a week and subtopic
    return raw.map(c => ({
      ...c,
      week: c.week || "Minggu 1",
      subtopic: c.subtopic || "Pengenalan"
    }));
  });

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>(() => {
    const raw = getStoredQuiz();
    return raw.map(q => ({
      ...q,
      week: q.week || "Minggu 1",
      subtopic: q.subtopic || "Pengenalan"
    }));
  });

  const [expandedQuizzes, setExpandedQuizzes] = useState<string[]>([]);
  const [expandedSubtopics, setExpandedSubtopics] = useState<string[]>([]);
  const [subtopicActiveTab, setSubtopicActiveTab] = useState<Record<string, "flashcards" | "quizzes">>({});
  const [weeks, setWeeks] = useState<string[]>([]);
  const [subtopicsByWeek, setSubtopicsByWeek] = useState<Record<string, string[]>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [newWeekInput, setNewWeekInput] = useState("");
  const [newSubtopicName, setNewSubtopicName] = useState<Record<string, string>>({});
  const [isAddWeekModalOpen, setIsAddWeekModalOpen] = useState(false);
  const [newWeekModalInput, setNewWeekModalInput] = useState("");
  const [addSubtopicWeekTarget, setAddSubtopicWeekTarget] = useState<string | null>(null);
  const [newSubtopicModalInput, setNewSubtopicModalInput] = useState("");

  const [quizSingleAttempt, setQuizSingleAttempt] = useState(getStoredQuizSingleAttempt());

  const handleToggleSingleAttempt = () => {
    const newVal = !quizSingleAttempt;
    setQuizSingleAttempt(newVal);
    saveStoredQuizSingleAttempt(newVal);
  };

  const [weekAccess, setWeekAccess] = useState<Record<string, boolean>>(() => getStoredWeekAccess());

  const toggleWeekAccess = (w: string) => {
    const isCurrentlyUnlocked = weekAccess[w] !== false;
    const updatedAccess = {
      ...weekAccess,
      [w]: !isCurrentlyUnlocked
    };
    setWeekAccess(updatedAccess);
    saveStoredWeekAccess(updatedAccess);
    setToastMsg(`Access for "${w}" has been ${!isCurrentlyUnlocked ? 'OPENED' : 'CLOSED'}!`);
    setShowToast(true);
  };

  // Toast & Safe Confirmation state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Extract weeks and subtopics from raw flashcards & current states
  useEffect(() => {
    // Unique weeks present in data
    const derivedWeeks = Array.from(new Set(data.map((f) => f.week || "Minggu 1"))) as string[];
    if (derivedWeeks.length === 0) derivedWeeks.push("Minggu 1");

    setWeeks((prev) => {
      const merged = Array.from(new Set([...prev, ...derivedWeeks]));
      return merged.length > 0 ? sortWeeks(merged) : ["Minggu 1"];
    });

    setSubtopicsByWeek((prev) => {
      const nextMapping = { ...prev };
      
      // Seed categories for all weeks
      derivedWeeks.forEach(w => {
        const subListForWeek = Array.from(
          new Set(data.filter((f) => f.week === w).map((f) => f.subtopic || "Pengenalan"))
        );
        if (subListForWeek.length === 0) subListForWeek.push("Pengenalan");

        const existing = nextMapping[w] || [];
        nextMapping[w] = Array.from(new Set([...existing, ...subListForWeek]));
      });

      return nextMapping;
    });

    // Automatically expand the first week
    if (expandedWeeks.length === 0 && derivedWeeks.length > 0) {
      setExpandedWeeks([derivedWeeks[0]]);
    }
  }, [data]);

  // Sync state changes back to storage immediately so no data is lost when switching tabs
  const syncToStorage = (updatedData: Flashcard[]) => {
    setData(updatedData);
    saveStoredFlashcards(updatedData);
  };

  const addWeek = (weekName?: string) => {
    const trimmed = (weekName || newWeekInput).trim();
    if (!trimmed) return;
    if (weeks.includes(trimmed)) {
      setToastMsg("This week already exists!");
      setShowToast(true);
      return;
    }
    setWeeks(sortWeeks([...weeks, trimmed]));
    setSubtopicsByWeek((prev) => ({
      ...prev,
      [trimmed]: ["Pengenalan"]
    }));
    
    // Add an initial placeholder card for the new week so it persists
    const newCard: Flashcard = {
      id: "f_" + Date.now(),
      term: "New Term",
      definition: "",
      category: "all",
      example: "",
      week: trimmed,
      subtopic: "Pengenalan"
    };
    syncToStorage([newCard, ...data]);

    setNewWeekInput("");
    setExpandedWeeks([...expandedWeeks, trimmed]);
    setToastMsg(`"${trimmed}" successfully added!`);
    setShowToast(true);
  };

  const deleteWeek = (weekToDelete: string) => {
    const cardsInWeek = data.filter((f) => f.week === weekToDelete);
    const msg = cardsInWeek.length > 0 
      ? `There are ${cardsInWeek.length} cards in ${weekToDelete}. Are you sure you want to permanently delete ${weekToDelete} and all cards & subtopics in it?`
      : `Are you sure you want to delete ${weekToDelete}?`;
    
    setConfirmState({
      isOpen: true,
      title: "Delete Week",
      message: msg,
      onConfirm: () => {
        const newData = data.filter((f) => f.week !== weekToDelete);
        syncToStorage(newData);
        setWeeks(weeks.filter((w) => w !== weekToDelete));
        setExpandedWeeks(expandedWeeks.filter((w) => w !== weekToDelete));
        setToastMsg(`"${weekToDelete}" successfully deleted!`);
        setShowToast(true);
      }
    });
  };

  const addSubtopic = (week: string, subtopicName?: string) => {
    const name = (subtopicName || newSubtopicName[week] || "").trim();
    if (!name) return;
    const currentSubs = subtopicsByWeek[week] || [];
    if (currentSubs.includes(name)) {
      setToastMsg("This subtopic already exists!");
      setShowToast(true);
      return;
    }

    setSubtopicsByWeek((prev) => ({
      ...prev,
      [week]: [...currentSubs, name]
    }));
    setNewSubtopicName((prev) => ({
      ...prev,
      [week]: ""
    }));

    // Add a placeholder card for this subtopic so it stays in storage
    const newCard: Flashcard = {
      id: "f_" + Date.now(),
      term: "New Term",
      definition: "Please enter definition here",
      category: "all",
      example: "",
      week,
      subtopic: name
    };
    syncToStorage([newCard, ...data]);

    setToastMsg(`Subtopic "${name}" added to ${week}!`);
    setShowToast(true);
  };

  const handleUpdateSubtopicName = (week: string, oldSubtopic: string, newSubtopic: string) => {
    const trimmed = newSubtopic.trim();
    if (!trimmed || trimmed === oldSubtopic) return;
    
    // Check if new name already exists in this week
    const currentSubs = subtopicsByWeek[week] || [];
    if (currentSubs.includes(trimmed)) {
      setToastMsg("This subtopic name already exists!");
      setShowToast(true);
      return;
    }

    // Update Flashcards
    const newData = data.map(f => (f.week === week && f.subtopic === oldSubtopic) ? { ...f, subtopic: trimmed } : f);
    syncToStorage(newData);

    // Update Quizzes
    const updatedQuizzes = quizzes.map(q => (q.week === week && q.subtopic === oldSubtopic) ? { ...q, subtopic: trimmed } : q);
    setQuizzes(updatedQuizzes);
    saveStoredQuiz(updatedQuizzes);

    // Update local subtopic list state
    setSubtopicsByWeek(prev => ({
      ...prev,
      [week]: (prev[week] || []).map(s => s === oldSubtopic ? trimmed : s)
    }));

    setToastMsg(`Subtopic updated to "${trimmed}"!`);
    setShowToast(true);
  };

  const deleteSubtopic = (week: string, subtopicToDelete: string) => {
    const cardsInSub = data.filter((f) => f.week === week && f.subtopic === subtopicToDelete);
    const msg = cardsInSub.length > 0
      ? `There are ${cardsInSub.length} cards in subtopic "${subtopicToDelete}". Are you sure you want to permanently delete this subtopic along with all cards & quizzes inside it?`
      : `Are you sure you want to delete subtopic "${subtopicToDelete}"?`;

    setConfirmState({
      isOpen: true,
      title: "Delete Subtopic",
      message: msg,
      onConfirm: () => {
        const newData = data.filter((f) => !(f.week === week && f.subtopic === subtopicToDelete));
        syncToStorage(newData);

        const updatedQuizzes = quizzes.filter(q => !(q.week === week && q.subtopic === subtopicToDelete));
        setQuizzes(updatedQuizzes);
        saveStoredQuiz(updatedQuizzes);

        setSubtopicsByWeek((prev) => ({
          ...prev,
          [week]: (prev[week] || []).filter((s) => s !== subtopicToDelete)
        }));
        setToastMsg(`Subtopic "${subtopicToDelete}" successfully deleted!`);
        setShowToast(true);
      }
    });
  };

  const addQuestionToSubtopic = (week: string, subtopic: string) => {
    const newQuestion: QuizQuestion = {
      id: "q_" + Date.now() + Math.floor(Math.random() * 100),
      question: "New Question",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      explanation: "",
      category: "all",
      week,
      subtopic,
    };
    const updatedQuizzes = [newQuestion, ...quizzes];
    setQuizzes(updatedQuizzes);
    saveStoredQuiz(updatedQuizzes);
    setToastMsg("New quiz question added!");
    setShowToast(true);
  };

  const handleUpdateQuizQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    const updatedQuizzes = quizzes.map(q => q.id === id ? { ...q, ...updates } : q);
    setQuizzes(updatedQuizzes);
    saveStoredQuiz(updatedQuizzes);
  };

  const handleDeleteQuizQuestion = (id: string, questionText: string) => {
    const shortText = questionText.length > 30 ? questionText.slice(0, 30) + "..." : questionText;
    setConfirmState({
      isOpen: true,
      title: "Delete Quiz Question",
      message: `Are you sure you want to delete question "${shortText || 'this'}"? This action cannot be undone.`,
      onConfirm: () => {
        const updatedQuizzes = quizzes.filter(q => q.id !== id);
        setQuizzes(updatedQuizzes);
        saveStoredQuiz(updatedQuizzes);
        setToastMsg("Quiz question successfully deleted!");
        setShowToast(true);
      }
    });
  };

  const addCardToSubtopic = (week: string, subtopic: string) => {
    const newCard: Flashcard = {
      id: "f_" + Date.now() + Math.floor(Math.random() * 1000),
      term: "New Term",
      definition: "",
      category: "all",
      example: "",
      week,
      subtopic
    };
    const newData = [newCard, ...data];
    syncToStorage(newData);
    setToastMsg("New flashcard added!");
    setShowToast(true);
  };

  const handleUpdateCard = (id: string, updates: Partial<Flashcard>) => {
    const newData = data.map((f) => (f.id === id ? { ...f, ...updates } : f));
    syncToStorage(newData);
  };

  const handleDeleteCard = (id: string, term: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Flashcard",
      message: `Are you sure you want to delete flashcard "${term || 'this'}"? This action cannot be undone.`,
      onConfirm: () => {
        const newData = data.filter((f) => f.id !== id);
        syncToStorage(newData);
        setToastMsg("Flashcard successfully deleted!");
        setShowToast(true);
      }
    });
  };

  const handleSave = () => {
    saveStoredFlashcards(data);
    saveStoredQuiz(quizzes);
    setToastMsg("All changes to week order, flashcard & quiz saved!");
    setShowToast(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">Flashcard Weeks</h2>
          <p className="text-xs text-slate-400 mt-1">Arrangement of terms by Week & Subtopic.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Add Week Control via Modal popup */}
          <button
            type="button"
            onClick={() => {
              setNewWeekModalInput("");
              setIsAddWeekModalOpen(true);
            }}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" /> Add Week
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-4 py-2.5 font-black rounded-xl hover:brightness-110 transition-all shadow-lg shadow-teal-500/20 active:scale-95 cursor-pointer text-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Weeks Accordion */}
      <div className="space-y-4">
        {weeks.map((week) => {
          const isExpanded = expandedWeeks.includes(week);
          const weekSubtopics = subtopicsByWeek[week] || [];
          const weekCards = data.filter((f) => f.week === week);

          return (
            <div key={week} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
              {/* Accordion Header */}
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isExpanded ? 'bg-white/5 border-b border-white/10' : ''}`}
                onClick={() => {
                  setExpandedWeeks(prev =>
                    prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
                  );
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-teal-500 text-slate-900' : 'bg-white/10 text-slate-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{week}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{weekSubtopics.length} Subtopics • {weekCards.length} Flashcards</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {/* Tambah Subtopik Button Triggering Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      setAddSubtopicWeekTarget(week);
                      setNewSubtopicModalInput("");
                    }}
                    className="flex items-center gap-1.5 bg-[#1e293b] hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold transition active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-teal-400" /> Subtopic
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteWeek(week);
                    }}
                    className="p-2 text-slate-500 hover:text-red-400 transition cursor-pointer"
                    title="Delete Week"
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
                <div className="p-4 space-y-6 bg-black/20">
                  {weekSubtopics.map((sub) => {
                    const subtopicCards = weekCards.filter((c) => c.subtopic === sub);
                    const subKey = `${week}_${sub}`;
                    const isSubExpanded = expandedSubtopics.includes(subKey);

                    return (
                      <div key={sub} className={`rounded-2xl border transition-all ${isSubExpanded ? 'bg-slate-950/60 border-teal-500/20' : 'bg-slate-950/30 border-white/5 hover:border-white/10'}`}>
                        {/* Subtopic Accordion Header */}
                        <div 
                          onClick={() => setExpandedSubtopics(prev => prev.includes(subKey) ? prev.filter(k => k !== subKey) : [...prev, subKey])}
                          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none ${isSubExpanded ? 'border-b border-white/5' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-1.5 rounded-lg ${isSubExpanded ? 'bg-teal-500 text-slate-900' : 'bg-white/10 text-slate-400'}`}>
                                <BookOpen className="w-3.5 h-3.5" />
                              </div>
                              <div className="relative flex-1 max-w-sm group/sub" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="text"
                                  defaultValue={sub}
                                  onBlur={(e) => handleUpdateSubtopicName(week, sub, e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleUpdateSubtopicName(week, sub, (e.target as HTMLInputElement).value)}
                                  className="w-full bg-teal-500/5 border border-teal-500/10 px-3 py-1.5 rounded-lg text-teal-300 font-bold text-sm focus:border-teal-500/40 focus:bg-teal-500/10 outline-none transition truncate"
                                  title="Click to edit subtopic name"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-full font-sans font-bold uppercase tracking-wider">
                                {subtopicCards.length} Cards
                              </span>
                              <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full font-sans font-bold uppercase tracking-wider">
                                {quizzes.filter(q => q.week === week && q.subtopic === sub).length} Quizzes
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-end shrink-0">
                            <div className={`transition-transform duration-200 ${isSubExpanded ? 'rotate-180 text-teal-400' : 'text-slate-500'}`}>
                              <ChevronDown className="w-5 h-5" />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSubtopic(week, sub);
                              }}
                              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                              title="Delete Subtopic"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtopic Content */}
                        {isSubExpanded && (() => {
                          const subKey = `${week}_${sub}`;
                          const subtopicActiveTabVal = subtopicActiveTab[subKey] || "flashcards";
                          return (
                            <div className="p-4 space-y-6">
                              {/* Subtopic Inner Tabs Selector */}
                              <div className="flex border-b border-white/5 pb-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSubtopicActiveTab(prev => ({ ...prev, [subKey]: "flashcards" }))}
                                  className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 select-none cursor-pointer border ${
                                    subtopicActiveTabVal === "flashcards"
                                      ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                                  <span>Flashcard Collection ({subtopicCards.length})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSubtopicActiveTab(prev => ({ ...prev, [subKey]: "quizzes" }))}
                                  className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 select-none cursor-pointer border ${
                                    subtopicActiveTabVal === "quizzes"
                                      ? "bg-teal-500/15 border-teal-500/30 text-teal-300"
                                      : "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                                  <span>Quiz Questions ({quizzes.filter(q => q.week === week && q.subtopic === sub).length})</span>
                                </button>
                              </div>

                              {subtopicActiveTabVal === "flashcards" ? (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center bg-white/2 p-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Flashcard Collection</span>
                                    <button
                                      type="button"
                                      onClick={() => addCardToSubtopic(week, sub)}
                                      className="text-[11px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer border border-teal-500/20 shrink-0"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Add Flashcard
                                    </button>
                                  </div>

                                  {/* Cards List */}
                                  <div className="space-y-4">
                                    {subtopicCards.map((card, cardIndex) => (
                                      <div key={card.id} className="bg-[#121824]/40 border border-white/10 rounded-2xl p-6 space-y-6 group hover:border-teal-500/30 transition relative">
                                        {/* Card Side Accent */}
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500/20 group-hover:bg-teal-500/50 transition-all rounded-l-2xl" />
                                        
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-black text-xs font-sans shadow-inner">
                                              {cardIndex + 1}
                                            </span>
                                            <div className="flex flex-col">
                                              <span className="text-xs font-bold text-teal-400 font-sans uppercase tracking-wider">Flashcard {String(cardIndex + 1).padStart(2, '0')}</span>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleDeleteCard(card.id, card.term)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-500/20"
                                            title="Delete Card"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans ml-1">Term / Concept</label>
                                            <input
                                              value={card.term}
                                              onChange={(e) => handleUpdateCard(card.id, { term: e.target.value })}
                                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-sm text-slate-100 font-bold focus:border-teal-500 outline-none transition placeholder-slate-700 shadow-sm"
                                              placeholder="Enter term..."
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans ml-1">Example</label>
                                            <input
                                              value={card.example}
                                              onChange={(e) => handleUpdateCard(card.id, { example: e.target.value })}
                                              className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-slate-400 outline-none italic placeholder-slate-700 focus:border-slate-500 transition shadow-sm"
                                              placeholder="Example sentence or context..."
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans ml-1">Definition / Explanation</label>
                                            <textarea
                                              value={card.definition}
                                              onChange={(e) => handleUpdateCard(card.id, { definition: e.target.value })}
                                              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-slate-200 h-28 resize-none outline-none focus:border-teal-500/30 transition placeholder-slate-700 shadow-sm"
                                              placeholder="Explain the meaning of this term clearly..."
                                            />
                                          </div>

                                          <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 font-sans ml-1">
                                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block animate-pulse"></span>
                                              Highlight Keywords (Separated by commas)
                                            </label>
                                            <input
                                              type="text"
                                              value={card.keywords ? card.keywords.join(", ") : ""}
                                              onChange={(e) => {
                                                const kw = e.target.value.split(",").map(k => k.trim());
                                                handleUpdateCard(card.id, { keywords: e.target.value ? kw : [] });
                                              }}
                                              placeholder="Example: Wahyu, Al-Quran, Nabi (Students will see these words highlighted)"
                                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:border-teal-500 outline-none transition placeholder-slate-600 shadow-sm"
                                            />
                                            
                                            {card.definition && card.keywords && card.keywords.filter(k => k.trim() !== "").length > 0 && (
                                              <div className="bg-teal-950/20 border border-teal-500/20 rounded-xl p-3.5 mt-2">
                                                <span className="text-[9px] text-teal-300 font-bold uppercase tracking-widest block mb-1">Highlight Preview (Student View):</span>
                                                <div className="text-xs text-teal-100 leading-relaxed font-semibold">
                                                  {highlightKeywordsAdmin(card.definition, card.keywords)}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                    {subtopicCards.length === 0 && (
                                      <div className="py-6 text-center text-slate-500 text-xs italic">
                                        No cards in this subtopic. Click "+ Add Flashcard" above to start.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center bg-white/2 p-2 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider font-sans px-2">Quiz Questions List</span>
                                    <button
                                      type="button"
                                      onClick={() => addQuestionToSubtopic(week, sub)}
                                      className="text-[11px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer border border-teal-500/20 shrink-0"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Add Quiz Question
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    {quizzes.filter(q => q.week === week && q.subtopic === sub).map((q, qIdx) => (
                                      <div key={q.id} className="bg-[#121824]/40 border border-white/10 rounded-xl p-4 space-y-3 relative group hover:border-teal-500/25 transition">
                                        <div className="flex gap-3">
                                          <div className="flex-1 space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Question {qIdx + 1}</label>
                                            <textarea
                                              value={q.question}
                                              onChange={(e) => handleUpdateQuizQuestion(q.id, { question: e.target.value })}
                                              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-slate-100 focus:border-teal-500 outline-none transition"
                                              placeholder="Enter question..."
                                              rows={2}
                                            />
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteQuizQuestion(q.id, q.question)}
                                            className="mt-6 p-2 text-slate-500 hover:text-red-400 transition cursor-pointer"
                                            title="Delete Question"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className={`flex items-center gap-2 p-2 rounded-lg border transition ${q.correctAnswer === oIdx ? 'bg-teal-500/10 border-teal-500/30 text-teal-300 font-bold' : 'bg-black/30 border-white/5 text-slate-300'}`}>
                                              <input
                                                type="radio"
                                                name={`correct_${q.id}`}
                                                checked={q.correctAnswer === oIdx}
                                                onChange={() => handleUpdateQuizQuestion(q.id, { correctAnswer: oIdx })}
                                                className="w-4 h-4 accent-teal-500 cursor-pointer text-white border-white/20"
                                              />
                                              <input
                                                value={opt}
                                                onChange={(e) => {
                                                  const newOpts = [...q.options];
                                                  newOpts[oIdx] = e.target.value;
                                                  handleUpdateQuizQuestion(q.id, { options: newOpts });
                                                }}
                                                className="bg-transparent border-none p-1 text-xs flex-1 outline-none text-white focus:bg-white/5 font-semibold"
                                                placeholder={`Option ${oIdx + 1}`}
                                              />
                                            </div>
                                          ))}
                                        </div>

                                        <div className="space-y-1">
                                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Answer Explanation</label>
                                          <textarea
                                            value={q.explanation}
                                            onChange={(e) => handleUpdateQuizQuestion(q.id, { explanation: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-slate-400 italic outline-none focus:border-teal-500/30 transition resize-none"
                                            placeholder="Explain why this option is correct..."
                                            rows={2}
                                          />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-white/10 pt-3 mt-1">
                                          <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans shrink-0">Time Limit:</span>
                                            <input
                                              type="number"
                                              min="5"
                                              max="180"
                                              placeholder="Default"
                                              value={q.timerLimit || ""}
                                              onChange={(e) => {
                                                const val = e.target.value === "" ? undefined : Math.max(5, parseInt(e.target.value) || 5);
                                                handleUpdateQuizQuestion(q.id, { timerLimit: val });
                                              }}
                                              className="w-20 bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-center text-xs font-bold text-white focus:border-teal-500 outline-none transition"
                                            />
                                            <span className="text-[10px] text-slate-500 font-sans">seconds (default: {getStoredQuizTimerLimit()}s)</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    {quizzes.filter(q => q.week === week && q.subtopic === sub).length === 0 && (
                                      <div className="py-6 text-center text-slate-500 text-xs italic">
                                        No quiz questions in this subtopic. Click "Add Quiz Question" to start.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                  </div>
                );
              })}

                  {weekSubtopics.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-sm italic">
                      No subtopics in this week yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Tambah Minggu */}
      {isAddWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAddWeekModalOpen(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-lg font-display">Add New Week</h3>
              </div>
              <button 
                onClick={() => setIsAddWeekModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Week Name</p>
              <input
                type="text"
                autoFocus
                value={newWeekModalInput}
                onChange={(e) => setNewWeekModalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addWeek(newWeekModalInput);
                    setIsAddWeekModalOpen(false);
                  }
                }}
                placeholder="e.g. Week 3"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition font-bold"
              />
              <p className="text-[10px] text-slate-500 font-semibold">New week will be created with one "Pengenalan" subtopic.</p>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddWeekModalOpen(false)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addWeek(newWeekModalInput);
                  setIsAddWeekModalOpen(false);
                }}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-5 py-2 rounded-xl text-xs font-black transition hover:brightness-110 cursor-pointer"
              >
                Add Week
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Subtopik */}
      {addSubtopicWeekTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setAddSubtopicWeekTarget(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-lg font-display">Add Subtopic</h3>
              </div>
              <button 
                onClick={() => setAddSubtopicWeekTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 bg-teal-500/10 text-teal-300 px-3 py-2 rounded-xl border border-teal-500/10 text-xs font-bold">
                Adding subtopic for <strong className="text-white">{addSubtopicWeekTarget}</strong>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Subtopic Name</p>
              <input
                type="text"
                autoFocus
                value={newSubtopicModalInput}
                onChange={(e) => setNewSubtopicModalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addSubtopic(addSubtopicWeekTarget, newSubtopicModalInput);
                    setAddSubtopicWeekTarget(null);
                  }
                }}
                placeholder="e.g. Introduction to Faith"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition font-bold"
              />
              <p className="text-[10px] text-slate-500 font-semibold">Subtopic will be created with one placeholder term "New Term". Update the term after the subtopic is created.</p>
            </div>
            <div className="p-6 pt-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddSubtopicWeekTarget(null)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  addSubtopic(addSubtopicWeekTarget, newSubtopicModalInput);
                  setAddSubtopicWeekTarget(null);
                }}
                className="bg-gradient-to-r from-teal-500 to-emerald-555 text-slate-900 px-5 py-2 rounded-xl text-xs font-black transition hover:brightness-110 cursor-pointer"
              >
                Add Subtopic
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
      <Toast 
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

// ================= ADMIN QUIZ =================
function AdminQuiz() {
  const [data, setData] = useState<QuizQuestion[]>(getStoredQuiz());
  const [themes, setThemes] = useState<string[]>([]);
  const [expandedThemes, setExpandedThemes] = useState<string[]>([]);
  const [newThemeName, setNewThemeName] = useState("");
  const [quizTimerLimit, setQuizTimerLimit] = useState<number>(() => getStoredQuizTimerLimit());

  // Toast & Safe Confirmation state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    // Unique categories/modules from quiz data
    const existingThemes = Array.from(new Set(data.map((q) => q.category)));
    setThemes((prev) => {
      const combined = Array.from(new Set([...prev, ...existingThemes]));
      return combined.length > 0 ? combined : ["Umum"];
    });
  }, [data]);

  const syncToStorage = (updatedData: QuizQuestion[]) => {
    setData(updatedData);
    saveStoredQuiz(updatedData);
  };

  const toggleTheme = (theme: string) => {
    setExpandedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const addTheme = () => {
    const trimmed = newThemeName.trim();
    if (!trimmed) return;
    if (themes.includes(trimmed)) {
      setToastMsg("Modul ini sudah wujud!");
      setShowToast(true);
      return;
    }
    setThemes([...themes, trimmed]);
    setNewThemeName("");
    setExpandedThemes([...expandedThemes, trimmed]);
    setToastMsg(`Modul "${trimmed}" berjaya ditambah!`);
    setShowToast(true);
  };

  const deleteTheme = (themeToDelete: string) => {
    const questionsInTheme = data.filter((q) => q.category === themeToDelete);
    const msg = questionsInTheme.length > 0 
      ? `Terdapat ${questionsInTheme.length} soalan dalam modul ini. Adakah anda pasti mahu memadam modul "${themeToDelete}" dan semua soalan di dalamnya secara kekal?`
      : `Adakah anda pasti mahu memadam modul "${themeToDelete}"?`;
    
    setConfirmState({
      isOpen: true,
      title: "Padam Modul Kuiz",
      message: msg,
      onConfirm: () => {
        const newData = data.filter((q) => q.category !== themeToDelete);
        syncToStorage(newData);
        setThemes(themes.filter((t) => t !== themeToDelete));
        setExpandedThemes(expandedThemes.filter((t) => t !== themeToDelete));
        setToastMsg(`Modul "${themeToDelete}" berjaya dipadam!`);
        setShowToast(true);
      }
    });
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
    syncToStorage(newData);
    setToastMsg("Soalan baru berjaya ditambah!");
    setShowToast(true);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    const newData = data.map((q) => (q.id === id ? { ...q, ...updates } : q));
    syncToStorage(newData);
  };

  const handleDeleteQuestion = (id: string, questionText: string) => {
    const shortText = questionText.length > 30 ? questionText.slice(0, 30) + "..." : questionText;
    setConfirmState({
      isOpen: true,
      title: "Padam Soalan Kuiz",
      message: `Adakah anda pasti mahu memadam soalan "${shortText || 'ini'}"? Tindakan ini tidak boleh diundur.`,
      onConfirm: () => {
        const newData = data.filter((q) => q.id !== id);
        syncToStorage(newData);
        setToastMsg("Soalan kuiz berjaya dipadam!");
        setShowToast(true);
      }
    });
  };

  const handleSave = () => {
    saveStoredQuiz(data);
    saveStoredQuizTimerLimit(quizTimerLimit);
    setToastMsg("Semua soalan & tetapan masa kuiz telah berjaya disimpan!");
    setShowToast(true);
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
                            onClick={() => handleDeleteQuestion(q.id, q.question)}
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
                                className="bg-transparent border-none p-1 text-sm flex-1 text-slate-300 outline-none text-white focus:bg-white/5"
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

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-white/5 pt-3 mt-1">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono shrink-0">Batas Masa Menjawab:</span>
                            <input
                              type="number"
                              min="5"
                              max="180"
                              placeholder="Bawaan"
                              value={q.timerLimit || ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? undefined : Math.max(5, parseInt(e.target.value) || 5);
                                handleUpdateQuestion(q.id, { timerLimit: val });
                              }}
                              className="w-20 bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1 text-center text-xs font-bold text-white focus:border-teal-500 outline-none transition"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">saat (bawaan: {quizTimerLimit}s)</span>
                          </div>
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

      <ConfirmDialog 
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />
      <Toast 
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

// ================= ADMIN PROGRESS ======================
function AdminProgress() {
  const [students, setStudents] = useState<Student[]>(() => getStoredStudents());
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});

  const formatWeekName = (weekStr: string) => {
    return weekStr.replace("Minggu", "Week");
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return "-";
    if (status === "Sempurna") return "Perfect";
    if (status === "Lulus") return "Pass";
    if (status === "Gagal") return "Fail";
    return status;
  };
  
  // Calculate how many weeks to show in the table dynamically
  const allWeeksFound = students.flatMap(s => [
    ...Object.keys(s.flashcardsByWeek || {}).map(k => parseInt(k.replace("Minggu ", "").replace("Week ", "")) || 0),
    ...(s.quizAttempts || []).map(a => parseInt(a.week.replace("Minggu ", "").replace("Week ", "")) || 0)
  ]);
  const maxW = Math.max(4, ...allWeeksFound);
  const displayWeeks = Array.from({ length: maxW }, (_, i) => i + 1);

  // Dynamic Subtopics from System Data
  const allQuizzes = getStoredQuiz().map(q => ({
    ...q,
    subtopic: q.subtopic || "Pengenalan"
  }));
  const displaySubtopics = Array.from(new Set(allQuizzes.map(q => q.subtopic))).filter(Boolean).sort();

  // Local week/subtopic helper for adding entry
  const [newFlashWeek, setNewFlashWeek] = useState("Minggu 1");
  const [newFlashCount, setNewFlashCount] = useState(0);

  // Sync with localStorage dynamically
  useEffect(() => {
    const handleStorage = () => {
      setStudents(getStoredStudents());
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => {
      const latest = getStoredStudents();
      if (JSON.stringify(latest) !== JSON.stringify(students)) {
        setStudents(latest);
      }
    }, 1500);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [students]);

  // Toast & Safe Confirmation state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      level: 1,
      completedFlashcardsCount: 0,
      avatarUrl: "",
      flashcardsByWeek: { "Minggu 1": 0 },
      quizAttempts: []
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(JSON.parse(JSON.stringify(student))); // deep copy
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Student Progress",
      message: `Are you sure you want to permanently delete student progress for "${name}"?`,
      onConfirm: () => {
        const updated = students.filter((s) => s.id !== id);
        setStudents(updated);
        saveStoredStudents(updated);
        setToastMsg(`Student progress for "${name}" successfully deleted!`);
        setShowToast(true);
      }
    });
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      setToastMsg("Please enter student name!");
      setShowToast(true);
      return;
    }

    // Recalculate total flashcards completed count based on weekly map
    const fMap = formData.flashcardsByWeek || {};
    const totalFlashCount = Object.values(fMap).reduce<number>((sum, val: any) => sum + (Number(val) || 0), 0);

    let updatedStudents: Student[];
    const isEdit = !!editingStudent;

    if (isEdit && editingStudent) {
      updatedStudents = students.map((s) =>
        s.id === editingStudent.id
          ? ({ ...s, ...formData, completedFlashcardsCount: totalFlashCount } as Student)
          : s
      );
    } else {
      const newStudent: Student = {
        id: "std_" + Date.now(),
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        level: formData.level || 1,
        joinedAt: new Date().toISOString().split("T")[0],
        completedFlashcardsCount: totalFlashCount,
        avatarUrl: formData.avatarUrl || "",
        flashcardsByWeek: fMap,
        quizAttempts: formData.quizAttempts || []
      };
      updatedStudents = [...students, newStudent];
    }

    setStudents(updatedStudents);
    saveStoredStudents(updatedStudents);
    setToastMsg(isEdit ? "Student progress successfully updated!" : "Student & progress successfully registered!");
    setShowToast(true);
    setIsFormOpen(false);
    setEditingStudent(null);
    setFormData({});
  };

  // Helper functions for inline week edit
  const addWeekFlashcard = () => {
    if (!newFlashWeek.trim()) return;
    const normalizedKey = newFlashWeek.trim().replace(/Week/i, "Minggu");
    const currentMap = formData.flashcardsByWeek || {};
    const updatedMap = {
      ...currentMap,
      [normalizedKey]: Number(newFlashCount) || 0
    };
    setFormData({
      ...formData,
      flashcardsByWeek: updatedMap
    });
    setNewFlashWeek("Minggu " + (Object.keys(updatedMap).length + 1));
    setNewFlashCount(0);
  };

  const removeWeekFlashcard = (weekKey: string) => {
    const currentMap = { ...(formData.flashcardsByWeek || {}) };
    delete currentMap[weekKey];
    setFormData({
      ...formData,
      flashcardsByWeek: currentMap
    });
  };

  // Helper function for adding blank quiz attempts on student form
  const addEmptyQuizAttempt = () => {
    const currentAttempts = formData.quizAttempts ? [...formData.quizAttempts] : [];
    const nowStr = new Date().toISOString().slice(0, 16).replace("T", " ");
    
    currentAttempts.push({
      id: "att_" + Date.now() + Math.floor(Math.random() * 1000),
      week: "Minggu 1",
      subtopic: "Nuzul Al-Quran",
      score: 100,
      status: "Sempurna",
      date: nowStr
    });

    setFormData({
      ...formData,
      quizAttempts: currentAttempts
    });
  };

  const updateQuizAttempt = (attId: string, updates: any) => {
    const currentAttempts = formData.quizAttempts ? [...formData.quizAttempts] : [];
    const updated = currentAttempts.map((att) => {
      if (att.id === attId) {
        const nextAtt = { ...att, ...updates };
        // Auto-calculate status from score if score was updated
        if ('score' in updates) {
          const s = Number(updates.score);
          if (s === 100) nextAtt.status = 'Sempurna';
          else if (s >= 80) nextAtt.status = 'Lulus';
          else nextAtt.status = 'Gagal';
        }
        return nextAtt;
      }
      return att;
    });
    setFormData({
      ...formData,
      quizAttempts: updated
    });
  };

  const removeQuizAttempt = (attId: string) => {
    const currentAttempts = formData.quizAttempts ? [...formData.quizAttempts] : [];
    const filtered = currentAttempts.filter((att) => att.id !== attId);
    setFormData({
      ...formData,
      quizAttempts: filtered
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <TrendingUp className="text-teal-400 w-6 h-6" />
            Student Progress
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review and monitor the progress of each student in memorizing terms and quizzes.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportProgressToExcel(students, displayWeeks, displaySubtopics)}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 px-3.5 py-2.5 font-bold rounded-xl border border-white/10 transition active:scale-95 cursor-pointer text-xs"
            title="Download Excel"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => exportProgressToPDF(students, displayWeeks, displaySubtopics)}
            className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 px-3.5 py-2.5 font-bold rounded-xl border border-white/10 transition active:scale-95 cursor-pointer text-xs"
            title="Print PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-900 px-5 py-2.5 font-bold rounded-xl hover:brightness-110 transition active:scale-95 cursor-pointer text-sm animate-pulse-slow font-sans uppercase tracking-wider"
          >
            +Add
          </button>
        </div>
      </div>

      {/* FORM DIALOG/MODAL DRAWER */}
      {isFormOpen && (
        <div className="bg-white/10 border border-teal-500/30 rounded-2xl p-6 space-y-6 relative shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="font-extrabold text-lg text-teal-400 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-400" />
              {editingStudent ? `Update Progress: ${editingStudent.name}` : "Register New Student Progress"}
            </h3>
            <button 
              onClick={() => { setIsFormOpen(false); setEditingStudent(null); }} 
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Profile Info */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-black text-slate-400 tracking-wider uppercase border-b border-white/5 pb-2">1. Profile Information</h4>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Student Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500 transition text-white"
                  placeholder="Student full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Profile Picture (URL)</label>
                <input
                  type="text"
                  value={formData.avatarUrl || ""}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-teal-500 transition text-slate-300 font-mono"
                  placeholder="https://images.unsplash.com/..."
                />
                {formData.avatarUrl && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 bg-black/30 rounded-lg">
                    <img 
                      src={formData.avatarUrl} 
                      alt="Preview" 
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="text-[10px] text-emerald-400 font-mono">Valid link detected ✓</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Level (Lvl)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.level || 1}
                    onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500 transition text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500 transition text-white"
                    placeholder="E.g. 011-xxx"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-sm outline-none focus:border-teal-500 transition text-white"
                  placeholder="student@gmail.com"
                />
              </div>
            </div>

            {/* COLUMN 2: Tab Hafalan Flashcard */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="text-xs font-black text-slate-400 tracking-wider uppercase border-b border-white/5 pb-2">2. Flashcards Memorized by Week</h4>
              
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {Object.entries(formData.flashcardsByWeek || {}).map(([weekKey, count]) => (
                  <div key={weekKey} className="flex gap-2 items-center bg-black/20 p-2 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-slate-300 w-20">{formatWeekName(weekKey)}</span>
                    <input
                      type="number"
                      min={0}
                      value={count}
                      onChange={(e) => {
                        const updated = { ...(formData.flashcardsByWeek || {}) };
                        updated[weekKey] = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, flashcardsByWeek: updated });
                      }}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg p-1.5 text-xs text-center outline-none focus:border-teal-500 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => removeWeekFlashcard(weekKey)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete data for this week"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {Object.keys(formData.flashcardsByWeek || {}).length === 0 && (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No weekly flashcard progress.</p>
                )}
              </div>

              {/* Add Week Progress inline form */}
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 space-y-2 mt-4">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">+ ADD NEW WEEK RECORD</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formatWeekName(newFlashWeek)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewFlashWeek(val.replace(/Week/i, "Minggu"));
                    }}
                    placeholder="e.g. Week 3"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                  />
                  <input
                    type="number"
                    min={0}
                    value={newFlashCount}
                    onChange={(e) => setNewFlashCount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-center text-white"
                  />
                  <button
                    type="button"
                    onClick={addWeekFlashcard}
                    className="bg-teal-500 text-slate-900 px-3 py-1 font-black text-xs rounded-lg hover:bg-teal-400 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Tab Cubaan Kuiz */}
            <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5 md:col-span-2 lg:col-span-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-xs font-black text-slate-400 tracking-wider uppercase">3. Quiz Scores & Attempts</h4>
                <button
                  type="button"
                  onClick={addEmptyQuizAttempt}
                  className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-bold text-xs px-3 py-1.5 rounded-lg border border-teal-500/30 flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Quiz Attempt
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse divide-y divide-white/5">
                  <thead>
                    <tr className="bg-black/30">
                      <th className="p-2 text-slate-400 font-bold uppercase tracking-wider">Week</th>
                      <th className="p-2 text-slate-400 font-bold uppercase tracking-wider">Subtopic / Category</th>
                      <th className="p-2 text-slate-400 font-bold uppercase tracking-wider text-center w-24">Score (%)</th>
                      <th className="p-2 text-slate-400 font-bold uppercase tracking-wider text-center w-32">Status</th>
                      <th className="p-2 text-slate-400 font-bold uppercase tracking-wider">Date Completed</th>
                      <th className="p-2 text-center w-12">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/10">
                    {(formData.quizAttempts || []).map((att) => (
                      <tr key={att.id} className="hover:bg-white/1 flex-none">
                        <td className="p-2">
                          <input 
                            value={formatWeekName(att.week)}
                            onChange={(e) => updateQuizAttempt(att.id, { week: e.target.value.replace(/Week/i, "Minggu") })}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-slate-200 outline-none focus:border-teal-500/50"
                            placeholder="Week 1"
                          />
                        </td>
                        <td className="p-2">
                          <input 
                            value={att.subtopic}
                            onChange={(e) => updateQuizAttempt(att.id, { subtopic: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-slate-200 outline-none focus:border-teal-500/50"
                            placeholder="Nuzul Al-Quran"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input 
                            type="number"
                            min={0}
                            max={100}
                            value={att.score}
                            onChange={(e) => updateQuizAttempt(att.id, { score: parseInt(e.target.value) || 0 })}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 w-16 text-center text-teal-400 font-bold font-mono outline-none focus:border-teal-500/50"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <select
                            value={att.status}
                            onChange={(e) => updateQuizAttempt(att.id, { status: e.target.value })}
                            className="bg-slate-900 border border-white/10 rounded px-2 py-1 w-full text-slate-200 focus:border-teal-500/50 outline-none"
                          >
                            <option value="Sempurna">Perfect</option>
                            <option value="Lulus">Pass</option>
                            <option value="Gagal">Fail</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <input 
                            type="text"
                            value={att.date}
                            onChange={(e) => updateQuizAttempt(att.id, { date: e.target.value })}
                            className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-slate-400 font-mono text-[11px] focus:border-teal-500/50 outline-none"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeQuizAttempt(att.id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(formData.quizAttempts || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                          No quiz attempts recorded for this student. Click "+ Quiz Attempt" to record score.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button 
              type="button"
              onClick={() => { setIsFormOpen(false); setEditingStudent(null); }} 
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSave} 
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 text-slate-900 px-6 py-2.5 font-black rounded-xl transition active:scale-95 text-sm cursor-pointer"
            >
              <Save className="w-4 h-4" /> SAVE RECORD
            </button>
          </div>
        </div>
      )}

      {/* DETAILED STUDENT PROGRESS LONG TABLE */}
      <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl shadow-xl">
        <table className="w-full text-left border-collapse table-auto">
          <thead className="bg-slate-900/60 sticky top-0 z-10 border-b border-white/10">
            <tr className="font-bold text-[10px] text-slate-400 uppercase tracking-tighter">
              <th rowSpan={2} className="p-4 min-w-[200px] border-r border-white/5">Student Profile</th>
              <th rowSpan={2} className="p-4 text-center border-r border-white/5 w-20">Level</th>
              <th colSpan={displayWeeks.length + 1} className="p-2 text-center border-r border-white/5 bg-teal-500/5 text-teal-400 text-[12px]">Weekly Flashcard Progress</th>
              <th colSpan={displaySubtopics.length * 2} className="p-2 text-center border-r border-white/5 bg-cyan-500/5 text-cyan-400 text-[11px]">Subtopic Quiz Performance</th>
              <th rowSpan={2} className="p-4 border-r border-white/5 min-w-[120px]">Quiz Date</th>
              <th rowSpan={2} className="p-4 text-center min-w-[100px]">Actions</th>
            </tr>
            <tr className="font-bold text-[9px] text-slate-500 uppercase tracking-wider border-b border-white/10">
              {displayWeeks.map(w => (
                <th key={`f_h_${w}`} className="p-2 text-center border-r border-white/5 min-w-[50px] text-[#00d5be]">W{w}</th>
              ))}
              <th className="p-2 text-center border-r border-white/5 bg-teal-500/10 text-teal-300 font-black">Total</th>
              {displaySubtopics.map(sub => (
                <Fragment key={`q_h_${sub}`}>
                  <th className="p-2 text-center border-r border-white/5 bg-cyan-500/5 w-16 text-[#00d3f3]">Score</th>
                  <th className="p-2 text-center border-r border-white/5 bg-cyan-500/5 w-20 text-[#00d3f3]">Status</th>
                </Fragment>
              ))}
            </tr>
            <tr className="bg-slate-800/40 border-b border-white/5">
              <th colSpan={displayWeeks.length + 3} className="border-r border-white/5"></th>
              {displaySubtopics.map((sub, index) => (
                <th key={`q_sub_${sub}`} colSpan={2} className={`p-1 px-2 text-center border-r border-white/5 truncate max-w-[150px] ${index === 0 ? "text-[10px] text-white" : "text-[8px] text-slate-400"}`}>
                  {sub}
                </th>
              ))}
              <th colSpan={2}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => {
              const fMap = student.flashcardsByWeek || {};
              const totalCards = Object.values(fMap).reduce<number>((sum, val: any) => sum + (Number(val) || 0), 0);
              
              const getAttemptForWeek = (wNum: number) => {
                const filtered = (student.quizAttempts || []).filter(a => {
                  const num = parseInt(a.week.replace("Minggu ", "").replace("Week ", "")) || 0;
                  return num === wNum;
                });
                return filtered.length > 0 ? filtered[filtered.length - 1] : null;
              };

              return (
                <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Profile */}
                  <td className="p-4 border-r border-white/5">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-black text-xs border border-teal-500/20">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-white text-[13px] tracking-tight truncate max-w-[140px] uppercase">{student.name}</div>
                        <div className="text-[9px] text-slate-500 font-mono">ID: {student.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="p-4 text-center border-r border-white/5">
                    <span className="text-xs font-black text-teal-300 font-mono">L{student.level}</span>
                  </td>

                  {/* Flashcards M1...Mn */}
                  {displayWeeks.map(w => (
                    <td key={`f_c_${w}`} className="p-2 text-center border-r border-white/5">
                      <span className={`text-xs font-bold font-mono ${fMap[`Minggu ${w}`] ? "text-white" : "text-slate-600"}`}>
                        {fMap[`Minggu ${w}`] || 0}
                      </span>
                    </td>
                  ))}

                  {/* Total Flashcards */}
                  <td className="p-2 text-center border-r border-white/5 bg-teal-500/10 text-teal-300 font-bold">
                    {totalCards || student.completedFlashcardsCount || 0}
                  </td>

                  {/* Quizzes by Subtopic */}
                  {displaySubtopics.map(sub => {
                    const attempts = (student.quizAttempts || []).filter(a => {
                      const normalizedSub = a.subtopic || "Pengenalan";
                      // If the original subtopic was one of the categories, we also want to group it into Pengenalan to fix legacy data.
                      const finalSub = ["Nuzul Al-Quran", "Makkiyyah & Madaniyyah", "Nasikh & Mansukh", "I'jaz Al-Quran", "Tafsir & Ta'wil"].includes(normalizedSub) ? "Pengenalan" : normalizedSub;
                      return finalSub === sub;
                    });
                    const att = attempts.length > 0 ? attempts[attempts.length - 1] : null;
                    
                    let statusColor = "text-slate-600";
                    if (att) {
                      if (att.status === "Sempurna") statusColor = "text-emerald-400";
                      else if (att.status === "Lulus") statusColor = "text-teal-400";
                      else statusColor = "text-rose-400";
                    }

                    return (
                      <Fragment key={`q_c_${sub}`}>
                        <td className="p-2 text-center border-r border-white/5 font-bold font-mono text-[11px] text-teal-400">
                          {att ? `${att.score}%` : "-"}
                        </td>
                        <td className={`p-2 text-center border-r border-white/5 font-black text-[9px] uppercase tracking-tighter ${statusColor}`}>
                          {getStatusLabel(att?.status)}
                        </td>
                      </Fragment>
                    );
                  })}

                  {/* Quiz Date */}
                  <td className="p-4 border-r border-white/5 text-[10px] text-slate-500 font-mono">
                    <div className={`flex flex-col gap-0.5 ${(!student.quizAttempts || student.quizAttempts.length === 0) ? "text-white" : ""}`}>
                      {(student.quizAttempts || []).slice(-3).map((a, idx) => (
                        <div key={idx} className={`whitespace-nowrap tabular-nums ${idx === 0 ? "text-white" : ""}`}>
                          {a.week.replace("Minggu ", "W").replace("Week ", "W")}: {a.date.split(" ")[0]}
                        </div>
                      ))}
                      {(!student.quizAttempts || student.quizAttempts.length === 0) && "-"}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 text-slate-400 hover:text-teal-300 bg-white/5 rounded-lg hover:bg-teal-500/10 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id, student.name)}
                        className="p-1.5 text-slate-400 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr>
                <td colSpan={5 + displayWeeks.length * 4} className="p-12 text-center text-slate-500 italic">
                  No student records found. Click "Add Student Progress" to start.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-950/60 border-t border-white/10 font-bold text-[10px] uppercase">
            <tr>
              <td colSpan={2} className="p-4 text-slate-400 border-r border-white/5 text-[12px]">GRAND TOTAL</td>
              {displayWeeks.map(w => {
                 const weekTotal = students.reduce((sum, s) => sum + (s.flashcardsByWeek?.[`Minggu ${w}`] || 0), 0);
                 return (
                   <td key={`f_f_${w}`} className="p-2 text-center border-r border-white/5 text-teal-400 font-mono text-[14px]">
                     {weekTotal}
                   </td>
                 );
              })}
              <td className="p-2 text-center border-r border-white/5 text-teal-300 bg-teal-500/10 text-[14px]">
                {students.reduce((sum, s) => {
                  const fMap = s.flashcardsByWeek || {};
                  return sum + Object.values(fMap).reduce<number>((inner, v: any) => inner + (Number(v) || 0), 0);
                }, 0)}
              </td>
              <td colSpan={displaySubtopics.length * 2 + 2} className="p-4 text-white text-right italic font-normal normal-case tracking-wide text-[12px]">
                Student performance data updated in real-time according to system storage.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={() => {
          confirmState.onConfirm();
          setConfirmState(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
      />

      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

// ================= ADMIN SETTINGS =================
function AdminSettings() {
  const [quizSingleAttempt, setQuizSingleAttempt] = useState(getStoredQuizSingleAttempt());
  const [quizTimerLimit, setQuizTimerLimit] = useState<number>(() => getStoredQuizTimerLimit());
  const [weekAccess, setWeekAccess] = useState<Record<string, boolean>>(() => getStoredWeekAccess());
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const flashcards = getStoredFlashcards();
  const weeks = sortWeeks(Array.from(new Set(flashcards.map((f) => f.week || "Minggu 1"))));

  const handleToggleSingleAttempt = () => {
    const newVal = !quizSingleAttempt;
    setQuizSingleAttempt(newVal);
    saveStoredQuizSingleAttempt(newVal);
    setToastMsg(`Sekatan pengulangan kuiz telah ${newVal ? "DIAKTIFKAN" : "DIMATIKAN"}!`);
    setShowToast(true);
  };

  const handleSaveTimer = () => {
    saveStoredQuizTimerLimit(quizTimerLimit);
    setToastMsg("Masa timer kuiz telah dikemaskini!");
    setShowToast(true);
  };

  const toggleWeekAccess = (w: string) => {
    const isCurrentlyUnlocked = weekAccess[w] !== false;
    const updatedAccess = {
      ...weekAccess,
      [w]: !isCurrentlyUnlocked
    };
    setWeekAccess(updatedAccess);
    saveStoredWeekAccess(updatedAccess);
    setToastMsg(`Akses untuk "${w}" telah ${!isCurrentlyUnlocked ? 'DIBUKA' : 'DITUTUP'}!`);
    setShowToast(true);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="border-b border-white/5 pb-6">
        <h2 className="text-2xl font-black font-display text-white italic tracking-tighter">Setting & Konfigurasi</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">Urus sekatan aplikasi dan tetapan sistem utama</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* QUIZ ATTEMPT SETTING */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Lock className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Sekatan Pengulangan Kuiz</h3>
              <p className="text-xs text-slate-400">Halang pelajar dari menjawab kuiz lebih dari sekali.</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-white/5">
            <span className="text-sm font-bold text-slate-300">Status Sekatan</span>
            <button
              onClick={handleToggleSingleAttempt}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${
                quizSingleAttempt 
                  ? "bg-teal-500 text-slate-900 shadow-lg shadow-teal-500/20" 
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              {quizSingleAttempt ? (
                <> <Lock className="w-4 h-4" /> SEKALI SAHAJA (AKTIF) </>
              ) : (
                <> <Unlock className="w-4 h-4" /> TIADA HAD (MATI) </>
              )}
            </button>
          </div>
        </section>

        {/* QUIZ TIMER SETTING */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Masa Timer Kuiz</h3>
              <p className="text-xs text-slate-400">Tetapkan had masa menjawab bagi setiap satu soalan.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
            <div className="flex-1">
              <input
                type="number"
                min="5"
                max="300"
                value={quizTimerLimit}
                onChange={(e) => setQuizTimerLimit(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-full sm:w-32 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-black text-white focus:border-teal-500 outline-none transition"
              />
              <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">Saat / Soalan</span>
            </div>
            <button
              onClick={handleSaveTimer}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold border border-white/10 transition active:scale-95"
            >
              <Save className="w-4 h-4" /> KEMASKINI MASA
            </button>
          </div>
        </section>

        {/* WEEK ACCESS CONTROL */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Calendar className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kawalan Akses Mingguan</h3>
              <p className="text-xs text-slate-400">Buka atau tutup akses silibus ikut minggu untuk semua pelajar.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {weeks.length > 0 ? weeks.map((w) => {
              const isUnlocked = weekAccess[w] !== false;
              return (
                <div key={w} className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all ${
                  isUnlocked ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' : 'bg-amber-500/5 border-amber-500/20 opacity-80'
                }`}>
                  <span className={`font-black text-xs uppercase tracking-tighter ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>{w}</span>
                  <button
                    onClick={() => toggleWeekAccess(w)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                      isUnlocked 
                        ? 'bg-emerald-500 text-slate-900 border border-emerald-500/20 shadow-sm shadow-emerald-500/10' 
                        : 'bg-amber-500 text-slate-900 border border-amber-500/20 shadow-sm shadow-amber-500/10'
                    }`}
                  >
                    {isUnlocked ? (
                      <><Unlock className="w-3.5 h-3.5 text-slate-900" /> DIBUKA</>
                    ) : (
                      <><Lock className="w-3.5 h-3.5 text-slate-900" /> DITUTUP</>
                    )}
                  </button>
                </div>
              );
            }) : (
              <div className="col-span-3 py-8 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-2xl border border-white/5">
                Tiada minggu yang didaftarkan. Sila tambah minggu di tab Flashcards.
              </div>
            )}
          </div>
        </section>
      </div>

      <Toast 
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
