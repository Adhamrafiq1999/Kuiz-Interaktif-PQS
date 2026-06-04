import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Mail, Phone, GraduationCap, ArrowLeft, CheckCircle2, Copy, Check, ExternalLink, HelpCircle, Upload, Trash2, Camera } from "lucide-react";
import { useRef } from "react";
import { getStoredStudents, saveStoredStudents, addActivityLog, getInitials } from "../lib/storage";
import { Student } from "../types";

interface StudentRegisterFormProps {
  onBackToApp?: () => void;
  isPreview?: boolean;
}

export default function StudentRegisterForm({ onBackToApp, isPreview = false }: StudentRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState<number>(1);
  const [completedFlashcardsCount, setCompletedFlashcardsCount] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Status states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const registerUrl = `${window.location.origin}/register`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(registerUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Please fill in your full name";
    if (!email.trim()) {
      newErrors.email = "Please fill in your email address";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!phone.trim()) {
      newErrors.phone = "Please fill in your phone number";
    } else if (phone.length < 8) {
      newErrors.phone = "Phone number must be at least 8 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileProcess = (file: File) => {
    setErrors({ ...errors, avatar: "" });
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, avatar: "Please select image files only." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, avatar: "Image size exceeds the 10MB limit." });
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
          setAvatarUrl(base64Str);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      // In preview mode, show success but do not save to actual live list
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 1000);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const students = getStoredStudents();
      const newStudent: Student = {
        id: "std_" + Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        level,
        avatarUrl, // Include the avatar URL
        completedFlashcardsCount,
        joinedAt: new Date().toISOString().split("T")[0],
      };

      const updated = [...students, newStudent];
      saveStoredStudents(updated);

      // Add elegant activity logs to admin activity tracking
      addActivityLog(
        newStudent.name,
        `Registered via Student Form (Beginner Lvl ${level})`,
        "student"
      );

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setLevel(1);
    setCompletedFlashcardsCount(0);
    setIsSuccess(false);
    setErrors({});
  };

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-4 ${isPreview ? "" : "py-12 bg-[#0f172a]"}`}>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#1e293b]/90 border border-teal-500/20 shadow-2xl rounded-3xl overflow-hidden relative"
      >
        {/* Glow Element */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-purple-500/10 p-6 sm:p-8 border-b border-white/5 relative">
          {!isPreview && onBackToApp && (
            <button 
              onClick={onBackToApp}
              className="absolute top-6 left-6 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Application
            </button>
          )}

          {isPreview && (
            <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Preview Mode
            </div>
          )}

          <div className="text-center pt-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
              Student Registration Form
            </h1>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              Complete your details below to register a student account for the Ulum system.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form 
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Avatar Upload Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 tracking-wide block">Profile Image (Upload File)</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : name.trim() ? (
                        <span className="text-xl font-black text-teal-400 font-display">
                          {getInitials(name)}
                        </span>
                      ) : (
                        <Camera className="w-6 h-6 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all w-fit cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> UPLOAD IMAGE
                      </button>
                      <p className="text-[9px] text-slate-500 leading-none">JPG/PNG format, max 10MB.</p>
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
                    {avatarUrl && (
                      <button 
                        type="button"
                        onClick={() => setAvatarUrl(undefined)}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {errors.avatar && <p className="text-[10px] text-red-400 font-bold">{errors.avatar}</p>}
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 tracking-wide block">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-white/5 border ${errors.name ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-teal-500"} rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder-slate-500`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 tracking-wide block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-white/5 border ${errors.email ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-teal-500"} rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder-slate-500`}
                      placeholder="e.g: student@email.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 tracking-wide block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-white/5 border ${errors.phone ? "border-red-500/50 focus:border-red-500" : "border-white/10 focus:border-teal-500"} rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none transition-colors placeholder-slate-500`}
                      placeholder="e.g: 0123456789"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>

                {/* Level & Initial Flashcards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Student Starting Level</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                      <select
                        value={level}
                        onChange={(e) => setLevel(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                          <option key={l} value={l} className="bg-[#1e293b]">Level {l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 block">Flashcards Already Memorized</label>
                    <input
                      type="number"
                      min="0"
                      value={completedFlashcardsCount}
                      onChange={(e) => setCompletedFlashcardsCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-600"
                      placeholder="e.g: 12"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center bg-teal-500 text-slate-900 font-bold px-6 py-3 rounded-2xl hover:bg-teal-400 disabled:opacity-50 transition active:scale-95 shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Submit Registration 🎉"
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-5"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/25 mx-auto">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Registration Successful!</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    {isPreview 
                      ? "This is a configuration preview of a successful registration! In the live application, this data instantly flows to the admin/teacher panel."
                      : `Thank you! The registration details for student "${name}" have been logged and can be accessed in the Teacher / Admin Dashboard.`}
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2 max-w-sm mx-auto">
                  <button
                    onClick={resetForm}
                    className="w-full bg-teal-500 text-slate-900 py-2.5 rounded-xl font-bold hover:bg-teal-400 transition cursor-pointer"
                  >
                    Register Another Student
                  </button>
                  {!isPreview && onBackToApp && (
                    <button
                      onClick={onBackToApp}
                      className="w-full bg-white/5 text-slate-300 hover:text-white border border-white/10 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition cursor-pointer"
                    >
                      Back to Panel
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Admin Share Pwa Segment (visible on live previews/screens or if isPreview is true) */}
          {isPreview && (
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-teal-400" />
                <span>Share This Form Publicly</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Copy this registration form link below and share it with your students for onboarding!
              </p>
              <div className="flex gap-2">
                <div className="bg-slate-950 px-3.5 py-2.5 rounded-xl text-xs text-teal-400 font-mono truncate border border-white/5 flex-1 select-all">
                  {registerUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition active:scale-95"
                  title="Salin Pautan"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
