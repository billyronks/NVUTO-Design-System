import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Magnifer as MagniferRounded,
  ChatLine as ChatLineIcon,
  SendSquare as SendRounded,
  PhoneRounded,
  VideoFrame as VideoFrameRounded,
  Gallery as GalleryRounded,
  Document as DocumentRounded,
  PaperclipRounded,
  AltArrowDown as ArrowDownIcon,
  AltArrowRight as ArrowRightIcon,
  UsersGroupTwoRounded as UsersIcon,
  Settings as SettingsIcon,
  BellBing as BellIcon,
  Pin as PinIcon,
  Link as LinkRounded,
  PlayCircle as PlayCircleRounded,
  PauseCircle as PauseCircleRounded,
  MenuDots as MenuDotsRounded,
  Microphone as MicrophoneRounded,
  Widget5 as WidgetIcon,
  AltArrowLeft as AltArrowLeftIcon,
  Archive as ArchiveIcon,
  TrashBinMinimalistic as TrashIcon,
  Pen as PenIcon2,
  Copy as CopyIcon,
  SmileCircle as SmileCircleIcon,
  CheckCircle as CheckCircleIcon
} from '@solar-icons/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuLabel,
} from '@/app/components/ui/context-menu';
import { Card } from '@/app/components/ui/card';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  Button,
  Badge,
  Avatar,
  Input,
  Modal,
  EmptyState,
  TableWrapper,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyState
} from '@/app/components/ui';
import { useToast } from '../../context/useToast';
import { getApiBaseUrl } from '../../../lib/apiClient';
import { OrgEmployee } from '../../../types/api.types';
import { getEmployee, getEmployees as searchLiveEmployees } from '../../../services/employeeService';
import {
  fetchDirectory,
  fetchThread,
  sendMessage,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  persistBotReply,
  updateThreadPreview,
  createThread,
  createDirectChannel,
  getChatPresence,
  deleteThread,
  reloadDirectory,
  uploadChatFile,
  fetchChatMediaBlob,
  markThreadAsRead,
  fetchThreadMedia,
	updateThreadPreferences,
	leaveGroup,
} from '../../../services/chatService';
import { getActiveRole, getCurrentUser } from '../../../services/authService';
import { getAppSettings } from '../../../services/userPreferencesService';
import { useChatStream } from '../../../hooks/useChatStream';
import { useAuth } from '../../context/AuthContext';
import { useMediaViewer } from '../../context/MediaViewerContext';
import type { ChatMessage as ChatMessageType, ChatThread as ChatThreadType } from '../../../types/api.types';
import { CreateGroupWizardModal } from './CreateGroupWizardModal';
import { NewChatContactModal } from './NewChatContactModal';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { EmployeeDossierVault } from './EmployeeDossierVault';
import { ChatOptionsMenu } from './ChatOptionsMenu';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';

// All local interfaces replaced by canonical types from src/types/api.types.ts
// ChatMessageType and ChatThreadType are imported above.
// This satisfies the Type Safety Lockdown mandate (Phase 3).
type ChatMessage = ChatMessageType;
type ChatListItem = ChatThreadType;

