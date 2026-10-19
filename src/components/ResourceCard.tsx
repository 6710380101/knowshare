import React from 'react';
import {
  Eye,
  Heart,
  FileText,
  Video,
  Globe,
  Presentation,
  BookOpen,
  Folder,
  Calendar,
  Share2,
  ExternalLink,
  Tag
} from 'lucide-react';
import type { Resource } from '../types';
import { EDUCATION_LEVEL_LABELS, MEDIA_TYPE_LABELS } from '../types';

interface ResourceCardProps {
  resource: Resource;
  isFavorited: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onSelect: (resource: Resource) => void;
  onShare: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isFavorited,
  onToggleFavorite,
  onSelect,
  onShare,
}) => {
  const mediaInfo = MEDIA_TYPE_LABELS[resource.mediaType] || MEDIA_TYPE_LABELS.other;

  const renderMediaIcon = () => {
    switch (resource.mediaType) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-600" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-600" />;
      case 'article':
        return <Globe className="w-4 h-4 text-emerald-600" />;
      case 'slides':
        return <Presentation className="w-4 h-4 text-amber-600" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      default:
        return <Folder className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Banner & Badges */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${mediaInfo.color}`}>
            {renderMediaIcon()}
            <span>{mediaInfo.label}</span>
          </span>

          <span className="text-xs text-slate-500 bg-slate-100 font-medium px-2 py-0.5 rounded-md">
            {EDUCATION_LEVEL_LABELS[resource.educationLevel]?.split('(')[0].trim() || 'ทั่วไป'}
          </span>
        </div>

        {/* Category chip */}
        <div className="text-xs font-semibold text-blue-700 tracking-wide mb-1.5 line-clamp-1">
          {resource.category}
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(resource)}
          className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition line-clamp-2 cursor-pointer leading-snug mb-2"
        >
          {resource.title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {resource.description}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                <span>{tag}</span>
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[11px] text-slate-400 px-1 py-0.5">
                +{resource.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2 max-w-[55%]">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
            {resource.authorName ? resource.authorName[0].toUpperCase() : 'A'}
          </div>
          <div className="truncate">
            <span className="font-medium text-slate-700 truncate block">
              {resource.authorName || 'ผู้จัดทำ'}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDate(resource.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Views count */}
          <span className="flex items-center gap-1 text-slate-400" title="ยอดเข้าชม">
            <Eye className="w-3.5 h-3.5" />
            <span>{resource.viewCount || 0}</span>
          </span>

          {/* Favorite toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(resource);
            }}
            className={`flex items-center gap-1 p-1.5 rounded-lg transition cursor-pointer ${
              isFavorited
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'
            }`}
            title={isFavorited ? 'ลบออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
            <span className="text-xs font-semibold">{resource.favoriteCount || 0}</span>
          </button>

          {/* Share button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(resource);
            }}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            title="แชร์ลิงก์สื่อนี้"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
