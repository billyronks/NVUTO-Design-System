import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MapPoint as MapPointRounded,
  ChatLine as ChatLineRounded,
  Letter as LetterRounded,
  Phone as PhoneRounded,
  ClockCircle as ClockCircleRounded,
  User as UserRounded,
  Camera as CameraIcon
} from '@solar-icons/react';
import { Badge, Avatar, Button } from '@/app/components/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/sheet';
import { useToast } from '../../context/useToast';
import { useConfirm } from '../../context/useConfirm';
import { useAuth } from '../../context/AuthContext';
import {
  getEmployee,
  activateEmployee,
  deactivateEmployee,
  uploadAvatar,
  getEmployeeReportingStructure
} from '../../../services/employeeService';

interface EmployeeProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employee: any | null;
  onRefresh?: () => void;
}

interface NormalizedEmployee {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  department: 'Engineering' | 'Product' | 'Design' | 'Human Resources' | 'Finance' | 'Marketing' | 'Executive';
  location: string;
  manager: string | null;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: string;
  level: number;
}

const badgeVariantMap = (dept: string): 'danger' | 'neutral' | 'info' | 'warning' | 'purple' | 'success' => {
  switch (dept) {
    case 'Executive':
      return 'danger';
    case 'Human Resources':
      return 'neutral';
    case 'Engineering':
      return 'info';
    case 'Finance':
      return 'warning';
    case 'Marketing':
      return 'purple';
    case 'Design':
      return 'success';
    case 'Product':
      return 'info';
    default:
      return 'neutral';
  }
};

const normalizeEmployee = (emp: any): NormalizedEmployee => {
  if (!emp) {
    return {
      id: '',
      name: '',
      firstName: '',
      lastName: '',
      title: 'No Title',
      department: 'Human Resources',
      location: 'Remote',
      manager: null,
      email: '',
      phone: '',
      avatarUrl: '',
      status: 'Active',
      level: 3,
    };
  }

  const storedAdminName = typeof window !== 'undefined' ? localStorage.getItem('nvuto_admin_name') : null;
  let firstName = emp.firstName || emp.name?.split(' ')[0] || '';
  let lastName = emp.lastName || emp.name?.split(' ').slice(1).join(' ') || '';
  let name = emp.name || `${firstName} ${lastName}`.trim() || 'Unnamed';

  if ((name.toLowerCase() === 'hr admin' || name.toLowerCase() === 'workspace admin') && storedAdminName && storedAdminName.toLowerCase() !== 'hr admin') {
    name = storedAdminName;
    firstName = storedAdminName.split(' ')[0] || firstName;
    lastName = storedAdminName.split(' ').slice(1).join(' ') || lastName;
  }

  return {
    id: emp.rawId || (emp.id ? String(emp.id) : ''),
    name,
    firstName,
    lastName,
    title: emp.jobTitle || emp.title || 'No Title',
    department: emp.department || 'Human Resources',
    location: emp.officeLocation || emp.location || 'Remote',
    manager: emp.reportingManagerName || emp.manager || null,
    email: emp.workEmail || emp.email || '',
    phone: emp.phone || '',
    avatarUrl: emp.profilePictureUrl || emp.avatarUrl || emp.avatarSrc || '',
    status: emp.status || 'Active',
    level: Number(emp.level) || 3,
  };
};

