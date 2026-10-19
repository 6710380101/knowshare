import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Flag,
  Users,
  Settings,
  Layers,
  FileCheck,
  Check,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserX,
  Shield,
  Activity,
  ExternalLink
} from 'lucide-react';
import type { ReportItem, UserProfile, Resource, ModerationLog, UserRole } from '../types';
import { REPORT_REASON_LABELS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { reportService } from '../services/reportService';
import { resourceService } from '../services/resourceService';
import { adminService } from '../services/adminService';

interface AdminDashboardProps {
  onSelectResource: (resource: Resource) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectResource }) => {
  const { userProfile, isAdmin, isModerator } = useAuth();
  const { settings, categories, updateSettings, addCategory, removeCategory } = useSettings();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'reports' | 'members' | 'resources' | 'settings' | 'logs'>('reports');

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceDeleteTarget, setResourceDeleteTarget] = useState<Resource | null>(null);

  // Settings edit state
  const [siteTitle, setSiteTitle] = useState(settings.siteTitle || '');
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription || '');
  const [announcement, setAnnouncement] = useState(settings.announcement || '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Load Reports
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถดึงข้อมูลรายงานได้', 'error');
    } finally {
      setLoadingReports(false);
    }
  };

  // Load Users
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถดึงรายชื่อสมาชิกได้', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load Resources (including hidden ones)
  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const data = await resourceService.getResources({ includeHidden: true });
      setResources(data);
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถดึงข้อมูลสื่อได้', 'error');
    } finally {
      setLoadingResources(false);
    }
  };

  // Load Moderation Logs
  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await adminService.getModerationLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'members') loadUsers();
    if (activeTab === 'resources') loadResources();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab]);

  useEffect(() => {
    setSiteTitle(settings.siteTitle || '');
    setSiteDescription(settings.siteDescription || '');
    setAnnouncement(settings.announcement || '');
  }, [settings]);

  // Report Actions
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!userProfile) return;
    try {
      await reportService.updateReportStatus(reportId, status, userProfile);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status, resolvedBy: userProfile.uid } : r))
      );
      showToast(status === 'resolved' ? 'ทำเครื่องหมายว่าจัดการแล้ว' : 'ยกเลิกรายงานนี้แล้ว', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการอัปเดตรายงาน', 'error');
    }
  };

  // Resource Hide/Show toggle
  const handleToggleHideResource = async (res: Resource) => {
    if (!userProfile) return;
    const newStatus = !res.isHidden;
    try {
      await resourceService.updateResource(res.id, { isHidden: newStatus }, userProfile);
      setResources((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, isHidden: newStatus } : r))
      );
      await adminService.logModerationAction({
        action: newStatus ? 'hide_resource' : 'unhide_resource',
        targetType: 'resource',
        targetId: res.id,
        details: `${newStatus ? 'ซ่อน' : 'แสดง'}สื่อ: ${res.title}`,
        performedBy: userProfile.uid,
        performedByEmail: userProfile.email,
      });
      showToast(newStatus ? 'ซ่อนสื่อเรียบร้อยแล้ว' : 'ยกเลิกการซ่อนสื่อแล้ว', 'info');
    } catch (err) {
      showToast('ไม่สามารถเปลี่ยนสถานะสื่อได้', 'error');
    }
  };

  // Delete Resource
  const handleDeleteResource = async (res: Resource) => {
    if (!userProfile) return;
    try {
      await resourceService.deleteResource(res.id);
      setResources((prev) => prev.filter((r) => r.id !== res.id));
      setResourceDeleteTarget(null);
      await adminService.logModerationAction({
        action: 'delete_resource',
        targetType: 'resource',
        targetId: res.id,
        details: `ลบสื่อถาวร: ${res.title}`,
        performedBy: userProfile.uid,
        performedByEmail: userProfile.email,
      });
      showToast('ลบสื่อออกจากระบบเรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบสื่อ', 'error');
    }
  };

  // Change User Role
  const handleChangeRole = async (targetUid: string, role: UserRole) => {
    if (!userProfile || !isAdmin) {
      showToast('เฉพาะผู้ดูแลระบบระดับ Admin เท่านั้นที่สามารถเปลี่ยนบทบาทได้', 'error');
      return;
    }
    try {
      await adminService.updateUserRole(targetUid, role, userProfile);
      setUsers((prev) => prev.map((u) => (u.uid === targetUid ? { ...u, role } : u)));
      showToast(`เปลี่ยนบทบาทสมาชิกเป็น ${role} เรียบร้อยแล้ว`, 'success');
    } catch (err) {
      showToast('ไม่สามารถเปลี่ยนบทบาทสมาชิกได้', 'error');
    }
  };

  // Toggle User Suspension
  const handleToggleSuspend = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    const newSuspended = !targetUser.isSuspended;
    try {
      await adminService.toggleUserSuspension(targetUser.uid, newSuspended, userProfile);
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, isSuspended: newSuspended } : u))
      );
      showToast(
        newSuspended ? `ระงับบัญชี ${targetUser.displayName} เรียบร้อยแล้ว` : `ปลดการระงับบัญชี ${targetUser.displayName} แล้ว`,
        'info'
      );
    } catch (err) {
      showToast('ไม่สามารถเปลี่ยนสถานะผู้ใช้งานได้', 'error');
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !isAdmin) {
      showToast('เฉพาะผู้ดูแลระบบระดับ Admin เท่านั้นที่แก้ไขการตั้งค่าได้', 'error');
      return;
    }
    setSavingSettings(true);
    try {
      await updateSettings(
        {
          siteTitle: siteTitle.trim(),
          siteDescription: siteDescription.trim(),
          announcement: announcement.trim(),
        },
        userProfile.uid
      );
      await adminService.logModerationAction({
        action: 'update_settings',
        targetType: 'settings',
        targetId: 'general',
        details: 'แก้ไขข้อมูลทั่วไปและการประกาศของเว็บไซต์',
        performedBy: userProfile.uid,
        performedByEmail: userProfile.email,
      });
      showToast('บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!userProfile || !newCategoryName.trim()) return;
    try {
      await addCategory(newCategoryName.trim(), userProfile.uid);
      setNewCategoryName('');
      showToast(`เพิ่มหมวดหมู่วิชา "${newCategoryName.trim()}" สำเร็จแล้ว`, 'success');
    } catch (err) {
      showToast('ไม่สามารถเพิ่มหมวดหมู่วิชาได้', 'error');
    }
  };

  // Remove Category
  const handleRemoveCategory = async (cat: string) => {
    if (!userProfile) return;
    if (categories.length <= 1) {
      showToast('ต้องมีหมวดหมู่วิชาอย่างน้อย 1 หมวดหมู่ในระบบ', 'error');
      return;
    }
    try {
      await removeCategory(cat, userProfile.uid);
      showToast(`ลบหมวดหมู่ "${cat}" เรียบร้อยแล้ว`, 'info');
    } catch (err) {
      showToast('ไม่สามารถลบหมวดหมู่ได้', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700/60 text-purple-200 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>ศูนย์ควบคุมผู้ดูแลระบบ (Admin Console)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            การจัดการความปลอดภัยและเนื้อหา
          </h1>
          <p className="text-sm text-purple-200 mt-1">
            ตรวจสอบรายงาน จัดการสมาชิก ดูแลสื่อ และตั้งค่าระบบคลังความรู้
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white/10 text-white border border-white/10">
            สถานะของคุณ: {isAdmin ? 'ผู้ดูแลระบบสูงสุด (Admin)' : 'ผู้ช่วยดูแล (Moderator)'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>รายงานเนื้อหา ({reports.filter((r) => r.status === 'pending').length} รอดำเนินการ)</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'members'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการสมาชิก</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'resources'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>จัดการสื่อทั้งหมด</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ตั้งค่าเว็บไซต์ & หมวดหมู่</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>บันทึกการตรวจสอบ</span>
        </button>
      </div>

      {/* Tab 1: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">คิวตรวจสอบรายงานเนื้อหา</h2>
            <button
              onClick={loadReports}
              className="flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          {loadingReports ? (
            <div className="p-12 text-center text-slate-400">กำลังโหลดรายการรายงาน...</div>
          ) : reports.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="text-base font-bold text-slate-800">ไม่มีรายงานที่รอดำเนินการ</p>
              <p className="text-xs text-slate-400 mt-1">คลังความรู้สะอาดและเป็นไปตามข้อตกลงการใช้งาน</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition ${
                    report.status === 'pending'
                      ? 'border-amber-200 bg-amber-50/20'
                      : report.status === 'resolved'
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-slate-200 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : report.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {report.status === 'pending' && 'รอดำเนินการ'}
                        {report.status === 'resolved' && 'จัดการแล้ว'}
                        {report.status === 'dismissed' && 'ยกเลิกรายงาน'}
                      </span>
                      <span className="text-xs font-semibold text-rose-600">
                        {REPORT_REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(report.createdAt).toLocaleString('th-TH')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    สื่อที่ถูกรายงาน: {report.resourceTitle}
                  </h3>

                  <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-200/60 text-xs sm:text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">รายละเอียดจากผู้รายงาน: </span>
                    {report.details}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      ผู้รายงาน: {report.reporterEmail} ({report.reporterId.substring(0, 6)}...)
                    </span>

                    <div className="flex items-center gap-2">
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id, 'resolved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition cursor-pointer"
                          >
                            ทำเครื่องหมายจัดการแล้ว
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, 'dismissed')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                          >
                            ยกเลิกรายงาน (ไม่ผิดกฎ)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Member Management */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">จัดการสมาชิกและสิทธิ์การใช้งาน</h2>
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="ค้นหาชื่อ, อีเมล, หรือสิทธิ์..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">ผู้ใช้งาน</th>
                    <th className="px-5 py-3.5">อีเมล</th>
                    <th className="px-5 py-3.5">บทบาทปัจจุบัน</th>
                    <th className="px-5 py-3.5">สถานะบัญชี</th>
                    <th className="px-5 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        กำลังโหลดข้อมูลสมาชิก...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        ไม่พบข้อมูลสมาชิก
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <span>{user.displayName || 'ไม่มีชื่อ'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{user.email}</td>
                        <td className="px-5 py-3.5">
                          {isAdmin ? (
                            <select
                              value={user.role || 'member'}
                              onChange={(e) => handleChangeRole(user.uid, e.target.value as UserRole)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold bg-white cursor-pointer focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="member">สมาชิกทั่วไป</option>
                              <option value="moderator">ผู้ช่วยดูแล (Moderator)</option>
                              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                            </select>
                          ) : (
                            <span className="font-semibold text-xs capitalize text-slate-700">
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {user.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                              <UserX className="w-3 h-3" />
                              <span>ระงับการใช้งาน</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              <UserCheck className="w-3 h-3" />
                              <span>ปกติ</span>
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleToggleSuspend(user)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              user.isSuspended
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {user.isSuspended ? 'ปลดระงับ' : 'ระงับบัญชี'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Resource Moderation */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">จัดการสื่อการเรียนรู้ทั้งหมด</h2>
            <button
              onClick={loadResources}
              className="flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingResources ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">ชื่อสื่อ / หมวดหมู่</th>
                    <th className="px-5 py-3.5">ผู้โพสต์</th>
                    <th className="px-5 py-3.5">รูปแบบ</th>
                    <th className="px-5 py-3.5">สถานะ</th>
                    <th className="px-5 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingResources ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        กำลังโหลดข้อมูลสื่อ...
                      </td>
                    </tr>
                  ) : resources.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        ไม่พบข้อมูลสื่อในระบบ
                      </td>
                    </tr>
                  ) : (
                    resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-3.5">
                          <p
                            onClick={() => onSelectResource(res)}
                            className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer line-clamp-1"
                          >
                            {res.title}
                          </p>
                          <span className="text-xs text-blue-600 font-medium">{res.category}</span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          <div>{res.authorName}</div>
                          <div className="text-[10px] text-slate-400">{res.authorEmail}</div>
                        </td>
                        <td className="px-5 py-3.5 uppercase font-semibold text-xs text-slate-500">
                          {res.mediaType}
                        </td>
                        <td className="px-5 py-3.5">
                          {res.isHidden ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              ซ่อนอยู่
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              เผยแพร่อยู่
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleHideResource(res)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title={res.isHidden ? 'ยกเลิกการซ่อน' : 'ซ่อนสื่อ'}
                          >
                            {res.isHidden ? <Eye className="w-4 h-4 text-blue-600" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setResourceDeleteTarget(res)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="ลบสื่อถาวร"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirm Modal */}
          {resourceDeleteTarget && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
                <AlertTriangle className="w-10 h-10 text-rose-600 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">ยืนยันการลบสื่อถาวร?</h3>
                <p className="text-xs text-slate-600 mb-4">
                  สื่อ "{resourceDeleteTarget.title}" จะถูกลบออกจากฐานข้อมูล Cloud Firestore อย่างถาวร และไม่สามารถกู้คืนได้
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setResourceDeleteTarget(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => handleDeleteResource(resourceDeleteTarget)}
                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    ยืนยันลบข้อมูล
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Site Settings & Dynamic Categories */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Site Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-700" />
              <span>ข้อมูลเว็บไซต์และคำประกาศ</span>
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ชื่อเว็บไซต์
                </label>
                <input
                  type="text"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  คำอธิบายเว็บไซต์ / สโลแกน
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  คำประกาศแถบด้านบน (Global Announcement)
                </label>
                <input
                  type="text"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="ข้อความประกาศ เช่น กิจกรรมการประกวดโครงงาน, การปรับปรุงระบบ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingSettings || !isAdmin}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {savingSettings ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าเว็บไซต์'}
              </button>
            </form>
          </div>

          {/* Dynamic Categories Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-700" />
              <span>จัดการหมวดหมู่วิชาความรู้ (ไม่ต้องแก้โค้ด)</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              เพิ่มหรือลบหมวดหมู่วิชาที่จะแสดงในตัวกรองและแบบฟอร์มโพสต์สื่อการเรียนรู้
            </p>

            {/* Add new category */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="ชื่อหมวดหมู่ใหม่ เช่น ดนตรีสากล, เกษตรกรรม..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-1 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่ม</span>
              </button>
            </div>

            {/* Current categories list */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-800"
                >
                  <span>{cat}</span>
                  <button
                    onClick={() => handleRemoveCategory(cat)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                    title="ลบหมวดหมู่นี้"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Moderation Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">ประวัติการปฏิบัติงานของผู้ดูแลระบบ</h2>
            <button
              onClick={loadLogs}
              className="flex items-center gap-1.5 text-xs text-purple-700 hover:text-purple-900 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
              <span>รีเฟรช</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {loadingLogs ? (
              <div className="p-8 text-center text-slate-400">กำลังโหลดบันทึกการตรวจสอบ...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">ยังไม่มีประวัติการปฏิบัติงาน</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-bold text-purple-900 uppercase text-xs mr-2">[{log.action}]</span>
                    <span className="text-slate-800 font-medium">{log.details}</span>
                  </div>
                  <div className="text-slate-400 text-xs flex items-center gap-2">
                    <span>โดย: {log.performedByEmail || log.performedBy}</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
