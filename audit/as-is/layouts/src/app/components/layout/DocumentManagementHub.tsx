import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  FolderWithFiles as FolderWithFilesRounded,
  DocumentText as DocumentTextRounded,
  PenNewSquare as PenNewSquareRounded,
  DownloadSquare as DownloadSquareRounded,
  UploadSquare as UploadSquareRounded,
  Eye as EyeRounded,
  ShieldCheck as ShieldCheckRounded,
  UserCheck as UserCheckRounded,
  Magnifer
} from '@solar-icons/react';
import { Card } from '@/app/components/ui/card';
import {
  Button,
  Badge,
  Input,
  Select,
  TableWrapper,
  Table,
  TableHead,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  PageHeader,
  Modal,
  Label,
  EmptyState
} from '@/app/components/ui';
import { useToast } from '../../context/useToast';
import { useMediaViewer } from '../../context/MediaViewerContext';
import { getEmployees } from '../../../services/employeeService';
import { useUIState } from '../../context/UIStateContext';
import {
  listAllDocuments,
  listFinanceDocuments,
  dispatchSignature,
  getComplianceMetrics,
  getPreSignedURL,
  downloadDMSFile,
  uploadDMSDocument,
  listAllDocumentRequests,
  createDocumentRequest
} from '../../../services/documentService';

