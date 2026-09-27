/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kaushal Setu — Turn local job demand into better training.
 * Smart India Hackathon 2026 • Region: Maharashtra
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  District,
  Sector,
  DemoRole,
  Language,
  Recommendation,
  SkillMapping,
  EmployerReviewDecision,
  DistrictTrainingPlan,
  LearnerProfile,
  AuditEvent,
} from './types';
import { INITIAL_APP_STATE } from './data/seedData';
import { loadAppState, saveAppState, resetAppState } from './utils/storage';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { GuidedDemoBanner, WALKTHROUGH_STEPS } from './components/GuidedDemoBanner';
import { DemoToolsModal } from './components/DemoToolsModal';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { DemandExplorerPage } from './pages/DemandExplorerPage';
import { CourseAlignmentPage } from './pages/CourseAlignmentPage';
import { EmployerReviewPage } from './pages/EmployerReviewPage';
import { DistrictPlanPage } from './pages/DistrictPlanPage';
import { LearnerPathwayPage } from './pages/LearnerPathwayPage';
import { OutcomesAndEvidencePage } from './pages/OutcomesAndEvidencePage';

export default function App() {
  const [appState, setAppState] = useState<AppState>(INITIAL_APP_STATE);
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDemoToolsOpen, setIsDemoToolsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // Live Analysis / Upload Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadType, setUploadType] = useState<'syllabus' | 'job_postings'>('syllabus');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Initialize storage
  useEffect(() => {
    async function init() {
      try {
        const stored = await loadAppState();
        setAppState(stored);
      } catch (err) {
        console.error('Failed to load from storage, using seed state:', err);
      }
    }
    init();
  }, []);

  // Synchronize state changes to IndexedDB
  const updateStateAndPersist = useCallback((updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveAppState(next).catch((e) => console.error('Failed to persist app state:', e));
      return next;
    });
  }, []);

  // Role switching
  const handleRoleChange = (newRole: DemoRole) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      currentRole: newRole,
    }));

    // Auto-route to relevant default tab per role
    if (newRole === 'learner') {
      setActiveTab('learner-pathway');
    } else if (newRole === 'employer-reviewer') {
      setActiveTab('employer-review');
    } else if (newRole === 'district-admin') {
      setActiveTab('district-training-plan');
    } else if (newRole === 'institute-coordinator') {
      setActiveTab('course-alignment');
    }
  };

  const handleDistrictChange = (district: District) => {
    updateStateAndPersist((prev) => ({ ...prev, currentDistrict: district }));
  };

  const handleSectorChange = (sector: Sector) => {
    updateStateAndPersist((prev) => ({ ...prev, currentSector: sector }));
  };

  const handleLanguageChange = (lang: Language) => {
    updateStateAndPersist((prev) => ({ ...prev, language: lang }));
  };

  // Updaters for domain entities
  const handleUpdateRecommendation = (rec: Recommendation) => {
    const audit: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: appState.currentRole === 'institute-coordinator' ? 'P. Joshi (Sahyadri Skills)' : 'District Admin',
      action: 'UPDATE_RECOMMENDATION',
      entityType: 'Recommendation',
      entityId: rec.id,
      details: `Updated lab proposal: ${rec.title} (Revision #${rec.revisionNumber})`,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      recommendations: prev.recommendations.map((r) => (r.id === rec.id ? rec : r)),
      auditEvents: [audit, ...prev.auditEvents],
    }));
  };

  const handleUpdateSkillMapping = (mapping: SkillMapping) => {
    const audit: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'Curriculum Officer',
      action: 'UPDATE_SKILL_MAPPING',
      entityType: 'SkillMapping',
      entityId: mapping.skillId,
      details: `Skill mapping status set to ${mapping.status} for ${mapping.skillName}`,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      skillMappings: prev.skillMappings.map((m) => (m.skillId === mapping.skillId ? mapping : m)),
      auditEvents: [audit, ...prev.auditEvents],
    }));
  };

  const handleUpdateEmployerReview = (rev: EmployerReviewDecision) => {
    const audit: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: `${rev.reviewerName} (${rev.organization})`,
      action: 'UPDATE_EMPLOYER_REVIEW',
      entityType: 'EmployerReviewDecision',
      entityId: rev.id,
      details: `Employer concurrence decision recorded: ${rev.status}`,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      employerReviews: prev.employerReviews.map((r) => (r.id === rev.id ? rev : r)),
      auditEvents: [audit, ...prev.auditEvents],
    }));
  };

  const handleUpdateDistrictPlan = (plan: DistrictTrainingPlan) => {
    const audit: AuditEvent = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'District Skill Committee',
      action: 'UPDATE_DISTRICT_PLAN',
      entityType: 'DistrictTrainingPlan',
      entityId: plan.id,
      details: `District training plan status: ${plan.status} (Seats: ${plan.plannedSeats})`,
    };

    updateStateAndPersist((prev) => ({
      ...prev,
      districtTrainingPlan: plan,
      auditEvents: [audit, ...prev.auditEvents],
    }));
  };

  const handleUpdateLearnerProfile = (learner: LearnerProfile) => {
    updateStateAndPersist((prev) => ({
      ...prev,
      learnerProfile: learner,
    }));
  };

  const handleReset = async () => {
    await resetAppState();
    setAppState(INITIAL_APP_STATE);
    setCurrentStepIndex(0);
  };

  const handleRestoreState = (newState: AppState) => {
    updateStateAndPersist(() => newState);
  };

  // Walkthrough navigation handler
  const handleWalkthroughStepChange = (stepIdx: number) => {
    setCurrentStepIndex(stepIdx);
    const targetStep = WALKTHROUGH_STEPS[stepIdx];
    if (targetStep) {
      setActiveTab(targetStep.targetTab);
      if (targetStep.requiredRole && appState.currentRole !== targetStep.requiredRole) {
        updateStateAndPersist((prev) => ({ ...prev, currentRole: targetStep.requiredRole! }));
      }
    }
  };

  // Live Analysis with Gemini (server-side proxy route /api/gemini/*)
  const handleRunLiveAnalysis = async () => {
    if (!uploadText.trim()) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const endpoint =
        uploadType === 'syllabus'
          ? '/api/gemini/analyze-curriculum'
          : '/api/gemini/analyze-demand';

      const payload =
        uploadType === 'syllabus'
          ? {
              syllabusText: uploadText,
              courseName: 'Custom Course Upload',
              targetRole: 'Junior Data Analyst',
            }
          : {
              jobPostingsText: uploadText,
              district: appState.currentDistrict,
              sector: appState.currentSector,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Gemini analysis failed or server unavailable');
      }

      setAnalysisResult(data.data);
    } catch (err: any) {
      console.warn('Live Gemini analysis error:', err);
      setAnalysisError(
        err.message ||
          'Analysis could not complete because GEMINI_API_KEY is not configured or network request failed. Your uploaded document is preserved.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
      {/* Top Banner: Guided Demo presenter controller */}
      <GuidedDemoBanner
        currentStepIndex={currentStepIndex}
        onStepChange={handleWalkthroughStepChange}
        currentRole={appState.currentRole}
        onRoleChange={handleRoleChange}
        onOpenDemoTools={() => setIsDemoToolsOpen(true)}
        isVisible={isBannerVisible}
        onToggleVisibility={() => setIsBannerVisible(!isBannerVisible)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex w-full overflow-hidden">
        {/* Navy Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            if (window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
          currentRole={appState.currentRole}
          isOpen={isSidebarOpen}
          isOpenMobile={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onCloseMobile={() => setIsSidebarOpen(false)}
          onOpenDemoTools={() => setIsDemoToolsOpen(true)}
        />

        {/* Content Column (never overlaps with sidebar) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50">
          {/* Top Header with prominent 3-line menu bar on all devices */}
          <Header
            currentDistrict={appState.currentDistrict}
            onDistrictChange={handleDistrictChange}
            currentSector={appState.currentSector}
            onSectorChange={handleSectorChange}
            currentRole={appState.currentRole}
            onRoleChange={handleRoleChange}
            language={appState.language}
            onLanguageChange={handleLanguageChange}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onToggleMobileMenu={() => setIsSidebarOpen(!isSidebarOpen)}
            onStartWalkthrough={() => {
              setIsBannerVisible(true);
              setCurrentStepIndex(0);
              setActiveTab('overview');
            }}
            onOpenDemoTools={() => setIsDemoToolsOpen(true)}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />

          {/* Active Page View Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24">
              {activeTab === 'overview' && (
                <OverviewPage appState={appState} onNavigate={(tab) => setActiveTab(tab)} />
              )}

              {activeTab === 'demand-explorer' && (
                <DemandExplorerPage
                  appState={appState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onDistrictChange={handleDistrictChange}
                />
              )}

              {activeTab === 'course-alignment' && (
                <CourseAlignmentPage
                  appState={appState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onUpdateRecommendation={handleUpdateRecommendation}
                  onUpdateSkillMapping={handleUpdateSkillMapping}
                />
              )}

              {activeTab === 'employer-review' && (
                <EmployerReviewPage
                  appState={appState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onUpdateReview={handleUpdateEmployerReview}
                />
              )}

              {activeTab === 'district-training-plan' && (
                <DistrictPlanPage
                  appState={appState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onUpdatePlan={handleUpdateDistrictPlan}
                />
              )}

              {activeTab === 'learner-pathway' && (
                <LearnerPathwayPage
                  appState={appState}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onUpdateLearnerProfile={handleUpdateLearnerProfile}
                />
              )}

              {activeTab === 'outcomes-and-evidence' && (
                <OutcomesAndEvidencePage appState={appState} onNavigate={(tab) => setActiveTab(tab)} />
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Demo Tools & Backup Modal */}
      <DemoToolsModal
        isOpen={isDemoToolsOpen}
        onClose={() => setIsDemoToolsOpen(false)}
        appState={appState}
        onResetToSeed={handleReset}
        onRestoreState={handleRestoreState}
        onSimulateLearnerAssessment={() => {
          if (appState.learnerProfile) {
            handleUpdateLearnerProfile({
              ...appState.learnerProfile,
              diagnosticScore: 92,
              skills: appState.learnerProfile.skills.map((s) => ({
                ...s,
                status: 'Mastered',
                progressPct: 100,
                progressPercent: 100,
              })),
            });
          }
        }}
        onClearUploadedDocuments={() => {
          setUploadText('');
          setAnalysisResult(null);
          setAnalysisError(null);
        }}
      />

      {/* Live Analysis & Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-700 text-2xl">document_scanner</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Analyse My Documents with AI</h3>
                  <p className="text-xs text-slate-500">Live Gemini analysis engine & empirical gap diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setUploadType('syllabus')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    uploadType === 'syllabus'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Course Syllabus / Assessment Document
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('job_postings')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    uploadType === 'job_postings'
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Local Job Postings / Employer Text
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste document text or syllabus contents below:
                </label>
                <textarea
                  rows={6}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder={
                    uploadType === 'syllabus'
                      ? 'Paste course curriculum, module outlines, learning objectives, and practical assessment questions...'
                      : 'Paste raw job descriptions, required qualification bullets, or employer interview notes...'
                  }
                  className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Sample button */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setUploadText(
                      `Unit 4: Advanced Structured Query Language (SQL)\n- SELECT statement basics and WHERE conditions\n- Sorting results using ORDER BY\n- Introduction to JOIN operations: INNER JOIN and LEFT JOIN theoretical concept\n- Classroom lecture: 4 hours, Practical lab: 1 hour (Demonstration only)\n- Practical Assessment: Written quiz on query syntax.`
                    )
                  }
                  className="text-teal-700 hover:underline font-medium"
                >
                  Insert Sample Syllabus Excerpt (SQL Module)
                </button>
                <span className="text-slate-400">{uploadText.length} characters</span>
              </div>

              {/* Error or unavailability prompt */}
              {analysisError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    <span>Gemini Server Unavailability Notice</span>
                  </div>
                  <p>{analysisError}</p>
                  <div className="flex items-center gap-2 pt-1 border-t border-amber-200">
                    <button
                      onClick={handleRunLiveAnalysis}
                      className="px-2.5 py-1 bg-amber-700 text-white rounded text-[11px] font-semibold hover:bg-amber-800"
                    >
                      Retry Analysis
                    </button>
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        setActiveTab('course-alignment');
                      }}
                      className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded text-[11px] font-semibold hover:bg-amber-50"
                    >
                      Switch to Sample Demonstration
                    </button>
                  </div>
                </div>
              )}

              {/* Result Preview */}
              {analysisResult && (
                <div className="p-4 bg-teal-50 border border-teal-300 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      AI-generated draft — review required
                    </span>
                    <span className="text-[10px] font-mono text-teal-700">Model: gemini-2.5-flash</span>
                  </div>
                  <div className="text-xs text-slate-800 font-mono bg-white p-3 rounded-lg border border-teal-200 max-h-48 overflow-y-auto leading-relaxed">
                    {JSON.stringify(analysisResult, null, 2)}
                  </div>
                  <p className="text-[11px] text-teal-800">
                    You can inspect these mapped recommendations and incorporate them into the active course alignment matrix.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500">
                Data processed in this session is kept client-side.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing || !uploadText.trim()}
                  onClick={handleRunLiveAnalysis}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 transition ${
                    isAnalyzing || !uploadText.trim()
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-teal-700 hover:bg-teal-800'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      <span>Analysing with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">auto_awesome</span>
                      <span>Run AI Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
