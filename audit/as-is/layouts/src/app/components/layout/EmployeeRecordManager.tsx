import React, { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import {
  AltArrowLeft,
  PenNewSquare as PenNewSquareRounded,
  RefreshCircle as RefreshCircleRounded,
  UserRounded,
  MapPoint as MapPointRounded,
  PhoneRounded,
  Letter as LetterRounded,
  CloseCircle as CloseCircleRounded,
  CheckCircle as CheckCircleRounded,
  Case as BriefcaseRounded,
  WadOfMoney as WadOfMoneyRounded,
  MonitorSmartphone as MonitorSmartphoneRounded,
  DownloadSquare as DownloadSquareRounded,
  ShieldCheck as ShieldCheckRounded,
  LockKeyhole as LockKeyholeRounded
} from '@solar-icons/react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Button,
  Avatar,
  Badge,
  Input,
  Select,
  Checkbox,
  PageHeader,
  PageTitle,
  Textarea,
  Modal
} from '@/app/components/ui';
import { useUIState } from '../../context/UIStateContext';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployee, updateEmployee, updateEmployeeContract, initiateOffboarding, getEmployees, getNextEmployeeNumber, getEmployeeReportingStructure, addDottedManager, removeDottedManager } from '../../../services/employeeService';
import { getExitLogs } from '../../../services/exitService';
import { getOnboardingFields, listLocations, listDepartments, listJobGrades } from '../../../services/settingsService';
import { listEmployeeDocuments, downloadEmployeeFile } from '../../../services/documentService';
import { Employee } from '../../../types/api.types';
import { useToast } from '../../context/useToast';
import { useAuth } from '../../context/AuthContext';
import { SearchableCombobox } from '@/app/components/ui/SearchableCombobox';
import { NATIONALITY_OPTIONS, getStatesForCountry, getLgasForState, RELATIONSHIP_OPTIONS } from '../../../data/geoLocations';
import { apiClient } from '../../../lib/apiClient';
import { getSupportedBanks } from '../../../services/onboardingService';
import { EmployeeCompensationTab } from './EmployeeCompensationTab';

interface EmployeeDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  status: 'ACTIVE' | 'NOTICE PERIOD' | 'ALUMNI' | 'EXITED' | 'ON LEAVE' | 'SUSPENDED' | 'PROBATION' | 'PENDING' | 'PENDING_ACTIVATION' | 'OFFBOARDING';
  email: string;
  phone: string;
  location: string;
  managerName: string;
  managerRole: string;
  avatarSrc?: string;
  
  // Personal Info
  personalEmail: string;
  dob: string;
  gender: string;
  address: string;
  
  // Employment
  joiningDate: string;
  employmentType: string;
  jobGrade: string;
  
  // Compensation
  baseSalary: string;
  currency: string;
  payFrequency: string;
  benefitsPackage: string;
  
  // IT Assets
  hardware: string[];
  accessLevel: string;
  saasWorkspaces: string[];
}

interface OnboardingField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'tel' | 'file' | 'checkbox';
  visible: boolean;
  required: boolean;
  category: string;
  options?: { value: string; label: string }[];
  isMedical?: boolean;
  placeholder?: string;
}

const CATEGORIES = [
  { id: '1_identity', name: 'Core Identity & Demographics' },
  { id: '2_contact', name: 'Contact & Location' },
  { id: '3_emergency', name: 'Emergency & Next of Kin' },
  { id: '4_statutory', name: 'Statutory, Compliance & Identity' },
  { id: '5_financial', name: 'Financial, Payroll & Benefits' },
  { id: '6_organizational', name: 'Organizational & Role Mapping' },
  { id: '7_academic', name: 'Academic & Professional Qualifications' },
  { id: '8_background', name: 'Background, Experience & Guarantors' },
  { id: '9_medical', name: 'Medical & HMO' },
  { id: '10_it', name: 'IT Assets & Workspace Provisioning' },
  { id: '11_culture', name: 'Culture, DEI & Company Swag' },
  { id: '12_legal', name: 'Legal & E-Signatures' }
];

