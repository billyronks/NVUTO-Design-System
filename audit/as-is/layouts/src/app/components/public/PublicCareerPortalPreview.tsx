import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Eye as EyeRounded,
  DangerCircle as DangerCircleRounded,
  Case as BriefcaseRounded,
  MapPoint as MapPinRounded,
  ClockCircle as ClockRounded,
  AltArrowLeft,
  ArrowRight
} from '@solar-icons/react';
import { getCareerSitePreview } from '../../../services/recruitmentService';
import { Button, Badge } from '@/app/components/ui';
import PlatformLoader from '../layout/PlatformLoader';

export const PublicCareerPortalPreview: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setErrorState({
        code: 'MISSING_TOKEN',
        message: 'No ephemeral preview token was provided in the URL.'
      });
      setIsLoading(false);
      return;
    }

    getCareerSitePreview(token)
      .then((res) => {
        setPreviewData(res.data || res);
        setIsLoading(false);
      })
      .catch((err) => {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'This preview link has expired or is invalid.';
        setErrorState({
          code: err.response?.data?.error || 'PREVIEW_ERROR',
          message: errorMsg
        });
        setIsLoading(false);
      });
  }, [token]);

  if (isLoading) {
    return <PlatformLoader message="Loading ephemeral portal preview..." />;
  }

  if (errorState) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-8 text-center shadow-xl flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <DangerCircleRounded size={36} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            Preview Expired or Invalid
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#94A3B8] leading-relaxed">
            {errorState.message}
          </p>
          <div className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-[#171E2E] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#232D42]">
            Error Code: {errorState.code}
          </div>
          <Button
            onClick={() => navigate('/hr/recruitment/career-site')}
            className="mt-4 !bg-[#FF4F00] hover:!bg-[#e04500] text-white font-bold h-11 px-6 rounded-xl flex items-center gap-2"
          >
            <AltArrowLeft size={18} />
            Back to Career Site Builder
          </Button>
        </div>
      </div>
    );
  }

  const primaryColor = previewData?.primary_color || '#0F172A';
  const accentColor = previewData?.accent_color || '#2563EB';
  const heroHeadline = previewData?.hero_headline || 'Build the future with us.';
  const subHeadline = previewData?.sub_headline || 'Join our passionate team.';
  const description = previewData?.description || 'We build next generation software.';
  const companyLogo = previewData?.company_logo_url;
  const heroImage = previewData?.hero_image_url;
  const openJobs = previewData?.open_jobs || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col text-slate-900 dark:text-[#F8FAFC]">
      {/* Ephemeral Preview Watermark Banner */}
      <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs md:text-sm flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <EyeRounded size={18} className="shrink-0" />
          <span>PREVIEW MODE — 15-Minute Ephemeral Session (Unpublished Draft Updates)</span>
        </div>
        <button
          onClick={() => window.close()}
          className="bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 px-3 py-1 rounded text-xs transition-colors"
        >
          Close Preview
        </button>
      </div>

      {/* Navigation Header */}
      <header
        className="w-full px-6 py-4 flex items-center justify-between border-b shadow-sm transition-colors"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          {companyLogo ? (
            <img src={companyLogo} alt="Company Logo" className="h-9 max-w-[180px] object-contain" />
          ) : (
            <span className="text-xl font-black text-white tracking-tight">
              NVUTO <span style={{ color: accentColor }}>Careers</span>
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
          Draft Preview
        </span>
      </header>

      {/* Hero Section */}
      <section
        className="relative px-6 py-20 md:py-28 flex flex-col items-center justify-center text-center overflow-hidden border-b border-slate-200 dark:border-[#232D42]"
        style={{
          backgroundColor: primaryColor,
          backgroundImage: heroImage ? `url(${heroImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {heroImage && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
        )}

        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            {heroHeadline}
          </h1>
          <p className="text-base md:text-xl font-medium text-white/90 max-w-2xl leading-relaxed">
            {subHeadline}
          </p>
        </div>
      </section>

      {/* About Company Narrative */}
      <section className="max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-3" style={{ color: accentColor }}>
            About Us
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-20 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#232D42] pb-4">
          <div className="flex items-center gap-2">
            <BriefcaseRounded size={22} style={{ color: accentColor }} />
            <h2 className="text-2xl font-bold">Open Roles</h2>
          </div>
          <Badge variant="neutral" className="text-sm font-semibold">
            {openJobs.length} {openJobs.length === 1 ? 'Opening' : 'Openings'}
          </Badge>
        </div>

        {openJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-12 text-center text-slate-500 dark:text-slate-400">
            No published roles visible at this moment. Roles marked as Published in Job Requisitions will automatically appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {openJobs.map((job: any) => (
              <div
                key={job.id}
                className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl p-5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold hover:underline cursor-pointer">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                    {job.department && (
                      <span className="flex items-center gap-1">
                        <BriefcaseRounded size={14} />
                        {job.department}
                      </span>
                    )}
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPinRounded size={14} />
                        {job.location}
                      </span>
                    )}
                    {job.employment_type && (
                      <span className="flex items-center gap-1">
                        <ClockRounded size={14} />
                        {job.employment_type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Button
                    size="sm"
                    style={{ backgroundColor: accentColor }}
                    className="text-white font-bold h-9 px-4 rounded-lg flex items-center gap-1.5"
                  >
                    View Role <ArrowRight size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PublicCareerPortalPreview;
