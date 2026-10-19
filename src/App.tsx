import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FilterSidebar } from './components/FilterSidebar';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { PostResourceModal } from './components/PostResourceModal';
import { ReportModal } from './components/ReportModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FavoritesView } from './components/FavoritesView';
import { MyPostsView } from './components/MyPostsView';
import { CategoriesView } from './components/CategoriesView';
import { Footer } from './components/Footer';
import { resourceService } from './services/resourceService';
import { favoriteService } from './services/favoriteService';
import type { Resource, FavoriteItem } from './types';
import {
  BookOpen,
  Filter,
  Search,
  Sparkles,
  Layers,
  Inbox,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';

function MainApp() {
  const { currentUser, userProfile, isAdmin, isModerator } = useAuth();
  const { settings, categories } = useSettings();
  const { showToast } = useToast();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<'browse' | 'categories' | 'favorites' | 'my-posts' | 'admin'>('browse');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEducationLevel, setSelectedEducationLevel] = useState('all');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'favorites'>('latest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Data states
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // Modal states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingResource, setReportingResource] = useState<Resource | null>(null);

  // Load Resources
  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const data = await resourceService.getResources({
        searchQuery,
        category: selectedCategory,
        educationLevel: selectedEducationLevel,
        mediaType: selectedMediaType,
        sortBy,
        includeHidden: false,
      });

      // If empty and current user is present, seed sample data once
      if (data.length === 0 && selectedCategory === 'all' && !searchQuery && userProfile) {
        const seeded = await resourceService.seedInitialResourcesIfEmpty(userProfile);
        if (seeded > 0) {
          const fresh = await resourceService.getResources({
            searchQuery,
            category: selectedCategory,
            educationLevel: selectedEducationLevel,
            mediaType: selectedMediaType,
            sortBy,
          });
          setResources(fresh);
          setLoadingResources(false);
          return;
        }
      }

      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      showToast('ไม่สามารถโหลดข้อมูลสื่อได้ในขณะนี้', 'error');
    } finally {
      setLoadingResources(false);
    }
  };

  // Load user favorites
  const fetchFavorites = async () => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }
    setLoadingFavorites(true);
    try {
      const favs = await favoriteService.getUserFavorites(currentUser.uid);
      setFavorites(favs || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [searchQuery, selectedCategory, selectedEducationLevel, selectedMediaType, sortBy, userProfile]);

  useEffect(() => {
    fetchFavorites();
  }, [currentUser]);

  // Set of favorite resource IDs for quick check
  const favoritesSet = useMemo(() => {
    return new Set(favorites.map((f) => f.resourceId));
  }, [favorites]);

  // Favorite resources mapped to actual objects
  const favoriteResourceObjects = useMemo(() => {
    return resources.filter((r) => favoritesSet.has(r.id));
  }, [resources, favoritesSet]);

  // My posts
  const myResources = useMemo(() => {
    if (!currentUser) return [];
    return resources.filter((r) => r.authorId === currentUser.uid);
  }, [resources, currentUser]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of resources) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
    return counts;
  }, [resources]);

  // Toggle favorite handler
  const handleToggleFavorite = async (resource: Resource) => {
    if (!currentUser) {
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      showToast('กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรด', 'info');
      return;
    }

    const wasFavorited = favoritesSet.has(resource.id);

    // Optimistic UI updates
    if (wasFavorited) {
      setFavorites((prev) => prev.filter((f) => f.resourceId !== resource.id));
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, favoriteCount: Math.max(0, (r.favoriteCount || 1) - 1) } : r))
      );
      if (selectedResource && selectedResource.id === resource.id) {
        setSelectedResource((prev) =>
          prev ? { ...prev, favoriteCount: Math.max(0, (prev.favoriteCount || 1) - 1) } : null
        );
      }
    } else {
      const newFav: FavoriteItem = {
        id: `${currentUser.uid}_${resource.id}`,
        userId: currentUser.uid,
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceCategory: resource.category,
      };
      setFavorites((prev) => [...prev, newFav]);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, favoriteCount: (r.favoriteCount || 0) + 1 } : r))
      );
      if (selectedResource && selectedResource.id === resource.id) {
        setSelectedResource((prev) =>
          prev ? { ...prev, favoriteCount: (prev.favoriteCount || 0) + 1 } : null
        );
      }
    }

    try {
      const isNowFav = await favoriteService.toggleFavorite(currentUser.uid, resource);
      showToast(isNowFav ? 'เพิ่มในรายการโปรดแล้ว' : 'ลบออกจากรายการโปรดแล้ว', 'success');
    } catch (err) {
      // Revert if error
      fetchFavorites();
      showToast('ไม่สามารถอัปเดตรายการโปรดได้', 'error');
    }
  };

  // Select resource (open detail modal)
  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
    setDetailModalOpen(true);
    // Silent increment view count in Firestore
    resourceService.incrementViewCount(resource.id);
  };

  // Open edit modal
  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setDetailModalOpen(false);
    setPostModalOpen(true);
  };

  // Delete resource
  const handleDeleteResource = async (resource: Resource) => {
    try {
      await resourceService.deleteResource(resource.id);
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
      setDetailModalOpen(false);
      showToast('ลบสื่อการเรียนรู้นี้เรียบร้อยแล้ว', 'success');
    } catch (err) {
      showToast('เกิดข้อผิดพลาดในการลบสื่อ', 'error');
    }
  };

  // Share link
  const handleShare = (resource: Resource) => {
    navigator.clipboard.writeText(window.location.origin + '?resource=' + resource.id);
    showToast('คัดลอกลิงก์สื่อการเรียนรู้แล้ว', 'success');
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedEducationLevel('all');
    setSelectedMediaType('all');
    setSortBy('latest');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenAuthModal={() => {
          setAuthInitialMode('login');
          setAuthModalOpen(true);
        }}
        onOpenPostModal={() => {
          setEditingResource(null);
          setPostModalOpen(true);
        }}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Browse / Home Tab */}
        {currentTab === 'browse' && (
          <div>
            {/* Hero Section */}
            <HeroSection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              totalResourcesCount={resources.length}
            />

            {/* Content & Sidebar Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Mobile Filter Toggle Button */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>ตัวกรองและจัดเรียง ({selectedCategory !== 'all' || selectedMediaType !== 'all' ? 'กำลังกรอง' : 'ค่าเริ่มต้น'})</span>
                </button>
                <span className="text-xs text-slate-500 font-medium">
                  พบ {resources.length} รายการ
                </span>
              </div>

              {/* Mobile Filter Drawer */}
              {mobileFilterOpen && (
                <div className="lg:hidden mb-6">
                  <FilterSidebar
                    selectedCategory={selectedCategory}
                    setSelectedCategory={(cat) => {
                      setSelectedCategory(cat);
                      setMobileFilterOpen(false);
                    }}
                    selectedEducationLevel={selectedEducationLevel}
                    setSelectedEducationLevel={(lvl) => {
                      setSelectedEducationLevel(lvl);
                      setMobileFilterOpen(false);
                    }}
                    selectedMediaType={selectedMediaType}
                    setSelectedMediaType={(type) => {
                      setSelectedMediaType(type);
                      setMobileFilterOpen(false);
                    }}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    onReset={handleResetFilters}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Desktop Filter Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-24">
                    <FilterSidebar
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      selectedEducationLevel={selectedEducationLevel}
                      setSelectedEducationLevel={setSelectedEducationLevel}
                      selectedMediaType={selectedMediaType}
                      setSelectedMediaType={setSelectedMediaType}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      onReset={handleResetFilters}
                    />
                  </div>
                </div>

                {/* Resource Cards Grid */}
                <div className="lg:col-span-3">
                  {/* Results Bar */}
                  <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedCategory === 'all' ? 'สื่อการเรียนรู้ทั้งหมด' : selectedCategory}
                      </h2>
                      <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                        {resources.length} รายการ
                      </span>
                    </div>

                    {(selectedCategory !== 'all' || selectedMediaType !== 'all' || searchQuery) && (
                      <button
                        onClick={handleResetFilters}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ล้างตัวกรองทั้งหมด</span>
                      </button>
                    )}
                  </div>

                  {/* Loading Skeleton */}
                  {loadingResources ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div
                          key={n}
                          className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-4 shadow-xs"
                        >
                          <div className="flex justify-between">
                            <div className="h-5 bg-slate-200 rounded-md w-1/3" />
                            <div className="h-5 bg-slate-100 rounded-md w-1/4" />
                          </div>
                          <div className="h-6 bg-slate-200 rounded-md w-4/5" />
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-100 rounded-md" />
                            <div className="h-4 bg-slate-100 rounded-md w-2/3" />
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                            <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                            <div className="h-6 bg-slate-200 rounded-md w-1/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : resources.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">ไม่พบสื่อการเรียนรู้ที่ตรงกับเงื่อนไข</h3>
                      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
                        ลองเปลี่ยนคำค้นหา หรือปรับตัวกรองหมวดหมู่และประเภทของสื่อใหม่อีกครั้ง
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
                        >
                          ล้างตัวกรองทั้งหมด
                        </button>
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              setAuthModalOpen(true);
                            } else {
                              setEditingResource(null);
                              setPostModalOpen(true);
                            }
                          }}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer"
                        >
                          ร่วมแบ่งปันสื่อใหม่ในหมวดนี้
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Grid of Resource Cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                      {resources.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          isFavorited={favoritesSet.has(resource.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onSelect={handleSelectResource}
                          onShare={handleShare}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {currentTab === 'categories' && (
          <CategoriesView
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentTab('browse');
            }}
            categoryCounts={categoryCounts}
          />
        )}

        {/* Favorites Tab */}
        {currentTab === 'favorites' && (
          <FavoritesView
            favoriteResources={favoriteResourceObjects}
            loading={loadingFavorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectResource={handleSelectResource}
            onShare={handleShare}
            onBrowseMore={() => setCurrentTab('browse')}
          />
        )}

        {/* My Posts Tab */}
        {currentTab === 'my-posts' && (
          <MyPostsView
            myResources={myResources}
            loading={loadingResources}
            favoritesSet={favoritesSet}
            onToggleFavorite={handleToggleFavorite}
            onSelectResource={handleSelectResource}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
            onShare={handleShare}
            onOpenCreate={() => {
              setEditingResource(null);
              setPostModalOpen(true);
            }}
          />
        )}

        {/* Admin Dashboard Tab */}
        {currentTab === 'admin' && (
          <AdminDashboard onSelectResource={handleSelectResource} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentTab('browse');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setAuthModalOpen(true);
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
      />

      <PostResourceModal
        isOpen={postModalOpen}
        onClose={() => {
          setPostModalOpen(false);
          setEditingResource(null);
        }}
        editingResource={editingResource}
        onSuccess={() => {
          fetchResources();
        }}
      />

      <ResourceDetailModal
        resource={selectedResource}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedResource(null);
        }}
        isFavorited={selectedResource ? favoritesSet.has(selectedResource.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onEdit={handleEditResource}
        onDelete={handleDeleteResource}
        onOpenReport={(res) => {
          setReportingResource(res);
          setReportModalOpen(true);
        }}
      />

      <ReportModal
        resource={reportingResource}
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportingResource(null);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SettingsProvider>
          <MainApp />
        </SettingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
