import React, { useState, useEffect } from 'react';
import { RTIDraftProvider, useRTIDraft } from './lib/context/rti-draft';
import { LanguageProvider } from './lib/context/LanguageContext';
import { LanguageComingSoonModal } from './components/modals/LanguageComingSoonModal';
import { AssistantWidget } from './components/accessibility/AssistantWidget';
import { SkipToContent } from './components/accessibility/SkipToContent';
import { GovernmentBanner } from './components/layout/GovernmentBanner';
import { AppHeader } from './components/layout/AppHeader';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { FileRtiLayout } from './pages/file-rti/FileRtiLayout';
import { Step1Guidelines } from './pages/file-rti/Step1Guidelines';
import { Step2Authority } from './pages/file-rti/Step2Authority';
import { Step3Applicant } from './pages/file-rti/Step3Applicant';
import { Step4Bpl } from './pages/file-rti/Step4Bpl';
import { Step5Request } from './pages/file-rti/Step5Request';
import { Step6Documents } from './pages/file-rti/Step6Documents';
import { Step7Review } from './pages/file-rti/Step7Review';
import { Step8Payment } from './pages/file-rti/Step8Payment';
import { Step9Success } from './pages/file-rti/Step9Success';

import { AppealLayout } from './pages/first-appeal/AppealLayout';
import { AppealStep1Lookup } from './pages/first-appeal/AppealStep1Lookup';
import { AppealStep2Eligibility } from './pages/first-appeal/AppealStep2Eligibility';
import { AppealStep3Form } from './pages/first-appeal/AppealStep3Form';
import { AppealStep4Review } from './pages/first-appeal/AppealStep4Review';
import { AppealStep5Success } from './pages/first-appeal/AppealStep5Success';

import { TrackLookupPage } from './pages/track/TrackLookupPage';
import { TrackDetailPage } from './pages/track/TrackDetailPage';

import { HistoryAuthPage } from './pages/history/HistoryAuthPage';
import { HistoryOtpPage } from './pages/history/HistoryOtpPage';
import { HistoryDashboardPage } from './pages/history/HistoryDashboardPage';

import { AuthoritiesDirectoryPage } from './pages/authorities/AuthoritiesDirectoryPage';
import { AuthorityDetailPage } from './pages/authorities/AuthorityDetailPage';

import { FaqPage } from './pages/faq/FaqPage';
import { GuidelinesPage } from './pages/guidelines/GuidelinesPage';
import { HelpPage } from './pages/help/HelpPage';
import { PaymentReconciliationPage } from './pages/payment-reconciliation/PaymentReconciliationPage';
import { LoginPage } from './pages/auth/LoginPage';

import { RTIApplication, FirstAppealApplication, Authority, AppealGround } from './types/rti';
import { mockApi } from './lib/mockApi';

