import React from 'react';
import { BookOpen, Heart, Shield, Sparkles, ExternalLink, Mail } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenAuth }) => {
  const { settings, categories } = useSettings();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                {settings.siteTitle || 'คลังปัญญา'}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {settings.siteDescription || 'แพลตฟอร์มรวบรวมและแบ่งปันความรู้ สื่อการเรียนรู้ และเนื้อหาทางวิชาการ เพื่อส่งเสริมการศึกษาไทยอย่างเท่าเทียมและเปิดกว้าง'}
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>ความปลอดภัยระดับสูงด้วย Firebase Authentication & Cloud Firestore</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              หมวดหมู่วิชายอดนิยม
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-sky-300 transition cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              สำหรับสมาชิกและครู
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={onOpenAuth}
                  className="hover:text-sky-300 transition cursor-pointer"
                >
                  เข้าสู่ระบบ / สมัครสมาชิก
                </button>
              </li>
              <li>
                <span className="text-slate-400">ระบบคลังความรู้เปิดสาธารณะ</span>
              </li>
              <li>
                <span className="text-slate-400">รองรับ PDF, วิดีโอ, สไลด์ และบทความ</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {settings.siteTitle || 'คลังปัญญา (KlangPanya)'}. สงวนลิขสิทธิ์เพื่อการศึกษา</p>
          <div className="flex items-center gap-1">
            <span>พัฒนาเพื่อการเรียนรู้ที่มีคุณภาพ</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
            <span>สำหรับนักเรียน นักศึกษา และครูไทย</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
