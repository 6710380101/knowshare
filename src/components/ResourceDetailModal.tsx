import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  Flag,
  Edit,
  Trash2,
  ExternalLink,
  Download,
  Calendar,
  Eye,
  ChevronRight,
  BookOpen,
  FileText,
  Video,
  Globe,
  Presentation,
  Folder,
  Tag,
  AlertTriangle
} from 'lucide-react';
import type { Resource } from '../types';
import { EDUCATION_LEVEL_LABELS, MEDIA_TYPE_LABELS } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ResourceDetailModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
  onOpenReport: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  isOpen,
  onClose,
  isFavorited,
  onToggleFavorite,
  onEdit,
  onDelete,
  onOpenReport,
}) => {
  const { currentUser, isModerator, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!isOpen || !resource) return null;

  const canManage =
    currentUser && (currentUser.uid === resource.authorId || isModerator || isAdmin);

  const mediaInfo = MEDIA_TYPE_LABELS[resource.mediaType] || MEDIA_TYPE_LABELS.other;

  // Extract YouTube ID if applicable
  const getYouTubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const youtubeEmbedUrl = resource.mediaType === 'video' ? getYouTubeEmbedUrl(resource.externalUrl) : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('คัดลอกลิงก์สื่อการเรียนรู้นี้แล้ว', 'success');
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Breadcrumbs & Close */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap mr-2">
            <span className="hover:text-blue-600 font-medium cursor-pointer" onClick={onClose}>
              คลังความรู้
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-blue-700">{resource.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {resource.title}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Hidden status notice for moderators */}
          {resource.isHidden && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-800 text-xs sm:text-sm font-medium">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>สื่อนี้ถูกซ่อนจากการมองเห็นสาธารณะโดยผู้ดูแลระบบ</span>
            </div>
          )}

          {/* Badges & Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${mediaInfo.color}`}>
              {resource.mediaType === 'pdf' && <FileText className="w-4 h-4" />}
              {resource.mediaType === 'video' && <Video className="w-4 h-4" />}
              {resource.mediaType === 'article' && <Globe className="w-4 h-4" />}
              {resource.mediaType === 'slides' && <Presentation className="w-4 h-4" />}
              {resource.mediaType === 'course' && <BookOpen className="w-4 h-4" />}
              {resource.mediaType === 'other' && <Folder className="w-4 h-4" />}
              <span>{mediaInfo.label}</span>
            </span>

            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200">
              {EDUCATION_LEVEL_LABELS[resource.educationLevel] || 'ระดับทั่วไป'}
            </span>

            <span className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-lg border border-blue-200">
              {resource.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {resource.title}
          </h1>

          {/* Author Card & Dates */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {resource.authorName ? resource.authorName[0].toUpperCase() : 'A'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{resource.authorName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(resource.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1" title="ยอดเข้าชม">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">{resource.viewCount || 0}</span>
              </span>
              <span className="flex items-center gap-1" title="บันทึกโปรด">
                <Heart className={`w-4 h-4 ${isFavorited ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`} />
                <span className="font-semibold text-slate-700">{resource.favoriteCount || 0}</span>
              </span>
            </div>
          </div>

          {/* Summary / Description */}
          {resource.description && (
            <div className="bg-sky-50/70 border-l-4 border-sky-500 p-4 rounded-r-xl">
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {resource.description}
              </p>
            </div>
          )}

          {/* YouTube Video Player Embed if applicable */}
          {youtubeEmbedUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black">
              <iframe
                src={youtubeEmbedUrl}
                title={resource.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* External Link or Attachment Card */}
          {(resource.externalUrl || resource.attachmentUrl) && (
            <div className="flex flex-wrap gap-3">
              {resource.externalUrl && (
                <a
                  href={resource.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm font-semibold transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดแหล่งข้อมูลต้นฉบับ / ลิงก์ภายนอก</span>
                </a>
              )}
              {resource.attachmentUrl && (
                <a
                  href={resource.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 text-sm font-semibold transition"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดไฟล์แนบ / เอกสาร</span>
                </a>
              )}
            </div>
          )}

          {/* Detailed Content / Markdown Notes */}
          {resource.content && (
            <div className="border-t border-slate-200 pt-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                เนื้อหาและรายละเอียดเพิ่มเติม
              </h3>
              <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                {resource.content}
              </div>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">คำสำคัญ:</span>
              {resource.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:px-7 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isFavorited ? 'บันทึกแล้ว' : 'บันทึกเป็นรายการโปรด'}</span>
            </button>

            {/* Share button */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">แชร์</span>
            </button>

            {/* Report button */}
            {currentUser && currentUser.uid !== resource.authorId && (
              <button
                onClick={() => onOpenReport(resource)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>รายงาน</span>
              </button>
            )}
          </div>

          {/* Manage controls if author or admin */}
          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(resource)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>แก้ไข</span>
              </button>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ลบ</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-xl px-2 py-1">
                  <span className="text-xs text-rose-700 font-medium">ยืนยันลบ?</span>
                  <button
                    onClick={() => onDelete(resource)}
                    className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 cursor-pointer"
                  >
                    ลบจริง
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-2 py-1 text-slate-600 text-xs hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
