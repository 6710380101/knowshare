import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, sendPasswordReset } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getThaiErrorMessage = (code?: string, defaultMsg?: string) => {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      case 'auth/email-already-in-use':
        return 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
      case 'auth/weak-password':
        return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      case 'auth/invalid-email':
        return 'รูปแบบที่อยู่อีเมลไม่ถูกต้อง';
      case 'auth/popup-closed-by-user':
        return 'หน้าต่างเข้าสู่ระบบ Google ถูกปิดก่อนเสร็จสิ้น';
      default:
        return defaultMsg || 'เกิดข้อผิดพลาดในการดำเนินการ กรุณาลองใหม่อีกครั้ง';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับมา!', 'success');
      onClose();
    } catch (err: any) {
      setError(getThaiErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(displayName, email, password);
      showToast('สมัครสมาชิกสำเร็จแล้ว! เราได้ส่งอีเมลยืนยันตัวตนไปยังกล่องจดหมายของคุณ', 'success');
      onClose();
    } catch (err: any) {
      setError(getThaiErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMessage(null);

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setResetSuccessMessage('ส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย');
      showToast('ส่งลิงก์รีเซ็ตรหัสผ่านทางอีเมลแล้ว', 'success');
    } catch (err: any) {
      setError(getThaiErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      showToast('เข้าสู่ระบบด้วย Google สำเร็จแล้ว!', 'success');
      onClose();
    } catch (err: any) {
      setError(getThaiErrorMessage(err?.code, err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-md">
            <BookOpen className="w-6 h-6 text-sky-300" />
          </div>
          <h2 className="text-xl font-bold">
            {mode === 'login' && 'เข้าสู่ระบบคลังปัญญา'}
            {mode === 'register' && 'สร้างบัญชีสมาชิกใหม่'}
            {mode === 'forgot' && 'รีเซ็ตรหัสผ่าน'}
          </h2>
          <p className="text-xs text-sky-200 mt-1">
            {mode === 'login' && 'เข้าถึงและบันทึกคลังความรู้ที่คุณสนใจ'}
            {mode === 'register' && 'ร่วมแบ่งปันและค้นคว้าสื่อการเรียนรู้'}
            {mode === 'forgot' && 'เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50 text-sm font-semibold">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-3 text-center transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`py-3 text-center transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-blue-700 border-b-2 border-blue-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  อีเมล
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    รหัสผ่าน
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ชื่อ - นามสกุล หรือชื่อแสดงผล
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น ครูสมชาย, นักศึกษาแพทย์..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบและรับข้อมูล)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ระบุอีเมลที่ลงทะเบียนไว้
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-sm shadow-sm transition active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setResetSuccessMessage(null);
                }}
                className="w-full text-center text-xs text-slate-600 hover:text-blue-700 font-semibold cursor-pointer py-1"
              >
                ← กลับสู่หน้าเข้าสู่ระบบ
              </button>
            </form>
          )}

          {/* Social Google Login Divider */}
          {mode !== 'forgot' && (
            <>
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs text-slate-400 font-medium">หรือ</span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold flex items-center justify-center gap-2.5 transition active:scale-98 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