// Main Router Wrapper Gating Views based on Role
export const DocumentManagementHub: React.FC = () => {
  const { activeRole } = useUIState();

  const roleStr = String(activeRole || '').toLowerCase();
  const isHR = roleStr === 'hr admin' || roleStr === 'hr' || roleStr === 'hr_admin';
  const isFinance = roleStr === 'finance';
  const isCEO = roleStr === 'ceo' || roleStr === 'exec';

  if (isHR) {
    return <HRDocumentsWorkspace />;
  }
  if (isFinance) {
    return <FinanceDocumentsWorkspace />;
  }
  if (isCEO) {
    return <ExecComplianceDashboard />;
  }

  // Fallback default
  return <HRDocumentsWorkspace />;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. HR DOCUMENTS WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
const HRDocumentsWorkspace: React.FC = () => {
  const { addToast } = useToast();
  const { openPreview } = useMediaViewer();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Upload fields state
  const [newDocCategory, setNewDocCategory] = useState<'HR' | 'FINANCE' | 'POLICY' | 'CORPORATE'>('HR');
  const [newDocOwnerId, setNewDocOwnerId] = useState('');

  // Fetch employees list for dropdown options
  const employeesQuery = useQuery({
    queryKey: ['employeesList'],
    queryFn: () => getEmployees({ limit: 100 }),
  });

  const employeeOptions = useMemo(() => {
    return (employeesQuery.data?.data || []).map((emp) => ({
      value: emp.id,
      label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.id,
    }));
  }, [employeesQuery.data]);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  // Dispatch signature form setup
  const { register: regDispatch, handleSubmit: handleSubDispatch, reset: resetDispatch, watch: watchDispatch, setValue: setValueDispatch, formState: { errors: errsDispatch } } = useForm<{ employeeIds: string }>();

  // Request document form setup
  const { register: regRequest, handleSubmit: handleSubRequest, reset: resetRequest, watch: watchRequest, setValue: setValueRequest, formState: { errors: errsRequest } } = useForm<{ employeeId: string; requestTitle: string; description: string }>();

  useEffect(() => {
    regDispatch('employeeIds', { required: 'Please select an employee' });
    regRequest('employeeId', { required: 'Target employee is required' });
  }, [regDispatch, regRequest]);

  // Fetch all documents for HR Admin
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['hr-all-documents'],
    queryFn: listAllDocuments
  });

  // Fetch all organization document requests
  const { data: requestsRes, isLoading: isReqsLoading, isError: isReqsError } = useQuery({
    queryKey: ['hr-all-document-requests'],
    queryFn: listAllDocumentRequests
  });

  const documentsList = res?.data || [];
  const requestsList = requestsRes?.data || [];

  const dispatchMutation = useMutation({
    mutationFn: ({ docId, employeeIds }: { docId: string; employeeIds: string[] }) =>
      dispatchSignature(docId, employeeIds),
    onSuccess: () => {
      addToast('success', 'Signature Dispatched', 'Compliance signing requests have been broadcasted to all selected employees.');
      setIsDispatchModalOpen(false);
      resetDispatch();
    },
    onError: (err: any) => {
      addToast('danger', 'Dispatch Failed', err.message || 'Unable to dispatch signing request.');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => uploadDMSDocument(formData),
    onSuccess: (resData: any) => {
      // 1. Invalidate document vault queries to trigger immediate background re-fetch
      queryClient.invalidateQueries({ queryKey: ['hr-all-documents'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents-vault'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'personal-vault'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dmsDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['hr-all-document-requests'] });

      // 2. Append new document directly to cached state if present
      const uploadedDocInfo = resData?.data;
      if (uploadedDocInfo) {
        const newDocObject = {
          id: uploadedDocInfo.id || `doc-${Date.now()}`,
          owner_id: newDocOwnerId || 'global',
          folder_category: newDocCategory || 'HR',
          document_name: selectedUploadFile?.name || 'Uploaded Document',
          file_size: uploadedDocInfo.file_size || '100 KB',
          file_type: uploadedDocInfo.file_type || 'PDF',
          uploaded_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        queryClient.setQueryData(['hr-all-documents'], (oldData: any) => {
          if (!oldData) return { success: true, data: [newDocObject] };
          if (Array.isArray(oldData)) return [newDocObject, ...oldData];
          if (oldData?.data && Array.isArray(oldData.data)) {
            return { ...oldData, data: [newDocObject, ...oldData.data] };
          }
          return oldData;
        });

        queryClient.setQueryData(['my-documents-vault'], (oldData: any) => {
          if (!oldData) return { success: true, data: [newDocObject] };
          if (Array.isArray(oldData)) return [newDocObject, ...oldData];
          if (oldData?.data && Array.isArray(oldData.data)) {
            return { ...oldData, data: [newDocObject, ...oldData.data] };
          }
          return oldData;
        });
      }

      setIsUploadOpen(false);
      setSelectedUploadFile(null);
      setNewDocOwnerId('');
      setNewDocCategory('HR');
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast('success', 'Upload Successful', 'The document has been securely uploaded and cataloged in the core archives.');
    },
    onError: (err: any) => {
      addToast('danger', 'Upload Failed', err.message || 'Unable to upload and archive the file.');
    }
  });

  const requestMutation = useMutation({
    mutationFn: (payload: { employee_id: string; request_title: string; description: string }) =>
      createDocumentRequest(payload),
    onSuccess: () => {
      addToast('success', 'Document Requested', 'Document upload request has been dispatched to the employee.');
      setIsRequestModalOpen(false);
      resetRequest();
      queryClient.invalidateQueries({ queryKey: ['hr-all-document-requests'] });
    },
    onError: (err: any) => {
      addToast('danger', 'Request Failed', err.message || 'Unable to create document request.');
    }
  });

  const handleDispatch = (data: { employeeIds: string }) => {
    if (!selectedDoc) return;
    const ids = data.employeeIds.split(',').map(id => id.trim()).filter(id => id !== '');
    if (ids.length === 0) {
      addToast('warning', 'Valid ID Required', 'Please enter at least one valid Employee ID or email.');
      return;
    }
    dispatchMutation.mutate({ docId: selectedDoc.id, employeeIds: ids });
  };

  const handleRequestSubmit = (data: { employeeId: string; requestTitle: string; description: string }) => {
    requestMutation.mutate({
      employee_id: data.employeeId,
      request_title: data.requestTitle,
      description: data.description
    });
  };

  const handlePreview = async (id: string, name: string, size?: string) => {
    try {
      const presignedRes = await getPreSignedURL(id);
      if (!presignedRes.data?.url) {
        throw new Error('Unable to obtain secure pre-signed preview link.');
      }
      const blob = await downloadDMSFile(presignedRes.data.url);
      const url = window.URL.createObjectURL(blob);
      openPreview({
        url,
        fileName: name,
        fileSize: size,
        allowDownload: true
      });
    } catch (err: any) {
      addToast('danger', 'Preview Failed', err.message || 'Unable to preview file.');
    }
  };

  const handleSecureDownload = async (id: string, name: string) => {
    try {
      const presignedRes = await getPreSignedURL(id);
      if (!presignedRes.data?.url) {
        throw new Error('Unable to obtain secure pre-signed download link.');
      }
      const blob = await downloadDMSFile(presignedRes.data.url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('success', 'Download Complete', 'File downloaded securely using temporary link credentials.');
    } catch (err: any) {
      addToast('danger', 'Download Failed', err.message || 'Access denied.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        addToast('danger', 'File Too Large', 'File size exceeds the 25MB limit.');
        e.target.value = '';
        setSelectedUploadFile(null);
        return;
      }
      setSelectedUploadFile(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      addToast('warning', 'File Required', 'Please select a file to upload.');
      return;
    }
    if (selectedUploadFile.size > 25 * 1024 * 1024) {
      addToast('danger', 'File Too Large', 'File size exceeds the 25MB limit.');
      return;
    }
    const finalOwner = newDocCategory === 'POLICY' ? 'global' : newDocOwnerId.trim();
    if (!finalOwner) {
      addToast('warning', 'Owner ID Required', 'Please specify the target Employee ID or owner context.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedUploadFile);
    formData.append('employee_id', finalOwner);
    formData.append('category', newDocCategory);
    formData.append('document_name', selectedUploadFile.name);

    uploadMutation.mutate(formData);
  };

  const filteredDocs = useMemo(() => {
    return documentsList.filter((doc: any) =>
      doc.document_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.folder_category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documentsList, searchQuery]);

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start w-full bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <PageHeader
        title="DMS: Custodian Workspace"
        subtitle="Broad company policy folders and employee record vaults compliance index."
        rightControls={
          <div className="flex gap-3">
            <Button
              onClick={() => setIsRequestModalOpen(true)}
              variant="outline"
              leftIcon={FolderWithFilesRounded}
              className="h-11 px-5 text-sm font-bold border-slate-300 dark:border-[#232D42] text-slate-800 dark:text-[#F8FAFC] bg-white hover:bg-slate-50 dark:bg-[#111625] dark:hover:bg-[#171E2E] shadow-xs rounded-lg"
            >
              Request Document
            </Button>
            <Button
              onClick={() => setIsUploadOpen(true)}
              leftIcon={UploadSquareRounded}
              className="h-11 px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 shadow-sm rounded-lg"
            >
              Upload New Document
            </Button>
          </div>
        }
      />

      <div className="mt-6 flex flex-col gap-8">
        
        {/* Main Files Table */}
        <TableWrapper>
          <div className="px-6 py-5 border-b border-slate-200 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
              All Files Directory
            </h3>
            <div className="w-72">
              <Input
                placeholder="Search file name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Magnifer}
                className="text-base"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              Loading custodian documents...
            </div>
          ) : (isError || filteredDocs.length === 0) ? (
            <div className="p-2">
              <EmptyState
                title="No documents found"
                description={isError ? "Unable to query custodian database. Please check connection and try again." : "The document store directory is empty."}
              />
            </div>
          ) : (
            <Table className="min-w-[650px]">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-sm">DOCUMENT NAME</TableHeaderCell>
                  <TableHeaderCell className="text-sm">FOLDER</TableHeaderCell>
                  <TableHeaderCell className="text-sm">OWNER ID</TableHeaderCell>
                  <TableHeaderCell className="text-sm">UPLOADED DATE</TableHeaderCell>
                  <TableHeaderCell className="text-sm text-center">ACTIONS</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocs.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="nvuto-body font-bold text-slate-900 dark:text-[#F8FAFC]">
                      <div
                        onClick={() => handlePreview(doc.id, doc.document_name, doc.file_size)}
                        className="flex items-center gap-2 cursor-pointer group hover:text-[#FF4F00] transition-colors"
                        title="Click to preview document"
                      >
                        <DocumentTextRounded className="text-slate-400 group-hover:text-[#FF4F00] shrink-0 transition-colors" size={18} />
                        <span className="underline-offset-2 group-hover:underline">{doc.document_name}</span>
                            <DocumentSecurityPanel documentId={doc.id}/>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">{doc.folder_category}</Badge>
                    </TableCell>
                    <TableCell className="nvuto-mono text-slate-500 dark:text-[#94A3B8]">
                      {doc.owner_id}
                    </TableCell>
                    <TableCell className="nvuto-caption text-slate-650">
                      {doc.uploaded_date}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handlePreview(doc.id, doc.document_name, doc.file_size)}
                          variant="outline"
                          leftIcon={EyeRounded}
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                        >
                          Preview
                        </Button>
                        <Button
                          onClick={() => handleSecureDownload(doc.id, doc.document_name)}
                          variant="outline"
                          leftIcon={DownloadSquareRounded}
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                        >
                          Download
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setIsDispatchModalOpen(true);
                          }}
                          leftIcon={PenNewSquareRounded}
                          className="h-8 px-3 text-xs font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0"
                        >
                          Request E-Sign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableWrapper>

        {/* Organization-wide document requests ledger */}
        <TableWrapper>
          <div className="px-6 py-5 border-b border-slate-200 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
              Requested Files Ledger
            </h3>
          </div>

          {isReqsLoading ? (
            <div className="p-12 text-center text-slate-400">
              Loading document requests ledger...
            </div>
          ) : (isReqsError || requestsList.length === 0) ? (
            <div className="p-2">
              <EmptyState
                title="No requests dispatched"
                description="No custom document upload requests have been dispatched to employees yet."
              />
            </div>
          ) : (
            <Table className="min-w-[650px]">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-sm">REQUEST TITLE</TableHeaderCell>
                  <TableHeaderCell className="text-sm">EMPLOYEE NAME</TableHeaderCell>
                  <TableHeaderCell className="text-sm">DESCRIPTION</TableHeaderCell>
                  <TableHeaderCell className="text-sm">STATUS</TableHeaderCell>
                  <TableHeaderCell className="text-sm text-center">ACTION</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requestsList.map((req: any) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                      <span>{req.request_title}</span>
                    </TableCell>
                    <TableCell className="text-base text-slate-700 dark:text-[#F8FAFC]">
                      {req.employee_name}
                    </TableCell>
                    <TableCell className="text-base text-slate-500 dark:text-[#94A3B8] max-w-xs truncate">
                      {req.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={req.status === 'uploaded' ? 'success' : 'warning'}>
                        {req.status === 'uploaded' ? 'FULFILLED' : 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {req.status === 'uploaded' ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => handlePreview(req.uploaded_doc_id, (req.request_title || 'Document') + '.pdf')}
                            variant="outline"
                            leftIcon={EyeRounded}
                            className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                          >
                            Preview
                          </Button>
                          <Button
                            onClick={() => handleSecureDownload(req.uploaded_doc_id, (req.request_title || 'Document') + '.pdf')}
                            variant="outline"
                            leftIcon={DownloadSquareRounded}
                            className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                          >
                            Download
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-450 font-semibold uppercase">Awaiting Upload</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableWrapper>

      </div>

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)}>
        <form onSubmit={handleUploadSubmit} className="flex flex-col bg-white dark:bg-[#111625] text-slate-900 dark:text-[#F8FAFC] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#232D42]">
          <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none bg-slate-50 dark:bg-[#0B0F19]">
            <UploadSquareRounded className="text-[#FF4F00]" size={24} />
            <h3 className="nvuto-h1 uppercase">
              Upload Sensitive Document
            </h3>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <Select
              label="Folder Category"
              value={newDocCategory}
              onChange={(e) => setNewDocCategory(e.target.value as any)}
              options={[
                { value: 'HR', label: 'HR / Personnel' },
                { value: 'FINANCE', label: 'Finance / Treasury' },
                { value: 'POLICY', label: 'Company Policy (Global)' },
                { value: 'CORPORATE', label: 'Corporate General' }
              ]}
            />

            {newDocCategory !== 'POLICY' && (
              <Select
                label="Target Owner (Employee)"
                value={newDocOwnerId}
                onChange={(e) => setNewDocOwnerId(e.target.value)}
                options={[{ value: '', label: 'Select Employee...' }, ...employeeOptions]}
                required
              />
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 dark:border-[#232D42] p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F19] rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-[#232D42] transition-all text-center gap-1 select-none"
            >
              <UploadSquareRounded className="text-slate-400 dark:text-[#94A3B8] shrink-0" size={32} />
              <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC] mt-2">
                {selectedUploadFile ? selectedUploadFile.name : 'Simulate selecting a document file'}
              </span>
              <span className="text-sm text-slate-500 dark:text-[#94A3B8]">
                {selectedUploadFile ? 'File attached successfully' : 'Click to attach PDF file'}
              </span>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-[#232D42] flex justify-end gap-3 select-none bg-slate-50 dark:bg-[#0B0F19]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
              className="h-11 px-5 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#232D42]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending}
              className="h-11 px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 shadow-sm"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload & Encrypt'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Document Modal */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)}>
        <form onSubmit={handleSubRequest(handleRequestSubmit)} className="flex flex-col bg-white dark:bg-[#111625] text-slate-900 dark:text-[#F8FAFC] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#232D42]">
          <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none bg-slate-50 dark:bg-[#0B0F19]">
            <FolderWithFilesRounded className="text-[#FF4F00]" size={24} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] uppercase">
              Request Document from Employee
            </h3>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <Select
              label="Target Employee"
              options={[{ value: '', label: 'Select Employee...' }, ...employeeOptions]}
              value={watchRequest('employeeId') || ''}
              onChange={(e) => setValueRequest('employeeId', e.target.value, { shouldValidate: true })}
              required
            />
            {errsRequest.employeeId && <span className="text-xs text-red-500">{errsRequest.employeeId.message}</span>}

            <Input
              label="Document Request Title"
              placeholder="e.g. Signed NDA, Medical Clearance Certificate"
              {...regRequest('requestTitle', { required: 'Request title is required' })}
              required
              className="text-base"
            />
            {errsRequest.requestTitle && <span className="text-xs text-red-500">{errsRequest.requestTitle.message}</span>}

            <Input
              label="Request Description / Guidelines"
              placeholder="e.g. Please scan and attach your certified credentials"
              {...regRequest('description')}
              className="text-base"
            />
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-[#232D42] flex justify-end gap-3 select-none bg-slate-50 dark:bg-[#0B0F19]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
              className="h-11 px-5 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#232D42]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={requestMutation.isPending}
              className="h-11 px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 shadow-sm"
            >
              {requestMutation.isPending ? 'Requesting...' : 'Dispatch Request'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Signature Dispatch Modal */}
      <Modal isOpen={isDispatchModalOpen} onClose={() => setIsDispatchModalOpen(false)}>
        {selectedDoc && (
          <form onSubmit={handleSubDispatch(handleDispatch)} className="flex flex-col bg-white dark:bg-[#111625] text-slate-900 dark:text-[#F8FAFC] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-[#232D42]">
            <div className="p-6 border-b border-slate-100 dark:border-[#232D42] flex items-center gap-2 select-none bg-slate-50 dark:bg-[#0B0F19]">
              <UploadSquareRounded className="text-[#FF4F00]" size={24} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC] uppercase">
                Dispatch Signature Request
              </h3>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1 select-none">
                <span className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                  {selectedDoc.document_name}
                </span>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
                  Select a target employee to dispatch compliance signature links.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <Select
                  label="Target Employee"
                  options={[{ value: '', label: 'Select Employee...' }, ...employeeOptions]}
                  value={watchDispatch('employeeIds') || ''}
                  onChange={(e) => setValueDispatch('employeeIds', e.target.value, { shouldValidate: true })}
                  required
                />
                {errsDispatch.employeeIds && (
                  <span className="text-xs text-red-500 font-semibold">{errsDispatch.employeeIds.message}</span>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-[#232D42] flex justify-end gap-3 select-none bg-slate-50 dark:bg-[#0B0F19]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDispatchModalOpen(false)}
                className="h-11 px-5 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#111625] hover:bg-slate-50 dark:hover:bg-[#232D42]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={dispatchMutation.isPending}
                className="h-11 px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 shadow-sm"
              >
                {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Requests'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. FINANCE DOCUMENTS WORKSPACE
// ─────────────────────────────────────────────────────────────────────────────
const FinanceDocumentsWorkspace: React.FC = () => {
  const { addToast } = useToast();
  const { openPreview } = useMediaViewer();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch only finance documents
  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['finance-only-documents'],
    queryFn: listFinanceDocuments
  });

  const documentsList = res?.data || [];

  const handlePreview = async (id: string, name: string, size?: string) => {
    try {
      const presignedRes = await getPreSignedURL(id);
      if (!presignedRes.data?.url) {
        throw new Error('Unable to obtain secure pre-signed preview link.');
      }
      const blob = await downloadDMSFile(presignedRes.data.url);
      const url = window.URL.createObjectURL(blob);
      openPreview({
        url,
        fileName: name,
        fileSize: size,
        allowDownload: true
      });
    } catch (err: any) {
      addToast('danger', 'Preview Failed', err.message || 'Unable to preview file.');
    }
  };

  const handleSecureDownload = async (id: string, name: string) => {
    try {
      const presignedRes = await getPreSignedURL(id);
      if (!presignedRes.data?.url) {
        throw new Error('Unable to obtain secure pre-signed download link.');
      }
      const blob = await downloadDMSFile(presignedRes.data.url);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('success', 'Download Complete', 'File downloaded securely.');
    } catch (err: any) {
      addToast('danger', 'Download Failed', err.message || 'Access denied.');
    }
  };

  const filteredDocs = useMemo(() => {
    return documentsList.filter((doc: any) =>
      doc.document_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documentsList, searchQuery]);

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start w-full bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <PageHeader
        title="DMS: Finance Vault"
        subtitle="Audit-ready ledger uploads and tax files. HR and personnel folders are hidden."
      />

      <div className="mt-6">
        <TableWrapper>
          <div className="px-6 py-5 border-b border-slate-200 dark:border-[#232D42] bg-slate-50 dark:bg-[#0B0F19]/50 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
              Finance Archives Ledger
            </h3>
            <div className="w-72">
              <Input
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Magnifer}
                className="text-base"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400">
              Loading Finance vault...
            </div>
          ) : (isError || filteredDocs.length === 0) ? (
            <div className="p-2">
              <EmptyState
                title="No finance documents"
                description={isError ? "Unable to query treasury database. Please verify service connection." : "The Finance vault contains no published records."}
              />
            </div>
          ) : (
            <Table className="min-w-[650px]">
              <TableHead>
                <TableRow>
                  <TableHeaderCell className="text-sm">DOCUMENT NAME</TableHeaderCell>
                  <TableHeaderCell className="text-sm">FOLDER</TableHeaderCell>
                  <TableHeaderCell className="text-sm">UPLOADED DATE</TableHeaderCell>
                  <TableHeaderCell className="text-sm text-center">ACTIONS</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocs.map((doc: any) => (
                  <TableRow key={doc.id}>
                    <TableCell className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                      <div
                        onClick={() => handlePreview(doc.id, doc.document_name, doc.file_size)}
                        className="flex items-center gap-2 cursor-pointer group hover:text-[#FF4F00] transition-colors"
                        title="Click to preview document"
                      >
                        <DocumentTextRounded className="text-slate-400 group-hover:text-[#FF4F00] shrink-0 transition-colors" size={18} />
                        <span className="underline-offset-2 group-hover:underline">{doc.document_name}</span>
                            <DocumentSecurityPanel documentId={doc.id}/>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="purple">{doc.folder_category}</Badge>
                    </TableCell>
                    <TableCell className="text-base text-slate-650">
                      {doc.uploaded_date}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => handlePreview(doc.id, doc.document_name, doc.file_size)}
                          variant="outline"
                          leftIcon={EyeRounded}
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                        >
                          Preview
                        </Button>
                        <Button
                          onClick={() => handleSecureDownload(doc.id, doc.document_name)}
                          variant="outline"
                          leftIcon={DownloadSquareRounded}
                          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-[#232D42] hover:bg-slate-50 dark:bg-[#0B0F19]"
                        >
                          Download
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableWrapper>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. CEO/EXEC COMPLIANCE DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
const ExecComplianceDashboard: React.FC = () => {
  // Fetch compliance metrics for CEO
  const { data: metricsRes, isLoading, isError } = useQuery({
    queryKey: ['exec-compliance-metrics'],
    queryFn: getComplianceMetrics
  });

  const stats = metricsRes?.data || { total_required: 0, total_signed: 0, completion_ratio: 0 };
  const completionPercentage = Math.round(stats.completion_ratio * 100);

  return (
    <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col justify-start w-full bg-[#F8FAFC] dark:bg-[#0B0F19]">
      <PageHeader
        title="DMS: Executive Governance Dashboard"
        subtitle="Macro-level compliance metrics. Individual file structures and low-level directory lists are pruned."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* Metric 1: Signed Ratio */}
        <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              Total Agreements Dispatched
            </span>
            <FolderWithFilesRounded className="text-blue-500" size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-2">
            {isLoading ? '...' : isError ? '0' : stats.total_required} Requests
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Required for ISO-27001 auditor verification</p>
        </Card>

        {/* Metric 2: Completed Signatures */}
        <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              Completed Signatures
            </span>
            <UserCheckRounded className="text-emerald-500" size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-2">
            {isLoading ? '...' : isError ? '0' : stats.total_signed} Sign-offs
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Legally locked cryptographic acknowledgements</p>
        </Card>

        {/* Metric 3: Overall Completion Rate */}
        <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-xs select-none">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider">
              Compliance Completion Rate
            </span>
            <ShieldCheckRounded className="text-orange-500" size={24} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] mt-2">
            {isLoading ? '...' : isError ? '0%' : `${completionPercentage}%`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">Current compliance readiness score</p>
        </Card>
      </div>

      {/* ComplianceRadarChart Component (Premium SVG Radial Ring Chart) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <Card className="p-6 bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-[#232D42] pb-3 select-none">
              <ShieldCheckRounded className="text-[#FF4F00]" size={24} />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider">
                Compliance Integrity Meter
              </h3>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-400">
                Calculating compliance ratios...
              </div>
            ) : isError ? (
              <div className="py-16">
                <EmptyState
                  title="Compliance Metrics Offline"
                  description="Unable to compile macro-level signature statistics. Check network status or gateway logs."
                />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-around py-8 gap-8">
                
                {/* Premium SVG Radial Progress Gauge */}
                <div className="relative w-48 h-48 select-none">
                  <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      className="text-slate-200 dark:text-[#232D42]"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    {/* Animated Progress Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF4F00"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * stats.completion_ratio)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-[#F8FAFC]">{completionPercentage}%</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-[#94A3B8] uppercase mt-0.5">COMPLIANT</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 leading-relaxed text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF4F00] mt-1 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-[#F8FAFC]">Acknowledged Signatures</span>
                      <span className="text-sm text-slate-500 dark:text-[#94A3B8]">{stats.total_signed} active employee profiles validated.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-[#171E2E] mt-1 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-850 dark:text-slate-200">Outstanding Action Items</span>
                      <span className="text-sm text-slate-500 dark:text-[#94A3B8]">{stats.total_required - stats.total_signed} pending employee responses.</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 select-none">
          <Card className="p-6 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-[#232D42] rounded-xl flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-250 dark:border-[#232D42] pb-3">
              <ShieldCheckRounded className="text-[#FF4F00]" size={20} />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F8FAFC] uppercase tracking-wider leading-none">
                Compliance Auditing
              </h3>
            </div>
            <p className="text-sm text-slate-650 dark:text-[#94A3B8] leading-relaxed">
              Company-wide agreements, policies, and contracts are securely cached and indexed. CEO compliance metrics query the Gateway aggregation database live for external audit checks.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
import {DocumentSecurityPanel} from "../../../components/recruiting/DocumentSecurityPanel";
