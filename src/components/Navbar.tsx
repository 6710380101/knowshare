import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Heart,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  Layers,
  FileCheck,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onOpenPostModal: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuthModal,
  onOpenPostModal,
  favoritesCount,
}) => {
  const { currentUser, userProfile, isAdmin, isModerator, isSuspended, logout, resendVerificationEmail } = useAuth();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleResendVerification = async () => {
    setSendingVerification(true);
    try {
      await resendVerificationEmail();
      showToast('ส่งอีเมลยืนยันตัวตนเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ', 'success');
    } catch (err: any) {
      showToast(err?.message || 'ไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่อีกครั้ง', 'error');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
      setCurrentTab('browse');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการออกจากระบบ', 'error');
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          ผู้ดูแลระบบ (Admin)
        </span>
      );
    }
    if (isModerator) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
          ผู้ช่วยดูแล (Mod)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        สมาชิก
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Global announcement bar if configured */}
      {settings.announcement && (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white text-xs sm:text-sm py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-300 shrink-0" />
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Account suspended notice */}
      {currentUser && isSuspended && (
        <div className="bg-rose-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-300 shrink-0" />
          <span>บัญชีของคุณถูกระงับการใช้งานชั่วคราว ไม่สามารถโพสต์หรือแก้ไขเนื้อหาได้ ติดต่อผู้ดูแลระบบ</span>
        </div>
      )}

      {/* Unverified email warning */}
      {currentUser && !currentUser.emailVerified && !isSuspended && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 flex-wrap">
          <Mail className="w-4 h-4 text-amber-600 shrink-0" />
          <span>อีเมลของคุณยังไม่ได้รับการยืนยัน</span>
          <button
            onClick={handleResendVerification}
            disabled={sendingVerification}
            className="underline font-semibold hover:text-amber-700 text-blue-700 cursor-pointer ml-1"
          >
            {sendingVerification ? 'กำลังส่ง...' : 'คลิกเพื่อส่งอีเมลยืนยันอีกครั้ง'}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('browse')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-900 leading-tight tracking-tight flex items-center gap-1.5">
                <span>{settings.siteTitle || 'คลังปัญญา'}</span>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded-sm">Hub</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">แหล่งแบ่งปันความรู้เพื่อการศึกษา</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('browse')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'browse'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              คลังความรู้
            </button>
            <button
              onClick={() => setCurrentTab('categories')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'categories'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              หมวดหมู่วิชา
            </button>
            {currentUser && (
              <button
                onClick={() => setCurrentTab('favorites')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'favorites'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                <span>รายการโปรด</span>
                {favoritesCount > 0 && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-1.5 py-0.2 rounded-full font-bold">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}
            {currentUser && (
              <button
                onClick={() => setCurrentTab('my-posts')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'my-posts'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>สื่อของฉัน</span>
              </button>
            )}
            {isModerator && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-purple-700 hover:bg-purple-50/80'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>แดชบอร์ดผู้ดูแล</span>
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Post Button */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuthModal();
                } else if (isSuspended) {
                  showToast('บัญชีของคุณถูกระงับ ไม่สามารถแบ่งปันสื่อได้', 'error');
                } else {
                  onOpenPostModal();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white shadow-sm shadow-blue-500/20 active:scale-95 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">แบ่งปันความรู้</span>
              <span className="sm:hidden">โพสต์</span>
            </button>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'Avatar'}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-800 max-w-[100px] truncate hidden md:inline">
                    {userProfile?.displayName || currentUser.displayName || 'ผู้ใช้'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400">เข้าสู่ระบบในชื่อ</p>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {userProfile?.displayName || currentUser.displayName || 'ผู้ใช้งาน'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-2">{getRoleBadge()}</div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setCurrentTab('my-posts');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-slate-500" />
                        <span>สื่อที่ฉันแบ่งปัน</span>
                      </button>
                      <button
                        onClick={() => {
                          setCurrentTab('favorites');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                        <span>รายการโปรด ({favoritesCount})</span>
                      </button>

                      {isModerator && (
                        <button
                          onClick={() => {
                            setCurrentTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-600" />
                          <span>แดชบอร์ดผู้ดูแล</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
            <button
              onClick={() => {
                setCurrentTab('browse');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'browse' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              คลังความรู้ทั้งหมด
            </button>
            <button
              onClick={() => {
                setCurrentTab('categories');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                currentTab === 'categories' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
              }`}
            >
              หมวดหมู่วิชา
            </button>
            {currentUser && (
              <>
                <button
                  onClick={() => {
                    setCurrentTab('favorites');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                    currentTab === 'favorites' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>รายการโปรด</span>
                  </span>
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {favoritesCount}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('my-posts');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    currentTab === 'my-posts' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>สื่อที่ฉันแบ่งปัน</span>
                </button>
              </>
            )}
            {isModerator && (
              <button
                onClick={() => {
                  setCurrentTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-purple-700 bg-purple-50`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>แดชบอร์ดผู้ดูแลระบบ</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
