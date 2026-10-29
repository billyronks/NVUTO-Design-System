import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getPublicJob, getPublicJobSchema, getApplicationPolicy, submitPublicApplication } from '../../../services/recruitmentService';
import { JobPostingDTO } from '../../../types/api.types';

// Clean inline SVG icons for guaranteed portability and zero runtime dependency issues
const Icons = {
  Briefcase: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  MapPin: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  DollarSign: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Building: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <line x1="8" y1="6" x2="8.01" y2="6" />
      <line x1="16" y1="6" x2="16.01" y2="6" />
      <line x1="12" y1="6" x2="12.01" y2="6" />
      <line x1="12" y1="10" x2="12.01" y2="10" />
      <line x1="12" y1="14" x2="12.01" y2="14" />
      <line x1="16" y1="10" x2="16.01" y2="10" />
      <line x1="16" y1="14" x2="16.01" y2="14" />
      <line x1="8" y1="10" x2="8.01" y2="10" />
      <line x1="8" y1="14" x2="8.01" y2="14" />
    </svg>
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Share: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  CheckCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Upload: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  AlertCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Spinner: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" {...props}>
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  ),
};

export const PublicJobDetailView: React.FC = () => {
  const { tenantSlug, jobId, slug } = useParams<{
    tenantSlug?: string;
    jobId?: string;
    slug?: string;
  }>();
  const navigate = useNavigate();

  const targetIdOrSlug = jobId || slug || '';
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [consent, setConsent] = useState(false);
  // Keep the exact request after an ambiguous network failure. Editing cannot
  // accidentally reuse its receipt or silently submit a second application.
  const submission = useRef<{ receipt: string; form: FormData } | null>(null);
  const formGeneration = useRef(0);

  // 1. Fetch Job Posting Data
  const {
    data: jobResponse,
    isLoading: isJobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ['publicJob', targetIdOrSlug, tenantSlug],
    queryFn: () => getPublicJob(targetIdOrSlug, tenantSlug),
    enabled: !!targetIdOrSlug,
  });

  const job: JobPostingDTO | undefined = jobResponse?.data;
  const policyQuery = useQuery({ queryKey: ['applicationPolicy', job?.id], queryFn: () => getApplicationPolicy(job!.id), enabled: !!job?.id, retry: false });
  const policy = policyQuery.data?.data;

  useEffect(() => {
    formGeneration.current += 1;
    submission.current = null; setSubmitSuccess(false); setConsent(false);
    setCandidateName(''); setCandidateEmail(''); setCandidatePhone(''); setCoverLetter(''); setResumeFile(null); setFormError('');
  }, [targetIdOrSlug, tenantSlug]);

  // 2. Fetch Google for Jobs Schema.org JSON-LD
  const { data: schemaData } = useQuery({
    queryKey: ['publicJobSchema', targetIdOrSlug, tenantSlug],
    queryFn: () => getPublicJobSchema(targetIdOrSlug, tenantSlug),
    enabled: !!targetIdOrSlug,
  });

  // 3. SEO Head Injection: Google for Jobs JSON-LD Script Node
  useEffect(() => {
    if (!schemaData || !targetIdOrSlug) return;

    const scriptId = `job-posting-ld-json-${targetIdOrSlug}`;
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    scriptTag.text = JSON.stringify(schemaData);

    return () => {
      const existingTag = document.getElementById(scriptId);
      if (existingTag && existingTag.parentNode) {
        existingTag.parentNode.removeChild(existingTag);
      }
    };
  }, [schemaData, targetIdOrSlug]);

  // 4. Dynamic Document Title & OpenGraph Meta Tags
  useEffect(() => {
    if (!job) return;

    const originalTitle = document.title;
    const companyName = (schemaData as any)?.hiringOrganization?.name || 'Company';
    document.title = `${job.title} | ${companyName} Careers`;

    const setMetaTag = (attr: string, key: string, content: string): HTMLMetaElement => {
      let meta = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
      return meta;
    };

    const ogTitle = setMetaTag('property', 'og:title', `${job.title} at ${companyName}`);
    const ogDesc = setMetaTag(
      'property',
      'og:description',
      job.description ? job.description.slice(0, 160) : `Exciting career opportunity for ${job.title}`
    );
    const ogType = setMetaTag('property', 'og:type', 'website');
    const twitterCard = setMetaTag('name', 'twitter:card', 'summary_large_image');

    return () => {
      document.title = originalTitle;
      [ogTitle, ogDesc, ogType, twitterCard].forEach((tag) => {
        if (tag && tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [job, schemaData]);

  // 5. Application Submission Mutation
  const applicationMutation = useMutation({
    onMutate: () => ({ generation: formGeneration.current }),
    mutationFn: async () => {
      if (submission.current) return submitPublicApplication(submission.current.form, submission.current.receipt);
      if (!job) throw new Error('No job selected');
      if (!candidateName.trim() || !candidateEmail.trim()) {
        throw new Error('Name and email are required');
      }
      if (!resumeFile) {
        throw new Error('Please attach your CV / Resume');
      }
      if (!policy?.enabled || !consent) throw new Error('Review and accept the application privacy notice before submitting.');
      if (resumeFile.size === 0 || resumeFile.size > 25 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(resumeFile.name)) throw new Error('Resume must be a PDF or Word document of 1 byte to 25 MiB.');

      const formData = new FormData();
      formData.append('job_id', job.id);
      formData.append('name', candidateName.trim());
      formData.append('email', candidateEmail.trim().toLowerCase());
      formData.append('phone', candidatePhone.trim());
      formData.append('cover_letter', coverLetter.trim());
      formData.append('resume', resumeFile);
      formData.append('policy_version', policy.version);
      formData.append('consent', 'true');

      // Store only a request fingerprint and random receipt, never candidate PII
      // or file bytes. Reselecting the same form after reload recovers its intent.
      if (!globalThis.crypto?.subtle || !crypto.randomUUID) throw new Error('A secure HTTPS browser session is required to submit this application.');
      const fingerprintBytes = new TextEncoder().encode(JSON.stringify([job.id, candidateName.trim(), candidateEmail.trim().toLowerCase(), candidatePhone.trim(), coverLetter.trim(), resumeFile.name, policy.version, Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await resumeFile.arrayBuffer())))]));
      const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', fingerprintBytes)), b => b.toString(16).padStart(2, '0')).join('');
      const receiptStorageKey = `nvuto-public-application:${job.id}:${fingerprint}`;
      const receipt = sessionStorage.getItem(receiptStorageKey) || crypto.randomUUID();
      sessionStorage.setItem(receiptStorageKey, receipt);
      submission.current = { receipt, form: formData };
      return submitPublicApplication(formData, receipt);
    },
    onSuccess: (_response, _variables, context) => {
      if (context?.generation !== formGeneration.current) return;
      setSubmitSuccess(true);
      setFormError('');
    },
    onError: (err: any, _variables, context) => {
      if (context?.generation !== formGeneration.current) return;
      if ([400, 404, 412, 413].includes(err?.status)) submission.current = null;
      if (err?.status === 412) { setConsent(false); policyQuery.refetch(); }
      setFormError(err?.message || 'Failed to submit application. Please try again.');
    },
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (isJobLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Icons.Spinner className="w-10 h-10 text-orange-500 mb-4" />
        <p className="text-lg font-medium">Loading position details...</p>
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Icons.AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Position unavailable</h1>
        <p className="text-slate-400 max-w-md mb-6">
          We could not load this position. It may be closed, the link may be invalid, or the service may be temporarily unavailable. Please retry later.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
        >
          <Icons.ArrowLeft className="w-4 h-4" />
          Back to Careers
        </button>
      </div>
    );
  }

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Compensation not disclosed';
    const amount = (n: number) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n); } catch { return `${n.toLocaleString()} (currency not configured)`; } };
    if (min && max) return `${amount(min)} - ${amount(max)}`;
    if (min) return `From ${amount(min)}`;
    return `Up to ${amount(max!)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Back"
            >
              <Icons.ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-600/20">
                N
              </span>
              <span className="font-semibold text-slate-100 tracking-tight text-lg">
                {(schemaData as any)?.hiringOrganization?.name || ''} <span className="text-orange-500 font-normal">Careers</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <Icons.Share className="w-3.5 h-3.5" />
              {copied ? 'Link Copied!' : 'Share'}
            </button>
            <button
              onClick={() => setApplyModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md shadow-orange-600/30 transition-all active:scale-95"
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-r from-orange-950/20 via-slate-900 to-slate-950 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
            <Icons.Briefcase className="w-3.5 h-3.5" />
            {job.department || 'Department not specified'}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            {job.title}
          </h1>

          {/* Badges Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-300 pt-2">
            <div className="flex items-center gap-2">
              <Icons.MapPin className="w-4 h-4 text-orange-400" />
              <span>{job.location || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Clock className="w-4 h-4 text-orange-400" />
              <span>{job.employment_type || 'Employment type not specified'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Building className="w-4 h-4 text-orange-400" />
              <span>{job.workplace_type || 'Workplace type not specified'}</span>
            </div>
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <Icons.DollarSign className="w-4 h-4" />
              <span>{formatSalary(job.salary_min, job.salary_max, job.currency)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Description & Requirements */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-6 sm:p-8 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4">About the Role</h2>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {job.description || 'No detailed description provided for this opening.'}
              </div>
            </section>

            {job.requirements && (
              <section className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-6 sm:p-8 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-4">Role Requirements</h2>
                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {job.requirements}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Summary Card */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Role Overview</h3>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wider">Department</dt>
                  <dd className="font-semibold text-slate-200 mt-0.5">{job.department || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wider">Location</dt>
                  <dd className="font-semibold text-slate-200 mt-0.5">{job.location || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wider">Employment Type</dt>
                  <dd className="font-semibold text-slate-200 mt-0.5">{job.employment_type || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wider">Compensation</dt>
                  <dd className="font-semibold text-emerald-400 mt-0.5">
                    {formatSalary(job.salary_min, job.salary_max, job.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 text-xs uppercase tracking-wider">Posted Date</dt>
                  <dd className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Icons.Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Not provided'}
                  </dd>
                </div>
              </dl>

              <button
                onClick={() => setApplyModalOpen(true)}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold shadow-lg shadow-orange-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="application-dialog-title" data-responsive-dialog="true" className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setApplyModalOpen(false);
                setSubmitSuccess(false);
                setFormError('');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            {submitSuccess ? (
              <div className="text-center py-6">
                <Icons.CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 id="application-dialog-title" className="text-2xl font-bold text-white mb-2">Application Received!</h3>
                <p className="text-slate-300 text-sm mb-6">
                  Your application for <strong>{job.title}</strong> was received. Your resume remains in private quarantine pending security clearance. This does not guarantee an interview or response time.
                </p>
                <button
                  onClick={() => {
                    setApplyModalOpen(false);
                    setSubmitSuccess(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 id="application-dialog-title" className="text-xl font-bold text-white mb-1">Apply for Position</h3>
                <p className="text-xs text-slate-400 mb-6">{job.title} • {job.location || 'Location not specified'}</p>

                {formError && (
                  <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <Icons.AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    applicationMutation.mutate();
                  }}
                  className="space-y-4"
                >
                  <fieldset disabled={applicationMutation.isPending || !!submission.current} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Resume / CV (PDF or Word) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative border border-dashed border-slate-800 hover:border-orange-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/50">
                      <input
                        type="file"
                        required
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Icons.Upload className="w-6 h-6 mx-auto text-slate-400 mb-1.5" />
                      <p className="text-xs font-medium text-slate-300">
                        {resumeFile ? resumeFile.name : 'Click or drag your CV file here (Max 25MB)'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Brief Note or Cover Letter
                    </label>
                    <textarea
                      rows={3}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Highlight relevant experience or portfolio links..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>
                  <div className="text-xs text-slate-300 space-y-2">
                    {policyQuery.isError ? <p role="alert">Application privacy information is unavailable. Please retry later.</p> : !policy?.enabled ? <p>Applications are not currently enabled by this company.</p> : <>
                      <p className="whitespace-pre-wrap">{policy.notice}</p>
                      <p>Configured retention: {policy.retention_days} days. <a href={policy.privacy_url} target="_blank" rel="noopener noreferrer" className="underline">Privacy notice</a></p>
                      <label className="flex gap-2"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />I have reviewed this notice and agree to submit my application under it.</label>
                    </>}
                  </div>
                  </fieldset>
                  {submission.current && !applicationMutation.isPending && <p role="status" className="text-xs text-amber-300">The result may be uncertain. Retry this exact application to recover its receipt; do not start another submission.</p>}

                  <button
                    type="submit"
                    disabled={applicationMutation.isPending || (!submission.current && (!policy?.enabled || !consent))}
                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {applicationMutation.isPending ? (
                      <>
                        <Icons.Spinner className="w-4 h-4 mr-2" />
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicJobDetailView;
