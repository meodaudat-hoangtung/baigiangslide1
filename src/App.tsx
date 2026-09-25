import React, { useState, useEffect, useCallback } from 'react';
import { SAMPLE_LESSONS } from './data/sampleLessons';
import { MathLesson, Slide, Question, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { StudioWorkspace } from './components/StudioWorkspace';
import { QuizSection } from './components/QuizSection';
import { LessonLibrary } from './components/LessonLibrary';
import { UploadModal } from './components/UploadModal';
import { CreateLessonModal } from './components/CreateLessonModal';
import { EmptyLessonState } from './components/EmptyLessonState';
import { AdminPanelModal } from './components/AdminPanelModal';
import { LoginModal } from './components/LoginModal';
import { FullscreenPresentationModal } from './components/FullscreenPresentationModal';
import { StorageService, getDeletedLessonIds, unrecordDeletedLessonId } from './services/storageService';
import { FirestoreService } from './services/firestoreService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    return FirestoreService.getCurrentSession();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    return !FirestoreService.getCurrentSession();
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);


  const [lessons, setLessons] = useState<MathLesson[]>(() => {
    try {
      const deletedIds = getDeletedLessonIds();
      const local = localStorage.getItem('mathslide_lessons_v2');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((l: MathLesson) => !deletedIds.has(l.id));
          return filtered;
        }
      }
      const isInit = localStorage.getItem('mathslide_initialized_v2');
      if (isInit === 'true') {
        return [];
      }
      return SAMPLE_LESSONS.filter((l) => !deletedIds.has(l.id));
    } catch {
      return SAMPLE_LESSONS;
    }
  });

  const [currentLessonId, setCurrentLessonId] = useState<string>(() => {
    try {
      const deletedIds = getDeletedLessonIds();
      const local = localStorage.getItem('mathslide_lessons_v2');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((l: MathLesson) => !deletedIds.has(l.id));
          if (filtered.length > 0) return filtered[0].id;
          return '';
        }
      }
      const isInit = localStorage.getItem('mathslide_initialized_v2');
      if (isInit === 'true') return '';
      const valid = SAMPLE_LESSONS.filter((l) => !deletedIds.has(l.id));
      return valid[0]?.id || '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<'slides' | 'questions' | 'library'>('slides');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Load lessons using multi-tier storage (Server -> IndexedDB -> LocalStorage)
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setIsSyncing(true);
      try {
        const { lessons: loadedLessons } = await StorageService.loadAllLessons();
        if (isMounted) {
          setLessons(loadedLessons);
          if (loadedLessons.length > 0) {
            setCurrentLessonId((prev) => {
              if (prev && loadedLessons.some((l) => l.id === prev)) return prev;
              return loadedLessons[0].id;
            });
          } else {
            setCurrentLessonId('');
          }
          setIsSynced(true);
        }
      } catch (err) {
        console.error('Error loading lessons:', err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    initData();

    // Listen to Firebase Auth state in real time
    const unsubscribeAuth = FirestoreService.onUserAuthChange((user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
      }
    });


    // Listen to network online / offline events
    const handleOnline = async () => {
      setIsOnline(true);
      // Flush local state to server when network reconnects
      try {
        setIsSyncing(true);
        const { lessons: currentLocal } = await StorageService.loadAllLessons();
        for (const l of currentLocal) {
          await fetch('/api/sync-save-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(l),
          }).catch(() => {});
        }
        setIsSynced(true);
      } catch {
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      unsubscribeAuth();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await FirestoreService.logout();
      setCurrentUser(null);
      setIsAdminPanelOpen(false);
      setIsLoginModalOpen(true);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };


  const currentLesson = lessons.find((l) => l.id === currentLessonId) || lessons[0] || null;

  // Persist current lessons state across IndexedDB, localStorage and backend server
  const saveLessonToAllTiers = useCallback((updatedLesson: MathLesson) => {
    setIsSyncing(true);
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === updatedLesson.id);
      let next: MathLesson[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedLesson;
      } else {
        next = [updatedLesson, ...prev];
      }

      // Persist to storage tiers with the exact fresh list
      StorageService.saveLesson(updatedLesson, next)
        .then(({ isSynced: synced }) => {
          setIsSynced(synced);
        })
        .catch((err) => {
          console.error('Save failed:', err);
          setIsSynced(false);
        })
        .finally(() => {
          setIsSyncing(false);
        });

      return next;
    });
  }, []);

  const handleLessonGenerated = (newLesson: MathLesson) => {
    saveLessonToAllTiers(newLesson);
    setCurrentLessonId(newLesson.id);
    setActiveTab('slides');
  };

  const handleUpdateSlide = (updatedSlide: Slide) => {
    if (!currentLesson) return;
    const updatedSlides = currentLesson.slides.map((s) =>
      s.id === updatedSlide.id ? updatedSlide : s
    );
    const updatedLesson: MathLesson = {
      ...currentLesson,
      slides: updatedSlides,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!currentLesson) return;
    const remaining = currentLesson.slides.filter((s) => s.id !== slideId);
    if (remaining.length === 0) {
      const defaultSlide: Slide = {
        id: `slide_${Date.now()}`,
        slideNumber: 1,
        title: 'Tiêu Đề Bài Học Mới',
        subtitle: 'Nhập nội dung bài giảng tại đây',
        category: 'definition',
        layout: 'standard',
        suggestedDurationMin: 5,
        sections: [
          {
            id: `sec_${Date.now()}`,
            title: '1. Kiến thức trọng tâm',
            content: 'Nội dung kiến thức bài học...',
            blocks: []
          }
        ]
      };
      const updatedLesson: MathLesson = {
        ...currentLesson,
        slides: [defaultSlide],
        updatedAt: Date.now(),
      };
      saveLessonToAllTiers(updatedLesson);
      return;
    }
    const reindexed = remaining.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1,
    }));
    const updatedLesson: MathLesson = {
      ...currentLesson,
      slides: reindexed,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleAddSlide = (newSlide: Slide, insertAfterIndex?: number) => {
    if (!currentLesson) return;
    const newSlides = [...currentLesson.slides];
    if (insertAfterIndex !== undefined && insertAfterIndex >= 0 && insertAfterIndex < newSlides.length) {
      newSlides.splice(insertAfterIndex + 1, 0, newSlide);
    } else {
      newSlides.push(newSlide);
    }
    const reindexed = newSlides.map((s, idx) => ({
      ...s,
      slideNumber: idx + 1,
    }));
    const updatedLesson: MathLesson = {
      ...currentLesson,
      slides: reindexed,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (!currentLesson) return;
    const updatedQuestions = currentLesson.questions.map((q) =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    const updatedLesson: MathLesson = {
      ...currentLesson,
      questions: updatedQuestions,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!currentLesson) return;
    const remaining = currentLesson.questions.filter((q) => q.id !== questionId);
    const reindexed = remaining.map((q, idx) => ({
      ...q,
      questionNumber: idx + 1,
    }));
    const updatedLesson: MathLesson = {
      ...currentLesson,
      questions: reindexed,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleAddQuestion = (newQuestion: Question) => {
    if (!currentLesson) return;
    const newQuestions = [...currentLesson.questions, newQuestion];
    const reindexed = newQuestions.map((q, idx) => ({
      ...q,
      questionNumber: idx + 1,
    }));
    const updatedLesson: MathLesson = {
      ...currentLesson,
      questions: reindexed,
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(updatedLesson);
  };

  const handleUpdateLesson = (updatedLesson: MathLesson) => {
    saveLessonToAllTiers(updatedLesson);
  };

  const handleDuplicateLesson = (lessonToDuplicate: MathLesson) => {
    const duplicated: MathLesson = {
      ...lessonToDuplicate,
      id: `lesson-${Date.now()}`,
      title: `${lessonToDuplicate.title} (Bản sao)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveLessonToAllTiers(duplicated);
    setCurrentLessonId(duplicated.id);
  };

  const handleDeleteLesson = useCallback((lessonId: string) => {
    setLessons((prev) => {
      const remaining = prev.filter((l) => l.id !== lessonId);
      setCurrentLessonId((curr) => {
        if (curr === lessonId) {
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return curr;
      });
      StorageService.deleteLesson(lessonId, remaining);
      return remaining;
    });
  }, []);

  const handleImportLesson = (importedLesson: MathLesson) => {
    saveLessonToAllTiers(importedLesson);
    setCurrentLessonId(importedLesson.id);
    setActiveTab('slides');
  };

  const handleRefreshCloudSync = async () => {
    try {
      setIsSyncing(true);
      const { lessons: refreshed } = await StorageService.loadAllLessons();
      setLessons(refreshed);
      if (refreshed.length > 0 && !refreshed.some((l) => l.id === currentLessonId)) {
        setCurrentLessonId(refreshed[0].id);
      }
      setIsSynced(true);
    } catch (err) {
      console.error('Refresh sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewLesson = (newLesson: MathLesson) => {
    saveLessonToAllTiers(newLesson);
    setCurrentLessonId(newLesson.id);
    setActiveTab('slides');
  };

  const handleRestoreSampleLessons = async () => {
    try {
      setIsSyncing(true);
      // Un-record deleted IDs
      SAMPLE_LESSONS.forEach((s) => {
        unrecordDeletedLessonId(s.id);
      });
      setLessons(SAMPLE_LESSONS);
      setCurrentLessonId(SAMPLE_LESSONS[0]?.id || '');
      setActiveTab('slides');
      for (const s of SAMPLE_LESSONS) {
        await StorageService.saveLesson(s, SAMPLE_LESSONS).catch(() => {});
      }
      setIsSynced(true);
    } catch (err) {
      console.error('Error restoring sample lessons:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  const handleToggleFullscreen = () => {
    if (currentLesson && currentLesson.slides.length > 0) {
      setIsPresentationOpen(true);
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentLesson={currentLesson}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenCreateLesson={() => setIsCreateModalOpen(true)}
        onToggleFullscreen={handleToggleFullscreen}
        isSynced={isSynced}
        isOnline={isOnline}
        isSyncing={isSyncing}
        currentUser={currentUser}
        onLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAdminPanel={() => {
          if (currentUser?.role === 'admin') {
            setIsAdminPanelOpen(true);
          }
        }}
      />


      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'library' ? (
          <LessonLibrary
            lessons={lessons}
            currentLessonId={currentLessonId}
            onSelectLesson={(l) => {
              setCurrentLessonId(l.id);
              setActiveTab('slides');
            }}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onDuplicateLesson={handleDuplicateLesson}
            onImportLesson={handleImportLesson}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onRefreshCloudSync={handleRefreshCloudSync}
            isSyncing={isSyncing}
            isOnline={isOnline}
          />
        ) : currentLesson ? (
          <>
            {activeTab === 'slides' && (
              <StudioWorkspace
                lesson={currentLesson}
                onUpdateSlide={handleUpdateSlide}
                onDeleteSlide={handleDeleteSlide}
                onAddSlide={handleAddSlide}
              />
            )}

            {activeTab === 'questions' && (
              <QuizSection
                lesson={currentLesson}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onAddQuestion={handleAddQuestion}
              />
            )}
          </>
        ) : (
          <EmptyLessonState
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onImportLesson={handleImportLesson}
            onRefreshCloudSync={handleRefreshCloudSync}
            isSyncing={isSyncing}
          />
        )}
      </main>

      {/* Upload AI Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onLessonGenerated={handleLessonGenerated}
      />

      {/* Create Lesson Modal */}
      <CreateLessonModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateLesson={handleCreateNewLesson}
      />

      {/* Login Authentication Gate */}
      <LoginModal
        isOpen={!currentUser || isLoginModalOpen}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin Panel Modal (Strictly for Admin) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen && currentUser?.role === 'admin'}
        onClose={() => setIsAdminPanelOpen(false)}
        currentUser={currentUser}
      />

      {/* Fullscreen Presentation Modal */}
      {currentLesson && (
        <FullscreenPresentationModal
          lesson={currentLesson}
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
        />
      )}

    </div>
  );
}
