import React from 'react';
import { NavTab } from './Sidebar';
import { DemoRole } from '../types';

export interface WalkthroughStep {
  step: number;
  title: string;
  instruction: string;
  targetTab: NavTab;
  requiredRole?: DemoRole;
  actionHint: string;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    step: 1,
    title: 'Open Priority Course',
    instruction: 'From the Overview dashboard, locate and open "Entry-Level Data Analytics" in the Priority Course Intervention Queue.',
    targetTab: 'overview',
    requiredRole: 'district_admin',
    actionHint: 'Click "Review Course" on Entry-Level Data Analytics.',
  },
  {
    step: 2,
    title: 'Inspect SQL Demand Evidence',
    instruction: 'In the Demand Explorer, inspect the 412 verified Pune IT job postings highlighting the urgent demand for multi-table SQL queries.',
    targetTab: 'demand-explorer',
    requiredRole: 'district_admin',
    actionHint: 'Review SQL Joins & Aggregations frequency (88%) and click "Compare with Course".',
  },
  {
    step: 3,
    title: 'Confirm Practical Assessment Gap',
    instruction: 'In Course Alignment, inspect the triangulation drawer showing theory is taught (Unit 3.2) but 0 hands-on labs exist.',
    targetTab: 'course-alignment',
    requiredRole: 'institute_coordinator',
    actionHint: 'Click "Confirm Gap" on the SQL Joins row.',
  },
  {
    step: 4,
    title: 'Inspect Join-and-Clean Remediation Lab',
    instruction: 'Review the Proposed Module Remediation (Add-on Lab 4B) providing 16 hours of hands-on query labs offset by compressing legacy MS-Access.',
    targetTab: 'course-alignment',
    requiredRole: 'institute_coordinator',
    actionHint: 'Verify the Net-Zero budget impact and target competencies.',
  },
  {
    step: 5,
    title: 'Submit for Employer Review',
    instruction: 'Submit the proposed curriculum intervention package to the Hinjawadi Technology Employers Association.',
    targetTab: 'course-alignment',
    requiredRole: 'institute_coordinator',
    actionHint: 'Click "Submit for Employer Review" and confirm transmission.',
  },
  {
    step: 6,
    title: 'Switch to Employer and Accept',
    instruction: 'Switch to the Employer Reviewer role and accept Remediation Lab 4B with the industry calibration note.',
    targetTab: 'employer-review',
    requiredRole: 'employer_reviewer',
    actionHint: 'Click "Submit Employer Validation (Accept with 1 Note)".',
  },
  {
    step: 7,
    title: 'Review District Training Plan & Feasibility',
    instruction: 'Switch back to District Admin to review quotas across Pune institutes and verify lab PC readiness and trainer certification.',
    targetTab: 'district-training-plan',
    requiredRole: 'district_admin',
    actionHint: 'Inspect the 8 PCs RAM warning at Dnyaneshwar ITI and the trainer orientation pre-condition.',
  },
  {
    step: 8,
    title: 'Approve District Plan with Conditions',
    instruction: 'Sanction the FY26 Q1 training plan with the 15 March trainer orientation condition recorded.',
    targetTab: 'district-training-plan',
    requiredRole: 'district_admin',
    actionHint: 'Click "Submit for Council Approval".',
  },
  {
    step: 9,
    title: 'Open Updated Learner Pathway',
    instruction: 'Switch to Learner (Rohan Deshmukh) to see how the approved Add-on Lab 4B bridges his diagnostic gap.',
    targetTab: 'learner-pathway',
    requiredRole: 'learner',
    actionHint: 'Inspect Stage 2 enrollment in Add-on Module 4B and reserve his test slot.',
  },
  {
    step: 10,
    title: 'Download Plan & Evidence Dossier',
    instruction: 'Conclude the demonstration by downloading the verifiable audit dossier and training plan CSV.',
    targetTab: 'outcomes-and-evidence',
    requiredRole: 'district_admin',
    actionHint: 'Click "Export Audit Dossier (JSON/CSV)".',
  },
];

interface GuidedDemoBannerProps {
  currentStepIndex: number; // 0 to 9
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onClose?: () => void;
  onGoToStep?: (stepNumber: number) => void;
  onStepChange?: (stepIdx: number) => void;
  currentRole?: DemoRole;
  onRoleChange?: (newRole: DemoRole) => void;
  onOpenDemoTools?: () => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  isSidebarOpen?: boolean;
}

export const GuidedDemoBanner: React.FC<GuidedDemoBannerProps> = ({
  currentStepIndex,
  onNextStep,
  onPrevStep,
  onClose,
  onGoToStep,
  onStepChange,
  currentRole,
  onRoleChange,
  onOpenDemoTools,
  isVisible = true,
  onToggleVisibility,
  isSidebarOpen = true,
}) => {
  if (isVisible === false) return null;

  const current = WALKTHROUGH_STEPS[currentStepIndex] || WALKTHROUGH_STEPS[0];
  const progressPercent = ((currentStepIndex + 1) / WALKTHROUGH_STEPS.length) * 100;

  const handleNext = () => {
    if (onNextStep) onNextStep();
    else if (onStepChange && currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
      onStepChange(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (onPrevStep) onPrevStep();
    else if (onStepChange && currentStepIndex > 0) {
      onStepChange(currentStepIndex - 1);
    }
  };

  const handleJump = (stepNum: number) => {
    if (onGoToStep) onGoToStep(stepNum);
    else if (onStepChange) onStepChange(stepNum - 1);
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 bg-[#1c2a3c] text-white rounded-xl shadow-2xl border border-teal-500/30 p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
        isSidebarOpen ? 'lg:left-[276px] lg:right-6' : 'lg:left-6 lg:right-6'
      }`}
    >
      {/* Top progress indicator */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#89f5e7] animate-pulse"></span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-bold">
            Guided Demo Walkthrough • Step {current.step} of 10
          </span>
          <span className="text-white/40">|</span>
          <span className="text-xs text-white/80 font-medium hidden sm:inline">
            Role: <strong className="text-teal-200">{current.requiredRole?.replace('_', ' ') || 'Any'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleJump(current.step)}
            className="text-[11px] px-2.5 py-1 bg-teal-600/60 hover:bg-teal-600 text-teal-100 rounded font-medium transition-colors flex items-center gap-1"
          >
            <span>Jump to View</span>
            <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
          </button>
          <button
            onClick={onClose || onToggleVisibility || (() => {})}
            className="text-white/60 hover:text-white p-1 rounded transition-colors"
            title="Close Walkthrough"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-1 rounded-full mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-teal-400 to-[#89f5e7] h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Content and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">{current.title}:</span>
            <span className="text-xs text-teal-200 font-medium truncate">{current.actionHint}</span>
          </div>
          <p className="text-xs text-white/75 mt-0.5 line-clamp-2 leading-relaxed">
            {current.instruction}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-white/5 text-white/50'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-[#00685f] hover:bg-[#008378] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>{currentStepIndex === WALKTHROUGH_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
            <span className="material-symbols-outlined text-[16px]">
              {currentStepIndex === WALKTHROUGH_STEPS.length - 1 ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
