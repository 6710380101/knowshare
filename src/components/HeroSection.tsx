import React from 'react';
import { Search, Sparkles, BookOpen, Users, Compass, X } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  totalResourcesCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalResourcesCount,
}) => {
  const { settings, categories } = useSettings();

  const popularQuickFilters = [
    'ทั้งหมด',
    'คอมพิวเตอร์และเทคโนโลยี',
    'คณิตศาสตร์',
    'วิทยาศาสตร์และดาราศาสตร์',
    'ภาษาอังกฤษและภาษาต่างประเทศ',
    'ภาษาไทยและการสื่อสาร',
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 shadow-inner">
      {/* Subtle decorative background circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-sky-200 text-xs sm:text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4 text-sky-300" />
          <span>พื้นที่แห่งการเรียนรู้ แบ่งปัน และสร้างสรรค์ปัญญา</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          {settings.siteTitle || 'คลังปัญญา'}
        </h1>
        <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-8 font-light">
          {settings.siteDescription || 'ศูนย์กลางรวบรวมและแบ่งปันความรู้ สื่อการเรียนรู้ และเนื้อหาทางวิชาการสำหรับนักเรียน นักศึกษา และครู'}
        </p>

        {/* Large Search Box */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเรื่อง, คำอธิบาย, วิชา หรือคำสำคัญ เช่น Python, แคลคูลัส, ชีววิทยา..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-base shadow-xl shadow-blue-950/20 focus:outline-hidden focus:ring-4 focus:ring-sky-400/50 transition border border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Popular Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-300 font-medium mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> วิชายอดนิยม:
          </span>
          {popularQuickFilters.map((cat) => {
            const isAll = cat === 'ทั้งหมด';
            const isSelected = isAll ? selectedCategory === 'all' || !selectedCategory : selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isAll ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg mx-auto text-center text-xs sm:text-sm text-slate-300">
          <div>
            <div className="font-bold text-white text-lg sm:text-xl">{totalResourcesCount}</div>
            <div className="text-slate-300 font-light">สื่อการเรียนรู้</div>
          </div>
          <div>
            <div className="font-bold text-white text-lg sm:text-xl">{categories.length}</div>
            <div className="text-slate-300 font-light">หมวดหมู่วิชา</div>
          </div>
          <div>
            <div className="font-bold text-white text-lg sm:text-xl">100%</div>
            <div className="text-slate-300 font-light">เข้าถึงฟรี</div>
          </div>
        </div>
      </div>
    </div>
  );
};
