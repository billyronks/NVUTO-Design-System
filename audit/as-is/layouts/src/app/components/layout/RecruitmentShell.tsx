import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUIState } from '../../context/UIStateContext';
import { SubNavTabs } from './SubNavTabs';
import { getRecruitmentPanelNavigation, interviewPanelScorecardPath, RECRUITMENT_PANELS_PATH } from '../../../config/recruitment-navigation';

export const RecruitmentShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { activeRole } = useUIState();
  const navigation = getRecruitmentPanelNavigation(activeRole || user?.role);
  return <section aria-label="Recruitment workspace" className="flex flex-col w-full min-w-0 bg-[#F8FAFC] dark:bg-[#0B0F19]">
    <nav aria-label="Recruitment navigation">
      <SubNavTabs {...navigation} defaultActiveTab={navigation.activeTab} />
    </nav>
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">{children}</div>
  </section>;
};

// Retain bookmarked links and panel invitations without a second workspace.
export const RecruitmentInterviewRedirect = () => {
  const { interviewId } = useParams();
  const { search, hash } = useLocation();
  return <Navigate replace to={`${interviewId ? interviewPanelScorecardPath(interviewId) : RECRUITMENT_PANELS_PATH}${search}${hash}`} />;
};
