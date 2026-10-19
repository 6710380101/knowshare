import React, { useState } from 'react';
import { X, Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Resource, ReportReason } from '../types';
import { REPORT_REASON_LABELS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { reportService } from '../services/reportService';

interface ReportModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ resource, isOpen, onClose }) => {
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [reason, setReason] = useState<ReportReason>('inappropriate');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userProfile) {
      setError('กรุณาเข้าสู่ระบบก่อนทำการรายงานเนื้อหา');
      return;
    }

    if (!details.trim()) {
      setError('กรุณาระบุรายละเอียดเพิ่มเติมเพื่อให้ผู้ดูแลระบบตรวจสอบ');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportService.createReport(
        {
          resourceId: resource.id,
          resourceTitle: resource.title,
          reason,
          details: details.trim(),
        },
        userProfile
      );

      showToast('ส่งรายงานต่อผู้ดูแลระบบเรียบร้อยแล้ว ขอบคุณที่ช่วยดูแลชุมชน', 'success');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50 text-rose-900">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-base">รายงานสื่อที่ไม่เหมาะสม</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <span className="text-xs text-slate-400 font-medium">สื่อที่กำลังรายงาน:</span>
            <p className="text-sm font-semibold text-slate-800 line-clamp-1">{resource.title}</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              เหตุผลในการรายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {Object.entries(REPORT_REASON_LABELS).map(([key, label]) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                    reason === key
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="report_reason"
                    value={key}
                    checked={reason === key}
                    onChange={() => setReason(key as ReportReason)}
                    className="accent-rose-600"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              คำอธิบายเพิ่มเติม <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="โปรดระบุปัญหา เช่น ลิงก์ปลายทางใช้งานไม่ได้, เป็นเนื้อหาคัดลอกมาจากที่ใด..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white"
              maxLength={1000}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งรายงาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
