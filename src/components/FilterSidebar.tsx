import React from 'react';
import {
  Filter,
  RotateCcw,
  BookOpen,
  GraduationCap,
  Layers,
  ArrowUpDown,
  FileText,
  Video,
  Globe,
  Presentation,
  Folder
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { EDUCATION_LEVEL_LABELS, MEDIA_TYPE_LABELS, type EducationLevel, type MediaType } from '../types';

interface FilterSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedEducationLevel: string;
  setSelectedEducationLevel: (lvl: string) => void;
  selectedMediaType: string;
  setSelectedMediaType: (type: string) => void;
  sortBy: 'latest' | 'popular' | 'favorites';
  setSortBy: (sort: 'latest' | 'popular' | 'favorites') => void;
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedEducationLevel,
  setSelectedEducationLevel,
  selectedMediaType,
  setSelectedMediaType,
  sortBy,
  setSortBy,
  onReset,
}) => {
  const { categories } = useSettings();

  const hasActiveFilters =
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedEducationLevel && selectedEducationLevel !== 'all') ||
    (selectedMediaType && selectedMediaType !== 'all') ||
    sortBy !== 'latest';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Filter className="w-5 h-5 text-blue-600" />
          <span>ตัวกรองการค้นหา</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างค่า</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
          <span>เรียงลำดับตาม</span>
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular' | 'favorites')}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition cursor-pointer font-medium"
        >
          <option value="latest">เผยแพร่ล่าสุด</option>
          <option value="popular">ยอดเข้าชมสูงสุด</option>
          <option value="favorites">บันทึกโปรดมากที่สุด</option>
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>หมวดหมู่วิชา</span>
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer flex items-center justify-between ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>ทั้งหมดทุกหมวด</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer truncate ${
                selectedCategory === cat
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Educational Level Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>ระดับการศึกษา</span>
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedEducationLevel('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
              selectedEducationLevel === 'all' || !selectedEducationLevel
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ทุกระดับชั้น
          </button>
          {Object.entries(EDUCATION_LEVEL_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedEducationLevel(key)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer leading-tight ${
                selectedEducationLevel === key
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Type Filter */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>ประเภทของสื่อ</span>
        </label>
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={() => setSelectedMediaType('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
              selectedMediaType === 'all' || !selectedMediaType
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            ทุกประเภทสื่อ
          </button>
          {Object.entries(MEDIA_TYPE_LABELS).map(([typeKey, info]) => (
            <button
              key={typeKey}
              onClick={() => setSelectedMediaType(typeKey)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition cursor-pointer flex items-center gap-2 ${
                selectedMediaType === typeKey
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {typeKey === 'pdf' && <FileText className="w-4 h-4 text-rose-500" />}
              {typeKey === 'video' && <Video className="w-4 h-4 text-red-500" />}
              {typeKey === 'article' && <Globe className="w-4 h-4 text-emerald-500" />}
              {typeKey === 'slides' && <Presentation className="w-4 h-4 text-amber-500" />}
              {typeKey === 'course' && <BookOpen className="w-4 h-4 text-indigo-500" />}
              {typeKey === 'other' && <Folder className="w-4 h-4 text-blue-500" />}
              <span>{info.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