export function AppContent() {
  // Navigation State
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [selectedAuthorityForDetail, setSelectedAuthorityForDetail] = useState<Authority | null>(null);
  const [trackRegNo, setTrackRegNo] = useState<string | null>(null);

  // Authenticated Mock User State (for judges & convenience login)
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string } | null>(null);

  // File RTI flow step state
  const { draft, currentStep: rtiStep, setCurrentStep: setRtiStep, resetDraft, updateAuthority, updateDraft } = useRTIDraft();
  const [submittedApplication, setSubmittedApplication] = useState<RTIApplication | null>(null);

  // First Appeal flow state
  const [appealStep, setAppealStep] = useState<number>(1);
  const [appealOriginalApp, setAppealOriginalApp] = useState<RTIApplication | null>(null);
  const [appealApplicantEmail, setAppealApplicantEmail] = useState<string>('');
  const [appealGround, setAppealGround] = useState<AppealGround | undefined>(undefined);
  const [appealText, setAppealText] = useState<string>('');
  const [appealDoc, setAppealDoc] = useState<any>(null);
  const [submittedAppeal, setSubmittedAppeal] = useState<FirstAppealApplication | null>(null);

  // History Auth flow state
  const [historyIdentifier, setHistoryIdentifier] = useState<string>('');
  const [historyVerifiedEmail, setHistoryVerifiedEmail] = useState<string | null>(null);
  const [historyStep, setHistoryStep] = useState<'AUTH' | 'OTP' | 'DASHBOARD'>('AUTH');

  // Scroll to top on route or step change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [currentRoute, rtiStep, appealStep, trackRegNo]);

  const handleNavigate = (path: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setCurrentRoute(path);
    if (path === '/file-rti' && rtiStep >= 9) {
      setSubmittedApplication(null);
      setRtiStep(1);
    }
    if (path === '/first-appeal') {
      setAppealStep(1);
    }
    if (path === '/track') {
      setTrackRegNo(null);
    }
    if (path === '/history') {
      if (currentUser?.email || historyVerifiedEmail) {
        setHistoryVerifiedEmail(currentUser?.email || historyVerifiedEmail || 'aarav.sharma@example.com');
        setHistoryStep('DASHBOARD');
      } else {
        setHistoryStep('AUTH');
      }
    }
  };

  const handleStartNewRti = () => {
    if (rtiStep >= 9) {
      resetDraft();
      setSubmittedApplication(null);
      setRtiStep(1);
    } else if (currentRoute !== '/file-rti') {
      setRtiStep(1);
    }
    setCurrentRoute('/file-rti');
  };

  const handleQuickTrack = (regNo: string) => {
    setTrackRegNo(regNo);
    setCurrentRoute('/track');
  };

  const handleFileAppealFromTrack = (regNo: string, email: string) => {
    setAppealStep(1);
    setCurrentRoute('/first-appeal');
  };

  const handleFileRtiWithAuthority = (auth: Authority) => {
    updateAuthority(auth);
    setRtiStep(3); // Jump directly to applicant details
    setCurrentRoute('/file-rti');
  };

  const handleLoginSuccess = (user: { email: string; name?: string }) => {
    setCurrentUser(user);
    setHistoryVerifiedEmail(user.email);
    updateDraft({
      applicant: {
        ...draft.applicant,
        fullName: draft.applicant?.fullName || user.name || (user.email === 'demo.citizen@example.com' ? 'Demo Citizen' : user.email.split('@')[0]),
        email: user.email,
      },
    });
    setHistoryStep('DASHBOARD');
    setCurrentRoute('/history');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setHistoryVerifiedEmail(null);
    setHistoryStep('AUTH');
    setCurrentRoute('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1B1E22] font-body selection:bg-[#EEF3FA] selection:text-[#1B4B8F]">
      <SkipToContent />
      {/* Pinned Fixed Top Navigation Bar */}
      <div className="sticky top-0 z-50 w-full shadow-xs bg-white no-print">
        <GovernmentBanner />
        <AppHeader
          currentPath={currentRoute}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onStartNewRti={handleStartNewRti}
          onTrackQuick={handleQuickTrack}
        />
      </div>

      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ========================================================================= */}
        {/* ROUTE: HOME PAGE                                                          */}
        {/* ========================================================================= */}
        {currentRoute === '/' && (
          <HomePage
            onNavigate={handleNavigate}
            onQuickTrack={handleQuickTrack}
          />
        )}

        {/* ========================================================================= */}
        {/* ROUTE: CONVENIENCE LOGIN                                                  */}
        {/* ========================================================================= */}
        {currentRoute === '/login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => handleNavigate('/')}
          />
        )}

        {/* ========================================================================= */}
        {/* ROUTE: FILE RTI (9 Multi-step Form)                                       */}
        {/* ========================================================================= */}
        {currentRoute === '/file-rti' && (
          <FileRtiLayout
            currentStep={rtiStep}
            onStepClick={(s) => setRtiStep(s)}
            onNavigateHome={() => handleNavigate('/')}
          >
            {rtiStep === 1 && (
              <Step1Guidelines onContinue={() => setRtiStep(2)} />
            )}
            {rtiStep === 2 && (
              <Step2Authority
                onContinue={() => setRtiStep(3)}
                onBack={() => setRtiStep(1)}
              />
            )}
            {rtiStep === 3 && (
              <Step3Applicant
                onContinue={() => setRtiStep(4)}
                onBack={() => setRtiStep(2)}
              />
            )}
            {rtiStep === 4 && (
              <Step4Bpl
                onContinue={() => setRtiStep(5)}
                onBack={() => setRtiStep(3)}
              />
            )}
            {rtiStep === 5 && (
              <Step5Request
                onContinue={() => setRtiStep(6)}
                onBack={() => setRtiStep(4)}
              />
            )}
            {rtiStep === 6 && (
              <Step6Documents
                onContinue={() => setRtiStep(7)}
                onBack={() => setRtiStep(5)}
              />
            )}
            {rtiStep === 7 && (
              <Step7Review
                onContinue={async () => {
                  try {
                    const res = await mockApi.submitApplication(draft);
                    if (draft.bpl?.isBpl) {
                      // Fee waiver: Directly submit
                      if (res.application) {
                        setSubmittedApplication(res.application);
                      }
                      setRtiStep(9);
                    } else {
                      if (res.draftId) {
                        updateDraft({ draftId: res.draftId });
                      }
                      setRtiStep(8);
                    }
                  } catch (e) {
                    console.error('Submission pre-check error:', e);
                    if (draft.bpl?.isBpl) {
                      setRtiStep(9);
                    } else {
                      setRtiStep(8);
                    }
                  }
                }}
                onBack={() => setRtiStep(6)}
                onEditStep={(s) => setRtiStep(s)}
              />
            )}
            {rtiStep === 8 && (
              <Step8Payment
                onSuccess={(app) => {
                  setSubmittedApplication(app);
                  setRtiStep(9);
                }}
                onBack={() => setRtiStep(7)}
                onNavigateReconciliation={() => handleNavigate('/payment-reconciliation')}
              />
            )}
            {rtiStep === 9 && submittedApplication && (
              <Step9Success
                application={submittedApplication}
                onTrack={(regNo) => handleQuickTrack(regNo)}
                onFileAnother={() => {
                  resetDraft();
                  setSubmittedApplication(null);
                  setRtiStep(1);
                }}
              />
            )}
          </FileRtiLayout>
        )}

        {/* ========================================================================= */}
        {/* ROUTE: FIRST APPEAL (5 Multi-step Form)                                   */}
        {/* ========================================================================= */}
        {currentRoute === '/first-appeal' && (
          <AppealLayout
            currentStep={appealStep}
            onStepClick={(s) => setAppealStep(s)}
          >
            {appealStep === 1 && (
              <AppealStep1Lookup
                onOriginalFound={(app, email) => {
                  setAppealOriginalApp(app);
                  setAppealApplicantEmail(email);
                  setAppealStep(2);
                }}
              />
            )}
            {appealStep === 2 && (
              <AppealStep2Eligibility
                initialGround={appealGround}
                onContinue={(ground) => {
                  setAppealGround(ground);
                  setAppealStep(3);
                }}
                onBack={() => setAppealStep(1)}
              />
            )}
            {appealStep === 3 && (
              <AppealStep3Form
                initialText={appealText}
                initialDoc={appealDoc}
                onContinue={(text, doc) => {
                  setAppealText(text);
                  setAppealDoc(doc);
                  setAppealStep(4);
                }}
                onBack={() => setAppealStep(2)}
              />
            )}
            {appealStep === 4 && appealOriginalApp && appealGround && (
              <AppealStep4Review
                originalApp={appealOriginalApp}
                applicantEmail={appealApplicantEmail}
                ground={appealGround}
                appealText={appealText}
                supportingDoc={appealDoc}
                onSuccess={(res) => {
                  setSubmittedAppeal(res);
                  setAppealStep(5);
                }}
                onBack={() => setAppealStep(3)}
              />
            )}
            {appealStep === 5 && submittedAppeal && (
              <AppealStep5Success
                appeal={submittedAppeal}
                onTrack={(regNo) => handleQuickTrack(regNo)}
                onFileAnother={() => {
                  setSubmittedAppeal(null);
                  setAppealOriginalApp(null);
                  setAppealStep(1);
                }}
              />
            )}
          </AppealLayout>
        )}

        {/* ========================================================================= */}
        {/* ROUTE: TRACK APPLICATION                                                  */}
        {/* ========================================================================= */}
        {currentRoute === '/track' && (
          <>
            {trackRegNo ? (
              <TrackDetailPage
                registrationNumber={trackRegNo}
                onBackToSearch={() => setTrackRegNo(null)}
                onFileAppeal={handleFileAppealFromTrack}
                onNavigateTrack={(reg) => setTrackRegNo(reg)}
              />
            ) : (
              <TrackLookupPage
                onSearch={(regNo) => setTrackRegNo(regNo)}
                onNavigateHome={() => handleNavigate('/')}
              />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ROUTE: CITIZEN HISTORY & DASHBOARD                                        */}
        {/* ========================================================================= */}
        {currentRoute === '/history' && (
          <>
            {historyStep === 'AUTH' && (
              <HistoryAuthPage
                onOtpRequested={(identifier) => {
                  setHistoryIdentifier(identifier);
                  setHistoryStep('OTP');
                }}
                onDirectLogin={(email) => {
                  handleLoginSuccess({ email, name: email.split('@')[0] });
                }}
                onNavigateHome={() => handleNavigate('/')}
              />
            )}
            {historyStep === 'OTP' && (
              <HistoryOtpPage
                identifier={historyIdentifier}
                onVerified={(email) => {
                  setHistoryVerifiedEmail(email);
                  setCurrentUser({ email, name: email.split('@')[0] });
                  setHistoryStep('DASHBOARD');
                }}
                onBack={() => setHistoryStep('AUTH')}
              />
            )}
            {historyStep === 'DASHBOARD' && historyVerifiedEmail && (
              <HistoryDashboardPage
                userEmail={historyVerifiedEmail}
                onLogout={handleLogout}
                onViewApplication={(regNo) => handleQuickTrack(regNo)}
                onFileNewRti={() => {
                  handleStartNewRti();
                }}
              />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ROUTE: PUBLIC AUTHORITIES DIRECTORY                                       */}
        {/* ========================================================================= */}
        {currentRoute === '/authorities' && (
          <>
            {selectedAuthorityForDetail ? (
              <AuthorityDetailPage
                authority={selectedAuthorityForDetail}
                onBack={() => setSelectedAuthorityForDetail(null)}
                onFileRti={(auth) => handleFileRtiWithAuthority(auth)}
              />
            ) : (
              <AuthoritiesDirectoryPage
                onSelectAuthority={(auth) => setSelectedAuthorityForDetail(auth)}
                onFileRtiWithAuthority={(auth) => handleFileRtiWithAuthority(auth)}
              />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* ROUTE: FAQ                                                                */}
        {/* ========================================================================= */}
        {currentRoute === '/faq' && <FaqPage />}

        {/* ========================================================================= */}
        {/* ROUTE: GUIDELINES                                                         */}
        {/* ========================================================================= */}
        {currentRoute === '/guidelines' && <GuidelinesPage />}

        {/* ========================================================================= */}
        {/* ROUTE: HELP & SUPPORT                                                     */}
        {/* ========================================================================= */}
        {currentRoute === '/help' && <HelpPage />}

        {/* ========================================================================= */}
        {/* ROUTE: PAYMENT RECONCILIATION                                             */}
        {/* ========================================================================= */}
        {currentRoute === '/payment-reconciliation' && (
          <PaymentReconciliationPage
            onApplicationFound={(regNo) => handleQuickTrack(regNo)}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      <AssistantWidget onNavigate={handleNavigate} onTrackQuick={handleQuickTrack} />
      <LanguageComingSoonModal />
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <RTIDraftProvider>
        <AppContent />
      </RTIDraftProvider>
    </LanguageProvider>
  );
}

export default App;
