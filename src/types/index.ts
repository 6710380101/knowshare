export type UserRole = 'member' | 'moderator' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isSuspended: boolean;
  photoURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type EducationLevel = 'primary' | 'secondary' | 'higher_ed' | 'general';

export type MediaType = 'pdf' | 'video' | 'article' | 'slides' | 'course' | 'other';

export interface Resource {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  educationLevel: EducationLevel;
  mediaType: MediaType;
  externalUrl?: string;
  attachmentUrl?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  isHidden: boolean;
  viewCount: number;
  favoriteCount: number;
  tags: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  resourceId: string;
  resourceTitle: string;
  resourceCategory: string;
  createdAt?: any;
}

export type ReportReason = 
  | 'broken_link' 
  | 'copyright' 
  | 'inappropriate' 
  | 'incorrect_info' 
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface ReportItem {
  id: string;
  resourceId: string;
  resourceTitle: string;
  reporterId: string;
  reporterEmail: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt?: any;
  resolvedAt?: any;
  resolvedBy?: string;
}

export interface ModerationLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  performedBy: string;
  performedByEmail?: string;
  createdAt?: any;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  announcement?: string;
  categories: string[];
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_CATEGORIES: string[] = [
  'คอมพิวเตอร์และเทคโนโลยี',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และดาราศาสตร์',
  'ภาษาไทยและการสื่อสาร',
  'ภาษาอังกฤษและภาษาต่างประเทศ',
  'สังคมศึกษาและประวัติศาสตร์',
  'ศิลปะและการออกแบบ',
  'ดนตรีและการแสดง',
  'การงานอาชีพและธุรกิจ',
  'สุขศึกษาและพลศึกษา',
  'การพัฒนาตนเองและการใช้ชีวิต',
  'อื่นๆ'
];

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  primary: 'ระดับประถมศึกษา (ป.1 - ป.6)',
  secondary: 'ระดับมัธยมศึกษา (ม.1 - ม.6)',
  higher_ed: 'ระดับอุดมศึกษา / ปวช. - ปวส.',
  general: 'บุคคลทั่วไป / การเรียนรู้ตลอดชีวิต',
};

export const MEDIA_TYPE_LABELS: Record<MediaType, { label: string; icon: string; color: string }> = {
  pdf: { label: 'เอกสาร PDF', icon: 'FileText', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  video: { label: 'วิดีโอ / YouTube', icon: 'Video', color: 'bg-red-50 text-red-600 border-red-200' },
  article: { label: 'บทความ / สื่อเว็บ', icon: 'Globe', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  slides: { label: 'สไลด์นำเสนอ', icon: 'Presentation', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  course: { label: 'หลักสูตร / คอร์สเรียน', icon: 'BookOpen', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
  other: { label: 'สื่อการเรียนรู้อื่นๆ', icon: 'Folder', color: 'bg-blue-50 text-blue-600 border-blue-200' },
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  broken_link: 'ลิงก์เสีย / ไฟล์เปิดไม่ได้',
  copyright: 'ละเมิดลิขสิทธิ์ / นำผลงานผู้อื่นมาลงโดยไม่ได้รับอนุญาต',
  inappropriate: 'เนื้อหาไม่เหมาะสม / หยาบคาย / ผิดศีลธรรม',
  incorrect_info: 'ข้อมูลผิดพลาดร้ายแรง / หลอกลวง',
  other: 'เหตุผลอื่นๆ',
};