const formatLastSeen = (lastSeenAt?: string): string => {
  if (!lastSeenAt) return 'Offline';
  try {
    const d = new Date(lastSeenAt);
    if (isNaN(d.getTime())) return 'Offline';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Active Now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Last seen just now';
    if (diffMins < 60) return `Last seen ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Last seen ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Last seen yesterday';
    if (diffDays < 7) return `Last seen ${diffDays}d ago`;
    return `Last seen ${d.toLocaleDateString()}`;
  } catch {
    return 'Offline';
  }
};

const SidebarSkeleton: React.FC = () => (
  <div className="flex flex-col gap-3 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-[#171E2E] rounded-xl">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="w-24 h-3" />
          <Skeleton className="w-36 h-2.5" />
        </div>
      </div>
    ))}
  </div>
);

const ThreadSkeleton: React.FC = () => (
  <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`flex items-end gap-3 max-w-[70%] ${i % 2 === 0 ? 'self-end flex-row-reverse' : 'self-start'}`}>
        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        <div className={`p-4 rounded-xl ${i % 2 === 0 ? 'bg-[#FF4F00]/20' : 'bg-slate-100 dark:bg-[#171E2E]'} flex flex-col gap-2 w-48`}>
          <Skeleton className="w-full h-3" />
          <Skeleton className="w-2/3 h-2.5" />
        </div>
      </div>
    ))}
  </div>
);

const AuthenticatedChatImage: React.FC<{
  src: string;
  alt: string;
}> = ({ src, alt }) => {
  const { openPreview } = useMediaViewer();
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isCancelled = false;
    if (!src) {
      setIsLoading(false);
      return;
    }
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setBlobUrl(src);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchChatMediaBlob(src)
      .then((blob) => {
        if (!isCancelled) {
          const url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.warn('Authenticated image fetch fallback:', err);
          setBlobUrl(src);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [src]);

  const handleOpen = () => {
    openPreview({
      url: blobUrl || src,
      fileName: alt || 'Shared image',
      allowDownload: true
    });
  };

  return (
    <div
      className="rounded-xl overflow-hidden w-72 box-border shadow-xs border border-slate-200/50 dark:border-[#232D42] cursor-pointer bg-slate-100 dark:bg-[#171E2E]"
      onClick={handleOpen}
      title={alt || 'Open image'}
    >
      {isLoading ? (
        <div className="w-full h-40 flex items-center justify-center text-xs text-slate-400">
          Loading image...
        </div>
      ) : (
        <img
          src={blobUrl || src}
          alt={alt || 'Shared image'}
          className="w-full h-auto max-h-80 object-cover block"
        />
      )}
    </div>
  );
};

export const UnifiedChatWorkspace: React.FC = () => {
  const { addToast } = useToast();
  const { openPreview } = useMediaViewer();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'Inbox' | 'Groups'>('Inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string>(''); // represents NVUTO Product Team
  const [mobilePane, setMobilePane] = useState<'inbox' | 'conversation' | 'details'>('inbox');
  const [composerValue, setComposerValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [playbackElapsed, setPlaybackElapsed] = useState<number>(0);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isViewingArchive, setIsViewingArchive] = useState(false);
  // ── Phase 3: Edit state machine ──────────────────────────────────────────
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const composerRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const scrollable = scrollContainerRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollable) {
        scrollable.scrollTop = scrollable.scrollHeight;
      } else {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  };

  // ── Service-layer state ───────────────────────────────────────────────────
  const [listItems, setListItems] = useState<ChatListItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [localMessagesMap, setLocalMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [vaultActiveTab, setVaultActiveTab] = useState<'Members' | 'Media' | 'Documents' | 'Links' | null>(null);
  const { data: prefRes } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: getAppSettings,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount, error: any) => error?.status !== 403 && error?.status !== 401 && failureCount < 2,
  });

  const persistChatHistory = prefRes?.data?.persistChatHistory ?? true;

  // Clear local messages cache on unmount when chat history persistence is disabled
  useEffect(() => {
    return () => {
      if (!persistChatHistory) {
        setLocalMessagesMap({});
        setMessages([]);
      }
    };
  }, [persistChatHistory]);

	const { user: currentAuthUser } = useAuth();
	const [currentRole, setCurrentRole] = useState<string>('employee');
	const [currentEmpId, setCurrentEmpId] = useState<string>(() => currentAuthUser?.employeeId || currentAuthUser?.id || '');
  const [employeesList, setEmployeesList] = useState<OrgEmployee[]>([]);
  const resolvedDeepLinkEmployeesRef = useRef<Set<string>>(new Set());

  const safeListItems = useMemo<ChatListItem[]>(() => {
    if (Array.isArray(listItems)) return listItems;
    if (listItems && typeof listItems === 'object') {
      if (Array.isArray((listItems as any).data)) return (listItems as any).data;
      if (Array.isArray((listItems as any).threads)) return (listItems as any).threads;
      if (Array.isArray((listItems as any).directory)) return (listItems as any).directory;
    }
    return [];
  }, [listItems]);

  const activeThreadDetails = useMemo(() => {
    if (!activeThreadId) {
      return {
        name: 'No Conversation Selected',
        avatarUrl: '',
        memberCount: 'Select a thread to start chatting',
        recipientId: '',
        email: '',
        phone: '',
        title: '',
        department: '',
      };
    }
    const found = safeListItems.find(item => item.id === activeThreadId);

    if (found && !found.isGroup) {
      const recipientId = found.participantIds?.find(id => id !== currentEmpId);
      const recipient = employeesList.find(emp => emp.id === recipientId);
      if (recipient) {
        return {
          name: recipient.name,
          avatarUrl: recipient.avatarUrl || '',
          memberCount: 'Active Now',
          recipientId: recipientId || '',
          email: recipient.email || '',
          phone: recipient.phone || '',
          title: recipient.title || 'Staff Member',
          department: recipient.department || 'General',
        };
      }
    }

    return {
      name: found?.name || 'Conversation',
			avatarUrl: found?.avatarUrl || '',
      memberCount: found?.isGroup ? 'Group Chat' : 'Active Now',
      recipientId: '',
      email: '',
      phone: '',
      title: 'Member',
      department: 'General',
    };
  }, [activeThreadId, listItems, currentEmpId, employeesList]);

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const audioBlobUrlMapRef = useRef<Map<string, string>>(new Map());

  // ── Role from authService ─────────────────────────────────────────────────

  useEffect(() => {
    getActiveRole().then((res) => setCurrentRole(res.data));
    const handleRole = () => getActiveRole().then((res) => setCurrentRole(res.data));
    window.addEventListener('storage', handleRole);
    return () => window.removeEventListener('storage', handleRole);
  }, []);

  useEffect(() => {
    if (currentAuthUser?.employeeId || currentAuthUser?.id) {
      setCurrentEmpId(currentAuthUser.employeeId || currentAuthUser.id);
    }
  }, [currentAuthUser]);

  useEffect(() => {
    getCurrentUser().then((res) => {
      const empId = res.data?.employeeId || res.data?.id;
      if (empId) {
        setCurrentEmpId(empId);
      }
    });
  }, []);

  const [pendingDeleteThreadId, setPendingDeleteThreadId] = useState<string | null>(null);
  const [pendingDeleteMessageId, setPendingDeleteMessageId] = useState<string | null>(null);

  // Initialize the real-time chat SSE stream subscriber
  const { connectionStatus } = useChatStream({
    activeThreadId,
    setMessages,
    setListItems,
    currentEmployeeId: currentEmpId,
  });

  // ── Employee list from live backend ─────────────────

  useEffect(() => {
    searchLiveEmployees({ limit: 100 })
      .then(res => {
        const mapped: OrgEmployee[] = (res.data || []).map(emp => ({
          id: emp.id,
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed',
          title: emp.jobTitle || 'No Title',
          department: emp.department || 'General',
          location: emp.officeLocation || 'Remote',
          email: emp.workEmail || '',
          phone: emp.phone || '',
          avatarUrl: emp.profilePictureUrl || '',
          reportingManagerId: emp.reportingManagerId || null,
        }));
        setEmployeesList(mapped);
      })
      .catch(err => console.error("Failed to load chat contact selection list:", err));
  }, []);

  // Resolve deep-linked recipients with a tenant-scoped server search instead
  // of assuming they are present in the first directory page.
  useEffect(() => {
    const targetEmail = searchParams.get('email') || (location.state as any)?.recipientEmail || (location.state as any)?.email;
    if (!targetEmail || resolvedDeepLinkEmployeesRef.current.has(targetEmail)) return;
    resolvedDeepLinkEmployeesRef.current.add(targetEmail);
    searchLiveEmployees({ search: targetEmail, limit: 10, status: 'active' })
      .then((res) => {
        const found = (res.data || []).find((employee) =>
          (employee.workEmail || '').toLowerCase() === targetEmail.toLowerCase());
        if (!found) return;
        const mapped: OrgEmployee = {
          id: found.id,
          name: `${found.firstName || ''} ${found.lastName || ''}`.trim() || 'Unnamed',
          title: found.jobTitle || 'No Title', department: found.department || 'General',
          location: found.officeLocation || 'Remote', email: found.workEmail || '', phone: found.phone || '',
          avatarUrl: found.profilePictureUrl || '', reportingManagerId: found.reportingManagerId || null,
        };
        setEmployeesList((current) => current.some((employee) => employee.id === mapped.id) ? current : [...current, mapped]);
      })
      .catch(() => resolvedDeepLinkEmployeesRef.current.delete(targetEmail));
  }, [location.state, searchParams]);

  // ── Auto-select or initialize direct chat thread for target recipient ──────
  useEffect(() => {
    // Wait until chat directory has loaded so we don't attempt duplicate thread creation
    if (isLoadingDirectory) return;

    const targetEmail = searchParams.get('email') || (location.state as any)?.recipientEmail || (location.state as any)?.email;
    const rawTargetEmpId = searchParams.get('empId') || searchParams.get('recipientId') || (location.state as any)?.recipientId || (location.state as any)?.empId;
    const targetEmpId = rawTargetEmpId || (targetEmail ? employeesList.find(e => e.email === targetEmail)?.id : undefined);
    const targetName = searchParams.get('name') || (location.state as any)?.recipientName || (location.state as any)?.name;
    const targetAvatar = (location.state as any)?.recipientAvatar || '';

    if (!targetEmail && !targetEmpId && !targetName) return;

    // Search in existing safeListItems (directory threads)
    const existingThread = safeListItems.find((item) => {
      if (item.isGroup) return false;
      const matchId = targetEmpId && item.participantIds?.includes(targetEmpId);
      const matchName = targetName && item.name?.toLowerCase().trim() === targetName.toLowerCase().trim();
      return Boolean(matchId || matchName);
    });

    if (existingThread) {
      setActiveThreadId(existingThread.id);
    } else if (targetEmpId && targetEmpId.trim() !== '' && targetEmpId !== currentEmpId) {
      createDirectChannel(targetEmpId)
        .then((res) => {
          const newThread = res.data;
          if (newThread && newThread.id) {
            setListItems((prev) => {
              const exists = prev.some((t) => t.id === newThread.id);
              if (exists) return prev;
              return [newThread, ...prev];
            });
            setActiveThreadId(newThread.id);
          }
        })
        .catch((err: any) => {
          addToast('danger', 'Creation Failed', err?.message || 'Failed to open conversation.');
        });
    } else if (targetName || targetEmail) {
      addToast('danger', 'Recipient Not Found', `Could not resolve an employee record for ${targetName || targetEmail} to start a conversation.`);
    }
  }, [searchParams, location.state, safeListItems, currentEmpId, employeesList, isLoadingDirectory]);

  const isGroup = useMemo(() => {
    const found = safeListItems.find(item => item.id === activeThreadId);
    return found ? found.isGroup : false;
  }, [activeThreadId, safeListItems]);

  useEffect(() => {
    setVaultActiveTab(null);
    setIsSettingsOpen(false);
  }, [activeThreadId]);

  // ── Voice recording timer ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecordingVoice) {
      setRecordingDuration(0);
      interval = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isRecordingVoice]);

  // ── Audio playback elapsed timer ──────────────────────────────────────────
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }

    if (!playingMsgId) {
      setPlaybackElapsed(0);
      return;
    }

    const msg = messages.find((m) => m.id === playingMsgId);
    if (!msg || !msg.body) {
      setPlayingMsgId(null);
      return;
    }

    let isCancelled = false;

    const playVoiceNote = async () => {
      try {
        let objectUrl = audioBlobUrlMapRef.current.get(msg.id);
        if (!objectUrl) {
          const blob = await fetchChatMediaBlob(msg.body);
          if (isCancelled) return;
          objectUrl = URL.createObjectURL(blob);
          audioBlobUrlMapRef.current.set(msg.id, objectUrl);
        }

        if (isCancelled) return;

        const audio = new Audio(objectUrl);
        audioPlayerRef.current = audio;
        setPlaybackElapsed(0);

        const handleTimeUpdate = () => {
          setPlaybackElapsed(Math.floor(audio.currentTime));
        };

        const handleEnded = () => {
          setPlayingMsgId(null);
          setPlaybackElapsed(0);
        };

        const handleError = (e: any) => {
          console.error('Audio playback failed:', e);
          addToast('error', 'Audio Player', 'Failed to play voice note.');
          setPlayingMsgId(null);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        await audio.play();
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Audio playback failed:', err);
          addToast('error', 'Audio Player', err?.message || 'Failed to load audio for playback.');
          setPlayingMsgId(null);
        }
      }
    };

    playVoiceNote();

    return () => {
      isCancelled = true;
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
    };
  }, [playingMsgId, messages]);

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      audioBlobUrlMapRef.current.forEach((url) => URL.revokeObjectURL(url));
      audioBlobUrlMapRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [activeThreadId]);

  useEffect(() => {
    if (activeThreadId) {
      markThreadAsRead(activeThreadId).then(() => {
        setListItems((prev) =>
          prev.map((item) =>
            item.id === activeThreadId ? { ...item, unreadCount: 0 } : item
          )
        );
      }).catch((err) => console.error('Failed to persist chat read receipt:', err));
    }
  }, [activeThreadId]);

  // Load chat directory via react-query useQuery
  const {
    data: directoryQueryData,
    isLoading: isLoadingDirectoryQuery,
    isError: isDirectoryError,
    refetch: refetchDirectory,
  } = useQuery({
    queryKey: ['chatDirectory'],
    queryFn: () => fetchDirectory().then((res) => res.data || []),
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (directoryQueryData && !isDirectoryError) {
      setListItems(directoryQueryData);
      setIsLoadingDirectory(false);
      const hasActive = directoryQueryData.some((item) => item.id === activeThreadId);
      if (!hasActive && directoryQueryData.length > 0) {
        setActiveThreadId(directoryQueryData[0].id);
      } else if (!hasActive && !activeThreadId) {
        setActiveThreadId('');
      }
    }
  }, [directoryQueryData, isDirectoryError]);

  useEffect(() => {
    if (!isLoadingDirectoryQuery || isDirectoryError) {
      setIsLoadingDirectory(false);
    } else {
      setIsLoadingDirectory(true);
    }
  }, [isLoadingDirectoryQuery, isDirectoryError]);

  // ── Load thread messages via react-query useQuery ──────────────────────────
  const { data: threadQueryData, isLoading: isLoadingThreadQuery } = useQuery({
    queryKey: ['chatThread', activeThreadId],
    queryFn: () => fetchThread(activeThreadId).then((res) => res.data || []),
    enabled: !!activeThreadId,
  });

  // ── Load thread media via react-query useQuery ─────────────────────────────
  const { data: mediaQueryData } = useQuery({
    queryKey: ['threadMedia', activeThreadId],
    queryFn: () => fetchThreadMedia(activeThreadId).then((res) => res.data),
    enabled: !!activeThreadId,
  });

  const sidebarMedia = useMemo(() => {
    return {
      images: Array.isArray(mediaQueryData?.images) ? mediaQueryData.images : [],
      files: Array.isArray(mediaQueryData?.files) ? mediaQueryData.files : [],
      links: Array.isArray(mediaQueryData?.links) ? mediaQueryData.links : [],
    };
  }, [mediaQueryData]);

  useEffect(() => {
    if (activeThreadId && localMessagesMap[activeThreadId]) {
      setMessages(localMessagesMap[activeThreadId]);
    }
  }, [activeThreadId]);

  useEffect(() => {
    if (threadQueryData && threadQueryData.length > 0) {
      setMessages(threadQueryData);
      if (activeThreadId) {
        setLocalMessagesMap((prev) => ({ ...prev, [activeThreadId]: threadQueryData }));
      }
      setIsLoadingThread(false);
	} else if (threadQueryData) {
		setMessages([]);
		if (activeThreadId) setLocalMessagesMap((prev) => ({ ...prev, [activeThreadId]: [] }));
		setIsLoadingThread(false);
    }
  }, [threadQueryData, activeThreadId]);

  useEffect(() => {
    if (isLoadingThreadQuery) {
      setIsLoadingThread(true);
    }
  }, [isLoadingThreadQuery]);

  // Reload directory (used after group creation)
  const loadChatDirectory = () => {
    reloadDirectory().then((res) => setListItems(res.data));
  };




  // Filtered items based on search query, archive state, and active tab
  const filteredListItems = useMemo(() => {
    const activeList = safeListItems.filter(item => isViewingArchive ? item.isArchived : !item.isArchived);
    if (!searchQuery) return activeList;
    return activeList.filter(item =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [safeListItems, searchQuery, isViewingArchive]);

  const inboxUnreadCount = useMemo(() => {
    return safeListItems
      .filter(item => !item.isArchived && !item.isGroup)
      .reduce((acc, item) => acc + (item.unreadCount || 0), 0);
  }, [safeListItems]);

  const groupsUnreadCount = useMemo(() => {
    return safeListItems
      .filter(item => !item.isArchived && item.isGroup)
      .reduce((acc, item) => acc + (item.unreadCount || 0), 0);
  }, [safeListItems]);

  const firstUnreadMessageId = useMemo(() => {
    const activeThread = safeListItems.find(item => item.id === activeThreadId);
    const lastReadAt = activeThread?.lastReadAt;
    if (!lastReadAt) return null;

    const lastReadTime = new Date(lastReadAt).getTime();
    
    const firstUnread = messages.find(
      (msg) => !msg.isMe && msg.createdAt && new Date(msg.createdAt).getTime() > lastReadTime
    );
    return firstUnread ? firstUnread.id : null;
  }, [messages, activeThreadId, listItems]);






  // ── Date Separator Utilities ────────────────────────────────────────────────
  const parseMessageDate = (msg: ChatMessage): Date | null => {
    if (msg.createdAt) {
      const d = new Date(msg.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const getMessageDateKey = (msg: ChatMessage): string => {
    const d = parseMessageDate(msg);
    if (d) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    // Fallback: extract leading day token from msg.timestamp (e.g. "Saturday 4:45pm" -> "Saturday")
    if (msg.timestamp) {
      const parts = msg.timestamp.trim().split(' ');
      if (parts[0]) return parts[0];
    }
    return 'unknown-date';
  };

  const getMessageDateLabel = (msg: ChatMessage): string => {
    const d = parseMessageDate(msg);
    if (d) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffTime = today.getTime() - target.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return 'Today';
      }
      if (diffDays === 1) {
        return 'Yesterday';
      }

      // Within current year: "Saturday, September 5"
      if (d.getFullYear() === now.getFullYear()) {
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }).format(d);
      }

      // Different year: "Saturday, September 5, 2025"
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
    }

    // Fallback if createdAt is not available
    if (msg.timestamp) {
      const lower = msg.timestamp.toLowerCase();
      if (lower.includes('today') || lower.includes('just now')) return 'Today';
      if (lower.includes('yesterday')) return 'Yesterday';
      const dayMatch = msg.timestamp.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
      if (dayMatch) return dayMatch[0];
      return msg.timestamp;
    }

    return 'Today';
  };

  // ── Utility ──────────────────────────────────────────────────────────────────
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ── Voice record toggle — implements MediaRecorder & uploadChatFile ───────
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Determine optimal audio mime type supported by the browser
      let mimeType = '';
      let fileExt = 'webm';
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
          fileExt = 'webm';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
          fileExt = 'webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          fileExt = 'mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
          fileExt = 'ogg';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingStartTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
        
        // Calculate true recording duration from high-resolution timestamps
        const startTime = recordingStartTimeRef.current || Date.now();
        const durationSecs = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        const voiceDur = formatDuration(durationSecs);
        recordingStartTimeRef.current = null;

        // Discard accidental clicks / empty recordings
        if (audioBlob.size === 0) {
          addToast('warning', 'Voice Note Cancelled', 'No audio was captured.');
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        
        try {
          const uploadRes = await uploadChatFile(audioBlob, `voice-note.${fileExt}`, activeThreadId);
          const audioUrl = uploadRes.data.url;

          const res = await sendMessage(
            {
              threadId: activeThreadId,
              body: audioUrl,
              senderId: currentEmpId,
              senderName: 'You',
              senderAvatar: currentAuthUser?.avatarUrl || '',
              isVoice: true,
              voiceDuration: voiceDur,
            },
            messages
          );
          setMessages(res.data);
          
          const previewRes = await updateThreadPreview(
            activeThreadId,
            `🎙️ Voice Note (${voiceDur})`,
            'Just Now',
            listItems
          );
          setListItems(previewRes.data);
          scrollToBottom();
          addToast('success', 'Voice Note Sent', `Voice note (${voiceDur}) posted successfully.`);
        } catch (err: any) {
          addToast('danger', 'Upload Failed', err?.message || 'Could not upload voice note to the server.');
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      // Request chunks every 250ms so data is streamed continuously
      mediaRecorder.start(250);
      setIsRecordingVoice(true);
      setShowEmojiPicker(false);
    } catch (err: any) {
      addToast('danger', 'Microphone Error', err?.message || 'Failed to access microphone for recording.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  };

  // ── File attach — uploads via chatService ─────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;
    
    setIsUploadingFile(true);
    try {
		const uploadRes = await uploadChatFile(file, file.name, activeThreadId);
		const fileUrlWithMeta = uploadRes.data.url;
      
      const res = await sendMessage(
        {
          threadId: activeThreadId,
          body: fileUrlWithMeta,
          senderId: currentEmpId,
          senderName: 'You',
			senderAvatar: currentAuthUser?.avatarUrl || '',
          isFile: true,
          fileName: file.name,
          fileSize: formattedSize,
        },
        messages
      );
      setMessages(res.data);
      const previewRes = await updateThreadPreview(
        activeThreadId,
        `📎 ${file.name}`,
        'Just Now',
        listItems
      );
      setListItems(previewRes.data);
      e.target.value = '';
      scrollToBottom();
      addToast('success', 'File Attached', `"${file.name}" uploaded successfully.`);
    } catch (err: any) {
      addToast('danger', 'Upload Failed', err?.message || 'Could not upload file to the server.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  // ── Mutation handlers — all delegate to chatService ───────────────────────

  const handleDeleteMessage = (messageId: string) => {
    setPendingDeleteMessageId(messageId);
  };

  const confirmDeleteMessage = async () => {
    if (!pendingDeleteMessageId) return;
    try {
      const res = await deleteMessage(activeThreadId, pendingDeleteMessageId, messages, 'everyone');
      setMessages(res.data);
      addToast('success', 'Message Unsent', 'Your message has been removed.');
    } catch (err: any) {
      addToast('danger', 'Error', err?.message || 'Failed to delete message.');
    } finally {
      setPendingDeleteMessageId(null);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      addToast('success', 'Copied', 'Message copied to clipboard.');
    }).catch(() => {
      addToast('error', 'Copy Failed', 'Unable to access clipboard.');
    });
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      const res = await addReaction(activeThreadId, messageId, emoji, messages);
      setMessages(res.data);
      addToast('success', 'Reaction Added', `Reacted with ${emoji}`);
    } catch (err: any) {
      addToast('danger', 'Error', err?.message || 'Failed to add reaction.');
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await removeReaction(activeThreadId, messageId, emoji, messages);
      setMessages(res.data);
    } catch (err: any) {
      addToast('danger', 'Error', err?.message || 'Failed to remove reaction.');
    }
  };

  const handleStartEditMessage = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setComposerValue(msg.body);
    setTimeout(() => composerRef.current?.focus(), 50);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setComposerValue('');
  };

  // ── Send / Save handler — delegates to chatService ───────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composerValue.trim() || isSendingMessage) {
      if (editingMessageId) handleCancelEdit();
      return;
    }

    setIsSendingMessage(true);

    try {
      // ── EDIT SAVE PATH ──
      if (editingMessageId) {
        const res = await editMessage(activeThreadId, editingMessageId, composerValue.trim(), messages);
        setMessages(res.data);
        setEditingMessageId(null);
        setComposerValue('');
        addToast('success', 'Message Updated', 'Your message has been edited.');
        return;
      }

      // ── SEND NEW MESSAGE PATH ──
      const res = await sendMessage(
        {
          threadId: activeThreadId,
          body: composerValue.trim(),
          senderId: currentEmpId,
          senderName: 'You',
          senderAvatar: currentAuthUser?.avatarUrl || '',
        },
        messages
      );
      setMessages(res.data);

      const previewRes = await updateThreadPreview(
        activeThreadId,
        composerValue.trim().substring(0, 30) + (composerValue.trim().length > 30 ? '...' : ''),
        'Just Now',
        listItems
      );
      setListItems(previewRes.data);

      setComposerValue('');
      scrollToBottom();
    } catch (err: any) {
      const status = err?.response?.status || err?.status;
      if (status === 429) {
        addToast('warning', 'Rate Limited', 'Too many messages sent. Please slow down.');
      } else {
        addToast('danger', 'Send Failed', err?.message || 'Unable to send message to the server.');
      }
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleContactSelected = async (employee: OrgEmployee) => {
    setIsNewChatOpen(false);
    setEmployeesList((current) => current.some((item) => item.id === employee.id)
      ? current
      : [...current, employee]);
    try {
      const existing = listItems.find(
        (item) =>
          !item.isGroup &&
          item.participantIds?.includes(employee.id)
      );
      if (existing) {
        setActiveThreadId(existing.id);
        const contactName = employee.name || (employee as any).fullName || (employee as any).full_name || 'Contact';
        addToast('success', 'Conversation Opened', `Opened chat with ${contactName}.`);
      } else {
        const res = await createDirectChannel(employee.id);
        const newThread = res.data;
        if (newThread && newThread.id) {
          setListItems((prev) => {
            const exists = prev.some((t) => t.id === newThread.id);
            if (exists) return prev;
            return [newThread, ...prev];
          });
          setActiveThreadId(newThread.id);
          const contactName = employee.name || (employee as any).fullName || (employee as any).full_name || 'Contact';
          addToast('success', 'Chat Created', `Started new conversation with ${contactName}.`);
        }
      }
      scrollToBottom();
    } catch (err: any) {
      addToast('danger', 'Creation Failed', err?.message || 'Failed to create new conversation.');
    }
  };

  const handleGroupCreated = (newGroupId: string) => {
    setIsCreateGroupOpen(false);
    loadChatDirectory();
    setActiveTab('Groups');
    setActiveThreadId(newGroupId);
    addToast('success', 'Group Created', 'New communication channel provisioned successfully.');
  };

  const handleDeleteGroup = (groupId: string) => {
    setIsSettingsOpen(false);
    setPendingDeleteThreadId(groupId);
  };

  const handleDeleteChat = (chatId: string) => {
    setIsSettingsOpen(false);
    setVaultActiveTab(null);
    setPendingDeleteThreadId(chatId);
  };

	const confirmDeleteThread = async () => {
    if (!pendingDeleteThreadId) return;
    try {
		const deletingThread = listItems.find((item) => item.id === pendingDeleteThreadId);
		const scope = deletingThread?.isGroup ? 'everyone' : 'me';
		const res = await deleteThread(pendingDeleteThreadId, listItems, scope);
      setListItems(res.data);
      if (activeThreadId === pendingDeleteThreadId) {
        const remaining = res.data.filter((item) => isViewingArchive ? item.isArchived : !item.isArchived);
        setActiveThreadId(remaining.length > 0 ? remaining[0].id : '');
      }
      addToast('success', 'Conversation Deleted', 'The communication thread has been completely removed.');
    } catch (e: any) {
      console.error(e);
      addToast('critical', 'Error', e?.message || 'Failed to delete conversation thread.');
    } finally {
      setPendingDeleteThreadId(null);
    }
  };

	const handleTogglePinActiveThread = async () => {
		const item = listItems.find((entry) => entry.id === activeThreadId);
		if (!item) return;
		const nextPinned = !item.isPinned;
		try {
			await updateThreadPreferences(activeThreadId, { is_pinned: nextPinned });
			setListItems((prev) => prev.map((entry) => entry.id === activeThreadId ? { ...entry, isPinned: nextPinned } : entry));
			addToast('success', nextPinned ? 'Conversation Pinned' : 'Conversation Unpinned', `Successfully ${nextPinned ? 'pinned' : 'unpinned'} "${item.name}".`);
		} catch (err: any) {
			addToast('danger', 'Preference Update Failed', err?.message || 'Could not update pin preference.');
		}
	};

  const handleToggleArchiveActiveThread = async () => {
		const item = listItems.find((entry) => entry.id === activeThreadId);
		if (!item) return;
		const nextArchived = !item.isArchived;
		try {
			await updateThreadPreferences(activeThreadId, { is_archived: nextArchived });
			const updated = listItems.map((entry) => entry.id === activeThreadId ? { ...entry, isArchived: nextArchived } : entry);
			setListItems(updated);
			addToast('success', nextArchived ? 'Conversation Archived' : 'Conversation Unarchived', `Successfully ${nextArchived ? 'archived' : 'unarchived'} "${item.name}".`);
			const remaining = updated.filter((entry) => isViewingArchive ? entry.isArchived : !entry.isArchived);
			setActiveThreadId(remaining.length > 0 ? remaining[0].id : '');
		} catch (err: any) {
			addToast('danger', 'Preference Update Failed', err?.message || 'Could not update archive preference.');
		}
	};

	const handleToggleMuteActiveThread = async () => {
		const item = listItems.find((entry) => entry.id === activeThreadId);
		if (!item) return;
		const nextMuted = !item.isMuted;
		await updateThreadPreferences(activeThreadId, { is_muted: nextMuted });
		setListItems((prev) => prev.map((entry) => entry.id === activeThreadId ? { ...entry, isMuted: nextMuted } : entry));
		addToast('success', nextMuted ? 'Notifications Muted' : 'Notifications Restored', `Notifications for "${item.name}" are now ${nextMuted ? 'muted' : 'unmuted'}.`);
	};

	const handleExitGroup = async () => {
		await leaveGroup(activeThreadId, currentEmpId);
		setListItems((prev) => prev.filter((entry) => entry.id !== activeThreadId));
		setActiveThreadId('');
		addToast('success', 'Left Group', 'You have left the group.');
	};



  return (
    <div className="nvuto-chat-workspace min-w-0 min-h-0 h-full flex-1 flex flex-col overflow-hidden bg-[#F0F2F5] dark:bg-[#0B0F19] w-full p-3 sm:p-4 lg:p-5 select-none">
      <div className="nvuto-chat-navigation flex flex-wrap gap-2 pb-3" role="group" aria-label="Chat panels">
        <Button variant={mobilePane === 'inbox' ? 'primary' : 'outline'} onClick={() => setMobilePane('inbox')}>Inbox</Button>
        <Button variant={mobilePane === 'conversation' ? 'primary' : 'outline'} disabled={!activeThreadId} onClick={() => setMobilePane('conversation')}>Conversation</Button>
        <Button variant={mobilePane === 'details' ? 'primary' : 'outline'} disabled={!activeThreadId} onClick={() => setMobilePane('details')}>Details</Button>
      </div>
      {connectionStatus === 'reconnecting' && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs px-4 py-2 mb-2 rounded-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Reconnecting to real-time chat stream... Live updates may be delayed.</span>
          </div>
        </div>
      )}
      {connectionStatus === 'disconnected' && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs px-4 py-2 mb-2 rounded-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Chat stream connection lost. Retrying automatically...</span>
          </div>
        </div>
      )}
      <Card data-chat-pane={mobilePane} className="nvuto-chat-panels min-w-0 min-h-0 flex-1 flex !flex-row !gap-0 rounded-xl border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625] dark:border dark:border-[#232D42] relative overflow-hidden">

        {/* PHASE 1: Left Pane (Unified Inbox & Groups) - Confinement & Nomenclature */}
        <aside className="nvuto-chat-inbox w-[320px] min-h-0 flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#111625] border-r border-slate-200 dark:border-[#232D42] overflow-hidden">
          {/* Top Search Input */}
          <div className="p-4 pb-2 box-border shrink-0">
            <Input
              type="text"
              placeholder="Search"
              leftIcon={MagniferRounded}
              className="!rounded-xl bg-slate-50 dark:bg-[#0B0F19] border-0 h-11 text-sm text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500"
              containerClassName="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Segmented Toggle Tabs */}
          <div className="px-4 py-2 flex gap-2 w-full box-border select-none shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab('Inbox')}
              className={`flex-1 !py-2.5 !px-3 !rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-all ${
                activeTab === 'Inbox'
                  ? '!bg-slate-100 dark:bg-[#171E2E] dark:!bg-[#171E2E] !text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                  : '!bg-transparent !text-slate-400 dark:!text-slate-400 hover:!bg-slate-50 dark:bg-[#0B0F19] dark:hover:!bg-[#171E2E]/60'
              }`}
            >
              <ChatLineIcon size={16} />
              Inbox
              {inboxUnreadCount > 0 && (
                <Badge variant="info" className="!bg-[#FF4F00] !text-white text-sm rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {inboxUnreadCount}
                </Badge>
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActiveTab('Groups')}
              className={`flex-1 !py-2.5 !px-3 !rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-0 cursor-pointer transition-all ${
                activeTab === 'Groups'
                  ? '!bg-slate-100 dark:bg-[#171E2E] dark:!bg-[#171E2E] !text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                  : '!bg-transparent !text-slate-400 dark:!text-slate-400 hover:!bg-slate-50 dark:bg-[#0B0F19] dark:hover:!bg-[#171E2E]/60'
              }`}
            >
              <WidgetIcon size={16} />
              Groups
              {groupsUnreadCount > 0 && (
                <Badge variant="neutral" className="!bg-slate-200 dark:bg-[#171E2E] !text-slate-600 dark:text-[#94A3B8] text-sm rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {groupsUnreadCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Global CTA button */}
          {!isViewingArchive && (
            <div className="px-4 py-2 shrink-0">
              <Button
                type="button"
                onClick={() => {
                  if (activeTab === 'Inbox') {
                    setIsNewChatOpen(true);
                  } else {
                    setIsCreateGroupOpen(true);
                  }
                }}
                className="w-full h-11 bg-[#FF4F00] hover:bg-[#e54700] text-white font-bold text-sm rounded-xl border-0 shadow-sm"
              >
                {activeTab === 'Inbox' ? 'New Chat' : 'Create New Group'}
              </Button>
            </div>
          )}

          {/* The Scroll Area: flex-1 overflow-y-auto overflow-x-hidden w-full px-4 */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-4 no-scrollbar">
            {isLoadingDirectory ? (
              <SidebarSkeleton />
            ) : (
            <div className="flex flex-col gap-5 py-4 w-full box-border">
              {isDirectoryError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                  <span>Chat service temporarily unreachable</span>
                  <button
                    type="button"
                    onClick={() => refetchDirectory()}
                    className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg font-semibold cursor-pointer transition-colors text-red-700 dark:text-red-300"
                  >
                    Retry
                  </button>
                </div>
              )}
              {activeTab === 'Inbox' ? (
                /* Messages Section Header */
                <div className="flex flex-col w-full box-border">
                  {isViewingArchive ? (
                    <div className="flex items-center gap-2 mb-2 pl-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsViewingArchive(false)}
                        className="text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-slate-200 !p-1 rounded-lg border-0 bg-transparent cursor-pointer transition-colors flex items-center justify-center !h-auto"
                        title="Back to Messages"
                      >
                        <AltArrowLeftIcon size={18} />
                      </Button>
                      <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                        Archived
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider mb-2 block pl-2">
                      Messages
                    </span>
                  )}

                  {/* Direct Messages List */}
                  <div className="flex flex-col gap-1 w-full box-border">
                    {filteredListItems.filter(item => !item.isGroup).length > 0 ? (
                      filteredListItems
                        .filter(item => !item.isGroup)
                        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                        .map((item) => {
                          const isActive = activeThreadId === item.id;
                          
                          // Resolve participant name dynamically in the left list
                          let displayName = item.name;
                          let displayAvatar = item.avatarUrl;
                          if (!item.isGroup) {
                            const recipientId = item.participantIds?.find(id => id !== currentEmpId);
                            const recipient = employeesList.find(emp => emp.id === recipientId);
                            if (recipient) {
                              displayName = recipient.name;
                              displayAvatar = recipient.avatarUrl || displayAvatar;
                            }
                          }

                          return (
                            <div
                              key={item.id}
                              onClick={() => { setActiveThreadId(item.id); setMobilePane('conversation'); }}
                              className={`flex items-center gap-3 w-full p-3 min-w-0 rounded-xl cursor-pointer transition-colors relative ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-[#171E2E] border-l-4 border-l-[#FF4F00]'
                                  : 'hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E]/60'
                              }`}
                            >
                              {/* Unread Left Dot indicator */}
                              {item.hasUnreadMarker && (
                                <span className="absolute left-1 w-2 h-2 rounded-full bg-[#FF4F00]" />
                              )}
                              
                              {/* Avatar Column */}
                              <div className="relative shrink-0">
                                <Avatar src={displayAvatar} name={displayName} size="sm" className="w-10 h-10 border border-slate-100 dark:border-[#232D42]" />
                                {item.online && (
                                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-[#111625]" />
                                )}
                              </div>

                              {/* The Middle Text Column (THE FIX): flex-1 flex flex-col min-w-0 */}
                              <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className="truncate text-sm font-bold text-slate-800 dark:text-[#F8FAFC] leading-tight">
                                    {displayName}
                                  </h4>
                                  {item.isPinned && (
                                    <PinIcon size={12} className="text-[#FF4F00] shrink-0 transform rotate-45" />
                                  )}
                                </div>
                                <p className="truncate text-sm text-slate-450 dark:text-slate-400 mt-1 leading-none">
                                  {item.preview}
                                </p>
                              </div>

                              {/* The Timestamp (Right Aligned): flex-shrink-0 */}
                              <div className="flex-shrink-0 flex flex-col items-end gap-1.5 select-none pl-1">
                                <span className="flex-shrink-0 text-sm text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                                  {item.time}
                                </span>
                                {item.unreadCount > 0 && (
                                  <span className="w-5 h-5 rounded-full bg-[#FF4F00] text-white text-sm font-bold flex items-center justify-center">
                                    {item.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-6 text-center text-slate-400 dark:text-slate-400 text-sm select-none">
                        {isViewingArchive ? 'No archived messages.' : 'No messages.'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Groups Section Header */
                <div className="flex flex-col w-full box-border">
                  {isViewingArchive ? (
                    <div className="flex items-center gap-2 mb-2 pl-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsViewingArchive(false)}
                        className="text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-slate-200 !p-1 rounded-lg border-0 bg-transparent cursor-pointer transition-colors flex items-center justify-center !h-auto"
                        title="Back to Groups"
                      >
                        <AltArrowLeftIcon size={18} />
                      </Button>
                      <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                        Archived
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider mb-2 block pl-2">
                      Groups
                    </span>
                  )}

                  {/* Group Channels List */}
                  <div className="flex flex-col gap-1 w-full box-border">
                    {filteredListItems.filter(item => item.isGroup).length > 0 ? (
                      filteredListItems
                        .filter(item => item.isGroup)
                        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                        .map((item) => {
                          const isActive = activeThreadId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => { setActiveThreadId(item.id); setMobilePane('conversation'); }}
                              className={`flex items-center gap-3 w-full p-3 min-w-0 rounded-xl cursor-pointer transition-colors relative ${
                                isActive
                                  ? 'bg-slate-100 dark:bg-[#171E2E] border-l-4 border-l-[#FF4F00]'
                                  : 'hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E]/60'
                              }`}
                            >
                              <div className="relative shrink-0">
                                <Avatar src={item.avatarUrl} name={item.name} size="sm" className="w-10 h-10 border border-slate-100 dark:border-[#232D42] rounded-xl" />
                              </div>

                              {/* Middle text column */}
                              <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h4 className="truncate text-sm font-bold text-slate-800 dark:text-[#F8FAFC] leading-tight">
                                    {item.name}
                                  </h4>
                                  {item.isPinned && (
                                    <PinIcon size={12} className="text-[#FF4F00] shrink-0 transform rotate-45" />
                                  )}
                                </div>
                                <p className="truncate text-sm text-slate-450 dark:text-slate-400 mt-1 leading-none">
                                  {item.preview}
                                </p>
                              </div>

                              <div className="flex-shrink-0 flex flex-col items-end gap-1.5 select-none pl-1">
                                <span className="flex-shrink-0 text-sm text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                                  {item.time}
                                </span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-6 text-center text-slate-400 dark:text-slate-400 text-sm select-none">
                        {isViewingArchive ? 'No archived groups.' : 'No groups.'}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            )}
          </div>

          {/* Archived Chats Access CTA Row (Fixed at Bottom of Sidebar) */}
          {!isViewingArchive && (
            <div className="p-4 border-t border-slate-100 dark:border-[#232D42] bg-white dark:bg-[#111625] shrink-0">
              <div
                onClick={() => setIsViewingArchive(true)}
                className="flex items-center gap-3 w-full p-3 min-w-0 rounded-xl hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] transition-colors cursor-pointer group box-border"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#171E2E] flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 dark:group-hover:bg-[#232D42] transition-colors">
                  <ArchiveIcon size={20} className="text-slate-600 dark:text-[#94A3B8] animate-pulse" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-[#F8FAFC] truncate">
                  Archived Chats
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* PHASE 2: Center Pane (NVUTO Operations Thread) */}
        <div className="nvuto-chat-conversation min-h-0 flex-1 flex flex-col bg-[#FAFBFC] dark:bg-[#0B0F19] relative min-w-0 h-full">
          {isSettingsOpen && activeThreadId ? (
            <ChatSettingsPanel
              activeThreadId={activeThreadId}
              groupName={activeThreadDetails.name}
              isGroup={listItems.find(item => item.id === activeThreadId)?.isGroup || false}
              onClose={() => setIsSettingsOpen(false)}
              onClearHistory={() => setMessages([])}
              onDeleteGroup={handleDeleteGroup}
              addToast={addToast}
						isGroupAdmin={listItems.find(item => item.id === activeThreadId)?.adminId === currentEmpId}
						initialPreferences={{
							mute: listItems.find(item => item.id === activeThreadId)?.isMuted || false,
							mentionsOnly: listItems.find(item => item.id === activeThreadId)?.mentionsOnly || false,
							emailDigests: listItems.find(item => item.id === activeThreadId)?.emailDigests || false,
						}}
            />
          ) : vaultActiveTab && activeThreadId ? (
            <ExtendedMediaVault
              activeThreadId={activeThreadId}
              activeTab={vaultActiveTab}
              setActiveTab={setVaultActiveTab}
              groupName={activeThreadDetails.name}
              employeesList={employeesList}
              memberIds={listItems.find(item => item.id === activeThreadId)?.participantIds || []}
              addToast={addToast}
            />
          ) : (
            <>
          {/* Header Area */}
          <div className="h-[76px] border-b border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#111625] px-6 flex items-center justify-between shrink-0 select-none relative z-10">
            <div className="flex items-center gap-3 min-w-0">
              {activeThreadId ? (
                <Avatar
                  src={activeThreadDetails.avatarUrl}
                  name={activeThreadDetails.name}
                  size="sm"
                  className="w-10 h-10 rounded-xl"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#171E2E] border border-slate-200/85 dark:border-[#232D42] flex items-center justify-center text-slate-400 dark:text-slate-400 shrink-0">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] truncate leading-tight">
                  {activeThreadDetails.name}
                </h2>
                {!activeThreadId ? (
                  <span className="text-sm text-slate-400 dark:text-slate-400 font-semibold leading-none mt-1">
                    Select a thread from the sidebar to view messages
                  </span>
                ) : isGroup ? (
                  <span className="text-sm text-slate-400 dark:text-slate-400 font-semibold leading-none mt-1">
                    {activeThreadDetails.memberCount}
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5 select-none">
                    {(() => {
                      const activeItem = listItems.find((item) => item.id === activeThreadId);
                      if (activeItem?.online) {
                        return (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold leading-none">
                              Active Now
                            </span>
                          </>
                        );
                      }
                      return (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                          <span className="text-sm text-slate-450 dark:text-slate-400 font-semibold leading-none">
                            {formatLastSeen(activeItem?.lastSeenAt)}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Actions cluster */}
            <div className="flex items-center gap-2">
              {activeThreadId && (
                <ChatOptionsMenu
                  activeThreadId={activeThreadId}
                  threadName={activeThreadDetails.name}
                  isGroup={isGroup}
                  addToast={addToast}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onDeleteChat={handleDeleteChat}
                  onTogglePin={handleTogglePinActiveThread}
                  isPinned={listItems.find(item => item.id === activeThreadId)?.isPinned || false}
					isArchived={listItems.find(item => item.id === activeThreadId)?.isArchived || false}
					isMuted={listItems.find(item => item.id === activeThreadId)?.isMuted || false}
					onToggleMute={handleToggleMuteActiveThread}
					onExitGroup={handleExitGroup}
					isGroupAdmin={listItems.find(item => item.id === activeThreadId)?.adminId === currentEmpId}
                  onArchiveChat={handleToggleArchiveActiveThread}
                  onScheduleClick={() => setIsScheduleOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Conversation Stream viewport */}
          <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto overflow-x-hidden w-full px-6 py-6 no-scrollbar ${!activeThreadId ? 'flex items-center justify-center' : ''}`}
          >
            <div className={`flex flex-col gap-6 max-w-3xl mx-auto w-full ${!activeThreadId ? 'h-full justify-center items-center' : ''}`}>
              {!activeThreadId ? (
                <div className="flex flex-col items-center justify-center text-center p-8 select-none">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#171E2E] flex items-center justify-center mb-4 text-[#FF4F00]">
                    <ChatLineIcon size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC]">No Active Thread</h3>
                  <p className="text-sm text-slate-450 dark:text-slate-400 mt-2 max-w-xs leading-relaxed text-center">
                    Select a conversation or group from the sidebar to start messaging.
                  </p>
                </div>
              ) : isLoadingThread ? (
                <ThreadSkeleton />
              ) : (
                <>
                {messages.map((msg, index) => {
                  const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
                  const showDateSeparator = index === 0 || getMessageDateKey(msg) !== getMessageDateKey(messages[index - 1]);
                  const showUnreadSeparator = msg.id === firstUnreadMessageId;
                  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😍', '🎉'];

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateSeparator && (
                        <div className="flex items-center justify-center select-none my-2">
                          <div className="h-px bg-slate-200 dark:bg-[#232D42] flex-1" />
                          <span className="text-sm font-bold text-slate-400 dark:text-slate-400 px-4 bg-[#FAFBFC] dark:bg-[#0B0F19]">
                            {getMessageDateLabel(msg)}
                          </span>
                          <div className="h-px bg-slate-200 dark:bg-[#232D42] flex-1" />
                        </div>
                      )}

                      {showUnreadSeparator && (
                        <div className="flex items-center justify-center select-none my-4">
                          <div className="h-px bg-[#FF4F00]/25 flex-1" />
                          <span className="text-sm font-bold text-[#FF4F00] px-4 bg-[#FAFBFC] dark:bg-[#0B0F19]">
                            Unread
                          </span>
                          <div className="h-px bg-[#FF4F00]/25 flex-1" />
                        </div>
                      )}

                      {/* ── PHASE 1: ContextMenu wraps the entire message row ── */}
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <div className={`flex gap-3 w-full ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            {/* Avatar left side */}
                            {!msg.isMe && (
                              <div className="w-8 shrink-0 flex items-start justify-center">
                                {showAvatar ? (
                                  <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8" />
                                )}
                              </div>
                            )}

                            <div className={`flex flex-col max-w-xl ${msg.isMe ? 'items-end' : 'items-start'}`}>
                              {/* Sender name & time metadata */}
                              {!msg.isMe && showAvatar && (
                                <div className="flex items-baseline gap-2 mb-1.5 select-none pl-1">
                                  <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">{msg.senderName}</span>
                                  <span className="text-sm text-slate-400 dark:text-slate-400 font-semibold">{msg.timestamp}</span>
                                </div>
                              )}

                              {/* Message Bubble Container */}
                              <div className={`relative group/bubble ${msg.reactions && msg.reactions.length > 0 ? 'mb-5' : ''}`}>

                                {/* VOICE NOTE RENDERING */}
                                {msg.isVoice ? (
                                  <div className={`p-4 rounded-xl flex items-center gap-3 w-72 box-border shadow-xs border ${
                                    msg.isMe
                                      ? 'bg-orange-50 dark:bg-[#FF4F00]/15 text-slate-800 dark:text-slate-100 border-orange-200/80 dark:border-[#FF4F00]/30 rounded-tr-sm rounded-tl-2xl'
                                      : 'bg-slate-100 dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] rounded-tl-sm border-slate-200/50 dark:border-[#232D42]'
                                  }`}>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => {
                                        if (playingMsgId === msg.id) {
                                          setPlayingMsgId(null);
                                        } else {
                                          setPlayingMsgId(msg.id);
                                          addToast('info', 'Audio Player', 'Playing voice note...');
                                        }
                                      }}
                                      className="!p-0 text-[#FF4F00] hover:text-[#d34200] shrink-0 w-9 h-9 flex items-center justify-center hover:!bg-transparent active:scale-95 transition-all"
                                    >
                                      {playingMsgId === msg.id ? (
                                        <PauseCircleRounded size={36} />
                                      ) : (
                                        <PlayCircleRounded size={36} />
                                      )}
                                    </Button>
                                    <div className="flex-1 flex items-center gap-1 h-6">
                                      {[
                                        { h: 'h-3', activeH: 'h-4' },
                                        { h: 'h-5', activeH: 'h-6' },
                                        { h: 'h-4', activeH: 'h-5' },
                                        { h: 'h-6', activeH: 'h-4' },
                                        { h: 'h-3', activeH: 'h-5' },
                                        { h: 'h-5', activeH: 'h-3' },
                                        { h: 'h-4', activeH: 'h-6' },
                                        { h: 'h-2', activeH: 'h-4' },
                                        { h: 'h-6', activeH: 'h-5' },
                                        { h: 'h-3', activeH: 'h-4' }
                                      ].map((bar, barIdx) => {
                                        const isPlaying = playingMsgId === msg.id;
                                        const durationParts = msg.voiceDuration ? msg.voiceDuration.split(':') : ['0', '08'];
                                        const totalSecs = parseInt(durationParts[0] || '0') * 60 + parseInt(durationParts[1] || '8');
                                        const progressPercent = totalSecs > 0 ? (playbackElapsed / totalSecs) * 100 : 0;
                                        const barShare = (barIdx / 10) * 100;
                                        const isBarPlayed = isPlaying && progressPercent >= barShare;

                                        const barHeight = isPlaying ? bar.activeH : bar.h;
                                        const delay = `${barIdx * 75}ms`;
                                        const activeBg = isBarPlayed ? 'bg-[#FF4F00]' : 'bg-neutral-300 dark:bg-slate-600';
                                        const inactiveBg = msg.isMe ? 'bg-[#FF4F00]/60' : 'bg-neutral-300 dark:bg-slate-600';
                                        return (
                                          <div
                                            key={barIdx}
                                            className={`w-1 rounded-full transition-all duration-300 ${barHeight} ${
                                              isPlaying ? activeBg : inactiveBg
                                            }`}
                                            style={{ animationDelay: isPlaying && !isBarPlayed ? delay : undefined }}
                                          />
                                        );
                                      })}
                                    </div>
                                    <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] shrink-0 leading-none select-none min-w-[32px] text-right">
                                      {playingMsgId === msg.id ? formatDuration(playbackElapsed) : msg.voiceDuration}
                                    </span>
                                  </div>
                                ) : msg.isFile && msg.isImage ? (
                                  /* INLINE IMAGE RENDERING */
                                  <AuthenticatedChatImage
                                    src={msg.body}
                                    alt={msg.fileName || 'Shared image'}
                                  />
                                ) : msg.isFile ? (
                                  /* FILE CARD RENDERING */
                                  <div
                                    onClick={async () => {
                                      try {
                                        const blob = await fetchChatMediaBlob(msg.body);
                                        const objectUrl = URL.createObjectURL(blob);
                                        openPreview({
                                          url: objectUrl,
                                          fileName: msg.fileName || 'Attachment',
                                          fileSize: msg.fileSize,
                                          allowDownload: true
                                        });
                                      } catch (err) {
                                        console.warn('Authenticated file preview fallback:', err);
                                        openPreview({
                                          url: msg.body,
                                          fileName: msg.fileName || 'Attachment',
                                          fileSize: msg.fileSize,
                                          allowDownload: true
                                        });
                                      }
                                    }}
                                    role="button"
                                    title={`Preview ${msg.fileName || 'file'}`}
                                    className={`p-4 rounded-xl flex items-center gap-3 w-72 box-border shadow-xs border cursor-pointer ${
                                    msg.isMe
                                      ? 'bg-orange-50 dark:bg-[#FF4F00]/15 text-slate-800 dark:text-slate-100 border-orange-200/80 dark:border-[#FF4F00]/30 rounded-tr-sm rounded-tl-2xl'
                                      : 'bg-slate-100 dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] rounded-tl-sm border-slate-200/50 dark:border-[#232D42]'
                                  }`}>
                                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#111625] border border-neutral-250/70 dark:border-[#232D42] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] shrink-0 select-none">
                                      <DocumentRounded size={20} />
                                    </div>
                                    <div className="flex-1 flex flex-col min-w-0">
                                      <span className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100" title={msg.fileName}>
                                        {msg.fileName}
                                      </span>
                                      <span className="truncate text-sm text-slate-500 dark:text-[#94A3B8] mt-0.5">
                                        {msg.fileSize}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  /* STANDARD TEXT BUBBLE */
                                  <div
                                    className={`p-4 rounded-xl text-base leading-relaxed ${
                                      msg.isMe
                                        ? 'bg-[#FF4F00] text-white rounded-tr-sm'
                                        : 'bg-slate-100 dark:bg-[#171E2E] text-slate-900 dark:text-[#F8FAFC] rounded-tl-sm border border-neutral-250/20 dark:border-[#232D42]'
                                    } ${editingMessageId === msg.id ? 'ring-2 ring-[#FF4F00]/40' : ''}`}
                                  >
                                    {msg.body}
                                  </div>
                                )}

                                {/* MESSAGE REACTION BADGE PILLS */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className={`absolute -bottom-3 ${msg.isMe ? 'right-3' : 'left-3'} flex items-center gap-1 z-30 select-none flex-wrap`}>
                                    {msg.reactions.map((rx, rIdx) => (
                                      <Badge
                                        key={rIdx}
                                        variant="neutral"
                                        className="!bg-white dark:bg-[#111625] !text-slate-700 dark:text-[#F8FAFC] border border-slate-200 dark:border-[#232D42] rounded-full shadow-xs px-2.5 py-0.5 flex items-center gap-1 text-sm font-bold cursor-pointer hover:!bg-red-50 dark:hover:!bg-red-950/40 hover:!text-red-500 hover:border-red-200 transition-colors group/reaction"
                                        onClick={() => handleRemoveReaction(msg.id, rx.emoji)}
                                        title={`Remove ${rx.emoji} reaction`}
                                      >
                                        <span>{rx.emoji}</span>
                                        <span className="group-hover/reaction:hidden">{rx.count}</span>
                                        <span className="hidden group-hover/reaction:inline text-xs font-bold">✕</span>
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Sent Message Delivery Status & Timestamp */}
                              {msg.isMe && (
                                <div className="flex items-center gap-1.5 mt-1 select-none pr-1">
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    {msg.timestamp}
                                  </span>
                                  {msg.deliveryStatus === 'SENDING' ? (
                                    <span title="Sending..." className="inline-block w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                                  ) : msg.deliveryStatus === 'READ' || msg.isReadByReceiver ? (
                                    <span title="Read" className="text-[#FF4F00] flex items-center font-bold text-xs" aria-label="Read">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 6 7 17 2 12" />
                                        <polyline points="22 10 13 19 11 17" />
                                      </svg>
                                    </span>
                                  ) : msg.deliveryStatus === 'DELIVERED' ? (
                                    <span title="Delivered" className="text-slate-400 dark:text-slate-500 flex items-center text-xs" aria-label="Delivered">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 6 7 17 2 12" />
                                        <polyline points="22 10 13 19 11 17" />
                                      </svg>
                                    </span>
                                  ) : (
                                    <span title="Sent" className="text-slate-400 dark:text-slate-500 flex items-center text-xs" aria-label="Sent">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                              )}
                              {!msg.isMe && !showAvatar && (
                                <div className="flex items-center gap-1.5 mt-1 select-none pl-1">
                                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                    {msg.timestamp}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Avatar right side for sent messages */}
                            {msg.isMe && (
                              <div className="w-8 shrink-0 flex items-start justify-center">
                                {showAvatar ? (
                                  <Avatar src={msg.senderAvatar} name={msg.senderName} size="sm" className="w-8 h-8 rounded-full" />
                                ) : (
                                  <div className="w-8 h-8" />
                                )}
                              </div>
                            )}
                          </div>
                        </ContextMenuTrigger>

                        {/* ── PHASE 1: Context Menu Content ── */}
                        <ContextMenuContent className="w-56 rounded-xl border border-slate-200/80 dark:border-[#232D42] bg-white/95 dark:bg-[#111625]/95 backdrop-blur-sm shadow-xl p-1.5 animate-none">

                          {/* Embedded Horizontal Quick Reactions Bar at the Top */}
                          <div className="flex items-center justify-between gap-1 px-2 py-1 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100/80 dark:border-[#232D42] mb-1 select-none">
                            {REACTION_EMOJIS.map(emoji => (
                              <Button
                                key={emoji}
                                type="button"
                                variant="ghost"
                                onClick={() => handleReactToMessage(msg.id, emoji)}
                                className="!p-0 w-9 h-9 flex items-center justify-center text-xl hover:!bg-slate-200 dark:bg-[#171E2E]/85 dark:hover:!bg-[#232D42] active:scale-95 transition-all cursor-pointer rounded-lg border-0 bg-transparent"
                                title={`React with ${emoji}`}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>

                          {/* Copy Text — available for all messages (file/image messages copy their URL) */}
                          {!msg.isVoice && (
                            <ContextMenuItem
                              onClick={() => handleCopyMessage(msg.body)}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] cursor-pointer"
                            >
                              <CopyIcon size={16} className="text-slate-500 dark:text-[#94A3B8]" />
                              Copy Text
                            </ContextMenuItem>
                          )}

                          {/* Sender-only actions */}
                          {msg.isMe && !msg.isVoice && !msg.isFile && (
                            <>
                              <ContextMenuSeparator className="my-1 bg-slate-100 dark:bg-[#232D42]" />
                              <ContextMenuItem
                                onClick={() => handleStartEditMessage(msg)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] cursor-pointer"
                              >
                                <PenIcon2 size={16} className="text-slate-500 dark:text-[#94A3B8]" />
                                Edit Message
                              </ContextMenuItem>
                              <ContextMenuSeparator className="my-1 bg-slate-100 dark:bg-[#232D42]" />
                              <ContextMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer focus:text-red-500 focus:bg-red-50"
                              >
                                <TrashIcon size={16} className="text-red-500" />
                                Unsend Message
                              </ContextMenuItem>
                            </>
                          )}
                        </ContextMenuContent>
                      </ContextMenu>
                    </React.Fragment>
                  );
                })}

                {/* Contact: Typing status indicator */}
                {isTyping && (
                  <div className="flex gap-3 w-full justify-start items-center">
                    <div className="w-8 shrink-0 flex justify-center">
                      <Avatar
                        src={activeThreadDetails.avatarUrl}
                        name={activeThreadDetails.name}
                        size="sm"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="bg-slate-100 dark:bg-[#171E2E] rounded-xl rounded-tl-sm px-4 py-2 text-sm text-slate-500 dark:text-[#94A3B8] font-medium flex items-center gap-1.5 border border-slate-200/50 dark:border-[#232D42]">
                        <span>is typing</span>
                        <div className="flex gap-1 items-center shrink-0">
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>

          {/* Composer Area: flat, border-t, borderless input with trailing formatting tools */}
          <div className="bg-white dark:bg-[#111625] border-t border-neutral-250/70 dark:border-[#232D42] p-4 shrink-0 box-border select-none relative">
            
            {/* Curated Popover Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 right-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-xl rounded-xl p-3 z-50 grid grid-cols-4 gap-2 select-none w-48">
                {['👍', '❤️', '😂', '😍', '🎉', '🚀', '🔥', '😮', '😢', '👏', '🙌', '👀'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setComposerValue(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#232D42] rounded-lg cursor-pointer border-0 bg-transparent transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* ── Phase 3: Edit mode indicator banner ── */}
            {editingMessageId && (
              <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FF4F00]/8 dark:bg-[#FF4F00]/15 border border-[#FF4F00]/20 select-none">
                <PenIcon2 size={14} className="text-[#FF4F00] shrink-0" />
                <span className="text-sm font-semibold text-[#FF4F00] flex-1">Editing message</span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] hover:text-slate-800 dark:hover:text-slate-200 bg-transparent border-0 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="nvuto-chat-composer min-w-0 max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3 box-border">

              {/* Text input or active voice note indicator */}
              {isRecordingVoice ? (
                <div className="flex-1 flex items-center gap-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 h-10 select-none animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span className="text-sm font-bold">Recording Audio Note...</span>
                  <span className="text-sm font-semibold ml-auto">{formatDuration(recordingDuration)}</span>
                </div>
              ) : (
                <input
                  ref={composerRef}
                  type="text"
                  placeholder={
                    !activeThreadId
                      ? 'Select a conversation from the sidebar to type a message...'
                      : editingMessageId
                        ? 'Edit your message...'
                        : 'Aa'
                  }
                  value={composerValue}
                  onChange={(e) => setComposerValue(e.target.value)}
                  disabled={!activeThreadId}
                  className="min-w-0 flex-1 bg-transparent border-0 outline-none text-base text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 h-10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              )}

              {/* Trailing tools aligned to the right */}
              <div className={`flex items-center gap-3.5 shrink-0 ml-2 ${!activeThreadId ? 'opacity-40 pointer-events-none' : ''}`}>
                {/* Hide voice/attach/emoji tools in edit mode */}
                {!editingMessageId && (
                  <>
                    <span
                      onClick={handleToggleVoiceRecord}
                      className={`cursor-pointer flex items-center transition-colors ${
                        isRecordingVoice ? 'text-red-500 hover:text-red-600 animate-pulse' : 'text-slate-400 dark:text-slate-500 hover:text-neutral-650 dark:hover:text-slate-300'
                      }`}
                      title={isRecordingVoice ? 'Stop and Send Audio' : 'Record Voice Note'}
                    >
                      <MicrophoneRounded size={20} />
                    </span>
                    <span
                      onClick={triggerFileInput}
                      className="text-slate-400 dark:text-slate-500 hover:text-neutral-650 dark:hover:text-slate-300 cursor-pointer flex items-center"
                      title="Upload Files"
                    >
                      <PaperclipRounded size={20} />
                    </span>
                    <span
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`text-slate-400 dark:text-slate-500 hover:text-neutral-650 dark:hover:text-slate-300 cursor-pointer flex items-center transition-transform active:scale-95 ${
                        showEmojiPicker ? 'scale-110' : ''
                      }`}
                      title="Smiley Face"
                    >
                      😊
                    </span>
                  </>
                )}
                {/* Send / Save button — morphs between SendRounded and CheckCircleIcon */}
                <button
                  type="submit"
                  disabled={isRecordingVoice || !activeThreadId || isSendingMessage || isUploadingFile}
                  className={`bg-transparent border-0 p-0 flex items-center justify-center transition-all shrink-0 ${
                    isRecordingVoice || !activeThreadId || isSendingMessage || isUploadingFile
                      ? 'text-neutral-300 dark:text-slate-700 cursor-not-allowed'
                      : editingMessageId
                        ? 'text-emerald-500 hover:text-emerald-600 cursor-pointer scale-110'
                        : 'text-[#FF4F00] hover:text-[#d34200] cursor-pointer'
                  }`}
                  title={editingMessageId ? 'Save Changes' : 'Send Message'}
                >
                  {isSendingMessage || isUploadingFile ? (
                    <span className="w-5 h-5 border border-[#FF4F00] border-t-transparent rounded-full animate-spin" />
                  ) : editingMessageId ? (
                    <CheckCircleIcon size={26} />
                  ) : (
                    <SendRounded size={24} />
                  )}
                </button>
              </div>

            </form>
          </div>
        </>
      )}
    </div>

        {/* PHASE 2: The Right Pane (Group Information / Employee Dossier) Hierarchy Fix */}
        {activeThreadId && (
          <aside className="nvuto-chat-details min-h-0 w-[320px] flex-shrink-0 flex flex-col h-full bg-white dark:bg-[#111625] border-l border-slate-200 dark:border-[#232D42] overflow-hidden">
          {!isGroup ? (
            <EmployeeDossierVault
              activeThreadId={activeThreadId}
              recipientName={activeThreadDetails.name}
              recipientAvatar={activeThreadDetails.avatarUrl}
              recipientEmail={activeThreadDetails.email}
              recipientPhone={activeThreadDetails.phone}
              recipientTitle={activeThreadDetails.title}
              recipientDepartment={activeThreadDetails.department}
              addToast={addToast}
              onOpenVault={setVaultActiveTab}
              isPinned={listItems.find(item => item.id === activeThreadId)?.isPinned || false}
              onTogglePin={handleTogglePinActiveThread}
              onScheduleClick={() => setIsScheduleOpen(true)}
            />
          ) : (
            /* Scroll container with internal scroll padding and custom-scrollbar */
            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-6 no-scrollbar">
              <div className="flex flex-col gap-6 py-4 pb-6 w-full box-border">
                
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#232D42] pb-3 shrink-0 select-none">
                  <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] tracking-wide !">
                    Group Information
                  </h3>
                </div>

              {/* Group Profile Card */}
              <div className="flex flex-col items-center justify-center py-4 select-text">
                <Avatar
                  src={activeThreadDetails.avatarUrl}
                  name={activeThreadDetails.name}
                  size="lg"
                  className="w-18 h-18 rounded-xl shadow-sm bg-slate-100 dark:bg-[#171E2E]"
                />
                <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] mt-3 block text-center">
                  {activeThreadDetails.name}
                </span>
              </div>

              {/* 2-Item square action buttons grid */}
              <div className="grid grid-cols-2 gap-2 w-full box-border select-none">
                <Button
                  variant="ghost"
                  onClick={handleTogglePinActiveThread}
                  className={`border-0 rounded-xl !flex !flex-col items-center justify-center p-3 gap-2 cursor-pointer transition-colors w-full min-w-0 ${
                    listItems.find(item => item.id === activeThreadId)?.isPinned
                      ? '!bg-orange-50 dark:!bg-[#FF4F00]/15 text-[#FF4F00]'
                      : '!bg-slate-50 dark:bg-[#0B0F19] hover:!bg-slate-100 dark:hover:!bg-[#232D42] text-slate-600 dark:text-[#94A3B8]'
                  }`}
                >
                  <PinIcon
                    size={20}
                    className={`flex-shrink-0 ${
                      listItems.find(item => item.id === activeThreadId)?.isPinned ? 'text-[#FF4F00]' : 'text-slate-500 dark:text-[#94A3B8]'
                    }`}
                  />
                  <span className="text-sm font-semibold block text-center truncate w-full px-1">
                    {listItems.find(item => item.id === activeThreadId)?.isPinned ? 'Pinned' : 'Pin Group'}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setIsSettingsOpen(true); setVaultActiveTab(null); }}
                  className="!bg-slate-50 dark:bg-[#0B0F19] hover:!bg-slate-100 dark:hover:!bg-[#232D42] border-0 rounded-xl !flex !flex-col items-center justify-center p-3 gap-2 cursor-pointer transition-colors text-slate-600 dark:text-[#94A3B8] w-full min-w-0"
                >
                  <SettingsIcon size={20} className="text-slate-450 dark:text-slate-400 shrink-0" />
                  <span className="text-sm font-semibold block text-center truncate w-full px-1">Setting</span>
                </Button>
              </div>

              {/* Members Section */}
              <div className="flex flex-col gap-3 w-full box-border">
                <div className="flex items-center justify-between select-none">
                  <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                    Members
                  </span>
                  <span
                    onClick={() => setVaultActiveTab('Members')}
                    className="text-sm font-bold text-[#FF4F00] hover:text-[#d34200] cursor-pointer"
                  >
                    View All
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B0F19] rounded-xl select-none">
                  <UsersIcon size={18} className="text-slate-450 dark:text-slate-400 shrink-0" />
					<span className="text-sm font-bold text-slate-700 dark:text-[#F8FAFC]">
						{listItems.find(item => item.id === activeThreadId)?.participantIds?.length || 0} members
					</span>
                </div>
              </div>

              {/* Images Section */}
              <div className="flex flex-col gap-3 w-full box-border">
                <div className="flex items-center justify-between select-none">
                  <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                    Images
                  </span>
                  <span
                    onClick={() => setVaultActiveTab('Media')}
                    className="text-sm font-bold text-[#FF4F00] hover:text-[#d34200] cursor-pointer"
                  >
                    View All
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 w-full box-border">
                  {sidebarMedia.images.slice(0, 8).map((img, idx) => (
                    <div key={idx} className="w-full min-w-0 h-auto aspect-square rounded-xl bg-slate-100 dark:bg-[#171E2E] overflow-hidden cursor-pointer" onClick={() => setVaultActiveTab('Media')}>
                      <img src={img.url} alt={`Shared ${idx}`} className="w-full h-auto aspect-square object-cover rounded-xl" />
                    </div>
                  ))}
                  {sidebarMedia.images.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold col-span-4 py-2">No shared images yet.</span>
                  )}
                </div>
              </div>

              {/* Files Section */}
              <div className="flex flex-col gap-3 w-full box-border">
                <div className="flex items-center justify-between select-none">
                  <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                    Files
                  </span>
                  <span
                    onClick={() => setVaultActiveTab('Documents')}
                    className="text-sm font-bold text-[#FF4F00] hover:text-[#d34200] cursor-pointer"
                  >
                    View All
                  </span>
                </div>
                
                <div className="flex flex-col w-full box-border">
                  {sidebarMedia.files.slice(0, 3).map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        window.open(file.url, '_blank');
                        addToast('info', 'File Downloaded', `Opening ${file.name}...`);
                      }}
                      className="flex items-start gap-3 w-full mb-3 min-w-0 p-3 bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-[#232D42] transition-colors rounded-xl cursor-pointer box-border"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] flex items-center justify-center text-slate-500 dark:text-[#94A3B8] shrink-0">
                        <DocumentRounded size={18} />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="truncate text-sm font-medium text-slate-900 dark:text-[#F8FAFC]" title={file.name}>
                          {file.name}
                        </span>
                        <div className="flex justify-between items-center w-full mt-1 min-w-0">
                          <span className="truncate text-xs text-slate-500 dark:text-[#94A3B8]">
                            {file.size} • {file.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sidebarMedia.files.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold py-2">No shared files yet.</span>
                  )}
                </div>
              </div>

              {/* Links Section */}
              <div className="flex flex-col gap-3 w-full box-border">
                <div className="flex items-center justify-between select-none">
                  <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                    Links
                  </span>
                  <span
                    onClick={() => setVaultActiveTab('Links')}
                    className="text-sm font-bold text-[#FF4F00] hover:text-[#d34200] cursor-pointer"
                  >
                    View All
                  </span>
                </div>
                
                <div className="flex flex-col w-full box-border">
                  {sidebarMedia.links.slice(0, 3).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 w-full mb-3 min-w-0 p-3 bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-[#232D42] transition-colors rounded-xl cursor-pointer box-border no-underline text-inherit"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-[#171E2E] overflow-hidden shrink-0 flex items-center justify-center text-slate-500 dark:text-[#94A3B8] border border-slate-200/50 dark:border-[#232D42]">
                        <LinkRounded size={18} />
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <span className="truncate text-sm font-medium text-slate-900 dark:text-[#F8FAFC]" title={link.title}>
                          {link.title}
                        </span>
                        <div className="flex justify-between items-center w-full mt-1 min-w-0">
                          <span className="truncate text-xs text-[#FF4F00] font-semibold">
                            {link.host}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                  {sidebarMedia.links.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold py-2">No shared links yet.</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </aside>
      )}

      </Card>
      
      <CreateGroupWizardModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
        currentEmployeeId={currentEmpId}
      />

      <NewChatContactModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        employees={employeesList}
        currentEmployeeId={currentEmpId}
        onContactSelected={handleContactSelected}
      />

      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        recipientName={activeThreadDetails.name}
        recipientAvatar={activeThreadDetails.avatarUrl}
        addToast={addToast}
      />

      {/* Confirmation Modal for Thread Deletion */}
      <Modal
        isOpen={Boolean(pendingDeleteThreadId)}
        onClose={() => setPendingDeleteThreadId(null)}
        title="Delete Conversation Thread"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#232D42] bg-slate-50/50 dark:bg-[#0B0F19]/50">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
              Delete Conversation Thread
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Permanently remove this conversation and its message history
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPendingDeleteThreadId(null)}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 dark:hover:bg-[#232D42] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors border-0"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Are you sure you want to delete this conversation thread? This action is destructive and will remove the thread for all participants.
          </p>
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-[#232D42]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteThreadId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="!bg-rose-600 !text-white hover:!bg-rose-700 font-semibold text-sm"
              onClick={confirmDeleteThread}
            >
              Delete Conversation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Message Deletion (Unsend for Everyone) */}
      <Modal
        isOpen={Boolean(pendingDeleteMessageId)}
        onClose={() => setPendingDeleteMessageId(null)}
        title="Unsend Message"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#232D42] bg-slate-50/50 dark:bg-[#0B0F19]/50">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
              Unsend Message
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Recall this message for all recipients in the channel
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPendingDeleteMessageId(null)}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] font-bold text-base bg-slate-100 dark:bg-[#171E2E] hover:bg-slate-200 dark:hover:bg-[#232D42] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors border-0"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            Are you sure you want to unsend this message for everyone? Recipients will no longer be able to read its contents.
          </p>
          <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-[#232D42]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteMessageId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="!bg-rose-600 !text-white hover:!bg-rose-700 font-semibold text-sm"
              onClick={confirmDeleteMessage}
            >
              Unsend Message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2 & 3: Extended Media Vault Sub-view Panel
// ─────────────────────────────────────────────────────────────────────────────
interface ExtendedMediaVaultProps {
  activeThreadId: string;
  activeTab: 'Members' | 'Media' | 'Documents' | 'Links';
  setActiveTab: (tab: 'Members' | 'Media' | 'Documents' | 'Links' | null) => void;
  groupName: string;
  employeesList: OrgEmployee[];
  memberIds: string[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

const ExtendedMediaVault: React.FC<ExtendedMediaVaultProps> = ({
  activeThreadId,
  activeTab,
  setActiveTab,
  groupName,
  employeesList,
  memberIds,
  addToast
}) => {
  const { openPreview } = useMediaViewer();
  const { data: mediaResponse, isLoading: isLoadingVaultMedia } = useQuery({
    queryKey: ['threadMedia', activeThreadId],
    queryFn: () => fetchThreadMedia(activeThreadId),
    enabled: !!activeThreadId,
  });

  const dynamicMedia = mediaResponse?.data;

  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['chatThreadMembers', activeThreadId, memberIds],
    queryFn: async () => {
      const profiles = await Promise.all(memberIds.map(async (id) => {
        const cached = employeesList.find((employee) => employee.id === id);
        if (cached) return cached;
        const response = await getEmployee(id);
        const employee = response.data;
        return {
          id: employee.id,
          name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unnamed',
          title: employee.jobTitle || 'No Title',
          department: employee.department || 'General',
          location: employee.officeLocation || 'Remote',
          email: employee.workEmail || '',
          phone: employee.phone || '',
          avatarUrl: employee.profilePictureUrl || '',
          reportingManagerId: employee.reportingManagerId || null,
        } as OrgEmployee;
      }));
      return profiles;
    },
    enabled: activeTab === 'Members' && memberIds.length > 0,
  });

  const documents = Array.isArray(dynamicMedia?.files) ? dynamicMedia.files : [];
  const links = Array.isArray(dynamicMedia?.links) ? dynamicMedia.links : [];
  const mediaItems = Array.isArray(dynamicMedia?.images)
    ? dynamicMedia.images.map((img: any, idx: number) => ({
        type: 'image' as const,
        src: img?.url || '',
        title: `Shared media item ${idx + 1}`,
        date: img?.date || ''
      }))
    : [];

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#111625] h-full overflow-hidden">
      {/* PHASE 1: Vault Navigation - The Header */}
      <div className="h-[76px] border-b border-slate-200 dark:border-[#232D42] bg-white dark:bg-[#111625] px-6 flex items-center justify-start gap-4 shrink-0 select-none">
        <Button
          variant="ghost"
          onClick={() => setActiveTab(null)}
          className="w-10 h-10 !rounded-xl !p-0 bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-[#232D42] text-slate-600 dark:text-[#94A3B8] flex items-center justify-center shrink-0 border-0"
        >
          <AltArrowLeftIcon size={22} className="text-slate-700 dark:text-[#F8FAFC]" />
        </Button>
        <div className="flex flex-col">
          <h2 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC] leading-tight">
            {groupName} - Vault
          </h2>
          <span className="text-sm text-slate-400 dark:text-slate-400 font-semibold leading-none mt-1">
            Expanded shared database resources
          </span>
        </div>
      </div>

      {/* Segmented Control Tabs */}
      <div className="px-6 pt-4 shrink-0 select-none">
        <div className="bg-slate-50 dark:bg-[#0B0F19] p-1.5 rounded-xl flex gap-1.5 w-fit border border-slate-200/40 dark:border-[#232D42]">
          {(['Members', 'Media', 'Documents', 'Links'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                variant="ghost"
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 !rounded-xl font-bold text-sm border-0 transition-all ${
                  isActive
                    ? 'bg-white dark:bg-[#111625] text-slate-900 dark:text-[#F8FAFC] shadow-xs'
                    : 'text-slate-400 dark:text-slate-400 hover:bg-slate-100 dark:bg-[#171E2E] dark:hover:bg-[#232D42] hover:text-neutral-750'
                }`}
              >
                {tab}
              </Button>
            );
          })}
        </div>
      </div>

      {/* PHASE 3: Content area with lock constraints */}
      <div className="flex-1 overflow-y-auto px-6 py-5 min-w-0 w-full box-border no-scrollbar">
        {isLoadingVaultMedia && (
          <div className="flex items-center justify-center py-12 text-slate-400 dark:text-slate-500 text-sm animate-pulse">
            Loading shared resources from backend...
          </div>
        )}
        
        {/* MEMBERS VIEW */}
        {!isLoadingVaultMedia && activeTab === 'Members' && (
          <div className="flex flex-col gap-4 max-w-4xl w-full">
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow className="hover:bg-transparent">
                    <TableHeaderCell>Member</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Department</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {memberProfiles.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.avatarUrl} name={emp.name} size="sm" className="w-9 h-9 rounded-full border border-slate-100 dark:border-[#232D42]" />
                          <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">{emp.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-[#94A3B8] font-semibold">{emp.title}</TableCell>
                      <TableCell className="text-slate-500 dark:text-[#94A3B8] font-medium">{emp.department}</TableCell>
                      <TableCell className="text-[#FF4F00] font-semibold">{emp.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>
        )}

        {/* MEDIA VIEW */}
        {!isLoadingVaultMedia && activeTab === 'Media' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full">
            {mediaItems.map((item, idx) => (
              <div
                key={idx}
                className="relative group/media rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-[#171E2E] shadow-xs hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => openPreview({
                  url: item.src,
                  fileName: item.title,
                  allowDownload: true
                })}
              >
                <img src={item.src} alt={item.title} className="w-full h-auto aspect-square object-cover rounded-xl" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-3 opacity-0 group-hover/media:opacity-100 transition-opacity">
                  <span className="text-sm text-white font-semibold truncate block w-full">{item.title}</span>
                </div>
              </div>
            ))}
            {mediaItems.length === 0 && (
              <div className="col-span-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                No media items uploaded in this thread yet.
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS VIEW */}
        {!isLoadingVaultMedia && activeTab === 'Documents' && (
          <div className="flex flex-col gap-4 max-w-4xl w-full">
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow className="hover:bg-transparent">
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Size</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((doc, idx) => (
                    <TableRow
                      key={idx}
                      className="cursor-pointer"
                      onClick={() => {
                        openPreview({
                          url: doc.url,
                          fileName: doc.name,
                          fileSize: doc.size,
                          allowDownload: true
                        });
                      }}
                    >
                      <TableCell className="min-w-0 max-w-[280px]">
                        <div className="flex items-center gap-3 min-w-0">
                          <DocumentRounded size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] truncate block flex-1" title={doc.name}>
                            {doc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 dark:text-[#94A3B8] font-bold whitespace-nowrap">{doc.size}</TableCell>
                      <TableCell className="text-slate-400 dark:text-[#94A3B8] font-medium whitespace-nowrap">{doc.date}</TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableEmptyState colSpan={3} variant="no_results" title="No documents shared" description="No documents shared in this thread yet." />
                  )}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>
        )}

        {/* LINKS VIEW */}
        {!isLoadingVaultMedia && activeTab === 'Links' && (
          <div className="flex flex-col gap-4 max-w-4xl w-full">
            <TableWrapper>
              <Table>
                <TableHead>
                  <TableRow className="hover:bg-transparent">
                    <TableHeaderCell>Preview</TableHeaderCell>
                    <TableHeaderCell>Title / URL</TableHeaderCell>
                    <TableHeaderCell>Host</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {links.map((link, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="select-none">
                        <div className="w-12 h-9 rounded bg-slate-100 dark:bg-[#171E2E] border border-slate-200/50 dark:border-[#232D42] flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <LinkRounded size={16} />
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 max-w-[320px]">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] truncate block" title={link.title}>
                            {link.title}
                          </span>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#FF4F00] font-semibold truncate hover:underline block mt-0.5"
                          >
                            {link.url}
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-[#94A3B8] font-semibold">{link.host}</TableCell>
                    </TableRow>
                  ))}
                  {links.length === 0 && (
                    <TableEmptyState colSpan={3} variant="no_results" title="No web links shared" description="No web links shared in this thread yet." />
                  )}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>
        )}

      </div>
    </div>
  );
};
