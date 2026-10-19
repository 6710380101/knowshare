import React from 'react';
import {
  BookOpen,
  Code2,
  Calculator,
  Atom,
  Languages,
  Landmark,
  Palette,
  Music,
  Briefcase,
  HeartPulse,
  Compass,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface CategoriesViewProps {
  onSelectCategory: (cat: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  onSelectCategory,
  categoryCounts,
}) => {
  const { categories } = useSettings();

  const getCategoryTheme = (name: string) => {
    if (name.includes('คอมพิวเตอร์') || name.includes('เทคโนโลยี')) {
      return { icon: Code2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200 hover:border-blue-400' };
    }
    if (name.includes('คณิตศาสตร์')) {
      return { icon: Calculator, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400' };
    }
    if (name.includes('วิทยาศาสตร์') || name.includes('ดาราศาสตร์')) {
      return { icon: Atom, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200 hover:border-sky-400' };
    }
    if (name.includes('ภาษา')) {
      return { icon: Languages, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400' };
    }
    if (name.includes('สังคม') || name.includes('ประวัติศาสตร์')) {
      return { icon: Landmark, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200 hover:border-amber-400' };
    }
    if (name.includes('ศิลปะ') || name.includes('ออกแบบ')) {
      return { icon: Palette, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200 hover:border-rose-400' };
    }
    if (name.includes('ดนตรี')) {
      return { icon: Music, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200 hover:border-purple-400' };
    }
    if (name.includes('ธุรกิจ') || name.includes('อาชีพ')) {
      return { icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200 hover:border-slate-400' };
    }
    if (name.includes('สุขศึกษา') || name.includes('พลศึกษา')) {
      return { icon: HeartPulse, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200 hover:border-teal-400' };
    }
    return { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200 hover:border-blue-400' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 pb-4 border-b border-slate-200 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>สำรวจตามสาขาวิชา</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          หมวดหมู่วิชาความรู้ทั้งหมด
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          เลือกหมวดหมู่วิชาที่คุณต้องการค้นคว้า เพื่อเข้าถึงสื่อการเรียนรู้ เอกสารประกอบ และวิดีโอที่เกี่ยวข้อง
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const theme = getCategoryTheme(cat);
          const IconComponent = theme.icon;
          const count = categoryCounts[cat] || 0;

          return (
            <div
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md flex flex-col justify-between group ${theme.bg}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white shadow-xs ${theme.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-full">
                  {count} สื่อ
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition mb-1 leading-snug">
                  {cat}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-blue-600 font-medium">
                  <span>สำรวจเนื้อหา</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
