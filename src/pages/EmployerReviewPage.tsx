import React, { useState } from 'react';
import { AppState, EmployerReviewDecision } from '../types';
import { NavTab } from '../components/Sidebar';

interface EmployerReviewPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
  onSubmitDecision?: (decision: EmployerReviewDecision) => void;
  onUpdateReview?: (decision: EmployerReviewDecision) => void;
}

export const EmployerReviewPage: React.FC<EmployerReviewPageProps> = ({
  appState,
  onNavigate,
  onSubmitDecision,
  onUpdateReview,
}) => {
  const handleSubmitDecision = onUpdateReview || onSubmitDecision || (() => {});
  const [package1Decision, setPackage1Decision] = useState<'accept' | 'changes' | 'reject'>('accept');
  const [package2Decision, setPackage2Decision] = useState<'accept' | 'changes' | 'reject'>('changes');

  const [package1Notes, setPackage1Notes] = useState(
    "This directly addresses our biggest hiring complaint. Ensure students also practice LEFT OUTER JOIN where records don't match, as dirty customer joins are standard in entry client projects. Validated by Hinjawadi Tech Taskforce."
  );
  const [package2Notes, setPackage2Notes] = useState(
    'Recommend adding a brief 1-hour session on encoding issues (UTF-8 vs ANSI) since government and local vendor data frequently contains Marathi Unicode text. A candidate who breaks pipeline ingestion due to Devnagari fonts is unusable in municipal projects.'
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmitValidation = () => {
    const decision: EmployerReviewDecision = {
      id: `emp-rev-${Date.now()}`,
      recommendationId: appState.recommendation.id,
      recommendationRevision: appState.recommendation.revisionNumber,
      decision: package1Decision === 'accept' ? 'accept' : 'request_changes',
      reviewerName: 'Rajeshwari Kulkarni',
      reviewerTitle: 'VP Engineering / Tech Taskforce Member',
      reviewerOrg: 'Hinjawadi Technology Employers Association',
      entityId: 'IND-PUN-082',
      feedbackNotes: package1Notes,
      mandatedNote: package2Decision === 'changes' ? package2Notes : undefined,
      reqCode: 'ADD-MOD-UTF8-MARATHI',
      timestamp: `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, Current`,
      digitalSignatureHash: 'DEMO-REV-SIG-2026-e7f2b9',
    };

    handleSubmitDecision(decision);
    setToastMessage('Employer concurrence ratified! Recommendation marked accepted for District Training Plan.');
    setTimeout(() => {
      setToastMessage(null);
      onNavigate('district-training-plan');
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-[#00685f] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-teal-300/40 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Maharashtra Skill Development</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Employer Validation Queue</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded font-semibold">
            Req #EMP-PUN-2026-08
          </span>
        </nav>
        <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-2.5 py-1 rounded text-xs font-semibold border border-amber-200">
          <span className="material-symbols-outlined text-[16px] text-amber-700">schedule</span>
          <span>REVIEW PENDING • DUE IN 3 DAYS</span>
        </div>
      </div>

      {/* Master Header Card */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                Vocational Concurrence
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-mono text-[11px] font-semibold">
                QP: SSC/Q2101 (v3.0)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Employer Review: Entry-Level Data Analytics Curriculum Update
            </h1>
            <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">Target Role:</span> Junior Data Analyst
              <span>•</span>
              <span className="font-semibold text-slate-800">Institute:</span> Government Polytechnic Pune (Aundh) & Nodal IT Centers
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg shrink-0 text-center">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Local Openings</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">737</span>
              <span className="text-[10px] text-[#00685f] font-semibold flex items-center justify-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>+18% MoM
              </span>
            </div>
            <div className="border-x border-slate-200 px-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Modules Flagged</span>
              <span className="text-xl font-bold text-amber-700 tabular-nums">02</span>
              <span className="text-[10px] text-slate-500">Labs 4B & 4C</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase block">Consensus Status</span>
              <span className="text-xl font-bold text-[#00685f] tabular-nums">82%</span>
              <span className="text-[10px] text-slate-500">Consortium Avg</span>
            </div>
          </div>
        </div>

        {/* Identity Provenance Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#00685f] shrink-0 border border-teal-200">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs text-slate-900">
                  Hinjawadi Technology Employers Association
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                  Entity ID: IND-PUN-082
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Designated Reviewer: <strong className="text-slate-800">Rajeshwari Kulkarni</strong> (VP Engineering / Tech Taskforce Member)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 text-xs bg-white px-3 py-1.5 rounded border border-slate-200">
            <span className="material-symbols-outlined text-[16px] text-[#00685f]">assignment</span>
            <span>Simulated Taskforce Session • Review Mode</span>
          </div>
        </div>

        {/* Review disclaimer */}
        <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-lg flex items-start gap-2 text-xs text-teal-900">
          <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">info</span>
          <div>
            <strong>Sample Employer Feedback:</strong> Industry concurrence signals practical labor-market relevance to the District Skill Planning Committee. Verified recommendations guide lab practical updates for incoming student cohorts.
          </div>
        </div>
      </div>

      {/* Review Progression Stepper */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
            Governance Review Progression
          </span>
          <span className="font-mono text-[#00685f] font-semibold">Stage 3 of 5 (Active Gate)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
          {/* Step 1 */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-emerald-800 font-bold text-[10px]">
              <span>01. DRAFTED</span>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            </div>
            <span className="font-bold text-slate-900 block mt-0.5">Nodal Institute</span>
            <span className="text-[11px] text-slate-500">Govt Poly Pune • 24 Feb</span>
          </div>

          {/* Step 2 */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-emerald-800 font-bold text-[10px]">
              <span>02. SUBMITTED</span>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
            </div>
            <span className="font-bold text-slate-900 block mt-0.5">District Cell</span>
            <span className="text-[11px] text-slate-500">DSO Pune Desk • 26 Feb</span>
          </div>

          {/* Step 3 (Active) */}
          <div className="p-2.5 rounded-lg bg-[#00685f] text-white text-xs shadow-xs">
            <div className="flex items-center justify-between text-teal-200 font-bold text-[10px]">
              <span>03. ACTIVE GATE</span>
              <span className="w-2 h-2 rounded-full bg-teal-200 animate-pulse" />
            </div>
            <span className="font-bold text-white block mt-0.5">Employer Concurrence</span>
            <span className="text-[11px] text-teal-100">Hinjawadi Panel Review</span>
          </div>

          {/* Step 4 */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs opacity-75">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[10px]">
              <span>04. CONCILIATION</span>
              <span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span>
            </div>
            <span className="font-bold text-slate-700 block mt-0.5">Intervention Fixes</span>
            <span className="text-[11px] text-slate-400">If changes requested</span>
          </div>

          {/* Step 5 */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs opacity-75">
            <div className="flex items-center justify-between text-slate-400 font-bold text-[10px]">
              <span>05. RATIFICATION</span>
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
            <span className="font-bold text-slate-700 block mt-0.5">District Council</span>
            <span className="text-[11px] text-slate-400">Budget release sanction</span>
          </div>
        </div>
      </div>

      {/* Two Detailed Packages for Review */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Curriculum Intervention Packages for Review</h2>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">
              2 Actionable Items
            </span>
          </div>
          <span className="text-xs text-slate-500">Please assess academic sufficiency against hiring rubrics</span>
        </div>

        {/* PACKAGE 1: SQL Relational Joins */}
        <article className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00685f] text-white flex items-center justify-center font-bold text-xs font-mono">
                4B
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00685f]">
                  Module Remediation Package 01
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Remediation Lab 4B: SQL Relational Joins & Subqueries in Relational Databases
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-xs text-[#00685f] font-semibold">
              <span className="material-symbols-outlined text-[15px]">query_stats</span>
              <span>Demand Match: 88% (412 Postings / 14 Surveys)</span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* 3 Spec Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Proposed Change</span>
                <p className="text-slate-800 leading-snug">
                  Replace <strong>14 hours</strong> of legacy MS Access theory with <strong>16 hours</strong> of hands-on PostgreSQL multi-table query labs.
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Pedagogy: Lab immersion (80/20 split)</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Target Proficiency</span>
                <p className="text-slate-800 leading-snug">
                  <strong>Level 3: Working Knowledge</strong> — Autonomous query creation, multi-table INNER/LEFT joins, handling NULLs in aggregations.
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Rubric: NCVET Descriptor Level 4.5</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Practical Assessment</span>
                <p className="text-slate-800 leading-snug">
                  <strong>45-minute timed challenge:</strong> Synthetic 15,000-row customer-order dataset requiring query execution with missing join keys.
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Auto-graded via SQL Sandbox</span>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Industry Concurrence Decision (Package 4B)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPackage1Decision('accept')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package1Decision === 'accept'
                      ? 'bg-[#00685f] text-white border-[#00685f] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Accept as Proposed</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded font-mono">Validated</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPackage1Decision('changes')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package1Decision === 'changes'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    <span>Request Minor Modifications</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackage1Decision('reject')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package1Decision === 'reject'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Not Relevant to Local Need</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Comment Area */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-[#00685f]">rate_review</span>
                  Industry Feedback & Calibration Notes
                </span>
                <span className="text-[11px] font-mono text-[#00685f]">Appended to Ratification Record</span>
              </div>
              <textarea
                rows={2}
                value={package1Notes}
                onChange={(e) => setPackage1Notes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Signatory: Rajeshwari Kulkarni (ID: HTEA-PUN-082-RK)</span>
                <span className="text-[#00685f] font-bold">Confidence Score: 95/100</span>
              </div>
            </div>
          </div>
        </article>

        {/* PACKAGE 2: Practical Data Cleaning */}
        <article className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs font-mono">
                4C
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Module Remediation Package 02
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Remediation Lab 4C: Practical Data Cleaning & Missing Value Imputation
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded text-xs text-amber-700 font-semibold">
              <span className="material-symbols-outlined text-[15px]">analytics</span>
              <span>Demand Match: 79% (325 Postings / Hinjawadi Cluster)</span>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* 3 Spec Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Proposed Change</span>
                <p className="text-slate-800 leading-snug">
                  <strong>8-hour practical lab</strong> covering Excel Power Query & basic Python/Pandas handling dirty dates, text trimming, and duplicate rows.
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Tools: Power Query + Pandas v2.1</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Target Proficiency</span>
                <p className="text-slate-800 leading-snug">
                  <strong>Level 2: Guided Execution</strong> — Handling realistic messy CSVs, formatting anomalies, and structured missing values.
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Threshold: 85% imputation accuracy</span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1">Practical Assessment</span>
                <p className="text-slate-800 leading-snug">
                  Deliver a cleaned dataset passing standard automated validation rules (zero duplicates, standardized ISO dates, correct numerical casting).
                </p>
                <span className="font-mono text-[10px] text-slate-400 mt-2 block">Verification: Scripted PyTest Harness</span>
              </div>
            </div>

            {/* Decision Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Industry Concurrence Decision (Package 4C)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPackage2Decision('accept')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package2Decision === 'accept'
                      ? 'bg-[#00685f] text-white border-[#00685f] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Accept as Proposed</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPackage2Decision('changes')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package2Decision === 'changes'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                    <span>Request Minor Changes</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded font-mono">Action Required</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPackage2Decision('reject')}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
                    package2Decision === 'reject'
                      ? 'bg-red-700 text-white border-red-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Not Relevant to Local Need</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mandated Note Box */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-amber-700">warning</span>
                  Mandated Curricular Revision Note
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-800">Condition for Concurrence</span>
              </div>
              <textarea
                rows={2}
                value={package2Notes}
                onChange={(e) => setPackage2Notes(e.target.value)}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-amber-800 font-medium">Flagged by: Industry Technical Reviewer (Pune Cluster)</span>
                <span className="font-mono text-slate-500 font-semibold">Req Code: ADD-MOD-UTF8-MARATHI</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Institutional Audit Trail */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-600 text-[20px]">history_edu</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Institutional Review History & Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Activity history of curriculum reviews and employer concurrence events</p>
            </div>
          </div>
          <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Audit Reference: DEMO-AUD-d9a4
          </span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Date & Timestamp</th>
                <th className="py-2.5 px-3">Actor / Institution</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Official Notes & Evidence</th>
                <th className="py-2.5 px-3 text-right">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {appState.auditTrail.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {ev.timestamp}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                    {ev.actor}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {ev.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-sm">
                    {ev.notes}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#00685f] font-semibold text-[10px] border border-emerald-200">
                      ✓ {ev.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statutory Clarification banner */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
        <span className="material-symbols-outlined text-slate-600 text-[18px] shrink-0 mt-0.5">gavel</span>
        <div className="leading-relaxed">
          <strong className="text-slate-900">Clarification:</strong> Employer acceptance validates vocational relevance, tool choices, and practical assessment rigor. Final administrative sanction, trainer honorarium allocations, and batch scheduling belong to the <strong>District Skill Committee ({appState.currentDistrict})</strong> in accordance with regional vocational planning guidelines.
        </div>
      </div>

      {/* Persistent Execution Action Bar */}
      <div className="sticky bottom-4 z-30 bg-[#213145] text-white p-4 rounded-xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-teal-300 shrink-0">
            <span className="material-symbols-outlined text-[18px]">fingerprint</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-white/70 font-medium">
              <span>Demo Concurrence Reference</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
            </div>
            <span className="font-mono text-xs text-teal-200 font-semibold tracking-wide">
              DEMO-REV-2026-9810 <span className="text-white/50 font-normal">| Simulated reviewer submission</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => onNavigate('course-alignment')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors"
          >
            Request Institute Clarification
          </button>
          <button
            onClick={handleSubmitValidation}
            className="px-5 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Submit Employer Validation (Accept with 1 Note)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
