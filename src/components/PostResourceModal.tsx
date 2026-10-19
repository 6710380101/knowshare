import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Layers,
  GraduationCap,
  Link as LinkIcon,
  FileText,
  Tag,
  AlertCircle,
  CheckCircle2,
  Upload,
  Info
} from 'lucide-react';
import type { Resource, EducationLevel, MediaType } from '../types';
import { EDUCATION_LEVEL_LABELS, MEDIA_TYPE_LABELS } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { resourceService } from '../services/resourceService';

interface PostResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingResource?: Resource | null;
  onSuccess: (resourceId: string, isNew: boolean) => void;
}

export const PostResourceModal: React.FC<PostResourceModalProps> = ({
  isOpen,
  onClose,
  editingResource,
  onSuccess,
}) => {
  const { categories } = useSettings();
  const { userProfile } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('secondary');
  const [mediaType, setMediaType] = useState<MediaType>('article');
  const [externalUrl, setExternalUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingResource) {
      setTitle(editingResource.title || '');
      setDescription(editingResource.description || '');
      setContent(editingResource.content || '');
      setCategory(editingResource.category || (categories[0] || ''));
      setEducationLevel(editingResource.educationLevel || 'secondary');
      setMediaType(editingResource.mediaType || 'article');
      setExternalUrl(editingResource.externalUrl || '');
      setAttachmentUrl(editingResource.attachmentUrl || '');
      setTagsInput(editingResource.tags?.join(', ') || '');
    } else {
      setTitle('');
      setDescription('');
      setContent('');
      setCategory(categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
      setEducationLevel('secondary');
      setMediaType('article');
      setExternalUrl('');
      setAttachmentUrl('');
      setTagsInput('');
    }
    setFormError(null);
  }, [editingResource, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!userProfile) {
      setFormError('กรุณาเข้าสู่ระบบก่อนทำการโพสต์');
      return;
    }

    if (!title.trim() || title.trim().length < 3) {
      setFormError('กรุณากรอกชื่อเรื่องอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (!description.trim()) {
      setFormError('กรุณากรอกคำอธิบายโดยย่อของสื่อการเรียนรู้นี้');
      return;
    }

    if (!category) {
      setFormError('กรุณาเลือกหมวดหมู่วิชา');
      return;
    }

    // Process tags
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .slice(0, 8); // max 8 tags

    setIsSubmitting(true);

    try {
      if (editingResource) {
        // Update existing resource
        await resourceService.updateResource(
          editingResource.id,
          {
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            category,
            educationLevel,
            mediaType,
            externalUrl: externalUrl.trim(),
            attachmentUrl: attachmentUrl.trim(),
            tags,
          },
          userProfile
        );
        showToast('แก้ไขข้อมูลสื่อการเรียนรู้สำเร็จแล้ว', 'success');
        onSuccess(editingResource.id, false);
      } else {
        // Create new resource
        const newId = await resourceService.createResource(
          {
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            category,
            educationLevel,
            mediaType,
            externalUrl: externalUrl.trim(),
            attachmentUrl: attachmentUrl.trim(),
            tags,
          },
          userProfile
        );
        showToast('เผยแพร่สื่อการเรียนรู้ลงคลังความรู้สำเร็จแล้ว', 'success');
        onSuccess(newId, true);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving resource:', err);
      setFormError(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-300" />
            <h2 className="text-base sm:text-lg font-bold">
              {editingResource ? 'แก้ไขสื่อการเรียนรู้' : 'แบ่งปันสื่อการเรียนรู้ใหม่'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ชื่อสื่อ / หัวข้อความรู้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปสูตรตรีโกณมิติ ม.5, คู่มือเขียนโปรแกรม JavaScript..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              maxLength={200}
              required
            />
          </div>

          {/* Category & Grade Level (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                หมวดหมู่วิชา <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ระดับการศึกษา <span className="text-rose-500">*</span>
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
              >
                {Object.entries(EDUCATION_LEVEL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              ประเภทของสื่อ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(MEDIA_TYPE_LABELS).map(([typeKey, info]) => {
                const isSelected = mediaType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setMediaType(typeKey as MediaType)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              คำอธิบายโดยย่อ <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายสรุปสาระสำคัญของสื่อ เพื่อช่วยให้ผู้อื่นตัดสินใจเลือกอ่านหรือศึกษา..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              maxLength={1000}
              required
            />
          </div>

          {/* External URL & Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>ลิงก์ภายนอก / วิดีโอ YouTube</span>
              </label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=... หรือ ลิงก์เว็บไซต์"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-rose-600" />
                <span>ลิงก์ไฟล์แนบ / PDF ดาวน์โหลด</span>
              </label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com/document.pdf หรือ Google Drive"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Full Content / Markdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>เนื้อหาฉบับเต็ม / โน้ตสรุป (Markdown)</span>
              <span className="text-[11px] font-normal text-slate-400">ใส่เนื้อหา, สูตร, หรือตัวอย่างได้ตามต้องการ</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="เขียนเนื้อหาบทเรียน, เนื้อหาข้อความ, สรุปใจความสำคัญ หรือแบบฝึกหัดที่ต้องการแบ่งปัน..."
              rows={6}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>คำสำคัญ / แท็ก (คั่นด้วยเครื่องหมายจุลภาค ,)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="เช่น ฟิสิกส์, ม.ปลาย, TCAS, ตะลุยโจทย์"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </form>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <span>{editingResource ? 'บันทึกการแก้ไข' : 'เผยแพร่สู่คลังความรู้'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
