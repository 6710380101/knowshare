import React from 'react';
import { Heart, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import type { Resource } from '../types';
import { ResourceCard } from './ResourceCard';

interface FavoritesViewProps {
  favoriteResources: Resource[];
  loading: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onSelectResource: (resource: Resource) => void;
  onShare: (resource: Resource) => void;
  onBrowseMore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteResources,
  loading,
  onToggleFavorite,
  onSelectResource,
  onShare,
  onBrowseMore,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-1">
            <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
            <span>คลังสื่อที่คุณสนใจ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            รายการโปรดของฉัน
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            รวบรวมสื่อการเรียนรู้ บทความ และเอกสารที่คุณบันทึกไว้สำหรับทบทวนภายหลัง ซิงค์ตรงกันทุกอุปกรณ์
          </p>
        </div>

        <button
          onClick={onBrowseMore}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
        >
          <span>ค้นหาสื่อเพิ่มเติม</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
              <div className="h-6 bg-slate-200 rounded-sm w-3/4" />
              <div className="h-16 bg-slate-100 rounded-sm" />
              <div className="h-8 bg-slate-200 rounded-sm" />
            </div>
          ))}
        </div>
      ) : favoriteResources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีรายการโปรด</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            คุณสามารถกดไอคอนรูปหัวใจที่การ์ดสื่อการเรียนรู้ใดๆ เพื่อบันทึกเก็บไว้เปิดอ่านได้สะดวกทุกเวลา
          </p>
          <button
            onClick={onBrowseMore}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            ไปที่คลังความรู้
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isFavorited={true}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelectResource}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </div>
  );
};
