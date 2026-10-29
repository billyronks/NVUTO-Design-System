import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Magnifer, FileText, UserCircle, UsersGroupTwoRounded } from '@solar-icons/react';
import { Input, EmptyState } from '@/app/components/ui';
import { globalSearch } from '../../../services/searchService';
import type { SearchResultDTO, SearchEmployeeDTO, SearchDocumentDTO, SearchDepartmentDTO } from '../../../types/api.types';
import { useNavigate } from 'react-router-dom';
import PlatformLoader from './PlatformLoader';

export const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Query search results
  const { data: searchResults, isLoading, isError } = useQuery({
    queryKey: ['globalSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const res = await globalSearch(debouncedQuery);
      return res.data || [];
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Split results by type
  const employees = React.useMemo(() => {
    return (searchResults || []).filter((r): r is SearchEmployeeDTO => r.type === 'employee');
  }, [searchResults]);

  const documents = React.useMemo(() => {
    return (searchResults || []).filter((r): r is SearchDocumentDTO => r.type === 'document');
  }, [searchResults]);

  const departments = React.useMemo(() => {
    return (searchResults || []).filter((r): r is SearchDepartmentDTO => r.type === 'department');
  }, [searchResults]);

  const hasResults = employees.length > 0 || documents.length > 0 || departments.length > 0;

  const handleResultClick = (result: SearchResultDTO) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'employee') {
      const isHrPath = window.location.pathname.startsWith('/hr');
      const targetRoute = isHrPath ? `/hr/people/${result.id}` : `/people/${result.id}`;
      navigate(targetRoute);
    } else if (result.type === 'document') {
      navigate('/documents');
    } else if (result.type === 'department') {
      const isHrPath = window.location.pathname.startsWith('/hr');
      navigate(isHrPath ? '/hr/directory' : '/directory');
    }
  };

  return (
    <div ref={containerRef} data-tour="global-search" className="relative min-w-0 flex-1 flex items-center w-full max-w-xl">
      <Input
        type="text"
        placeholder="Search records, documents, actions..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        leftIcon={Magnifer}
        containerClassName="flex min-w-0 flex-1 w-full"
        className="!bg-[#E2E5F5] dark:!bg-[#171E2E] !h-10 text-slate-900 dark:text-[#F8FAFC] dark:!text-[#F8FAFC] placeholder:text-slate-500 dark:text-[#94A3B8] dark:placeholder:text-[#94A3B8] !rounded-lg border-transparent dark:border-[#232D42]"
        role="combobox"
        aria-label="Global Workspace Search"
        aria-expanded={isOpen && query.trim().length >= 2}
      />

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-12 left-0 right-0 bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md border border-slate-200/80 dark:border-[#232D42] rounded-xl shadow-2xl z-[1000] overflow-hidden max-h-[min(420px,calc(100dvh-8rem))] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200" role="region" aria-label="Search Results">
          
          {/* Loading state */}
          {isLoading && (
            <PlatformLoader variant="inline" size="sm" message="Searching NVUTO indices" />
          )}

          {/* Error state */}
          {isError && (
            <div className="p-6 text-center text-sm font-bold text-rose-600 dark:text-rose-400">
              Failed to query unified search index.
            </div>
          )}

          {/* Results display */}
          {!isLoading && !isError && (
            <>
              {!hasResults ? (
                <EmptyState icon={Magnifer} title="No matching records found." subtitle="Try searching for name, document title, or department." className="border-0 p-8" />
              ) : (
                <div className="py-2 flex flex-col gap-1.5">
                  
                  {/* Employees Category */}
                  {employees.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-[#D63F00] dark:text-[#FF4F00] uppercase tracking-wider bg-slate-50 dark:bg-[#0B0F19] select-none">
                        Employees ({employees.length})
                      </div>
                      <div className="flex flex-col">
                        {employees.map((emp) => (
                          <button
                            key={emp.id}
                            onClick={() => handleResultClick(emp)}
                            aria-label={`Employee result: ${emp.firstName} ${emp.lastName}, ${emp.jobTitle} in ${emp.department}`}
                            className="w-full px-4 py-2.5 hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#171E2E] border border-slate-200 dark:border-[#232D42] overflow-hidden flex items-center justify-center text-slate-600 dark:text-[#94A3B8]">
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <UserCircle size={20} />
                              )}
                            </div>
                            <div className="flex flex-col leading-tight min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] truncate">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold truncate">
                                {emp.jobTitle} • {emp.department}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents Category */}
                  {documents.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-[#D63F00] dark:text-[#FF4F00] uppercase tracking-wider bg-slate-50 dark:bg-[#0B0F19] select-none">
                        Documents ({documents.length})
                      </div>
                      <div className="flex flex-col">
                        {documents.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => handleResultClick(doc)}
                            aria-label={`Document result: ${doc.name}, category ${doc.category}`}
                            className="w-full px-4 py-2.5 hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="flex flex-col leading-tight min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] truncate">
                                {doc.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold truncate">
                                {doc.category} • {doc.fileType.toUpperCase()} • Uploaded by {doc.uploadedBy}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Departments Category */}
                  {departments.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-[#D63F00] dark:text-[#FF4F00] uppercase tracking-wider bg-slate-50 dark:bg-[#0B0F19] select-none">
                        Departments ({departments.length})
                      </div>
                      <div className="flex flex-col">
                        {departments.map((dept) => (
                          <button
                            key={dept.id}
                            onClick={() => handleResultClick(dept)}
                            aria-label={`Department result: ${dept.name}, managed by ${dept.manager}`}
                            className="w-full px-4 py-2.5 hover:bg-slate-50 dark:bg-[#0B0F19] dark:hover:bg-[#171E2E] flex items-center gap-3 text-left transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                              <UsersGroupTwoRounded size={18} />
                            </div>
                            <div className="flex flex-col leading-tight min-w-0">
                              <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] truncate">
                                {dept.name}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-semibold truncate">
                                Manager: {dept.manager} • Cost Center: {dept.costCenter}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  );
};
