import React, { useMemo } from 'react';
import { SunFog as SunFogRounded } from '@solar-icons/react';
import { Avatar, PageHeader } from '@/app/components/ui';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../../store';

export interface WelcomeHeaderProps {
  userName?: string;
  avatarUrl?: string;
  dateText?: string;
  department?: string;
  subtitle?: string;
  className?: string;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName: customUserName,
  avatarUrl: customAvatarUrl,
  dateText,
  department: customDepartment,
  subtitle,
  className = '',
}) => {
  const { user } = useAuth();
  const reduxProfile = useAppSelector((state) => state.auth.profile);

  const storedAdminName = typeof window !== 'undefined' ? localStorage.getItem('nvuto_admin_name') : null;
  let rawUserName =
    customUserName ||
    reduxProfile?.profile?.first_name ||
    (user as any)?.profile?.first_name ||
    (user as any)?.firstName ||
    user?.fullName?.split(' ')[0] ||
    '';

  if ((!rawUserName || rawUserName.toLowerCase() === 'hr' || rawUserName.toLowerCase() === 'workspace' || rawUserName.toLowerCase() === 'user') && storedAdminName && storedAdminName.toLowerCase() !== 'hr admin') {
    rawUserName = storedAdminName.split(' ')[0] || rawUserName;
  }

  const userName = rawUserName || 'User';

  const department =
    customDepartment ||
    (user as any)?.profile?.department ||
    (user as any)?.department ||
    reduxProfile?.profile?.department ||
    'Staff';

  const avatarSrc = useMemo(() => {
    return (
      customAvatarUrl ||

      user?.avatarUrl ||
      (user as any)?.profile?.avatar_url ||
      (user as any)?.profile?.avatarUrl ||
      (user as any)?.profile_picture_url ||
      (user as any)?.profilePictureUrl ||
      reduxProfile?.profile?.avatar_url ||


      ''
    );
  }, [customAvatarUrl, user, reduxProfile]);

  const formattedDate = useMemo(() => {
    if (dateText) return dateText;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }, [dateText]);

  return (
    <div className={`select-none ${className}`}>
      <PageHeader
        title={
          <div className="flex items-center gap-4">
            <Avatar name={userName} src={avatarSrc} size="lg" className="w-14 h-14" />
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-[#F8FAFC] leading-none">
                Good morning, {userName}!
              </h1>
              <span className="text-base text-slate-500 dark:text-[#94A3B8] font-medium mt-1.5 flex items-center leading-none">
                <SunFogRounded className="text-slate-400 mr-2 shrink-0" size={20} />
                {subtitle || `${formattedDate} • ${department}`}
              </span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default WelcomeHeader;
