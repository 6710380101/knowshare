import {
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type { Resource, UserProfile, EducationLevel, MediaType } from '../types';

const COLLECTION_NAME = 'resources';

export interface ResourceFilterOptions {
  searchQuery?: string;
  category?: string;
  educationLevel?: string;
  mediaType?: string;
  sortBy?: 'latest' | 'popular' | 'favorites';
  authorId?: string;
  includeHidden?: boolean;
}

export const resourceService = {
  // Fetch resources with client/server filtering
  async getResources(options: ResourceFilterOptions = {}): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      let q = query(resourcesRef);

      // If filtering by author
      if (options.authorId) {
        q = query(resourcesRef, where('authorId', '==', options.authorId));
      }

      const snapshot = await getDocs(q);
      let list: Resource[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Resource, 'id'>),
      }));

      // Filter out hidden items unless explicitly allowed for admins/moderators
      if (!options.includeHidden) {
        list = list.filter((r) => !r.isHidden);
      }

      // Filter category
      if (options.category && options.category !== 'all') {
        list = list.filter((r) => r.category === options.category);
      }

      // Filter education level
      if (options.educationLevel && options.educationLevel !== 'all') {
        list = list.filter((r) => r.educationLevel === options.educationLevel);
      }

      // Filter media type
      if (options.mediaType && options.mediaType !== 'all') {
        list = list.filter((r) => r.mediaType === options.mediaType);
      }

      // Search keyword filter (title, description, tags, category, authorName)
      if (options.searchQuery && options.searchQuery.trim() !== '') {
        const queryTerm = options.searchQuery.toLowerCase().trim();
        list = list.filter((r) => {
          return (
            r.title.toLowerCase().includes(queryTerm) ||
            r.description.toLowerCase().includes(queryTerm) ||
            r.category.toLowerCase().includes(queryTerm) ||
            (r.authorName && r.authorName.toLowerCase().includes(queryTerm)) ||
            (r.tags && r.tags.some((t) => t.toLowerCase().includes(queryTerm)))
          );
        });
      }

      // Sorting
      if (options.sortBy === 'popular') {
        list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      } else if (options.sortBy === 'favorites') {
        list.sort((a, b) => (b.favoriteCount || 0) - (a.favoriteCount || 0));
      } else {
        // default latest
        list.sort((a, b) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      }

      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, COLLECTION_NAME);
    }
  },

  // Get single resource
  async getResourceById(id: string): Promise<Resource | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { id: snap.id, ...(snap.data() as Omit<Resource, 'id'>) };
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${COLLECTION_NAME}/${id}`);
    }
  },

  // Create new resource
  async createResource(
    data: {
      title: string;
      description: string;
      content: string;
      category: string;
      educationLevel: EducationLevel;
      mediaType: MediaType;
      externalUrl?: string;
      attachmentUrl?: string;
      tags: string[];
    },
    author: UserProfile
  ): Promise<string> {
    try {
      const newDocRef = doc(collection(db, COLLECTION_NAME));
      const newResource: Omit<Resource, 'id'> = {
        title: data.title.trim(),
        description: data.description.trim(),
        content: data.content || '',
        category: data.category,
        educationLevel: data.educationLevel,
        mediaType: data.mediaType,
        externalUrl: data.externalUrl?.trim() || '',
        attachmentUrl: data.attachmentUrl?.trim() || '',
        authorId: author.uid,
        authorName: author.displayName,
        authorEmail: author.email,
        isHidden: false,
        viewCount: 0,
        favoriteCount: 0,
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(newDocRef, newResource);
      return newDocRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, COLLECTION_NAME);
    }
  },

  // Update resource
  async updateResource(id: string, updates: Partial<Resource>, user: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const cleanUpdates = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, cleanUpdates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  // Delete resource
  async deleteResource(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cur = snap.data().viewCount || 0;
        await updateDoc(docRef, { viewCount: cur + 1 });
      }
    } catch (err) {
      // Non-critical, ignore silent view counter failures
      console.warn('View count increment silent catch:', err);
    }
  },

  // Seed sample real educational resources if empty
  async seedInitialResourcesIfEmpty(user: UserProfile): Promise<number> {
    try {
      const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), limit(1)));
      if (!snapshot.empty) return 0;

      const samples: Omit<Resource, 'id'>[] = [
        {
          title: 'พื้นฐานการเขียนโปรแกรมด้วย Python สำหรับผู้เริ่มต้น',
          description: 'คู่มือและแบบฝึกหัดเรียนรู้ภาษา Python ตั้งแต่ตัวแปร เงื่อนไข ลูป ไปจนถึงฟังก์ชัน พร้อมตัวอย่างเขียนโค้ดแก้ปัญหาจริง',
          content: `# ยินดีต้อนรับสู่บทเรียน Python ขั้นพื้นฐาน\n\nภาษา Python เป็นภาษาที่อ่านง่าย เหมาะสำหรับผู้ที่เริ่มต้นเรียนรู้การเขียนโค้ด:\n\n1. การประกาศตัวแปร:\n\`\`\`python\nname = "สมชาย"\nage = 16\nprint(f"สวัสดี {name}, อายุ {age} ปี")\n\`\`\`\n\n2. โครงสร้างเงื่อนไข if-else:\n\`\`\`python\nif age >= 18:\n    print("มีสิทธิ์ลงประชามติ")\nelse:\n    print("ยังไม่ถึงเกณฑ์")\n\`\`\`\n\nหวังว่าบทเรียนนี้จะเป็นประโยชน์แก่น้องๆ ทุกคน!`,
          category: 'คอมพิวเตอร์และเทคโนโลยี',
          educationLevel: 'secondary',
          mediaType: 'article',
          externalUrl: 'https://docs.python.org/3/tutorial/',
          attachmentUrl: '',
          authorId: user.uid,
          authorName: user.displayName || 'ครูวิทยาการคำนวณ',
          authorEmail: user.email,
          isHidden: false,
          viewCount: 142,
          favoriteCount: 18,
          tags: ['Python', 'Coding', 'วิทยาการคำนวณ', 'มัธยมศึกษา'],
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'สรุปสูตรตรีโกณมิติและเรขาคณิตวิเคราะห์ ม.ปลาย',
          description: 'เอกสารสรุปความสัมพันธ์ sin, cos, tan วงกลมหนึ่งหน่วย และสูตรลัดทำข้อสอบเข้ามหาวิทยาลัยอย่างรวดเร็ว',
          content: `# สรุปสูตรตรีโกณมิติที่ต้องจำ\n\n- sin²θ + cos²θ = 1\n- 1 + tan²θ = sec²θ\n- 1 + cot²θ = cosec²θ\n\nสูตรผลบวกผลต่างมุม:\n- sin(A ± B) = sinA cosB ± cosA sinB\n- cos(A ± B) = cosA cosB ∓ sinA sinB\n\nทบทวนโจทย์และฝึกทำเป็นประจำจะช่วยให้จำสูตรได้แม่นยำขึ้นครับ`,
          category: 'คณิตศาสตร์',
          educationLevel: 'secondary',
          mediaType: 'pdf',
          externalUrl: 'https://www.scimath.org/lesson-mathematics',
          attachmentUrl: '',
          authorId: user.uid,
          authorName: user.displayName || 'อาจารย์คณิตศาสตร์',
          authorEmail: user.email,
          isHidden: false,
          viewCount: 289,
          favoriteCount: 35,
          tags: ['ตรีโกณมิติ', 'คณิตศาสตร์', 'ม.ปลาย', 'เตรียมสอบ'],
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'วิดีโอจำลอง: การสังเคราะห์ด้วยแสงของพืชและการถ่ายทอดอิเล็กตรอน',
          description: 'คลิปอธิบายกระบวนการ Light Reaction และ Calvin Cycle อย่างเข้าใจง่าย พร้อมภาพ 3D แสดงการทำงานของ Chloroplast',
          content: `# กระบวนการสังเคราะห์ด้วยแสง (Photosynthesis)\n\nสมการรวม:\n6CO2 + 12H2O + แสงสว่าง -> C6H12O6 + 6H2O + 6O2\n\nประกอบด้วย 2 ขั้นตอนหลัก:\n1. ปฏิกิริยาแสง (Light Reaction) ที่เยื่อไทลาคอยด์\n2. ปฏิกิริยาไม่ใช้แสงหรือวัฏจักรคัลวิน (Calvin Cycle) ในสโตรมา`,
          category: 'วิทยาศาสตร์และดาราศาสตร์',
          educationLevel: 'secondary',
          mediaType: 'video',
          externalUrl: 'https://www.youtube.com/watch?v=sQK3Yr4Sc_k',
          attachmentUrl: '',
          authorId: user.uid,
          authorName: user.displayName || 'ครูชีววิทยา',
          authorEmail: user.email,
          isHidden: false,
          viewCount: 412,
          favoriteCount: 52,
          tags: ['ชีววิทยา', 'สังเคราะห์แสง', 'วิทยาศาสตร์', 'วิดีโอ'],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          title: 'เทคนิคการจำคำศัพท์ภาษาอังกฤษ 100 คำที่ออกสอบบ่อยที่สุด',
          description: 'รวมรากศัพท์ Prefix, Suffix และเทคนิค Mnemonic จำคำศัพท์แบบไม่ลืมง่าย พร้อมแบบทดสอบวัดระดับ',
          content: `# รากศัพท์ภาษาอังกฤษสำคัญ\n\n- **Bio** = ชีวิต (Biology, Biography)\n- **Chron** = เวลา (Chronology, Synchronize)\n- **Dict** = คำพูด (Predict, Dictate)\n- **Port** = ขนย้าย (Transport, Portable)\n\nการเข้าใจรากศัพท์จะช่วยให้เดาความหมายคำศัพท์ใหม่ได้แม้ไม่เคยเจอมาก่อน!`,
          category: 'ภาษาอังกฤษและภาษาต่างประเทศ',
          educationLevel: 'general',
          mediaType: 'article',
          externalUrl: 'https://learnenglish.britishcouncil.org',
          attachmentUrl: '',
          authorId: user.uid,
          authorName: user.displayName || 'ครูภาษาอังกฤษ',
          authorEmail: user.email,
          isHidden: false,
          viewCount: 305,
          favoriteCount: 41,
          tags: ['English', 'Vocabulary', 'TCAS', 'TOEIC'],
          createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      for (const item of samples) {
        const refDoc = doc(collection(db, COLLECTION_NAME));
        await setDoc(refDoc, item);
      }

      return samples.length;
    } catch (err) {
      console.warn('Seeding check/insert error:', err);
      return 0;
    }
  },
};
