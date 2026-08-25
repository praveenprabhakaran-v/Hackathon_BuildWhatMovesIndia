import React, { createContext, useContext, useState, useEffect } from 'react';
import { RTIDraft, Authority, ApplicantDetails, BplDetails, SupportingDocument } from '../../types/rti';

interface RTIDraftContextType {
  draft: RTIDraft;
  setDraft: React.Dispatch<React.SetStateAction<RTIDraft>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  updateAuthority: (authority: Authority) => void;
  updateApplicant: (applicant: ApplicantDetails) => void;
  updateBpl: (bpl: BplDetails) => void;
  updateRequest: (text: string, supportingDocId?: string) => void;
  updateDraft: (updates: Partial<RTIDraft>) => void;
  addDocument: (doc: SupportingDocument) => void;
  removeDocument: (fileId: string) => void;
  setGuidelinesAcknowledged: (acknowledged: boolean) => void;
  resetDraft: () => void;
  isDraftEmpty: boolean;
}

const INITIAL_DRAFT: RTIDraft = {
  guidelinesAcknowledged: false,
  applicant: {
    fullName: '',
    gender: '',
    email: '',
    mobile: '',
    country: 'India',
    state: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    category: 'URBAN',
    educationalStatus: 'LITERATE',
  },
  bpl: {
    isBpl: false,
  },
  request: {
    text: '',
  },
  documents: [],
};

const DRAFT_SESSION_KEY = 'rti_current_draft_session_v1';

const RTIDraftContext = createContext<RTIDraftContextType | undefined>(undefined);

export const RTIDraftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [draft, setDraft] = useState<RTIDraft>(() => {
    try {
      const stored = sessionStorage.getItem(DRAFT_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read draft from sessionStorage', e);
    }
    return INITIAL_DRAFT;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_SESSION_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Could not save draft to sessionStorage', e);
    }
  }, [draft]);

  const updateAuthority = (authority: Authority) => {
    setDraft((prev) => ({ ...prev, authority }));
  };

  const updateApplicant = (applicant: ApplicantDetails) => {
    setDraft((prev) => ({ ...prev, applicant: { ...prev.applicant, ...applicant } }));
  };

  const updateBpl = (bpl: BplDetails) => {
    setDraft((prev) => ({ ...prev, bpl: { ...prev.bpl, ...bpl } }));
  };

  const updateRequest = (text: string, supportingDocId?: string) => {
    setDraft((prev) => ({
      ...prev,
      request: {
        text,
        supportingDocId,
        wordCount: text.trim() ? text.trim().split(/\s+/).length : 0,
      },
    }));
  };

  const updateDraft = (updates: Partial<RTIDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const addDocument = (doc: SupportingDocument) => {
    setDraft((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), doc],
    }));
  };

  const removeDocument = (fileId: string) => {
    setDraft((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.fileId !== fileId),
    }));
  };

  const setGuidelinesAcknowledged = (acknowledged: boolean) => {
    setDraft((prev) => ({ ...prev, guidelinesAcknowledged: acknowledged }));
  };

  const resetDraft = () => {
    setDraft(INITIAL_DRAFT);
    setCurrentStep(1);
    try {
      sessionStorage.removeItem(DRAFT_SESSION_KEY);
    } catch (e) {
      // ignore
    }
  };

  const isDraftEmpty =
    !draft.authority &&
    !draft.request?.text &&
    !draft.applicant?.fullName &&
    !draft.guidelinesAcknowledged;

  return (
    <RTIDraftContext.Provider
      value={{
        draft,
        setDraft,
        currentStep,
        setCurrentStep,
        updateAuthority,
        updateApplicant,
        updateBpl,
        updateRequest,
        updateDraft,
        addDocument,
        removeDocument,
        setGuidelinesAcknowledged,
        resetDraft,
        isDraftEmpty,
      }}
    >
      {children}
    </RTIDraftContext.Provider>
  );
};

export function useRTIDraft() {
  const context = useContext(RTIDraftContext);
  if (!context) {
    throw new Error('useRTIDraft must be used within an RTIDraftProvider');
  }
  return context;
}