const DEFAULT_FIELDS: OnboardingField[] = [
  { id: 'firstName', label: 'First Name', type: 'text', visible: true, required: true, category: '1_identity', placeholder: 'e.g., Jane' },
  { id: 'middleName', label: 'Middle Name', type: 'text', visible: true, required: false, category: '1_identity', placeholder: 'e.g., Marie' },
  { id: 'lastName', label: 'Last Name', type: 'text', visible: true, required: true, category: '1_identity', placeholder: 'e.g., Doe' },
  { id: 'preferredName', label: 'Preferred Name / Alias', type: 'text', visible: true, required: false, category: '1_identity', placeholder: 'e.g., Jay' },
  { id: 'dob', label: 'Date of Birth', type: 'date', visible: true, required: true, category: '1_identity' },
  { id: 'gender', label: 'Gender', type: 'select', visible: true, required: true, category: '1_identity', options: [
    { value: 'Female', label: 'Female' },
    { value: 'Male', label: 'Male' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ]},
  { id: 'pronouns', label: 'Preferred Pronouns', type: 'text', visible: true, required: false, category: '1_identity', placeholder: 'e.g., she/her' },
  { id: 'maritalStatus', label: 'Marital Status', type: 'select', visible: true, required: false, category: '1_identity', options: [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' }
  ]},
  { id: 'nationality', label: 'Nationality', type: 'select', visible: true, required: true, category: '1_identity', placeholder: 'Select Nationality', options: NATIONALITY_OPTIONS },
  { id: 'stateOfOrigin', label: 'State of Origin', type: 'select', visible: true, required: false, category: '1_identity', placeholder: 'Select State of Origin', options: getStatesForCountry('Nigeria') },
  { id: 'lga', label: 'Local Government Area (LGA)', type: 'select', visible: true, required: false, category: '1_identity', placeholder: 'Select Local Government Area', options: getLgasForState('Nigeria', 'Lagos') },
  { id: 'hometown', label: 'Hometown / Village', type: 'text', visible: true, required: false, category: '1_identity', placeholder: 'e.g., Badagry' },
  { id: 'bloodGroup', label: 'Blood Group', type: 'select', visible: true, required: false, category: '1_identity', isMedical: true, options: [
    { value: 'A+', label: 'A+' }, { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' }, { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' }, { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' }, { value: 'AB-', label: 'AB-' }
  ]},
  { id: 'genotype', label: 'Genotype', type: 'select', visible: true, required: false, category: '1_identity', isMedical: true, options: [
    { value: 'AA', label: 'AA' },
    { value: 'AS', label: 'AS' },
    { value: 'AC', label: 'AC' },
    { value: 'SS', label: 'SS' },
    { value: 'SC', label: 'SC' }
  ]},
  { id: 'profilePicture', label: 'Profile Picture / Passport Photograph', type: 'file', visible: true, required: false, category: '1_identity' },

  { id: 'workEmail', label: 'Work Email Address', type: 'email', visible: true, required: true, category: '2_contact', placeholder: 'e.g., jane.doe@company.com' },
  { id: 'personalEmail', label: 'Personal Email Address (Alternative)', type: 'email', visible: true, required: false, category: '2_contact', placeholder: 'e.g., jane.doe@example.com' },
  { id: 'primaryPhone', label: 'Primary Mobile Number', type: 'tel', visible: true, required: true, category: '2_contact', placeholder: 'e.g., +234 800 000 0000' },
  { id: 'alternatePhone', label: 'Secondary / Alternative Mobile Number', type: 'tel', visible: true, required: false, category: '2_contact', placeholder: 'e.g., +234 801 111 1111' },
  { id: 'currentAddress', label: 'Current Residential Address (Street, City, State, ZIP)', type: 'textarea', visible: true, required: true, category: '2_contact', placeholder: 'Enter complete street address...' },
  { id: 'permanentAddress', label: 'Permanent Home Address (If different)', type: 'textarea', visible: true, required: false, category: '2_contact', placeholder: 'Enter permanent home address...' },
  { id: 'proofOfAddress', label: 'Proof of Address Document (Utility bill/tenancy agreement)', type: 'file', visible: true, required: false, category: '2_contact' },

  { id: 'nokName', label: 'Next of Kin Full Name', type: 'text', visible: true, required: true, category: '3_emergency', placeholder: 'e.g., John Doe' },
  { id: 'nokRelation', label: 'Next of Kin Relationship', type: 'select', visible: true, required: true, category: '3_emergency', placeholder: 'Select or type relationship', options: RELATIONSHIP_OPTIONS },
  { id: 'nokPhone', label: 'Next of Kin Phone Number', type: 'tel', visible: true, required: true, category: '3_emergency', placeholder: 'e.g., +234 800 000 0000' },
  { id: 'nokEmail', label: 'Next of Kin Email Address', type: 'email', visible: true, required: false, category: '3_emergency', placeholder: 'e.g., john.doe@example.com' },
  { id: 'nokAddress', label: 'Next of Kin Residential Address', type: 'textarea', visible: true, required: true, category: '3_emergency' },
  { id: 'emergency1Name', label: 'Primary Emergency Contact Name', type: 'text', visible: true, required: false, category: '3_emergency', placeholder: 'Leave blank if same as Next of Kin' },
  { id: 'emergency1Relation', label: 'Primary Emergency Contact Relationship', type: 'select', visible: true, required: false, category: '3_emergency', placeholder: 'Leave blank if same as Next of Kin', options: RELATIONSHIP_OPTIONS },
  { id: 'emergency1Phone', label: 'Primary Emergency Contact Phone', type: 'tel', visible: true, required: false, category: '3_emergency', placeholder: 'Leave blank if same as Next of Kin' },
  { id: 'emergency2Name', label: 'Secondary Emergency Contact Name', type: 'text', visible: true, required: false, category: '3_emergency' },
  { id: 'emergency2Relation', label: 'Secondary Emergency Contact Relationship', type: 'select', visible: true, required: false, category: '3_emergency', placeholder: 'Select or type relationship', options: RELATIONSHIP_OPTIONS },
  { id: 'emergency2Phone', label: 'Secondary Emergency Contact Phone', type: 'tel', visible: true, required: false, category: '3_emergency' },

  { id: 'nin', label: 'National Identity Number (NIN / SSN)', type: 'text', visible: true, required: false, category: '4_statutory', placeholder: 'Enter National ID number' },
  { id: 'tin', label: 'Tax Identification Number (TIN)', type: 'text', visible: true, required: false, category: '4_statutory', placeholder: 'Enter Tax identification number' },
  { id: 'bvn', label: 'Bank Verification Number (BVN)', type: 'text', visible: true, required: false, category: '4_statutory', placeholder: 'Enter BVN' },
  { id: 'passportNumber', label: 'International Passport Number', type: 'text', visible: true, required: false, category: '4_statutory', placeholder: 'Enter Passport number' },
  { id: 'passportExpiry', label: 'Passport Expiry Date', type: 'date', visible: true, required: false, category: '4_statutory' },
  { id: 'driversLicense', label: 'Driver’s License Number', type: 'text', visible: true, required: false, category: '4_statutory' },
  { id: 'driversLicenseExpiry', label: 'Driver’s License Expiry Date', type: 'date', visible: true, required: false, category: '4_statutory' },
  { id: 'visaStatus', label: 'Work Permit / Visa Status', type: 'select', visible: true, required: false, category: '4_statutory', options: [
    { value: 'Citizen', label: 'Citizen / Passport Holder' },
    { value: 'Permanent Resident', label: 'Permanent Resident' },
    { value: 'Work Permit', label: 'Work Permit / Business Visa' },
    { value: 'Visa Free', label: 'Visa Free / Entry Status' }
  ]},
  { id: 'visaIssueDate', label: 'Visa Issue Date', type: 'date', visible: true, required: false, category: '4_statutory' },
  { id: 'visaExpiryDate', label: 'Visa Expiry Date', type: 'date', visible: true, required: false, category: '4_statutory' },
  { id: 'identityUpload', label: 'Identity Documents Upload (National ID/Passport/Work Permit)', type: 'file', visible: true, required: false, category: '4_statutory' },

  { id: 'bankName', label: 'Bank Name', type: 'select', visible: true, required: true, category: '5_financial', placeholder: 'Select or search bank...' },
  { id: 'bankAccountName', label: 'Bank Account Name', type: 'text', visible: true, required: true, category: '5_financial', placeholder: 'Must match employee name exactly' },
  { id: 'bankAccountNumber', label: 'Bank Account Number', type: 'text', visible: true, required: true, category: '5_financial', placeholder: 'Enter 10-digit NUBAN' },
  { id: 'bankSortCode', label: 'Bank Sort Code / Routing Number / SWIFT', type: 'text', visible: true, required: false, category: '5_financial' },
  { id: 'pfaName', label: 'Pension Fund Administrator (PFA) Name', type: 'text', visible: true, required: false, category: '5_financial' },
  { id: 'rsaNumber', label: 'Retirement Savings Account (RSA) Number / Pension PIN', type: 'text', visible: true, required: false, category: '5_financial' },
  { id: 'nhfNumber', label: 'National Housing Fund (NHF) Number', type: 'text', visible: true, required: false, category: '5_financial' },
  { id: 'voluntaryDeductions', label: 'Voluntary Deductions / Contributions (Cooperative, etc.)', type: 'textarea', visible: true, required: false, category: '5_financial' },

  { id: 'employeeId', label: 'Employee ID / Clock-in Number', type: 'text', visible: true, required: true, category: '6_organizational', placeholder: 'Auto-assigned or custom ID (e.g., NV-0001)' },
  { id: 'dateOfHire', label: 'Official Date of Hire / Resumption Date', type: 'date', visible: true, required: true, category: '6_organizational' },
  { id: 'employmentType', label: 'Employment Type', type: 'select', visible: true, required: true, category: '6_organizational', options: [
    { value: 'Full-time Permanent', label: 'Full-time Permanent' },
    { value: 'Full-time Temporary', label: 'Full-time Temporary' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Intern', label: 'Intern' },
    { value: 'Freelance', label: 'Freelance' }
  ]},
  { id: 'department', label: 'Department / Division', type: 'select', visible: true, required: false, category: '6_organizational', placeholder: 'Select department / division', options: [] },
  { id: 'jobTitle', label: 'Designation / Job Title', type: 'text', visible: true, required: true, category: '6_organizational', placeholder: 'e.g., Senior Designer' },
  { id: 'jobGrade', label: 'Job Grade / Level', type: 'select', visible: true, required: true, category: '6_organizational', options: [
    { value: 'Grade 5 - Senior Marketing Specialist', label: 'Grade 5 - Senior Marketing' },
    { value: 'Grade 7 - Head of Recruiting', label: 'Grade 7 - Head of Recruiting' },
    { value: 'Grade 8 - Principal Architect', label: 'Grade 8 - Principal Architect' },
    { value: 'Grade 9 - VP of Product', label: 'Grade 9 - VP of Product' },
    { value: 'Grade 10 - CFO', label: 'Grade 10 - CFO' },
    { value: 'Grade 9 - Senior Director', label: 'Grade 9 - Senior Director' }
  ]},
  { id: 'manager', label: 'Direct Line Manager / Supervisor', type: 'select', visible: true, required: false, category: '6_organizational', placeholder: 'Select line manager or leave blank if Head of Org', options: [] },
  { id: 'workLocation', label: 'Work Location / Branch / Remote Status', type: 'select', visible: true, required: true, category: '6_organizational', options: [] },
  { id: 'shiftAssignment', label: 'Assigned Work Shift', type: 'select', visible: true, required: false, category: '6_organizational', placeholder: 'Select assigned work shift or leave blank for default', options: [
    { value: '', label: 'None (Use Location / Company Default Hours)' },
    { value: '09:00 - 17:00', label: 'Standard Shift (09:00 - 17:00)' },
    { value: '08:00 - 17:00', label: 'Operational Shift (08:00 - 17:00)' },
  ] },

  { id: 'highestQualification', label: 'Highest Educational Qualification', type: 'select', visible: true, required: false, category: '7_academic', options: [
    { value: 'SSCE', label: 'SSCE / High School' },
    { value: 'Diploma', label: 'OND / HND Diploma' },
    { value: 'BSc', label: 'Bachelor\'s Degree (BSc/BEng)' },
    { value: 'MSc', label: 'Master\'s Degree (MSc/MA)' },
    { value: 'PhD', label: 'Doctorate (PhD)' }
  ]},
  { id: 'institution', label: 'Institution Attended', type: 'text', visible: true, required: false, category: '7_academic', placeholder: 'e.g., University of Lagos' },
  { id: 'courseOfStudy', label: 'Course of Study / Major', type: 'text', visible: true, required: false, category: '7_academic', placeholder: 'e.g., Computer Science' },
  { id: 'graduationYear', label: 'Year of Graduation', type: 'number', visible: true, required: false, category: '7_academic', placeholder: 'e.g., 2022' },
  { id: 'professionalCertifications', label: 'Professional Certifications', type: 'text', visible: true, required: false, category: '7_academic', placeholder: 'e.g., PMP, ACCA' },
  { id: 'certificationsExpiry', label: 'Certification License Numbers & Expiry Dates', type: 'text', visible: true, required: false, category: '7_academic', placeholder: 'e.g., ACCA-123456 Exp: 2028' },
  { id: 'academicUpload', label: 'Upload Qualifications (Degree Certificates / Transcripts / Licenses)', type: 'file', visible: true, required: false, category: '7_academic' },

  { id: 'lastEmployer', label: 'Last Employer Name', type: 'text', visible: true, required: false, category: '8_background' },
  { id: 'lastJobTitle', label: 'Last Job Title / Designation', type: 'text', visible: true, required: false, category: '8_background' },
  { id: 'lastEmploymentDuration', label: 'Duration of Last Employment (Start & End Dates)', type: 'text', visible: true, required: false, category: '8_background', placeholder: 'e.g., Jan 2023 - Mar 2026' },
  { id: 'leavingReason', label: 'Reason for Leaving Last Employment', type: 'textarea', visible: true, required: false, category: '8_background' },
  { id: 'references', label: 'Professional References Details (Name, Company, Phone, Email)', type: 'textarea', visible: true, required: false, category: '8_background' },
  { id: 'guarantor1Details', label: 'Guarantor 1 Details (Full Name, Occupation, Employer, Phone, Email, Address)', type: 'textarea', visible: true, required: false, category: '8_background' },
  { id: 'guarantor2Details', label: 'Guarantor 2 Details (Full Name, Occupation, Employer, Phone, Email, Address)', type: 'textarea', visible: true, required: false, category: '8_background' },
  { id: 'guarantorUploads', label: 'Guarantor Uploads (Signed forms, ID card scans, Passport photos)', type: 'file', visible: true, required: false, category: '8_background' },
  { id: 'backgroundConsent', label: 'Consent for Background / Criminal Record Check', type: 'checkbox', visible: true, required: true, category: '8_background' },

  { id: 'physicianDetails', label: 'Primary Physician Name & Contact', type: 'text', visible: true, required: false, category: '9_medical' },
  { id: 'preExistingConditions', label: 'Pre-existing Medical Conditions (Voluntary disclosure)', type: 'textarea', visible: true, required: false, category: '9_medical', isMedical: true },
  { id: 'knownAllergies', label: 'Known Allergies', type: 'textarea', visible: true, required: false, category: '9_medical', isMedical: true },
  { id: 'hmoPlan', label: 'Preferred HMO Plan / Tier (Based on company offerings)', type: 'select', visible: true, required: false, category: '9_medical', options: [
    { value: 'Bronze', label: 'Bronze Plan (Basic)' },
    { value: 'Silver', label: 'Silver Plan (Standard)' },
    { value: 'Gold', label: 'Gold Plan (Executive)' },
    { value: 'Platinum', label: 'Platinum Plan (Director)' }
  ]},
  { id: 'hmoEnrolleeId', label: 'Existing HMO Provider & Enrollee ID (If transferring)', type: 'text', visible: true, required: false, category: '9_medical' },
  { id: 'hmoDependents', label: 'Dependents for HMO (Names, DOBs, Relationships & Photos)', type: 'textarea', visible: true, required: false, category: '9_medical', isMedical: true },

  { id: 'preferredOs', label: 'Preferred OS / Device Type', type: 'select', visible: true, required: false, category: '10_it', options: [
    { value: 'Mac', label: 'Apple macOS (MacBook Pro)' },
    { value: 'Windows', label: 'Microsoft Windows (ThinkPad)' },
    { value: 'Linux', label: 'Linux OS (Ubuntu Developer Setup)' }
  ]},
  { id: 'softwareLicenses', label: 'Required Software Licenses (Figma, Adobe, specific IDEs)', type: 'textarea', visible: true, required: false, category: '10_it', placeholder: 'e.g., Slack, GitHub, Figma, IntelliJ' },
  { id: 'mobileAllocation', label: 'Mobile Device Allocation (Requires company phone)', type: 'select', visible: true, required: false, category: '10_it', options: [
    { value: 'Yes', label: 'Yes, Company phone required' },
    { value: 'No', label: 'No, BYOD (Bring Your Own Device)' }
  ]},
  { id: 'ergonomicNeeds', label: 'Special Workspace Ergonomic Needs', type: 'textarea', visible: true, required: false, category: '10_it', placeholder: 'e.g., Standing desk, vertical mouse, 27" monitor' },
  { id: 'itAssetIds', label: 'Provisioned Hardware / IT Assets', type: 'select', visible: true, required: false, category: '10_it', options: [] },

  { id: 'swagSize', label: 'T-Shirt / Hoodie Size', type: 'select', visible: true, required: false, category: '11_culture', options: [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
    { value: 'XXL', label: 'Double Extra Large' },
    { value: 'XXXL', label: 'Triple Extra Large' }
  ]},
  { id: 'shoeSize', label: 'Shoe Size (If applicable for safety/uniforms)', type: 'number', visible: true, required: false, category: '11_culture' },
  { id: 'dietaryPreferences', label: 'Dietary Restrictions / Preferences (Vegan, Halal, Allergies)', type: 'textarea', visible: true, required: false, category: '11_culture', placeholder: 'e.g., Vegan, No peanuts, Halal' },
  { id: 'hobbies', label: 'Hobbies / Interests', type: 'textarea', visible: true, required: false, category: '11_culture', placeholder: 'For newsletters or intro chats' },
  { id: 'introductoryBio', label: 'Introductory Bio (Intro paragraph for team channel)', type: 'textarea', visible: true, required: false, category: '11_culture', placeholder: 'Tell us a fun fact or details about your journey...' },

  { id: 'offerLetterUpload', label: 'Signed Offer Letter Upload', type: 'file', visible: true, required: true, category: '12_legal' },
  { id: 'ndaSignature', label: 'Non-Disclosure Agreement (NDA) Acknowledgement', type: 'checkbox', visible: true, required: true, category: '12_legal' },
  { id: 'handbookAck', label: 'Employee Handbook Acknowledgment', type: 'checkbox', visible: true, required: true, category: '12_legal' },
  { id: 'itPolicyAck', label: 'IT & Data Acceptable Use Policy Acknowledgment', type: 'checkbox', visible: true, required: true, category: '12_legal' },
  { id: 'codeOfConductAck', label: 'Code of Conduct Agreement Acknowledgment', type: 'checkbox', visible: true, required: true, category: '12_legal' }
];

const mapFieldIdToProperty = (fieldId: string): string => {
  const mapping: Record<string, string> = {
    firstName: 'firstName',
    lastName: 'lastName',
    dob: 'dob',
    gender: 'gender',
    personalEmail: 'personalEmail',
    primaryPhone: 'phone',
    currentAddress: 'residentialAddress',
    nokName: 'emergencyName',
    nokRelation: 'emergencyRelation',
    nokPhone: 'emergencyPhone',
    nokEmail: 'nokEmail',
    nokAddress: 'nokAddress',
    emergency1Name: 'emergencyName',
    emergency1Relation: 'emergencyRelation',
    emergency1Phone: 'emergencyPhone',
    bankName: 'bankName',
    bankAccountName: 'accountHolderName',
    bankAccountNumber: 'accountNumber',
    employeeId: 'employeeNumber',
    dateOfHire: 'startDate',
    employmentType: 'employmentType',
    department: 'department',
    jobTitle: 'jobTitle',
    jobGrade: 'level',
    manager: 'reportingManagerName',
    workLocation: 'officeLocation',
    knownAllergies: 'allergies',
    bloodGroup: 'bloodGroup',
    genotype: 'genotype',
  };
  return mapping[fieldId] || fieldId;
};

const firstClassFieldKeys = [
  'firstName', 'lastName', 'phone', 'residentialAddress', 'gender', 'dob',
  'bloodGroup', 'genotype', 'allergies', 'emergencyName', 'emergencyPhone', 'emergencyRelation',
  'bankName', 'bankCode', 'accountNumber', 'accountHolderName',
  'personalEmail', 'nationality', 'stateOfOrigin', 'lga'
];

export const EmployeeRecordManager: React.FC = () => {
	const { user } = useAuth();
	const { activeRole } = useUIState();
	const cache = useQueryClient();
	const scope = JSON.stringify([user?.tenantId || '', user?.id || '', activeRole || user?.role || '']);
	useLayoutEffect(() => {
		const sensitive = new Set(['employee', 'employeePermissions', 'employeeDeductions', 'payrollSettings', 'tenantDeductionTypes']);
		const predicate = (query: { queryKey: readonly unknown[] }) => sensitive.has(String(query.queryKey[0])) && query.queryKey.at(-1) !== scope;
		void cache.cancelQueries({ predicate });
		cache.removeQueries({ predicate });
	}, [cache, scope]);
	// A new identity/role must not retain form, breakdown, modal or tab state,
	// even for the exact same employee and while the new request is pending.
	if (!user) return null;
	return <EmployeeRecordSession key={scope} identityScope={scope} />;
};

const EmployeeRecordSession: React.FC<{ identityScope: string }> = ({ identityScope }) => {
  const navigate = useNavigate();
  const { selectedEmployeeId, setSelectedEmployeeId, employeeViewMode, setEmployeeViewMode, activeRole } = useUIState();
  const { user, refreshUser } = useAuth();
  const routeLocation = useLocation();
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('employeeId');
  const storedSessionId = typeof window !== 'undefined' ? sessionStorage.getItem('nvuto_selected_employee_id') : null;
  // Route params/query params are authoritative. The context/session fallback is
  // retained only for the legacy /employees/detail route; otherwise a remembered
  // employee must never keep the detail page alive after the URL leaves it.
  const isLegacyDetailRoute = routeLocation.pathname === '/hr/employees/detail' || routeLocation.pathname === '/employees/detail';
  const activeId = routeId || queryId || (isLegacyDetailRoute ? (selectedEmployeeId || storedSessionId || '') : '');

  const handleReturnToEmployeeRecords = useCallback(() => {
    // The detail page can recover its employee ID from four different sources.
    // Clear every non-route source before navigating so the old record cannot
    // remain mounted after the URL has changed back to the records page.
    // Commit the context/session cleanup before changing routes. Without this,
    // the detail component can render once more with its remembered employee ID
    // and remain visible even though the address bar already says /hr/people.
    flushSync(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nvuto_selected_employee_id');
      }
      setSelectedEmployeeId(null);
      setEmployeeViewMode('view');
    });
    // This transition deliberately crosses a route boundary with a document-level
    // replace. React Router was updating the address bar while the mounted detail
    // tree remained on screen; replacing the document guarantees that the records
    // route is rendered and prevents Back from reopening the stale detail view.
    window.location.replace('/hr/people');
  }, [setEmployeeViewMode, setSelectedEmployeeId]);

  const [activeTab, setActiveTab] = useState('PERSONAL INFO');
  const { addToast } = useToast();

  // Keep selectedEmployeeId in sync across components/session
  useEffect(() => {
    if (activeId && activeId !== selectedEmployeeId) {
      setSelectedEmployeeId(activeId);
    }
  }, [activeId, selectedEmployeeId, setSelectedEmployeeId]);

  const isHrAdmin = useMemo(() => {
    const role = (activeRole || user?.role || '').toLowerCase().replace(/\s+/g, '_');
    return ['hr_admin', 'hr', 'admin', 'owner', 'super_admin'].includes(role);
  }, [activeRole, user?.role]);

  // Main edit mode state
  const [isEditMode, setIsEditMode] = useState(employeeViewMode === 'edit');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(employeeViewMode === 'status');
  const [isDownloading, setIsDownloading] = useState(false);

  const initialEmp = { id: activeId, name: '' };

  const queryClient = useQueryClient();
  const { data: employeeDataRes, isLoading, error } = useQuery({
    queryKey: ['employee', activeId, identityScope],
    queryFn: () => getEmployee(activeId),
    enabled: !!activeId,
  });
  const employee = employeeDataRes?.data;
  const isRootTarget = !!(employee?.is_tenant_root || employee?.super_admin);

  // If the record fails to load (e.g. 404 or record not found), clean up stale session state
  useEffect(() => {
    if (error || (!isLoading && activeId && !employee)) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nvuto_selected_employee_id');
      }
      if (selectedEmployeeId === activeId) {
        setSelectedEmployeeId(null);
      }
    }
  }, [error, isLoading, activeId, employee, selectedEmployeeId, setSelectedEmployeeId]);

  // Fetch locations dynamically from backend settings
  const { data: locationsRes } = useQuery({
    queryKey: ['locations'],
    queryFn: listLocations
  });

  // Fetch departments dynamically from backend settings
  const { data: departmentsRes } = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartments
  });

  // Fetch job grades dynamically from backend settings
  const { data: jobGradesRes } = useQuery({
    queryKey: ['jobGrades'],
    queryFn: listJobGrades
  });

  // Fetch supported banks for reliable bank code resolution
  const { data: banksRes } = useQuery({
    queryKey: ['supportedBanks'],
    queryFn: getSupportedBanks,
    staleTime: 1000 * 60 * 30
  });

  // Fetch active employees dynamically for manager list selection.
  // getEmployees() is paginated (backend defaults to 20/page, 100 max) - a
  // plain unparameterized call silently truncates the roster to whichever
  // 20 were most recently created, which for any tenant past 20 active
  // employees quietly drops earlier hires (frequently including the
  // tenant's own founding admin) from the reporting-manager picker. Page
  // through the full result set instead so every active employee is a
  // selectable manager, not just the newest 20.
  const { data: employeesRes } = useQuery({
    queryKey: ['employeesList'],
    queryFn: async () => {
      const first = await getEmployees({ status: 'ACTIVE', page: 1, limit: 100 });
      const totalPages = (first as any)?.meta?.total_pages || 1;
      let allEmployees = first.data || [];
      for (let page = 2; page <= totalPages; page++) {
        const next = await getEmployees({ status: 'ACTIVE', page, limit: 100 });
        allEmployees = allEmployees.concat(next.data || []);
      }
      return { ...first, data: allEmployees };
    }
  });

  // Query active exit records to detect if this employee already has an active offboarding transition
  const { data: exitLogsRes } = useQuery({
    queryKey: ['employeeExitRecord', activeId],
    queryFn: () => getExitLogs(),
    enabled: !!activeId
  });

  const activeExitRecord = useMemo(() => {
    if (!exitLogsRes?.data || !activeId) return null;
    return exitLogsRes.data.find((e: any) =>
      e.employee_id === activeId &&
      !['completed', 'cancelled', 'rejected', 'finalized'].includes(String(e.status || '').toLowerCase())
    );
  }, [exitLogsRes, activeId]);

  // Access & Permissions States
  const [hasFinanceRole, setHasFinanceRole] = useState(false);
  const [hasCeoRole, setHasCeoRole] = useState(false);
  const [isJustificationModalOpen, setIsJustificationModalOpen] = useState(false);
  const [justificationRole, setJustificationRole] = useState<'finance_admin' | 'global_executive' | null>(null);
  const [justificationAction, setJustificationAction] = useState<'grant' | 'revoke'>('grant');
  const [roleJustificationNote, setRoleJustificationNote] = useState('');

  const { data: permissionTuplesRes, refetch: refetchPermissions } = useQuery({
    queryKey: ['employeePermissions', activeId, identityScope],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>(`/permissions/tuples?employee_id=${activeId}`, {
          headers: {
            'X-Tenant-ID': user?.tenantId || ''
          }
        });
        return res;
      } catch (err) {
        return { roles: [] };
      }
    },
    enabled: !!activeId
  });

  const activeRoles = useMemo(() => {
    return permissionTuplesRes?.roles || [];
  }, [permissionTuplesRes]);

  useEffect(() => {
    setHasFinanceRole(activeRoles.includes('finance_admin'));
    setHasCeoRole(activeRoles.includes('global_executive'));
  }, [activeRoles]);

  const grantRoleMutation = useMutation({
    mutationFn: async (payload: { roleKey: string; action: string; justification: string }) => {
      try {
        const res = await apiClient.post<any>('/permissions/grants', {
          target_employee_id: employee?.id || activeId,
          role_key: payload.roleKey,
          action: payload.action,
          justification_note: payload.justification
        }, {
          headers: {
            'X-Tenant-ID': user?.tenantId || ''
          }
        });
        return res;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to update capability grant');
      }
    },
    onSuccess: () => {
      refetchPermissions();
      addToast('success', 'Permissions Updated', 'Employee capability grant updated and synchronized successfully.');
      setIsJustificationModalOpen(false);
      setRoleJustificationNote('');
    },
    onError: (err: any) => {
      addToast('critical', 'Update Failed', err.message || 'An error occurred.');
      setIsJustificationModalOpen(false);
      setRoleJustificationNote('');
    }
  });

  // Local editable fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<EmployeeDetail['status']>('ACTIVE');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [managerId, setManagerId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerRole, setManagerRole] = useState('');
  const [allergies, setAllergies] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  // Personal Info
  const [personalEmail, setPersonalEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  const [nationality, setNationality] = useState('');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [lga, setLga] = useState('');

  // Employment
  const [joiningDate, setJoiningDate] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time Permanent');
  const [jobGrade, setJobGrade] = useState('');

  // Compensation
  const [baseSalary, setBaseSalary] = useState('0');
  const [currency, setCurrency] = useState('NGN');
  const [payFrequency, setPayFrequency] = useState('Monthly');
  const [benefitsPackage, setBenefitsPackage] = useState('');

  // IT Assets
  const [hardwareString, setHardwareString] = useState('');
  const [accessLevel, setAccessLevel] = useState('Employee');
  const [saasWorkspaces, setSaasWorkspaces] = useState<string[]>([]);

  // Additional dynamic/onboarding fields state
  const [preferencesObj, setPreferencesObj] = useState<Record<string, any>>({});
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [compensationBreakdown, setCompensationBreakdown] = useState<any>(null);
  const [bloodGroup, setBloodGroup] = useState('');
  const [genotype, setGenotype] = useState('');

  const getStandardValue = (fieldId: string) => {
    switch (fieldId) {
      case 'firstName': return firstName;
      case 'lastName': return lastName;
      case 'dob': return dob;
      case 'gender': return gender;
      case 'personalEmail': return personalEmail;
      case 'nationality': return nationality;
      case 'stateOfOrigin': return stateOfOrigin;
      case 'lga': return lga;
      case 'primaryPhone': return phone;
      case 'currentAddress': return address;
      case 'nokName': return emergencyName;
      case 'nokPhone': return emergencyPhone;
      case 'nokRelation': return emergencyRelation;
      case 'emergency1Name': return emergencyName;
      case 'emergency1Phone': return emergencyPhone;
      case 'emergency1Relation': return emergencyRelation;
      case 'bankName': return bankName;
      case 'bankCode': return bankCode;
      case 'bankAccountName': return bankAccountName;
      case 'bankAccountNumber': return bankAccountNumber;
      case 'employeeId': return employeeNumber || employee?.employeeNumber || activeId;
      case 'dateOfHire': return joiningDate;
      case 'employmentType': return employmentType;
      case 'department': return department;
      case 'jobTitle': return role;
      case 'jobGrade': return jobGrade;
      case 'manager': return managerId;
      case 'workLocation': return location;
      case 'baseSalary': return baseSalary;
      case 'currency': return currency;
      case 'payFrequency': return payFrequency;
      case 'effectiveDate': return effectiveDate;
      case 'benefitsPackage': return benefitsPackage;
      case 'bloodGroup': return bloodGroup;
      case 'genotype': return genotype;
      case 'allergies':
      case 'knownAllergies': return allergies;
      default: return undefined;
    }
  };

  const setStandardValue = (fieldId: string, val: string) => {
    switch (fieldId) {
      case 'firstName': setFirstName(val); break;
      case 'lastName': setLastName(val); break;
      case 'dob': setDob(val); break;
      case 'gender': setGender(val); break;
      case 'personalEmail': setPersonalEmail(val); break;
      case 'nationality': setNationality(val); break;
      case 'stateOfOrigin': setStateOfOrigin(val); break;
      case 'lga': setLga(val); break;
      case 'primaryPhone': setPhone(val); break;
      case 'currentAddress': setAddress(val); break;
      case 'nokName': setEmergencyName(val); break;
      case 'nokPhone': setEmergencyPhone(val); break;
      case 'nokRelation': setEmergencyRelation(val); break;
      case 'emergency1Name': setEmergencyName(val); break;
      case 'emergency1Phone': setEmergencyPhone(val); break;
      case 'emergency1Relation': setEmergencyRelation(val); break;
      case 'bankName': setBankName(val); break;
      case 'bankCode': setBankCode(val); break;
      case 'bankAccountName': setBankAccountName(val); break;
      case 'bankAccountNumber': setBankAccountNumber(val); break;
      case 'employeeId': setEmployeeNumber(val); break;
      case 'dateOfHire': setJoiningDate(val); break;
      case 'employmentType': setEmploymentType(val); break;
      case 'department': setDepartment(val); break;
      case 'jobTitle': setRole(val); break;
      case 'jobGrade': setJobGrade(val); break;
      case 'manager': {
        setManagerId(val);
        const selected = employeesRes?.data?.find((e: any) => e.id === val);
        if (selected) {
          setManagerName(`${selected.firstName} ${selected.lastName}`);
          setManagerRole(selected.jobTitle || '');
        } else {
          setManagerName('');
          setManagerRole('');
        }
        break;
      }
      case 'workLocation': setLocation(val); break;
      case 'baseSalary': setBaseSalary(val); break;
      case 'currency': setCurrency(val); break;
      case 'payFrequency': setPayFrequency(val); break;
      case 'effectiveDate': setEffectiveDate(val); break;
      case 'benefitsPackage': setBenefitsPackage(val); break;
      case 'bloodGroup': setBloodGroup(val); break;
      case 'genotype': setGenotype(val); break;
      case 'allergies':
      case 'knownAllergies': setAllergies(val); break;
    }
  };

  // Load onboarding fields config
  const { data: onboardingFieldsResponse } = useQuery({
    queryKey: ['onboardingFields'],
    queryFn: getOnboardingFields,
  });
  const dbFields = onboardingFieldsResponse?.data || [];

  const renderTabFields = (categoryIds: string[]) => {
    const fields = DEFAULT_FIELDS.map(df => {
      const saved = dbFields.find((f: any) => f.field_id === df.id);
      return saved ? { ...df, visible: saved.is_visible, required: saved.is_required } : df;
    }).filter(f => categoryIds.includes(f.category) && f.visible);

    if (fields.length === 0) {
      return (
        <div className="p-8 text-center text-slate-400 italic select-none">
          No visible fields configured in this section.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {categoryIds.map(catId => {
          const catFields = fields.filter(f => f.category === catId);
          if (catFields.length === 0) return null;
          const catName = CATEGORIES.find(c => c.id === catId)?.name || 'Information';

          return (
            <div key={catId} className="flex flex-col gap-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#232D42] select-none">
                <UserRounded className="w-5 h-5 text-[#FF4F00]" />
                <h3 className="nvuto-h3 uppercase">
                  {catName}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {catFields.map(f => {
                  // Determine read-only vs editable status for HR Admin
                  const isEmployeeId = f.id === 'employeeId';
                  const isCheckbox = f.type === 'checkbox';
                  const isFile = f.type === 'file';

                  // Value resolving
                  const isStandard = firstClassFieldKeys.includes(mapFieldIdToProperty(f.id)) ||
                    ['employeeId', 'dateOfHire', 'employmentType', 'department', 'jobTitle', 'jobGrade', 'manager', 'workLocation', 'baseSalary', 'currency', 'payFrequency', 'benefitsPackage'].includes(f.id);
                  const value = isStandard ? (getStandardValue(f.id) || '') : (preferencesObj[f.id] || '');

                  // Rendering logic

                  // For Checkboxes (NDA, Handbook, etc. signed by employee - read-only for HR Admin)
                  if (isCheckbox) {
                    return (
                      <div key={f.id} className="flex items-center gap-2.5 py-2 select-none col-span-1 md:col-span-2">
                        <Checkbox
                          id={`view-${f.id}`}
                          checked={value === 'true' || value === true || String(value).toLowerCase() === 'true'}
                          disabled
                          className="w-5 h-5 border-slate-300 dark:border-[#232D42] cursor-not-allowed opacity-80"
                        />
                        <label htmlFor={`view-${f.id}`} className="text-sm font-semibold text-slate-600 dark:text-[#94A3B8] cursor-not-allowed select-none">
                          {f.label}
                        </label>
                      </div>
                    );
                  }

                  // For File uploads (NDA docs, transcripts - read-only links for HR Admin)
                  if (isFile) {
                    return (
                      <div key={f.id} className="flex flex-col leading-relaxed">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{f.label}</span>
                        {value ? (
                          <a
                            href={String(value)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-extrabold text-slate-900 dark:text-[#F8FAFC] hover:text-[#FF4F00] transition-colors mt-1.5 flex items-center gap-2 w-fit bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 hover:border-slate-200 dark:border-[#232D42] px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            <DownloadSquareRounded size={16} />
                            <span>View Document</span>
                          </a>
                        ) : (
                          <span className="text-sm font-bold text-slate-400 mt-1.5 italic select-none">No document uploaded</span>
                        )}
                      </div>
                    );
                  }

                  // For Employee ID / Clock-in Number (HR Admin governed)
                  if (isEmployeeId) {
                    const currentEmpId = employeeNumber || value || '—';
                    if (!isEditMode) {
                      return (
                        <div key={f.id} className="flex flex-col leading-relaxed">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{f.label}</span>
                          <span className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200 mt-1">{currentEmpId}</span>
                        </div>
                      );
                    }

                    if (isHrAdmin) {
                      return (
                        <div key={f.id} className="flex flex-col gap-1.5 md:col-span-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              {f.label} <span className="text-rose-500">*</span>
                            </label>
                            <span className="inline-flex items-center gap-1 nvuto-btn-text-compact font-bold text-[#FF4F00] bg-[#FF4F00]/10 dark:bg-[#FF4F00]/20 px-2 py-0.5 rounded">
                              HR Admin Managed
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mt-1">
                            <div className="relative flex-1">
                              <Input
                                value={employeeNumber}
                                onChange={(e) => {
                                  const val = e.target.value.toUpperCase();
                                  setEmployeeNumber(val);
                                  setStandardValue('employeeId', val);
                                }}
                                placeholder="e.g. EMP-0001"
                                className="font-mono font-bold tracking-wide uppercase"
                                required
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isGeneratingId}
                              onClick={async () => {
                                setIsGeneratingId(true);
                                try {
                                  const res = await getNextEmployeeNumber();
                                  const nextNum = res?.data?.next_employee_number;
                                  if (nextNum) {
                                    setEmployeeNumber(nextNum);
                                    setStandardValue('employeeId', nextNum);
                                    addToast('success', 'ID Generated', `Assigned next sequence ID: ${nextNum}`);
                                  } else {
                                    addToast('critical', 'Generation Error', 'Unable to retrieve next number from sequence.');
                                  }
                                } catch (err: any) {
                                  addToast('critical', 'Generation Error', err?.message || 'Failed to auto-assign ID');
                                } finally {
                                  setIsGeneratingId(false);
                                }
                              }}
                              leftIcon={RefreshCircleRounded}
                              className="h-11 px-4 text-xs font-bold shrink-0 border-[#FF4F00] text-[#FF4F00] hover:bg-[#FF4F00]/10"
                            >
                              {isGeneratingId ? 'Generating...' : 'Auto-Assign Next ID'}
                            </Button>
                          </div>
                          <p className="nvuto-caption text-slate-500 dark:text-slate-400">
                            Format & sequence counter are managed in Company Settings. Duplicates are automatically rejected.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div key={f.id} className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {f.label}
                        </label>
                        <div className="h-11 bg-slate-100 dark:bg-[#171E2E] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg px-4 flex items-center justify-between text-sm font-mono font-bold mt-1 select-none cursor-not-allowed">
                          <span>{currentEmpId}</span>
                          <span className="inline-flex items-center gap-1 nvuto-btn-text-compact font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                            <LockKeyholeRounded className="w-3 h-3" />
                            Locked (HR Admin Only)
                          </span>
                        </div>
                        <p className="nvuto-caption text-slate-400">
                          Staff ID is managed strictly by HR Administrators to prevent sequence collisions.
                        </p>
                      </div>
                    );
                  }

                  // If not in Edit Mode (read-only view for general fields)
                  if (!isEditMode) {
                    const displayVal = f.id === 'manager' ? (managerName || 'No Manager') : (value || '—');
                    return (
                      <div key={f.id} className="flex flex-col leading-relaxed">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">{f.label}</span>
                        <span className="text-sm font-semibold text-slate-705 mt-1">{displayVal}</span>
                      </div>
                    );
                  }

                  // Otherwise, render editable fields
                  if (f.type === 'select') {
                    let options = f.options || [];
                    if (f.id === 'workLocation') {
                      options = locationOptions;
                    } else if (f.id === 'department') {
                      options = departmentOptions;
                    } else if (f.id === 'jobGrade') {
                      options = jobGradeOptions;
                    } else if (f.id === 'nationality') {
                      options = NATIONALITY_OPTIONS;
                    } else if (f.id === 'stateOfOrigin') {
                      const selectedCountry = getStandardValue('nationality') || preferencesObj.nationality || 'Nigeria';
                      options = getStatesForCountry(selectedCountry);
                    } else if (f.id === 'lga') {
                      const selectedCountry = getStandardValue('nationality') || preferencesObj.nationality || 'Nigeria';
                      const selectedState = getStandardValue('stateOfOrigin') || preferencesObj.stateOfOrigin || '';
                      options = getLgasForState(selectedCountry, selectedState);
                    } else if (['nokRelation', 'emergency1Relation', 'emergency2Relation'].includes(f.id)) {
                      options = RELATIONSHIP_OPTIONS;
                    } else if (f.id === 'manager') {
                      options = managerOptions;
                    }
                    const isLocationOrLongField = ['nationality', 'stateOfOrigin', 'lga', 'workLocation', 'department', 'jobGrade', 'nokRelation', 'emergency1Relation', 'emergency2Relation', 'manager'].includes(f.id);
                    if (isLocationOrLongField) {
                      return (
                        <SearchableCombobox
                          key={f.id}
                          label={f.label}
                          value={value}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isStandard) {
                              setStandardValue(f.id, val);
                              if (f.id === 'nationality') {
                                setStandardValue('stateOfOrigin', '');
                                setStandardValue('lga', '');
                              } else if (f.id === 'stateOfOrigin') {
                                setStandardValue('lga', '');
                              }
                            } else {
                              setPreferencesObj(prev => ({
                                ...prev,
                                [f.id]: val,
                                ...(f.id === 'nationality' ? { stateOfOrigin: '', lga: '' } : {}),
                                ...(f.id === 'stateOfOrigin' ? { lga: '' } : {})
                              }));
                            }
                          }}
                          options={options}
                          placeholder={`Type or select ${f.label.toLowerCase()}`}
                          required={f.required}
                        />
                      );
                    }

                    return (
                      <Select
                        key={f.id}
                        label={f.label}
                        value={value}
                        onChange={(e) => {
                          if (isStandard) {
                            setStandardValue(f.id, e.target.value);
                          } else {
                            setPreferencesObj(prev => ({ ...prev, [f.id]: e.target.value }));
                          }
                        }}
                        options={options}
                        required={f.required}
                      />
                    );
                  }

                  if (f.type === 'textarea') {
                    return (
                      <div key={f.id} className="md:col-span-2">
                        <Input
                          label={f.label}
                          value={value}
                          onChange={(e) => {
                            if (isStandard) {
                              setStandardValue(f.id, e.target.value);
                            } else {
                              setPreferencesObj(prev => ({ ...prev, [f.id]: e.target.value }));
                            }
                          }}
                          required={f.required}
                        />
                      </div>
                    );
                  }

                  return (
                    <Input
                      key={f.id}
                      label={f.label}
                      type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'}
                      value={value}
                      onChange={(e) => {
                        if (isStandard) {
                          setStandardValue(f.id, e.target.value);
                        } else {
                          setPreferencesObj(prev => ({ ...prev, [f.id]: e.target.value }));
                        }
                      }}
                      required={f.required}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Change Status modal states
  const [newStatus, setNewStatus] = useState<EmployeeDetail['status']>('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [statusEffectiveDate, setStatusEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Initiate Offboarding modal states
  const [isOffboardModalOpen, setIsOffboardModalOpen] = useState(false);
  const [offboardExitType, setOffboardExitType] = useState('Resignation');
  const [offboardLastWorkingDay, setOffboardLastWorkingDay] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [offboardReason, setOffboardReason] = useState('');
  const [offboardNoticeGiven, setOffboardNoticeGiven] = useState('30 Days');
  const [offboardExitInterviewRequired, setOffboardExitInterviewRequired] = useState(true);
  const [offboardNotes, setOffboardNotes] = useState('');

  const offboardMutation = useMutation({
    mutationFn: (payload: any) => initiateOffboarding(activeId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee', activeId] });
      setIsOffboardModalOpen(false);
      navigate('/hr/offboarding/active');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.message || 'Check database connection.';
      addToast('critical', 'Offboarding Failed', `Failed to initiate offboarding: ${errMsg}`);
    }
  });

  const handleOffboardSubmit = () => {
    if (activeExitRecord) {
      addToast('warning', 'Already Offboarding', 'This employee already has an active offboarding transition in progress.');
      setIsOffboardModalOpen(false);
      return;
    }
    if (!offboardReason.trim()) {
      addToast('critical', 'Validation Error', 'Please specify the reason for separation.');
      return;
    }
    offboardMutation.mutate({
      exit_type: offboardExitType,
      last_working_day: offboardLastWorkingDay,
      reason: offboardReason,
      notice_given: offboardNoticeGiven,
      exit_interview_required: offboardExitInterviewRequired,
      notes: offboardNotes
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState('');

  // Sync state if employee changes
  useEffect(() => {
    if (employee) {
      // Parse preferences (also used as a fallback source for fields
      // saved before these had dedicated backend columns)
      let prefs: Record<string, any> = {};
      if ((employee as any).preferences) {
        try {
          prefs = typeof (employee as any).preferences === 'string'
            ? JSON.parse((employee as any).preferences)
            : (employee as any).preferences;
        } catch {
          prefs = {};
        }
      }
      setPreferencesObj(prefs || {});

      setFirstName(employee.firstName || '');
      setLastName(employee.lastName || '');
      setRole(employee.jobTitle || '');
      setDepartment(employee.department || '');
      setStatus(employee.status as any || 'ACTIVE');
      setEmail(employee.workEmail || '');
      setPhone(employee.phone || '');
      setLocation(employee.officeLocation || '');
      setManagerId(employee.reportingManagerId || '');
      setManagerName(employee.reportingManagerName || '');
      setManagerRole('');
      setPersonalEmail(employee.personalEmail || prefs.personalEmail || employee.workEmail || '');
      setDob(employee.dob ? employee.dob.split('T')[0] : (prefs.dob || ''));
      setGender(prefs.gender || employee.gender || 'Male');
      setAddress(employee.residentialAddress || prefs.residentialAddress || prefs.currentAddress || '');

      setNationality((employee as any).nationality || prefs.nationality || 'Nigeria');
      setStateOfOrigin((employee as any).stateOfOrigin || prefs.stateOfOrigin || '');
      setLga((employee as any).lga || prefs.lga || '');

      setJoiningDate(employee.startDate ? employee.startDate.split('T')[0] : '');
      const rawEmpType = employee.employmentType || '';
      setEmploymentType(rawEmpType === 'Full-time' ? 'Full-time Permanent' : (rawEmpType || 'Full-time Permanent'));
      setJobGrade(employee.level || '');
      setBaseSalary(employee.baseSalary || '0');
      setCurrency((employee as any).currency || prefs.currency || 'NGN');
      setPayFrequency(prefs.payFrequency || prefs.pay_frequency || 'Monthly');
      setBenefitsPackage(prefs.benefitsPackage || prefs.benefits_package || 'Standard Health + Pension');
      setHardwareString(prefs.hardware || 'MacBook Pro 14" (M3 Pro)');
      setAccessLevel(prefs.accessLevel || 'Employee');
      setSaasWorkspaces(prefs.saasWorkspaces || ['Slack', 'Google Workspace']);
      setNewStatus(employee.status as any || 'ACTIVE');
      setAvatarSrc(employee.profilePictureUrl || '');

      setEmergencyName(employee.emergencyName || prefs.nokName || prefs.emergency1Name || '');
      setEmergencyPhone(employee.emergencyPhone || prefs.nokPhone || prefs.emergency1Phone || '');
      setEmergencyRelation(employee.emergencyRelation || prefs.nokRelation || prefs.emergency1Relation || '');
      const initialBankName = employee.bankName || (employee as any).bank_name || prefs.bankName || '';
      const initialBankCode = employee.bankCode || (employee as any).bank_code || prefs.bankCode || '';
      setBankName(initialBankName);
      setBankCode(initialBankCode);
      setBankAccountName(employee.accountHolderName || (employee as any).account_holder_name || prefs.bankAccountName || '');
      setBankAccountNumber(employee.accountNumber || (employee as any).account_number || prefs.bankAccountNumber || '');
      setEffectiveDate(prefs.effectiveDate || prefs.effective_date || (employee.startDate ? employee.startDate.split('T')[0] : ''));
      setCompensationBreakdown(prefs.compensation_breakdown || null);
      setBloodGroup(employee.bloodGroup || prefs.bloodGroup || '');
      setGenotype(employee.genotype || prefs.genotype || '');
      setAllergies(employee.allergies || prefs.knownAllergies || prefs.allergies || '');
      setEmployeeNumber(employee.employeeNumber || (employee as any).employee_number || '');
    }
  }, [employee]);

  // Keep manager name and role in sync with manager list
  useEffect(() => {
    if (managerId && employeesRes?.data) {
      const matched = employeesRes.data.find((e: any) => e.id === managerId);
      if (matched) {
        if (!managerName) {
          setManagerName(`${matched.firstName} ${matched.lastName}`);
        }
        setManagerRole(matched.jobTitle || '');
      }
    } else if (!managerId) {
      setManagerRole('');
    }
  }, [managerId, employeesRes, managerName]);

  // Sync mode changes from state router
  useEffect(() => {
    setIsEditMode(employeeViewMode === 'edit');
    setIsStatusModalOpen(employeeViewMode === 'status');
  }, [employeeViewMode]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => {
      const targetId = (employee?.id && employee.id.trim()) || (activeId && activeId.trim());
      if (!targetId) {
        throw new Error('No employee record selected.');
      }
      return updateEmployee(targetId, payload);
    },
    onSuccess: () => {
      const targetId = (employee?.id && employee.id.trim()) || (activeId && activeId.trim());
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['employee', targetId] });
        queryClient.invalidateQueries({ queryKey: ['reportingStructure', targetId] });
      }
      queryClient.invalidateQueries({ queryKey: ['orgChart'] });
      if (activeId && activeId !== targetId) queryClient.invalidateQueries({ queryKey: ['employee', activeId] });
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      // This admin tool lets an HR Admin edit any employee's record,
      // including their own - it had no self/other distinction, so an admin
      // updating their own avatar (or any other field) here left the
      // header/sidebar/welcome banner on stale data until a manual reload.
      // Invalidate if the modified record is the current user OR if current user is the new/former manager.
      const isSelf = Boolean(user?.email && employee?.workEmail && user.email === employee.workEmail);
      const isSelfManager = Boolean(user?.employeeId && (managerId === user.employeeId || employee?.reportingManagerId === user.employeeId));
      if (isSelf || isSelfManager) {
        queryClient.invalidateQueries({ queryKey: ['myEmployeeProfile'] });
        queryClient.invalidateQueries({ queryKey: ['authProfile'] });
        queryClient.invalidateQueries({ queryKey: ['employeeRoster'] });
        refreshUser();
      }
      setIsEditMode(false);
      setEmployeeViewMode('view');
      addToast('success', 'Changes Saved', 'Employee record updated successfully.');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.data?.message || err?.message || 'Check network connection.';
      addToast('critical', 'Update Failed', `Failed to save employee record: ${errMsg}`);
    }
  });

  const updateContractMutation = useMutation({
    mutationFn: (payload: any) => {
      const targetId = (employee?.id && employee.id.trim()) || (activeId && activeId.trim());
      if (!targetId) {
        throw new Error('No employee record selected.');
      }
      return updateEmployeeContract(targetId, payload);
    },
    onSuccess: () => {
      const targetId = (employee?.id && employee.id.trim()) || (activeId && activeId.trim());
      if (targetId) queryClient.invalidateQueries({ queryKey: ['employee', targetId] });
      if (activeId && activeId !== targetId) queryClient.invalidateQueries({ queryKey: ['employee', activeId] });
      queryClient.invalidateQueries({ queryKey: ['employeesList'] });
      setIsEditMode(false);
      setEmployeeViewMode('view');
      addToast('success', 'Contract Saved', 'Employee contract details updated successfully.');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || err?.data?.message || err?.message || 'Check network connection.';
      addToast('critical', 'Update Failed', `Failed to save contract: ${errMsg}`);
    }
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAvatarSrc(base64);
        updateMutation.mutate({
          profile_picture_url: base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleEdit = () => {
    if (!activeId || !employee) {
      addToast('warning', 'No Record', 'Please select an employee record before editing.');
      return;
    }
    if (isEditMode) {
      const selectedDepartment = (departmentsRes?.data || []).find((item) => item.name === department);
      const selectedLocation = (locationsRes?.data || []).find((item) => item.name === location);
      let effectiveSaveBankCode = bankCode;
      if (!effectiveSaveBankCode && bankName) {
        const list = Array.isArray(banksRes) ? banksRes : Array.isArray((banksRes as any)?.data) ? (banksRes as any).data : [];
        const matched = list.find((b: any) => b.name?.toLowerCase() === bankName.toLowerCase() || b.code === bankName);
        if (matched) {
          effectiveSaveBankCode = matched.code;
        }
      }
      updateMutation.mutate({
        first_name: firstName,
        last_name: lastName,
        job_title: role,
        department: department,
        department_id: selectedDepartment?.id,
        status: status as any,
        ...(isHrAdmin && email ? { work_email: email } : {}),
        ...(isHrAdmin && employeeNumber ? { employee_number: employeeNumber } : {}),
        phone: phone,
        office_location: location,
        location_id: selectedLocation?.id,
        base_salary: baseSalary,
        currency: currency,
        pay_frequency: payFrequency,
        reporting_manager_id: managerId || '',
        profile_picture_url: avatarSrc,
        dob: dob,
        gender: gender,
        residential_address: address,
        personal_email: personalEmail,
        nationality: nationality,
        state_of_origin: stateOfOrigin,
        lga: lga,
        emergency_name: emergencyName,
        emergency_phone: emergencyPhone,
        emergency_relation: emergencyRelation,
        bank_name: bankName,
        bank_code: effectiveSaveBankCode,
        account_holder_name: bankAccountName,
        account_number: bankAccountNumber,
        blood_group: bloodGroup,
        genotype: genotype,
        allergies: allergies,
        start_date: joiningDate,
        employment_type: employmentType,
        level: jobGrade,
        preferences: {
          ...preferencesObj,
          gender,
          dob,
          residentialAddress: address,
          currentAddress: address,
          currency,
          pay_frequency: payFrequency,
          payFrequency,
          benefits_package: benefitsPackage,
          benefitsPackage,
          effective_date: effectiveDate,
          effectiveDate,
          bloodGroup,
          genotype,
          knownAllergies: allergies,
          ...(compensationBreakdown ? { compensation_breakdown: compensationBreakdown } : {})
        }
      });
    } else {
      setIsEditMode(true);
    }
  };

  const handleDownloadContract = async () => {
    try {
      setIsDownloading(true);
      const res = await listEmployeeDocuments({
        employee_id: employee?.id || activeId,
        category: 'Contract'
      });
      if (res.data && res.data.length > 0) {
        const doc = res.data[0];
        const blob = await downloadEmployeeFile(doc.id);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.document_name || 'contract.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        addToast('warning', 'Not Found', 'No contract document found in the vault for this employee.');
      }
    } catch (err) {
      console.error('Failed to download contract', err);
      addToast('critical', 'Download Failed', 'An error occurred while downloading the contract.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpdateStatusSubmit = () => {
    updateMutation.mutate({
      status: newStatus as any
    });
    setStatus(newStatus);
    setIsStatusModalOpen(false);
  };

  const toggleSaaSWorkspace = (ws: string) => {
    setSaasWorkspaces((prev) =>
      prev.includes(ws) ? prev.filter((item) => item !== ws) : [...prev, ws]
    );
  };

  const getBadgeVariant = (statusVal: EmployeeDetail['status']) => {
    const s = String(statusVal || '').trim().toUpperCase().replace(/[\s_-]+/g, '');
    switch (s) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
      case 'PENDINGACTIVATION':
      case 'NOTICEPERIOD':
      case 'OFFBOARDING':
      case 'ONLEAVE':
      case 'PROBATION':
        return 'warning';
      case 'SUSPENDED':
      case 'EXITED':
      case 'TERMINATED':
      case 'RESIGNED':
        return 'critical';
      case 'ALUMNI':
      default:
        return 'neutral';
    }
  };

  const tabs = ['PERSONAL INFO', 'EMPLOYMENT', 'COMPENSATION', 'IT ASSETS', 'ACCESS & PERMISSIONS'];

  // Departments List
  const departmentOptions = useMemo(() => {
    const depts = departmentsRes?.data || [];
    return depts.map((d: any) => ({
      value: typeof d === 'string' ? d : d.name,
      label: typeof d === 'string' ? d : d.name
    }));
  }, [departmentsRes]);

  // Locations List
  const locationOptions = useMemo(() => {
    const locs = locationsRes?.data || [];
    return locs.map((l: any) => ({
      value: l.name,
      label: l.name
    }));
  }, [locationsRes]);

  // Job Grades List
  const jobGradeOptions = useMemo(() => {
    const grades = jobGradesRes?.data || [];
    if (grades.length === 0) {
      return [
        { value: 'Grade 5 - Senior Marketing Specialist', label: 'Grade 5 - Senior Marketing' },
        { value: 'Grade 7 - Head of Recruiting', label: 'Grade 7 - Head of Recruiting' },
        { value: 'Grade 8 - Principal Architect', label: 'Grade 8 - Principal Architect' },
        { value: 'Grade 9 - VP of Product', label: 'Grade 9 - VP of Product' },
        { value: 'Grade 10 - CFO', label: 'Grade 10 - CFO' },
        { value: 'Grade 9 - Senior Director', label: 'Grade 9 - Senior Director' }
      ];
    }
    return grades.map((g: any) => ({
      value: `${g.grade_code || g.name}`,
      label: g.name
    }));
  }, [jobGradesRes]);

  // Reporting Structure Query & Mutations
  const targetEmpId = employee?.id || activeId;
  const { data: reportingRes, refetch: refetchReporting } = useQuery({
    queryKey: ['reportingStructure', targetEmpId],
    queryFn: () => getEmployeeReportingStructure(targetEmpId),
    enabled: !!targetEmpId,
  });

  const reportingData = reportingRes;
  const dottedManagers = reportingData?.dotted_managers || [];
  const directReportsCount = reportingData?.direct_reports_count ?? 0;
  const dottedReportsCount = reportingData?.dotted_reports_count ?? 0;

  const [selectedDottedManagerId, setSelectedDottedManagerId] = useState('');
  const [isAddingDotted, setIsAddingDotted] = useState(false);

  const addDottedMutation = useMutation({
    mutationFn: (managerEmployeeId: string) => addDottedManager(targetEmpId, {
      manager_employee_id: managerEmployeeId,
      relationship_type: 'DOTTED'
    }),
    onSuccess: () => {
      refetchReporting();
      queryClient.invalidateQueries({ queryKey: ['orgChart'] });
      addToast('success', 'Dotted-Line Manager Added', 'Functional reporting relationship registered.');
      setSelectedDottedManagerId('');
      setIsAddingDotted(false);
    },
    onError: (err: any) => {
      addToast('critical', 'Failed to Add Dotted Manager', err?.response?.data?.message || err.message);
    }
  });

  const removeDottedMutation = useMutation({
    mutationFn: (dottedManagerId: string) => removeDottedManager(targetEmpId, dottedManagerId),
    onSuccess: () => {
      refetchReporting();
      queryClient.invalidateQueries({ queryKey: ['orgChart'] });
      addToast('success', 'Dotted-Line Manager Removed', 'Functional reporting relationship removed.');
    },
    onError: (err: any) => {
      addToast('critical', 'Failed to Remove Dotted Manager', err?.response?.data?.message || err.message);
    }
  });

  // Managers List
  const managerOptions = useMemo(() => {
    const emps = (employeesRes?.data || []).filter((e: any) => e.id !== activeId);
    const options = emps.map((e: any) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName} (${e.jobTitle || 'Staff'})`
    }));
    return [
      { value: '', label: 'None / No Manager' },
      ...options
    ];
  }, [employeesRes, activeId]);

  // Candidates for Dotted-Line Reporting (Exclude self, direct manager, and existing dotted)
  const dottedCandidateOptions = useMemo(() => {
    const existingDottedIds = new Set(dottedManagers.map((dm: any) => dm.id));
    return (employeesRes?.data || [])
      .filter((e: any) => e.id !== targetEmpId && e.id !== managerId && !existingDottedIds.has(e.id))
      .map((e: any) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName} (${e.jobTitle || 'Staff'})`
      }));
  }, [employeesRes, targetEmpId, managerId, dottedManagers]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <div className="sticky top-0 z-30 bg-white dark:bg-[#111625] border-b border-border px-6 py-4 shadow-sm w-full mb-0 h-[76px] flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-200 dark:bg-[#171E2E] animate-pulse rounded" />
          <div className="h-10 w-24 bg-slate-200 dark:bg-[#171E2E] animate-pulse rounded" />
        </div>
        <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-pulse">
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl overflow-hidden">
                <div className="h-32 bg-slate-200 dark:bg-[#171E2E]" />
                <div className="p-6 flex flex-col gap-4">
                  <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-[#171E2E] -mt-16 border-4 border-white" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <hr className="my-5 border-slate-100 dark:border-[#232D42]" />
                  <div className="h-4 w-5/6 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-[#171E2E] rounded" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] shadow-sm rounded-xl p-6 flex flex-col gap-6">
                <div className="flex gap-4 border-b border-slate-100 dark:border-[#232D42] pb-3">
                  <div className="h-6 w-24 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  <div className="h-6 w-24 bg-slate-200 dark:bg-[#171E2E] rounded" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-[#171E2E] rounded" />
                    <div className="h-10 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-[#171E2E] rounded" />
                    <div className="h-10 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  </div>
                  <div className="flex flex-col gap-2 col-span-2">
                    <div className="h-4 w-1/6 bg-slate-200 dark:bg-[#171E2E] rounded" />
                    <div className="h-10 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-[#171E2E] rounded" />
                    <div className="h-10 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-[#171E2E] rounded" />
                    <div className="h-10 bg-slate-200 dark:bg-[#171E2E] rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeId) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleReturnToEmployeeRecords}
                className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-border/60 flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-[#FF4F00] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 !p-0 !min-w-0"
                title="Back to Employee Records"
              >
                <AltArrowLeft size={24} />
              </Button>
              <PageTitle>Employee Record</PageTitle>
            </div>
          }
          className="sticky top-0 z-30 bg-white dark:bg-[#111625] border-b border-border px-6 py-4 shadow-sm w-full mb-0"
        />
        <div className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625]">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-[#171E2E] text-slate-400 mx-auto flex items-center justify-center mb-4">
              <UserRounded className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Employee Selected</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Please select an employee record from the Employee Directory to view or manage their profile.
            </p>
            <Button
              variant="primary"
              onClick={handleReturnToEmployeeRecords}
              className="w-full bg-[#111184] hover:bg-[#111184]/90 text-white font-bold h-11"
            >
              Browse Employee Directory
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !employee)) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleReturnToEmployeeRecords}
                className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-border/60 flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-[#FF4F00] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 !p-0 !min-w-0"
                title="Back to Employee Records"
              >
                <AltArrowLeft size={24} />
              </Button>
              <PageTitle>Employee Record Not Found</PageTitle>
            </div>
          }
          className="sticky top-0 z-30 bg-white dark:bg-[#111625] border-b border-border px-6 py-4 shadow-sm w-full mb-0"
        />
        <div className="flex-1 p-6 lg:p-12 flex items-center justify-center">
          <Card className="max-w-md w-full p-8 text-center border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625]">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <CloseCircleRounded className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Record Not Found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Could not find an employee record for <span className="font-semibold text-slate-700 dark:text-slate-300">"{activeId}"</span>. The employee may have been removed, or you may not have authorization to access this record.
            </p>
            <Button
              variant="primary"
              onClick={handleReturnToEmployeeRecords}
              className="w-full bg-[#111184] hover:bg-[#111184]/90 text-white font-bold h-11"
            >
              Return to Employee Directory
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19]">
      {/* PHASE 1: Page Header & Action Controls */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleReturnToEmployeeRecords}
              className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-border/60 flex items-center justify-center text-slate-500 dark:text-[#94A3B8] hover:text-[#FF4F00] hover:bg-slate-100 transition-colors cursor-pointer shrink-0 !p-0 !min-w-0"
              title="Back to Employee Records"
            >
              <AltArrowLeft size={24} />
            </Button>
            <PageTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 break-words">{firstName} {lastName}</span>
                {isRootTarget && (
                  <Badge variant="critical" className="nvuto-btn-text-compact font-extrabold normal-case shrink-0">Workspace Owner</Badge>
                )}
              </div>
            </PageTitle>
          </div>
        }
        badge={<Badge variant={getBadgeVariant(status)}>{String(status || '').replace(/_/g, ' ').toUpperCase()}</Badge>}
        rightControls={
          <>
            {activeExitRecord ? (
              <Button
                variant="outline"
                onClick={() => navigate('/hr/offboarding/active')}
                className="h-11 px-4 text-sm font-bold border-amber-300 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              >
                View Offboarding
              </Button>
            ) : (() => {
              const normStatus = String(status || '').trim().toUpperCase().replace(/[\s_-]+/g, '');
              const isSeparatedOrPending = ['OFFBOARDING', 'NOTICEPERIOD', 'EXITED', 'ALUMNI', 'TERMINATED', 'RESIGNED'].includes(normStatus);
              return !isSeparatedOrPending ? (
                <Button
                  variant="outline"
                  onClick={() => setIsOffboardModalOpen(true)}
                  className="h-11 px-4 text-sm font-bold border-rose-200 text-rose-700 hover:bg-rose-50/50 hover:text-rose-800"
                >
                  Initiate Offboarding
                </Button>
              ) : null;
            })()}
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(true)}
              className="h-11 px-4 text-sm font-bold border-border text-slate-700 dark:text-[#F8FAFC] hover:text-[#FF4F00]"
            >
              Change Status
            </Button>
            <Button
              variant="primary"
              leftIcon={isEditMode ? undefined : PenNewSquareRounded}
              onClick={handleToggleEdit}
              disabled={updateMutation.isPending || !activeId || !employee}
              className="h-11 px-5 text-sm font-bold bg-brand hover:bg-brand/90 text-white border-0 cursor-pointer disabled:opacity-60"
            >
              {isEditMode ? (updateMutation.isPending ? 'Saving...' : 'Save Changes') : 'Edit Record'}
            </Button>
          </>
        }
        className="sticky top-0 z-30 bg-white dark:bg-[#111625] border-b border-border px-6 py-4 shadow-sm w-full mb-0"
      />

      {/* Main Canvas Area */}
      <div className="nvuto-page-canvas flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* PHASE 2: Unified Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sticky Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-[90px] z-10">
            <Card className="overflow-hidden border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625]">
              {/* Top Section: Banner pattern */}
              <div className="h-32 bg-gradient-to-r from-[#111184] to-[#FF4F00] relative" />
              
              {/* Profile Avatar & Info */}
              <div className="px-6 pb-6 relative">
                <div className="absolute -top-12 left-6 relative w-24 h-24">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Avatar
                    src={avatarSrc}
                    name={`${firstName} ${lastName}`}
                    className="w-24 h-24 border-4 border-white shadow-md bg-slate-200 dark:bg-[#171E2E] rounded-full"
                  />
                  {isEditMode && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <span className="text-sm text-white font-bold text-center">
                        Update Photo
                      </span>
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="pt-4 mt-2">
                  {isEditMode ? (
                    <div className="flex flex-col gap-3">
                      <Input
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                      <Input
                        label="Job Title"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                      <Select
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        options={departmentOptions}
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-[#F8FAFC]">
                        {firstName} {lastName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-sm font-semibold text-slate-500 dark:text-[#94A3B8]">
                          {role} • {department}
                        </p>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#111184]/10 dark:bg-[#111184]/25 text-slate-900 dark:text-[#F8FAFC] dark:text-[#818cf8] border border-[#111184]/20">
                          <span className="nvuto-h3 uppercase font-bold text-slate-400">ID:</span>
                          {employeeNumber || employee?.employeeNumber || 'ID Pending'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-5 border-slate-100 dark:border-[#232D42]" />

                {/* Contact & Meta Info */}
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3 text-slate-600 dark:text-[#94A3B8]">
                    <LetterRounded className="w-4 h-4 text-slate-400 shrink-0" />
                    {isEditMode ? (
                      isHrAdmin ? (
                        <div className="w-full">
                          <Input
                            label="Work Email (HR Admin Only)"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            containerClassName="w-full"
                            required
                          />
                          <p className="nvuto-caption text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                            <LockKeyholeRounded className="w-3 h-3" />
                            Primary login identity. Updates will sync user account.
                          </p>
                        </div>
                      ) : (
                        <div className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121826]">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{email}</span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded nvuto-btn-text-compact font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50">
                              <LockKeyholeRounded className="w-2.5 h-2.5" />
                              HR Only
                            </span>
                          </div>
                          <p className="nvuto-caption text-slate-400 dark:text-slate-500 mt-1">
                            Work email is locked as the primary system identifier.
                          </p>
                        </div>
                      )
                    ) : (
                      <span className="text-sm font-semibold">{email}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-[#94A3B8]">
                    <PhoneRounded className="w-4 h-4 text-slate-400 shrink-0" />
                    {isEditMode ? (
                      <Input
                        label="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        containerClassName="w-full"
                        required
                      />
                    ) : (
                      <span className="text-sm font-semibold">{phone}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-[#94A3B8]">
                    <MapPointRounded className="w-4 h-4 text-slate-400 shrink-0" />
                    {isEditMode ? (
                      <Select
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        options={locationOptions}
                        containerClassName="w-full"
                        required
                      />
                    ) : (
                      <span className="text-sm font-semibold">{location}</span>
                    )}
                  </div>
                </div>

                <hr className="my-5 border-slate-100 dark:border-[#232D42]" />

                {/* Reporting Structure Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Reporting Structure
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" title="Direct subordinates">
                        {directReportsCount} Direct {directReportsCount === 1 ? 'Report' : 'Reports'}
                      </span>
                      {dottedReportsCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700" title="Functional dotted subordinates">
                          {dottedReportsCount} Dotted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1. Direct Reporting Manager (Reports To) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Reports To (Direct Manager)
                    </span>
                    {isEditMode ? (
                      <div className="flex flex-col gap-2">
                        <Select
                          label=""
                          value={managerId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManagerId(val);
                            const matchedEmp = employeesRes?.data?.find((emp: any) => emp.id === val);
                            if (matchedEmp) {
                              setManagerName(`${matchedEmp.firstName} ${matchedEmp.lastName}`);
                              setManagerRole(matchedEmp.jobTitle || '');
                            } else {
                              setManagerName('');
                              setManagerRole('');
                            }
                          }}
                          options={managerOptions}
                        />
                        <p className="text-[11px] text-slate-400">
                          Authoritative primary line manager for approvals & organizational tree.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-[#232D42] bg-slate-50/50 dark:bg-[#111625]">
                        <Avatar name={managerName || 'No Direct Manager'} size="sm" className="bg-[#111184] text-white" />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 dark:text-[#F8FAFC]">
                            {managerName || 'No Direct Manager (Top-level / CEO)'}
                          </span>
                          {managerRole ? (
                            <span className="text-xs text-slate-450 font-semibold">{managerRole}</span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Dotted-Line Reports / Secondary Managers */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-dashed border-slate-100 dark:border-[#232D42]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Dotted-Line Reports
                      </span>
                      {(isEditMode || isHrAdmin) && !isAddingDotted && dottedCandidateOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsAddingDotted(true)}
                          className="text-xs font-bold text-[#FF4F00] hover:underline cursor-pointer"
                        >
                          + Add Dotted-Line Manager
                        </button>
                      )}
                    </div>

                    {/* Dotted list */}
                    {dottedManagers.length === 0 && !isAddingDotted ? (
                      <span className="text-xs text-slate-400 italic">No secondary/functional reporting relationships assigned.</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {dottedManagers.map((dm: any) => (
                          <div
                            key={dm.id}
                            className="flex items-center justify-between p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-[#0B0F19]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar name={dm.name} size="sm" className="bg-slate-700 text-white text-xs" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{dm.name}</span>
                                <span className="text-[11px] text-slate-400 truncate">{dm.title || dm.department || 'Functional Lead'}</span>
                              </div>
                            </div>
                            {(isEditMode || isHrAdmin) && (
                              <button
                                type="button"
                                onClick={() => removeDottedMutation.mutate(dm.id)}
                                disabled={removeDottedMutation.isPending}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                                title="Remove dotted relationship"
                              >
                                <CloseCircleRounded className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Dotted Manager picker */}
                    {isAddingDotted && (
                      <div className="flex flex-col gap-2 p-2.5 rounded-lg border border-[#FF4F00]/30 bg-[#FF4F00]/5 dark:bg-[#FF4F00]/10 mt-1">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Select Dotted-Line Manager
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedDottedManagerId}
                            onChange={(e) => setSelectedDottedManagerId(e.target.value)}
                            className="flex-1 text-xs py-1.5 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111625] text-slate-800 dark:text-slate-200"
                          >
                            <option value="">Choose manager...</option>
                            {dottedCandidateOptions.map((opt: any) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            size="sm"
                            disabled={!selectedDottedManagerId || addDottedMutation.isPending}
                            onClick={() => {
                              if (selectedDottedManagerId) {
                                addDottedMutation.mutate(selectedDottedManagerId);
                              }
                            }}
                            className="h-8 px-3 text-xs bg-[#FF4F00] text-white hover:bg-[#e04500]"
                          >
                            {addDottedMutation.isPending ? 'Saving...' : 'Add'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingDotted(false);
                              setSelectedDottedManagerId('');
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          </div>

          {/* Right Column: Tabbed Information Details Card */}
          <div className="lg:col-span-8">
            <Card className="border border-slate-200 dark:border-[#232D42] shadow-sm bg-white dark:bg-[#111625] p-6">
              
              {/* Inner Tab selectors */}
              <div className="border-b border-slate-100 dark:border-[#232D42] mb-6 flex gap-6 overflow-x-auto no-scrollbar select-none">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 border-b-2 text-sm font-bold tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap uppercase ${
                        isActive
                          ? 'border-[#111184] text-slate-900 dark:text-[#F8FAFC]'
                          : 'border-transparent text-slate-400 hover:text-[#FF4F00]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Tab Form/Grid Contents */}
              <div className="">
                
                {/* 1. PERSONAL INFO TAB */}
                {activeTab === 'PERSONAL INFO' && (
                  renderTabFields(['1_identity', '2_contact', '3_emergency', '4_statutory', '7_academic', '9_medical', '11_culture'])
                )}

                {/* 2. EMPLOYMENT TAB */}
                {activeTab === 'EMPLOYMENT' && (
                  renderTabFields(['6_organizational', '8_background', '12_legal'])
                )}

                {/* 3. COMPENSATION TAB */}
                {activeTab === 'COMPENSATION' && (
                  <EmployeeCompensationTab
                    employeeId={activeId}
                    isEditMode={isEditMode}
                    baseSalary={baseSalary}
                    setBaseSalary={setBaseSalary}
                    currency={currency}
                    setCurrency={setCurrency}
                    payFrequency={payFrequency}
                    setPayFrequency={setPayFrequency}
                    effectiveDate={effectiveDate}
                    setEffectiveDate={setEffectiveDate}
                    hireDate={joiningDate}
                    bankName={bankName}
                    setBankName={setBankName}
                    bankCode={bankCode}
                    setBankCode={setBankCode}
                    bankAccountNumber={bankAccountNumber}
                    setBankAccountNumber={setBankAccountNumber}
                    bankAccountName={bankAccountName}
                    setBankAccountName={setBankAccountName}
                    bankSortCode={getStandardValue('bankSortCode') || preferencesObj.bankSortCode || ''}
                    setBankSortCode={(val) => {
                      setStandardValue('bankSortCode', val);
                      setPreferencesObj(prev => ({ ...prev, bankSortCode: val }));
                    }}
                    pfaName={getStandardValue('pfaName') || preferencesObj.pfaName || ''}
                    setPfaName={(val) => {
                      setStandardValue('pfaName', val);
                      setPreferencesObj(prev => ({ ...prev, pfaName: val }));
                    }}
                    rsaNumber={getStandardValue('rsaNumber') || preferencesObj.rsaNumber || ''}
                    setRsaNumber={(val) => {
                      setStandardValue('rsaNumber', val);
                      setPreferencesObj(prev => ({ ...prev, rsaNumber: val }));
                    }}
                    nhfNumber={getStandardValue('nhfNumber') || preferencesObj.nhfNumber || ''}
                    setNhfNumber={(val) => {
                      setStandardValue('nhfNumber', val);
                      setPreferencesObj(prev => ({ ...prev, nhfNumber: val }));
                    }}
                    voluntaryDeductions={getStandardValue('voluntaryDeductions') || preferencesObj.voluntaryDeductions || ''}
                    setVoluntaryDeductions={(val) => {
                      setStandardValue('voluntaryDeductions', val);
                      setPreferencesObj(prev => ({ ...prev, voluntaryDeductions: val }));
                    }}
                    initialBreakdown={compensationBreakdown}
                    onBreakdownChange={setCompensationBreakdown}
                  />
                )}

                {/* 4. IT ASSETS TAB */}
                {activeTab === 'IT ASSETS' && (
                  renderTabFields(['10_it'])
                )}

                {/* 5. ACCESS & PERMISSIONS TAB */}
                {activeTab === 'ACCESS & PERMISSIONS' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-[#232D42] select-none">
                      <ShieldCheckRounded size={18} className="text-[#FF4F00]" />
                      <h3 className="nvuto-h3 uppercase">
                        Access & Permissions Governance
                      </h3>
                    </div>

                    <div className="flex flex-col gap-5 mt-2">
                      <p className="text-sm text-slate-500 dark:text-[#94A3B8] leading-relaxed font-medium">
                        Configure explicit SpiceDB capabilities for this employee dossier. All grants are recorded in an immutable audit ledger.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Finance Operations Toggle */}
                        <div 
                          className="p-5 bg-slate-50 dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-[#232D42]/80 rounded-xl flex items-center justify-between gap-4 animate-fade-in"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Finance Operations</span>
                            <span className="text-xs text-slate-550 mt-1 font-semibold leading-relaxed">Grants explicit access to treasury, comp, and payroll management tables.</span>
                          </div>
                          <Checkbox
                            id="finance-operations-toggle"
                            checked={hasFinanceRole}
                            onCheckedChange={(checked) => {
                              const action = checked ? 'grant' : 'revoke';
                              setJustificationRole('finance_admin');
                              setJustificationAction(action);
                              setIsJustificationModalOpen(true);
                            }}
                          />
                        </div>

                        {/* Global Executive Toggle */}
                        <div 
                          className="p-5 bg-slate-50 dark:bg-[#0B0F19]/50 border border-slate-200 dark:border-[#232D42]/80 rounded-xl flex items-center justify-between gap-4 animate-fade-in"
                        >
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC]">Global Executive (CEO)</span>
                            <span className="text-xs text-slate-555 mt-1 font-semibold leading-relaxed">Grants global tenant read access while restricting line-manager pipelines.</span>
                          </div>
                          <Checkbox
                            id="ceo-toggle"
                            checked={hasCeoRole}
                            onCheckedChange={(checked) => {
                              const action = checked ? 'grant' : 'revoke';
                              setJustificationRole('global_executive');
                              setJustificationAction(action);
                              setIsJustificationModalOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Explicit Capability Grant Justification Modal */}
      {isJustificationModalOpen && (
        <Modal isOpen={isJustificationModalOpen} onClose={() => { setIsJustificationModalOpen(false); setRoleJustificationNote(''); }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (justificationRole) {
                grantRoleMutation.mutate({
                  roleKey: justificationRole,
                  action: justificationAction,
                  justification: roleJustificationNote
                });
              }
            }}
            className="p-6 flex flex-col gap-5 text-slate-900 dark:text-[#F8FAFC]"
          >
            <div className="flex items-center gap-3 border-b border-slate-150 pb-3.5 select-none">
              <h3 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                Reason for Capability {justificationAction === 'grant' ? 'Grant' : 'Revocation'}
              </h3>
            </div>

            <div className="flex flex-col gap-4 leading-relaxed text-slate-650">
              <p className="text-sm font-semibold">
                This high-privilege action will be stored in the immutable platform audit ledger. Please enter the business justification.
              </p>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-[#F8FAFC]">Justification Note <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  value={roleJustificationNote}
                  onChange={(e) => setRoleJustificationNote(e.target.value)}
                  placeholder="Provide reason for this explicit privilege modification..."
                  rows={4}
                  className="w-full bg-white dark:bg-[#111625] border border-slate-200 dark:border-[#232D42] rounded-lg p-3 text-sm text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-150 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsJustificationModalOpen(false); setRoleJustificationNote(''); }}
                className="text-slate-700 dark:text-[#F8FAFC] border-slate-300 dark:border-[#232D42] font-bold h-11 px-5 text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={roleJustificationNote.trim().length === 0 || grantRoleMutation.isPending}
                className="bg-brand hover:bg-brand/90 text-white font-bold h-11 px-5 text-sm border-0"
              >
                {grantRoleMutation.isPending ? 'Processing...' : 'Confirm Action'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PHASE 3: The Change Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl border border-slate-200 dark:border-[#232D42] shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-[#232D42] flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                Update Employee Status
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] transition-colors cursor-pointer"
                title="Close modal"
              >
                <CloseCircleRounded size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              <Select
                label="New Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'ON LEAVE', label: 'On Leave' },
                  { value: 'SUSPENDED', label: 'Suspended' },
                  { value: 'PROBATION', label: 'Probation' }
                ]}
                required
              />

              <Textarea
                id="remarks"
                label="Reason / Remarks"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="min-h-[80px]"
                placeholder="Enter reason for status change..."
              />

              <Input
                label="Effective Date"
                type="date"
                value={statusEffectiveDate}
                onChange={(e) => setStatusEffectiveDate(e.target.value)}
                required
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-100 dark:border-[#232D42] flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
                className="h-10 px-4 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatusSubmit}
                className="h-11 min-h-[44px] px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0"
              >
                Update Status
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Initiate Offboarding Modal - Dual-Theme Compatible */}
      {isOffboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div data-responsive-dialog="true" className="bg-white dark:bg-[#111625] rounded-xl border border-slate-200 dark:border-[#232D42] shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-[#232D42] flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-[#F8FAFC]">
                Initiate Offboarding Sequence
              </h3>
              <button
                onClick={() => setIsOffboardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-[#94A3B8] transition-colors cursor-pointer"
                title="Close modal"
              >
                <CloseCircleRounded size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-1">
                Transitioning <span className="font-bold text-slate-900 dark:text-white">{firstName} {lastName}</span> to offboarding status. This will automatically seed their exit checklist and publish revocation events.
              </p>

              <Select
                label="Exit Type"
                value={offboardExitType}
                onChange={(e) => setOffboardExitType(e.target.value)}
                options={[
                  { value: 'Resignation', label: 'Voluntary Resignation' },
                  { value: 'Termination', label: 'Involuntary Termination' },
                  { value: 'Mutual Agreement', label: 'Mutual Agreement' }
                ]}
                required
              />

              <Input
                label="Final Working Day"
                type="date"
                value={offboardLastWorkingDay}
                onChange={(e) => setOffboardLastWorkingDay(e.target.value)}
                required
              />

              <Input
                label="Notice Period Duration"
                value={offboardNoticeGiven}
                onChange={(e) => setOffboardNoticeGiven(e.target.value)}
                placeholder="e.g. 30 Days"
              />

              <div className="flex items-center gap-3 py-1">
                <Checkbox
                  id="offboard-interview-req"
                  checked={offboardExitInterviewRequired}
                  onCheckedChange={(checked) => setOffboardExitInterviewRequired(!!checked)}
                />
                <label
                  htmlFor="offboard-interview-req"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none cursor-pointer"
                >
                  Schedule Exit Interview
                </label>
              </div>

              <Textarea
                id="offboard-reason"
                label="Primary Separation Driver"
                value={offboardReason}
                onChange={(e) => setOffboardReason(e.target.value)}
                className="min-h-[80px]"
                placeholder="Specify the core driver (e.g. Career growth, restructuring)..."
                required
              />

              <Textarea
                id="offboard-notes"
                label="Administrative Notes"
                value={offboardNotes}
                onChange={(e) => setOffboardNotes(e.target.value)}
                className="min-h-[80px]"
                placeholder="Internal HR coordination remarks..."
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-[#0B0F19] border-t border-slate-100 dark:border-[#232D42] flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOffboardModalOpen(false)}
                className="h-10 px-4 text-sm font-bold border-slate-200 dark:border-[#232D42] text-slate-700 dark:text-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleOffboardSubmit}
                disabled={offboardMutation.isPending}
                className="h-11 min-h-[44px] px-5 text-sm font-bold bg-[#FF4F00] hover:bg-[#e04500] text-white border-0 disabled:opacity-50"
              >
                {offboardMutation.isPending ? 'Initiating...' : 'Confirm Offboarding'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