export const EmployeeProfileDrawer: React.FC<EmployeeProfileDrawerProps> = ({
  isOpen,
  onClose,
  employee,
  onRefresh
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localEmployee, setLocalEmployee] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isHrAdmin = user?.role?.toLowerCase() === 'hr_admin' || user?.role?.toLowerCase() === 'hr admin';

  const empTargetId = employee?.rawId || (employee?.id ? String(employee.id) : '');
  const { data: reportingRes } = useQuery({
    queryKey: ['reportingStructure', empTargetId],
    queryFn: () => getEmployeeReportingStructure(empTargetId),
    enabled: !!empTargetId && isOpen,
  });

  const reportingData = reportingRes;
  const dottedManagers = reportingData?.dotted_managers || [];
  const directReportsCount = reportingData?.direct_reports_count ?? 0;
  const dottedReportsCount = reportingData?.dotted_reports_count ?? 0;

  // Load and sync employee details on open
  useEffect(() => {
    if (employee) {
      setLocalEmployee(employee);

      const empId = employee.rawId || String(employee.id);
      if (empId) {
        getEmployee(empId)
          .then((res) => {
            if (res?.data) {
              setLocalEmployee(res.data);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch detailed employee profile:', err);
          });
      }
    } else {
      setLocalEmployee(null);
    }
  }, [employee, isOpen]);

  const normalized = normalizeEmployee(localEmployee || employee);

  const handleDeactivate = async () => {
    if (!normalized.id) return;
    const confirmed = await confirm({
      title: 'Suspend Platform Access',
      message: `Are you sure you want to deactivate and suspend platform access for ${normalized.name}?`,
      confirmText: 'Suspend Access',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;

    try {
      const res = await deactivateEmployee(normalized.id);
      if (res?.status === 200 || res?.data) {
        addToast({
          title: 'Employee Suspended',
          message: `${normalized.name} has been suspended successfully.`,
          type: 'success',
        });
        const updated = res.data || { ...normalized, status: 'Inactive' };
        setLocalEmployee(updated);
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      addToast({
        title: 'Suspension Failed',
        message: err.message || 'An error occurred while deactivating the employee.',
        type: 'danger',
      });
    }
  };

  const handleActivate = async () => {
    if (!normalized.id) return;
    const confirmed = await confirm({
      title: 'Restore Platform Access',
      message: `Are you sure you want to reactivate platform access for ${normalized.name}?`,
      confirmText: 'Reactivate',
      cancelText: 'Cancel',
      variant: 'primary',
    });
    if (!confirmed) return;

    try {
      const res = await activateEmployee(normalized.id);
      if (res?.status === 200 || res?.data) {
        addToast({
          title: 'Employee Reactivated',
          message: `${normalized.name} has been reactivated successfully.`,
          type: 'success',
        });
        const updated = res.data || { ...normalized, status: 'Active' };
        setLocalEmployee(updated);
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      addToast({
        title: 'Reactivation Failed',
        message: err.message || 'An error occurred while activating the employee.',
        type: 'danger',
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        title: 'Upload Failed',
        message: 'File size exceeds the 2MB limit.',
        type: 'danger'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate format (png, jpg, jpeg)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      addToast({
        title: 'Upload Failed',
        message: 'Only PNG and JPG/JPEG formats are accepted.',
        type: 'danger'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      addToast({
        title: 'Upload Failed',
        message: 'Profile photo exceeds the 25MB limit.',
        type: 'danger'
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAvatar(normalized.id, file);
      if (res?.status === 200 || res?.data?.avatar_url) {
        addToast({
          title: 'Avatar Updated',
          message: 'Profile picture has been uploaded successfully.',
          type: 'success'
        });
        const newUrl = res.data.avatar_url;
        setLocalEmployee((prev: any) => prev ? { ...prev, profilePictureUrl: newUrl, avatarUrl: newUrl } : { ...normalized, avatarUrl: newUrl });
        if (onRefresh) onRefresh();
        // If the edited employee is the currently logged-in user, refresh the
        // shared auth/profile caches so every other "your avatar" render
        // (header, sidebar, welcome banner, etc.) picks up the new picture
        // immediately instead of only after a manual reload.
        if (user?.email && normalized.email && user.email === normalized.email) {
          queryClient.invalidateQueries({ queryKey: ['myEmployeeProfile'] });
          queryClient.invalidateQueries({ queryKey: ['authProfile'] });
          queryClient.invalidateQueries({ queryKey: ['employeeRoster'] });
          refreshUser();
        }
      }
    } catch (err: any) {
      addToast({
        title: 'Upload Failed',
        message: err.message || 'An error occurred during the image transmission.',
        type: 'danger'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isStatusActive = normalized.status.toLowerCase() === 'active';

  return (
    <Sheet open={isOpen && !!employee} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="bg-white dark:bg-[#111625] w-full sm:max-w-[540px] h-full shadow-sm flex flex-col p-0 gap-0 border-l border-slate-100 dark:border-[#232D42] outline-none">
        {employee && (
          <>
            {/* Header Block */}
            <SheetHeader className="p-6 border-b border-slate-100 dark:border-[#232D42] flex flex-row justify-between items-center bg-slate-50 dark:bg-[#0B0F19] select-none -mx-0">
              <SheetTitle className="sr-only">{normalized.name} Profile Details</SheetTitle>
              <SheetDescription className="sr-only">
                Employee information, department, and administrative management drawer for {normalized.name}
              </SheetDescription>
              <div className="flex gap-2">
                <Badge variant={badgeVariantMap(normalized.department)} className="text-sm font-semibold tracking-wider">
                  {normalized.department}
                </Badge>
                <Badge 
                  variant={isStatusActive ? 'success' : normalized.status.toLowerCase() === 'pending' ? 'warning' : 'danger'} 
                  className="text-sm font-semibold tracking-wider uppercase"
                >
                  {normalized.status}
                </Badge>
              </div>
            </SheetHeader>

            {/* Hero Identity Block */}
            <div className="p-8 flex flex-col items-center text-center border-b border-slate-100 dark:border-[#232D42] bg-white dark:bg-[#111625] select-none">
              <div className="relative group mb-4">
                <Avatar
                  name={normalized.name}
                  size="lg"
                  src={normalized.avatarUrl}
                  className="!bg-indigo-100 dark:!bg-[#FF4F00]/10 !bg-none !text-indigo-900 dark:!text-[#FF4F00] font-bold !w-24 !h-24 !text-3xl border border-slate-200 dark:border-[#232D42] shadow-sm transition-all group-hover:opacity-85"
                />
                {isHrAdmin && (
                  <div 
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className={`absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white transition-opacity duration-200 select-none ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 cursor-pointer'}`}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border border-white border-t-transparent rounded-full animate-nvuto-spin" />
                    ) : (
                      <>
                        <CameraIcon size={22} className="mb-0.5 text-white" />
                        <span className="nvuto-h3 font-black uppercase tracking-wider">Photo</span>
                      </>
                    )}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".png,.jpg,.jpeg" 
                  className="hidden" 
                />
              </div>
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC] leading-normal">
                {normalized.name}
              </SheetTitle>
              <p className="text-lg font-bold text-blue-700 dark:text-[#FF4F00] mt-1 leading-normal">
                {normalized.title}
              </p>
              <p className="text-base text-slate-500 dark:text-[#94A3B8] mt-2 flex items-center justify-center leading-relaxed">
                <MapPointRounded className="inline mr-1 text-slate-400 dark:text-[#94A3B8] shrink-0" size={18} />
                {normalized.location}
              </p>
            </div>

            {/* Quick Action Bar */}
            {normalized.email !== user?.email && (
              <div className="p-6 bg-slate-50 dark:bg-[#0B0F19] flex gap-3 justify-center border-b border-slate-100 dark:border-[#232D42] select-none">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white dark:bg-[#111625] border-slate-200 dark:border-[#232D42] text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#232D42] shadow-sm flex items-center justify-center gap-2 text-base h-11 cursor-pointer"
                  onClick={() => {
                    const isHrPath = window.location.pathname.startsWith('/hr');
                    const chatPath = isHrPath ? '/hr/chat' : '/chat';
                    onClose();
                    navigate(`${chatPath}?email=${encodeURIComponent(normalized.email || '')}&empId=${encodeURIComponent(normalized.id || '')}&name=${encodeURIComponent(normalized.name || '')}`, {
                      state: {
                        recipientEmail: normalized.email,
                        recipientId: normalized.id,
                        recipientName: normalized.name,
                        recipientAvatar: normalized.avatarUrl
                      }
                    });
                  }}
                >
                  <ChatLineRounded size={18} />
                  <span>Message</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white dark:bg-[#111625] border-slate-200 dark:border-[#232D42] text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#232D42] shadow-sm flex items-center justify-center gap-2 text-base h-11 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const mailEvent = new CustomEvent('open-compose-modal', { detail: { to: normalized.email } });
                    window.dispatchEvent(mailEvent);
                    window.location.href = `mailto:${normalized.email}`;
                  }}
                >
                  <LetterRounded size={18} />
                  <span>Email</span>
                </Button>
              </div>
            )}

            {/* Essential Details & Org Context */}
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#111625]">
              <div className="flex flex-col gap-6">
                {/* Organizational Context & Reporting Structure */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase select-none">
                      Reporting Structure
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {directReportsCount} Direct {directReportsCount === 1 ? 'Report' : 'Reports'}
                      </span>
                      {dottedReportsCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {dottedReportsCount} Dotted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direct Reporting Manager */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Primary / Direct Manager
                    </span>
                    {reportingData?.direct_manager ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-[#232D42] select-none">
                        <Avatar
                          name={reportingData.direct_manager.name}
                          src={reportingData.direct_manager.profile_picture_url || undefined}
                          size="sm"
                          className="!bg-indigo-100 dark:!bg-[#FF4F00]/10 !bg-none !text-indigo-900 dark:!text-[#FF4F00] font-bold border border-slate-200 dark:border-[#232D42] shadow-sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                            {reportingData.direct_manager.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {reportingData.direct_manager.title || reportingData.direct_manager.department || 'Direct Line Manager'}
                          </span>
                        </div>
                      </div>
                    ) : normalized.manager ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-[#232D42] select-none">
                        <Avatar
                          name={normalized.manager}
                          size="sm"
                          className="!bg-indigo-100 dark:!bg-[#FF4F00]/10 !bg-none !text-indigo-900 dark:!text-[#FF4F00] font-bold border border-slate-200 dark:border-[#232D42] shadow-sm"
                        />
                        <span className="text-base font-medium text-slate-900 dark:text-[#F8FAFC] leading-relaxed">
                          Reports to {normalized.manager}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-[#232D42] select-none">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-[#FF4F00]/10 flex items-center justify-center shrink-0 border border-slate-200 dark:border-[#232D42] text-indigo-900 dark:text-[#FF4F00] shadow-sm">
                          <UserRounded size={18} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-[#F8FAFC] leading-relaxed">
                          Top-level Executive / Direct Report to Board
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dotted-Line Reports */}
                  {dottedManagers.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-dashed border-slate-100 dark:border-[#232D42]">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Dotted-Line / Functional Reporting
                      </span>
                      <div className="flex flex-col gap-2">
                        {dottedManagers.map((dm: any) => (
                          <div
                            key={dm.id}
                            className="flex items-center gap-3 p-2.5 bg-slate-50/50 dark:bg-[#0B0F19] rounded-xl border border-dashed border-slate-200 dark:border-slate-800 select-none"
                          >
                            <Avatar
                              name={dm.name}
                              size="sm"
                              className="bg-slate-700 text-white text-xs font-bold"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                                {dm.name}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {dm.title || dm.department || 'Secondary / Functional Manager'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="flex flex-col">
                  <h3 className="text-sm font-bold text-slate-400 dark:text-[#94A3B8] tracking-wider uppercase select-none">
                    Contact Details
                  </h3>
                  <div className="flex flex-col gap-4 mt-3">
                    <div className="flex items-center gap-3">
                      <LetterRounded className="text-slate-400 dark:text-[#94A3B8] text-xl shrink-0" size={20} />
                      <a
                        href={`mailto:${normalized.email}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const mailEvent = new CustomEvent('open-compose-modal', { detail: { to: normalized.email } });
                          window.dispatchEvent(mailEvent);
                          window.location.href = `mailto:${normalized.email}`;
                        }}
                        className="text-base text-slate-800 dark:text-[#F8FAFC] hover:text-blue-700 dark:hover:text-[#FF4F00] transition-colors leading-relaxed break-all cursor-pointer"
                      >
                        {normalized.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneRounded className="text-slate-400 dark:text-[#94A3B8] text-xl shrink-0" size={20} />
                      <a
                        href={`tel:${normalized.phone}`}
                        className="text-base text-slate-800 dark:text-[#F8FAFC] hover:text-blue-700 dark:hover:text-[#FF4F00] transition-colors leading-relaxed tabular-nums"
                      >
                        {normalized.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 select-none">
                      <ClockCircleRounded className="text-slate-400 dark:text-[#94A3B8] text-xl shrink-0" size={20} />
                      <span className="text-base text-slate-800 dark:text-[#F8FAFC] leading-relaxed">
                        11:18 AM (PST)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrative Action Bar (Gated for HR Admin) */}
            {isHrAdmin && (
              <div className="p-6 bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-100 dark:border-[#232D42] flex gap-3 select-none">
                {isStatusActive || normalized.status.toLowerCase() === 'pending' ? (
                  <Button
                    onClick={handleDeactivate}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 text-base border-0 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Suspend Access</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleActivate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-base border-0 rounded-xl cursor-pointer shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Restore Platform Access</span>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
