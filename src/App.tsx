import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  StorageService,
  getDeletedLessonIds,
  recordDeletedLessonId,
  unrecordDeletedLessonId,
  subscribeLocalBroadcast,
  saveAllLessonsToIndexedDB,
  deleteLessonFromIndexedDB,
} from './services/storageService';
import { FirestoreService } from './services/firestoreService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    return FirestoreService.getCurrentSession();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(() => {
    return !FirestoreService.getCurrentSession();
  });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const [lessons, setLessons] = useState<MathLesson[]>(() => {
    try {
      const deletedIds = getDeletedLessonIds();
      const local = localStorage.getItem('mathslide_lessons_v2');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.filter((l: MathLesson) => !deletedIds.has(l.id));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [currentLessonId, setCurrentLessonId] = useState<string>(() => {
    try {
      const wsRaw = localStorage.getItem('mathslide_workspace_state_v2');
      if (wsRaw) {
        const ws = JSON.parse(wsRaw);
        if (ws?.activeLessonId) return ws.activeLessonId;
      }
      const deletedIds = getDeletedLessonIds();
      const local = localStorage.getItem('mathslide_lessons_v2');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((l: MathLesson) => !deletedIds.has(l.id));
          if (filtered.length > 0) return filtered[0].id;
        }
      }
      return '';
    } catch {
      return '';
    }
  });

  const [activeTab, setActiveTab] = useState<'slides' | 'questions' | 'library'>(() => {
    try {
      const wsRaw = localStorage.getItem('mathslide_workspace_state_v2');
      if (wsRaw) {
        const ws = JSON.parse(wsRaw);
        if (ws?.activeTab === 'slides' || ws?.activeTab === 'questions' || ws?.activeTab === 'library') {
          return ws.activeTab;
        }
      }
    } catch {}
    return 'slides';
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSynced, setIsSynced] = useState(true);
  const [isSyncing, setIsSyncing] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const lastWorkspaceSyncTimeRef = useRef<number>(0);

  // Helper to apply incoming single-lesson save from real-time streams (SSE / BroadcastChannel)
  const applyIncomingLessonSave = useCallback((incomingLesson: MathLesson) => {
    if (!incomingLesson || !incomingLesson.id) return;
    const deletedIds = getDeletedLessonIds();
    if (deletedIds.has(incomingLesson.id)) return;

    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === incomingLesson.id);
      if (idx >= 0) {
        const existing = prev[idx];
        if ((incomingLesson.updatedAt || 0) < (existing.updatedAt || 0)) {
          return prev;
        }
        // Skip state update if identical
        if (
          incomingLesson.updatedAt === existing.updatedAt &&
          JSON.stringify(incomingLesson) === JSON.stringify(existing)
        ) {
          return prev;
        }
        const next = [...prev];
        next[idx] = incomingLesson;
        next.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        try {
          localStorage.setItem('mathslide_lessons_v2', JSON.stringify(next));
          saveAllLessonsToIndexedDB(next).catch(() => {});
        } catch {}
        return next;
      } else {
        const next = [incomingLesson, ...prev].sort(
          (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
        );
        try {
          localStorage.setItem('mathslide_lessons_v2', JSON.stringify(next));
          saveAllLessonsToIndexedDB(next).catch(() => {});
        } catch {}
        return next;
      }
    });

    setCurrentLessonId((curr) => curr || incomingLesson.id);
  }, []);

  // Helper to apply incoming permanent deletion from real-time streams
  const applyIncomingLessonDelete = useCallback((deletedId: string) => {
    if (!deletedId) return;
    recordDeletedLessonId(deletedId);
    deleteLessonFromIndexedDB(deletedId).catch(() => {});

    setLessons((prev) => {
      if (!prev.some((l) => l.id === deletedId)) return prev;
      const remaining = prev.filter((l) => l.id !== deletedId);
      try {
        localStorage.setItem('mathslide_lessons_v2', JSON.stringify(remaining));
        saveAllLessonsToIndexedDB(remaining).catch(() => {});
      } catch {}
      setCurrentLessonId((curr) => {
        if (curr === deletedId) {
          return remaining.length > 0 ? remaining[0].id : '';
        }
        return curr;
      });
      return remaining;
    });
  }, []);

  // Load lessons & subscribe to all 3 real-time channels (Firestore + Server SSE + BroadcastChannel)
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      setIsSyncing(true);
      try {
        const {
          lessons: loadedLessons,
          activeLessonId,
          activeTab: remoteTab,
        } = await StorageService.loadAllLessons();
        if (isMounted) {
          setLessons(loadedLessons);
          if (remoteTab === 'slides' || remoteTab === 'questions' || remoteTab === 'library') {
            setActiveTab(remoteTab);
          }
          if (loadedLessons.length > 0) {
            setCurrentLessonId((prev) => {
              if (activeLessonId && loadedLessons.some((l) => l.id === activeLessonId)) {
                return activeLessonId;
              }
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

    // 1. Real-Time Firestore Tombstones Listener (deleted_lessons)
    const unsubscribeDeleted = FirestoreService.subscribeDeletedLessons((deletedIdsList) => {
      if (!isMounted || !Array.isArray(deletedIdsList)) return;
      deletedIdsList.forEach((delId) => {
        applyIncomingLessonDelete(delId);
      });
      if (deletedIdsList.length > 0) {
        fetch('/api/sync-deleted-ids', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedIds: deletedIdsList }),
        }).catch(() => {});
      }
    });

    // 2. Real-Time Firestore Lessons Listener (lessons) - Authoritative across all devices/tabs
    const unsubscribeLessons = FirestoreService.subscribeLessons((remoteLessons, removedIds) => {
      if (!isMounted || !Array.isArray(remoteLessons)) return;
      if (Array.isArray(removedIds) && removedIds.length > 0) {
        removedIds.forEach((remId) => applyIncomingLessonDelete(remId));
      }

      const deletedIds = getDeletedLessonIds();
      const removedSet = new Set(removedIds || []);
      const validRemote = remoteLessons.filter(
        (l) => l && l.id && !deletedIds.has(l.id) && !removedSet.has(l.id)
      );

      setLessons((prev) => {
        const mergedMap = new Map<string, MathLesson>();
        const now = Date.now();

        // Keep only very recent in-flight local edits (< 8s old) that haven't round-tripped yet
        prev.forEach((l) => {
          if (
            l &&
            l.id &&
            !deletedIds.has(l.id) &&
            !removedSet.has(l.id) &&
            (l.updatedAt || 0) > now - 8000
          ) {
            mergedMap.set(l.id, l);
          }
        });

        validRemote.forEach((rLesson) => {
          const existing = mergedMap.get(rLesson.id);
          if (!existing || (rLesson.updatedAt || 0) >= (existing.updatedAt || 0)) {
            mergedMap.set(rLesson.id, rLesson);
            // Also keep Express server in sync
            fetch('/api/sync-save-lesson?reconcile=true', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rLesson),
            }).catch(() => {});
          }
        });

        const nextList = Array.from(mergedMap.values()).sort(
          (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
        );

        // Avoid redundant state updates if identical
        if (
          nextList.length === prev.length &&
          nextList.every(
            (item, idx) =>
              prev[idx] &&
              item.id === prev[idx].id &&
              item.updatedAt === prev[idx].updatedAt
          )
        ) {
          return prev;
        }

        try {
          localStorage.setItem('mathslide_lessons_v2', JSON.stringify(nextList));
          saveAllLessonsToIndexedDB(nextList).catch(() => {});
        } catch {}
        return nextList;
      });

      setCurrentLessonId((curr) => {
        if (curr && validRemote.some((l) => l.id === curr)) return curr;
        return validRemote[0]?.id || '';
      });
    });

    // 3. Real-Time Firestore Workspace State Listener
    const unsubscribeWorkspace = FirestoreService.subscribeWorkspaceState((wsState) => {
      if (!isMounted || !wsState) return;
      const incomingTime = wsState.updatedAt || 0;
      if (incomingTime > lastWorkspaceSyncTimeRef.current) {
        lastWorkspaceSyncTimeRef.current = incomingTime;
        const deletedIds = getDeletedLessonIds();
        if (wsState.activeLessonId && !deletedIds.has(wsState.activeLessonId)) {
          setCurrentLessonId(wsState.activeLessonId);
        }
        if (
          wsState.activeTab === 'slides' ||
          wsState.activeTab === 'questions' ||
          wsState.activeTab === 'library'
        ) {
          setActiveTab(wsState.activeTab);
        }
      }
    });

    // 4. Real-Time Server-Sent Events (SSE) Listener (/api/events)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === 'lesson:saved' && parsed.payload) {
            applyIncomingLessonSave(parsed.payload as MathLesson);
          } else if (parsed.type === 'lesson:deleted' && parsed.payload?.id) {
            applyIncomingLessonDelete(parsed.payload.id);
          } else if (parsed.type === 'workspace:updated' && parsed.payload) {
            const incomingTime = parsed.payload.updatedAt || 0;
            if (incomingTime > lastWorkspaceSyncTimeRef.current) {
              lastWorkspaceSyncTimeRef.current = incomingTime;
              const deletedIds = getDeletedLessonIds();
              if (parsed.payload.activeLessonId && !deletedIds.has(parsed.payload.activeLessonId)) {
                setCurrentLessonId(parsed.payload.activeLessonId);
              }
              if (
                parsed.payload.activeTab === 'slides' ||
                parsed.payload.activeTab === 'questions' ||
                parsed.payload.activeTab === 'library'
              ) {
                setActiveTab(parsed.payload.activeTab);
              }
            }
          }
        } catch {}
      };
    } catch {}

    // 5. Real-Time Same-Browser Cross-Tab BroadcastChannel Listener
    const unsubscribeBroadcast = subscribeLocalBroadcast((msg) => {
      if (!isMounted) return;
      if (msg.type === 'lesson:saved' && msg.payload) {
        applyIncomingLessonSave(msg.payload as MathLesson);
      } else if (msg.type === 'lesson:deleted' && msg.payload?.id) {
        applyIncomingLessonDelete(msg.payload.id);
      } else if (msg.type === 'workspace:updated' && msg.payload) {
        const incomingTime = msg.payload.updatedAt || 0;
        if (incomingTime > lastWorkspaceSyncTimeRef.current) {
          lastWorkspaceSyncTimeRef.current = incomingTime;
          if (msg.payload.activeLessonId) {
            setCurrentLessonId(msg.payload.activeLessonId);
          }
          if (
            msg.payload.activeTab === 'slides' ||
            msg.payload.activeTab === 'questions' ||
            msg.payload.activeTab === 'library'
          ) {
            setActiveTab(msg.payload.activeTab);
          }
        }
      }
    });

    // 6. Listen to Firebase Auth state in real time
    const unsubscribeAuth = FirestoreService.onUserAuthChange((user) => {
      if (user) {
        setCurrentUser(user);
        setIsLoginModalOpen(false);
      }
    });

    // 7. Listen to network online / offline events
    const handleOnline = async () => {
      setIsOnline(true);
      try {
        setIsSyncing(true);
        const { lessons: refreshed } = await StorageService.loadAllLessons();
        if (isMounted) {
          setLessons(refreshed);
          setIsSynced(true);
        }
      } catch {
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMounted = false;
      unsubscribeDeleted();
      unsubscribeLessons();
      unsubscribeWorkspace();
      unsubscribeBroadcast();
      unsubscribeAuth();
      eventSource?.close();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [applyIncomingLessonSave, applyIncomingLessonDelete]);

  // Subscribe to logged-in user document in real time (instant role/profile/lock/delete sync)
  useEffect(() => {
    if (!currentUser?.uid || currentUser.uid === 'admin_master_root') return;
    const unsubscribeUser = FirestoreService.subscribeUserDoc(currentUser.uid, (updatedUser, isDeleted) => {
      if (isDeleted || (updatedUser && updatedUser.status === 'blocked')) {
        FirestoreService.logout().catch(() => {});
        setCurrentUser(null);
        setIsAdminPanelOpen(false);
        setIsLoginModalOpen(true);
        return;
      }
      if (updatedUser) {
        setCurrentUser((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(updatedUser)) return prev;
          try {
            localStorage.setItem('toan_active_user_session', JSON.stringify(updatedUser));
          } catch {}
          return updatedUser;
        });
      }
    });
    return () => {
      unsubscribeUser();
    };
  }, [currentUser?.uid]);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleChangeTab = useCallback((tab: 'slides' | 'questions' | 'library') => {
    setActiveTab(tab);
    lastWorkspaceSyncTimeRef.current = Date.now();
    StorageService.syncWorkspaceState({ activeTab: tab }).catch(() => {});
  }, []);

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

  // Select lesson & sync active selection across tabs/devices in real time
  const handleSelectLessonId = useCallback((lessonId: string) => {
    setCurrentLessonId(lessonId);
    lastWorkspaceSyncTimeRef.current = Date.now();
    StorageService.syncWorkspaceState({ activeLessonId: lessonId }).catch(() => {});
  }, []);

  // Persist current lessons state across IndexedDB, localStorage, Express Server, and Firestore
  const saveLessonToAllTiers = useCallback((updatedLesson: MathLesson) => {
    setIsSyncing(true);
    const stampedLesson: MathLesson = {
      ...updatedLesson,
      updatedAt: Date.now(),
    };
    setLessons((prev) => {
      const idx = prev.findIndex((l) => l.id === stampedLesson.id);
      let next: MathLesson[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = stampedLesson;
      } else {
        next = [stampedLesson, ...prev];
      }

      StorageService.saveLesson(stampedLesson, next)
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
    handleSelectLessonId(newLesson.id);
    handleChangeTab('slides');
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
        title: 'Slide Trống',
        blocks: [],
        styleConfig: {
          backgroundColor: currentLesson.slides[0]?.styleConfig?.backgroundColor || '#103463',
          textColor: '#ffffff',
          fontFamily: 'sans',
        },
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
    if (
      insertAfterIndex !== undefined &&
      insertAfterIndex >= 0 &&
      insertAfterIndex < newSlides.length
    ) {
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
    handleSelectLessonId(duplicated.id);
  };

  const handleDeleteLesson = useCallback(
    (lessonId: string) => {
      setLessons((prev) => {
        const remaining = prev.filter((l) => l.id !== lessonId);
        const nextActiveId =
          currentLessonId === lessonId ? (remaining.length > 0 ? remaining[0].id : '') : currentLessonId;
        if (nextActiveId !== currentLessonId) {
          setCurrentLessonId(nextActiveId);
          StorageService.syncWorkspaceState({ activeLessonId: nextActiveId }).catch(() => {});
        }
        StorageService.deleteLesson(lessonId, remaining);
        return remaining;
      });
    },
    [currentLessonId]
  );

  const handleImportLesson = (importedLesson: MathLesson) => {
    saveLessonToAllTiers(importedLesson);
    handleSelectLessonId(importedLesson.id);
    handleChangeTab('slides');
  };

  const handleRefreshCloudSync = async () => {
    try {
      setIsSyncing(true);
      const { lessons: refreshed, activeLessonId } = await StorageService.loadAllLessons();
      setLessons(refreshed);
      if (activeLessonId && refreshed.some((l) => l.id === activeLessonId)) {
        setCurrentLessonId(activeLessonId);
      } else if (refreshed.length > 0 && !refreshed.some((l) => l.id === currentLessonId)) {
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
    handleSelectLessonId(newLesson.id);
    handleChangeTab('slides');
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
        setActiveTab={handleChangeTab}
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
              handleSelectLessonId(l.id);
              handleChangeTab('slides');
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
