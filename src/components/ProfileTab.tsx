import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Save, Check, Upload, Trash2, Camera } from 'lucide-react';
import { UserProgress } from '../types';

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(part => part.length > 0);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

interface ProfileTabProps {
  progress: UserProgress;
  onUpdateProgress: (updater: (prev: UserProgress) => UserProgress) => void;
}

export default function ProfileTab({ progress, onUpdateProgress }: ProfileTabProps) {
  const [profileName, setProfileName] = useState(progress.name);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onUpdateProgress(prev => ({
      ...prev,
      name: profileName || 'Excellent Student'
    }));
    setShowSavedFeedback(true);
    setTimeout(() => {
      setShowSavedFeedback(false);
    }, 4000);
  };

  const handleFileProcess = (file: File) => {
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError("Please select image files only (e.g. PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image size exceeds 10MB limit. Please choose a smaller image.");
      return;
    }
    
    // We'll resize the image even if it's small to ensure it's a manageable size for localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
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
          // Convert to a slightly compressed JPEG to save even more space
          const base64Str = canvas.toDataURL('image/jpeg', 0.8);
          
          onUpdateProgress(prev => ({
            ...prev,
            avatarUrl: base64Str
          }));
          
          setImageSuccess(true);
          setTimeout(() => setImageSuccess(false), 4000);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveCustomImage = () => {
    onUpdateProgress(prev => {
      const next = { ...prev };
      delete next.avatarUrl;
      return next;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* HEADER BAR */}
      <div className="bg-white/5 backdrop-blur-xl p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-white transform-gpu backface-hidden">
        <div>
          <h1 className="text-2xl font-black text-white font-display">Manage Learner Profile</h1>
          <p className="text-xs text-slate-300 mt-1">
            Customise your name and upload your profile picture to personalize your learning profile.
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl space-y-6 text-white w-full transform-gpu backface-hidden">
        
        {/* PROFILE PICTURE DRAG & DROP AREA */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block px-0.5">
            Learner Profile Image (Upload File)
          </span>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* CURRENT PREVIEW BOX */}
            <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden border-2 border-teal-500/35 bg-slate-950/60 shadow-xl flex items-center justify-center p-1 group">
              {progress.avatarUrl ? (
                <>
                  <img 
                    src={progress.avatarUrl} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCustomImage}
                    className="absolute inset-0 bg-slate-950/80 text-rose-400 font-extrabold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 cursor-pointer rounded-xl"
                    title="Delete Image"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Image</span>
                  </button>
                </>
              ) : (
                <div className="w-full h-full rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-white/5">
                  <span className="text-3xl font-black text-teal-400 tracking-tighter font-display">
                    {getInitials(progress.name)}
                  </span>
                  <div className="absolute top-1 right-1 opacity-20">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>

            {/* DRAG AND DROP ZONE */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 select-none min-h-[112px] ${
                isDragging 
                  ? 'border-teal-400 bg-teal-500/10 text-white shadow-lg scale-[1.02]' 
                  : 'border-white/10 bg-slate-950/20 hover:border-teal-500/30 hover:bg-slate-950/40 text-slate-300'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                className="hidden"
              />
              <Upload className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
              <div>
                <p className="text-xs font-bold font-display">Drag & Drop here or click to Upload</p>
                <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP files up to 10MB</p>
              </div>
            </div>
          </div>
          
          {progress.avatarUrl && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={handleRemoveCustomImage}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Image
              </button>
            </div>
          )}
        </div>

        {/* NAMA PROFILE INTERFACE */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-xs uppercase tracking-wider font-extrabold text-slate-400 block px-0.5">
            Full Name / Nickname
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={24}
              className="w-full sm:flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-teal-400 focus:bg-white/10 transition-all text-white font-semibold placeholder-slate-400"
            />
            <button
              onClick={handleSaveProfile}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition select-none cursor-pointer hover:brightness-110 shadow-lg shadow-teal-500/10 shrink-0"
            >
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
          
          {/* Saved feedback micro animation */}
          {showSavedFeedback && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-450 font-semibold flex items-center gap-1.5 pt-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Successfully saved your profile information!
            </motion.p>
          )}

          {imageError && (
            <p className="text-xs text-rose-400 font-semibold mt-1 animate-pulse">
              {imageError}
            </p>
          )}

          {imageSuccess && (
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              ✓ Profile picture successfully updated!
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
