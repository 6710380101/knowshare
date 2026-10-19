import React from 'react';
import { Layers, Plus, BookOpen, Trash2, Edit, Eye, ArrowRight } from 'lucide-react';
import type { Resource } from '../types';
import { ResourceCard } from './ResourceCard';

interface MyPostsViewProps {
  myResources: Resource[];
  loading: boolean;
  favoritesSet: Set<string>;
  onToggleFavorite: (resource: Resource) => void;
  onSelectResource: (resource: Resource) => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
  onShare: (resource: Resource) => void;
  onOpenCreate: () => void;
}

export const MyPostsView: React.FC<MyPostsViewProps> = ({
  myResources,
  loading,
  favoritesSet,
  onToggleFavorite,
  onSelectResource,
  onEditResource,
  onDeleteResource,
  onShare,
  onOpenCreate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>ผลงานที่คุณได้เผยแพร่</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            สื่อการเรียนรู้ของฉัน
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            จัดการ แก้ไข หรือลบสื่อการสอนและบทความที่คุณได้ร่วมแบ่งปันไว้ในคลังปัญญา
          </p>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>แบ่งปันสื่อใหม่</span>
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
      ) : myResources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">ยังไม่มีสื่อที่คุณเผยแพร่</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            ร่วมเป็นส่วนหนึ่งในการแบ่งปันความรู้ สื่อการสอน หรือโน้ตสรุปวิชาการเพื่อประโยชน์แก่นักเรียนและครูไทย
          </p>
          <button
            onClick={onOpenCreate}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            เริ่มแบ่งปันสื่อแรกของคุณ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myResources.map((resource) => (
            <div key={resource.id} className="relative group">
              <ResourceCard
                resource={resource}
                isFavorited={favoritesSet.has(resource.id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelectResource}
                onShare={onShare}
              />
              <div className="mt-2 flex items-center justify-end gap-2 px-2">
                <button
                  onClick={() => onEditResource(resource)}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-semibold text-blue-700 cursor-pointer transition shadow-2xs"
                >
                  <Edit className="w-3 h-3" />
                  <span>แก้ไข</span>
                </button>
                <button
                  onClick={() => onDeleteResource(resource)}
                  className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-lg text-xs font-semibold text-rose-600 cursor-pointer transition shadow-2xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>ลบ</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
