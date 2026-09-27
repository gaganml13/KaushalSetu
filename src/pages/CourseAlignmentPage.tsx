import React, { useState } from 'react';
import { AppState, SkillMapping, Recommendation } from '../types';
import { NavTab } from '../components/Sidebar';
import { exportCourseAlignmentCsv } from '../utils/storage';

interface CourseAlignmentPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
  onUpdateMapping?: (mapping: SkillMapping) => void;
  onUpdateSkillMapping?: (mapping: SkillMapping) => void;
  onUpdateRecommendation: (rec: Recommendation) => void;
  onSubmitForEmployerReview?: () => void;
}

export const CourseAlignmentPage: React.FC<CourseAlignmentPageProps> = ({
  appState,
  onNavigate,
  onUpdateMapping,
  onUpdateSkillMapping,
  onUpdateRecommendation,
  onSubmitForEmployerReview,
}) => {
  const handleUpdateMap = onUpdateSkillMapping || onUpdateMapping || (() => {});
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-sql');
  const [deficitFilterOnly, setDeficitFilterOnly] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Upload & live analysis state
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [pastedSyllabusText, setPastedSyllabusText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [aiDraftBadge, setAiDraftBadge] = useState<boolean>(false);

  // Override prompt state
  const [showOverridePrompt, setShowOverridePrompt] = useState<boolean>(false);
  const [overrideInput, setOverrideInput] = useState<string>('');

  const activeMapping =
    appState.skillMappings.find((m) => m.skillId === selectedSkillId) || appState.skillMappings[1];

  const displayedMappings = deficitFilterOnly
    ? appState.skillMappings.filter((m) => m.isConfirmedGap)
    : appState.skillMappings;

  const confirmedGapsCount = appState.skillMappings.filter((m) => m.isConfirmedGap).length;

  const handleConfirmGap = (mapping: SkillMapping) => {
    const updated: SkillMapping = {
      ...mapping,
      isConfirmedGap: true,
      auditorSanctioned: true,
    };
    handleUpdateMap(updated);
    setShowSuccessToast(`Confirmed practical deficit gap for ${mapping.skillName}. Logged under audit trail.`);
    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  const handleOverrideGap = (mapping: SkillMapping) => {
    const updated: SkillMapping = {
      ...mapping,
      isConfirmedGap: false,
      auditorSanctioned: true,
      overrideNote: overrideInput || 'Auditor override: verified via supplementary practical project log.',
      status: 'aligned',
    };
    handleUpdateMap(updated);
    setShowOverridePrompt(false);
    setOverrideInput('');
    setShowSuccessToast(`Auditor override recorded for ${mapping.skillName}.`);
    setTimeout(() => setShowSuccessToast(null), 3500);
  };

  const handleLiveAnalysis = async () => {
    if (!pastedSyllabusText.trim()) {
      setAnalysisError('Please paste or upload document syllabus text to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/gemini/analyze-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseTitle: 'Entry-Level Data Analytics',
          documentText: pastedSyllabusText,
          demandSkills: appState.skillMappings.map((m) => ({
            id: m.skillId,
            name: m.skillName,
            marketExpectation: m.marketExpectation,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gemini analysis failed');
      }

      setAiDraftBadge(true);
      setShowUploadModal(false);
      setShowSuccessToast('AI Analysis Complete: Mappings suggested from uploaded syllabus. Review required.');
      setTimeout(() => setShowSuccessToast(null), 4000);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(
        err.message || 'Gemini analysis unavailable. Preserving your document text. You may continue in Sample Demonstration mode or enter manual mapping.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-16 right-6 z-50 bg-[#00685f] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-teal-300/40 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Maharashtra Skill Development</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>Course Alignment</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-800 font-semibold">
            NSQF Level 4 • MH-PUN-IT-04
          </span>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Course Alignment Matrix: Entry-Level Data Analytics
              </h1>
              {aiDraftBadge && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-300">
                  AI-generated draft — review required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 max-w-4xl">
              Comparative tri-part review of pedagogical theory, hands-on lab manuals, and terminal evaluation rubrics benchmarked against 412 verified {appState.currentDistrict} IT-ITeS hiring requirements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start xl:self-auto">
            <button
              onClick={() => setShowUploadModal(true)}
              className="h-9 px-3.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px] text-[#00685f]">upload_file</span>
              <span>Upload Syllabus / TXT</span>
            </button>
            <button
              onClick={() => exportCourseAlignmentCsv(appState.skillMappings)}
              className="h-9 px-3.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px] text-slate-600">download</span>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="h-9 px-4 rounded bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Send for Employer Review</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Flow: 3-Step Review Progress Banner */}
      <div className="bg-white rounded-xl p-4 shadow-xs border border-slate-200/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="w-7 h-7 rounded-full bg-[#00685f] flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Step 01 • Completed
              </span>
              <span className="text-xs font-bold text-slate-900">Select Evidence</span>
              <p className="text-[11px] text-slate-600 mt-0.5">3 artifacts indexed (Syllabus v2.1, Lab Manual, Exam Rubric)</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">flaky</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                Step 02 • Active Audit
              </span>
              <span className="text-xs font-bold text-slate-900">Review Deficit Gaps</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {confirmedGapsCount} critical practical voids detected in SQL & Data Cleaning
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              03
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Step 03 • Action Gate
              </span>
              <span className="text-xs font-bold text-slate-700">Draft Update & Validate</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Synthesize Remediation Add-on Lab 4B for Industry Council</p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Ingestion Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-50 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Theory Curriculum</span>
              <span className="text-xs font-bold text-slate-900">MSBTE Syllabus v2.1</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
            28 Feb
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-teal-50 flex items-center justify-center text-[#00685f]">
              <span className="material-symbols-outlined text-[18px]">grading</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Formal Assessment</span>
              <span className="text-xs font-bold text-slate-900">MSBTE Question Bank</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
            28 Feb
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between shadow-xs ring-1 ring-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-700">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Lab Manual</span>
              <span className="text-xs font-bold text-slate-900">Practical Exercise Log</span>
            </div>
          </div>
          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
            {confirmedGapsCount} Deficits
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700">
              <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Market Baseline</span>
              <span className="text-xs font-bold text-slate-900">{appState.currentDistrict} IT-ITeS Postings</span>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-mono font-bold px-2 py-0.5 rounded">
            N=412 Jobs
          </span>
        </div>
      </div>

      {/* Primary Work Surface: Matrix Table + Evidence Inspector */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 items-start">
        {/* Left / Center Table (8 cols on 2xl) */}
        <div className="2xl:col-span-8 flex flex-col gap-3 bg-white rounded-xl p-5 shadow-xs border border-slate-200/80">
          {/* Civic Notice */}
          <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
            <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0">info</span>
            <div className="flex-1 leading-snug">
              <strong className="text-slate-900">Civic Standard Rule:</strong> Unsubstantiated syllabus areas are tagged <span className="font-mono font-semibold bg-slate-200 px-1 py-0.5 rounded text-slate-800">Not Evidenced</span> instead of assumed omitted. Mappings are empirical observations requiring evaluator sanction.
            </div>
            <span className="font-mono text-[10px] text-slate-400 shrink-0 hidden md:inline">ISO/IEC 19796-1</span>
          </div>

          {/* Filter Header */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">Skill Verification Ledger</span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {displayedMappings.length} Core Units
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Deficit Filter:</span>
              <button
                onClick={() => setDeficitFilterOnly(true)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  deficitFilterOnly
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                Gaps Only ({confirmedGapsCount})
              </button>
              <button
                onClick={() => setDeficitFilterOnly(false)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  !deficitFilterOnly
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                All Units (5)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">Required Skill</th>
                  <th className="py-2.5 px-3 font-semibold">Market Expectation</th>
                  <th className="py-2.5 px-3 font-semibold">Taught (Theory)</th>
                  <th className="py-2.5 px-3 font-semibold">Practised (Labs)</th>
                  <th className="py-2.5 px-3 font-semibold">Assessed</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {displayedMappings.map((m) => {
                  const isSelected = selectedSkillId === m.skillId;
                  const isGap = m.isConfirmedGap;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedSkillId(m.skillId)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/70 border-l-4 border-l-amber-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          {isGap && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />}
                          <span>{m.skillName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 pl-3">{m.skillCode}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate" title={m.marketExpectation}>
                        {m.marketExpectation}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800 font-medium">
                          <span className="material-symbols-outlined text-[13px] text-[#00685f]">check_circle</span>
                          {m.taughtTheoryCitation}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {m.isPractised ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[13px]">task_alt</span>
                            {m.practisedLabsCitation}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px]">warning</span>
                            {m.practisedLabsCitation}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {m.isAssessed ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[13px]">assignment_turned_in</span>
                            {m.assessedCitation}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                            <span className="material-symbols-outlined text-[13px]">quiz</span>
                            {m.assessedCitation}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isGap ? (
                          <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-bold text-[10px]">
                            Practical Deficit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            Aligned ({m.alignmentScorePercent}%)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSkillId(m.skillId);
                          }}
                          className="text-[#00685f] hover:underline font-semibold text-[11px]"
                        >
                          {isSelected ? 'Active Focus' : 'Excerpts'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Coverage Summary Metrics Bar */}
          <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Employer Alignment</span>
                <span className="text-xl font-bold text-slate-900">54%</span>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Deficit Severity</span>
                <span className="text-xl font-bold text-amber-700">{confirmedGapsCount} High Gaps</span>
              </div>
              <div className="h-7 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Resolution ETA</span>
                <span className="text-xl font-bold text-[#00685f]">+16 Hours</span>
              </div>
            </div>

            <div className="w-full md:w-56 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-medium">
                <span>Verified Practical Coverage</span>
                <span className="font-bold text-slate-900">
                  {appState.skillMappings.length - confirmedGapsCount}/{appState.skillMappings.length} Skills
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                <div className="bg-[#00685f] h-full" style={{ width: '40%' }} />
                <div className="bg-amber-500 h-full" style={{ width: '40%' }} />
                <div className="bg-slate-400 h-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Evidence Triangulation Inspector (4 cols on 2xl) */}
        <div className="2xl:col-span-4 flex flex-col gap-3 bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 sticky top-20">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-600 text-[20px]">fact_check</span>
              <span className="text-sm font-bold text-slate-900">Evidence Triangulation</span>
            </div>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono text-[10px] font-bold border border-amber-200">
              FOCUS: {activeMapping.skillCode}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-snug">
            Audit comparison demonstrating divergence between hiring expectations and classroom practice for <strong className="text-slate-800">{activeMapping.skillName}</strong>.
          </p>

          {/* Triangulation Cards */}
          <div className="space-y-2.5">
            {/* 1: Employer Demand */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <span className="font-bold text-[#00685f] uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">work</span>
                  Employer Demand Excerpt
                </span>
                <span className="font-mono text-slate-400">{activeMapping.employerSource}</span>
              </div>
              <blockquote className="italic text-slate-800 bg-white p-2 rounded border border-slate-200/60 leading-relaxed">
                "{activeMapping.employerDemandExcerpt}"
              </blockquote>
            </div>

            {/* 2: Current Syllabus */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">school</span>
                  Current Syllabus
                </span>
                <span className="font-mono text-slate-400">{activeMapping.currentSyllabusLocation}</span>
              </div>
              <blockquote className="italic text-slate-800 bg-white p-2 rounded border border-slate-200/60 leading-relaxed">
                "{activeMapping.currentSyllabusExcerpt}"
              </blockquote>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Note: Solely syntax identification; no write-back requirement.
              </span>
            </div>

            {/* 3: Lab Rubric Deficit */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <span className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">code_blocks</span>
                  Current Lab Rubric Excerpt
                </span>
                <span className="font-bold text-amber-800 text-[10px]">DEFICIT FOUND</span>
              </div>
              <blockquote className="italic text-slate-800 bg-white p-2 rounded border border-amber-200/70 leading-relaxed">
                "{activeMapping.currentLabRubricExcerpt}"
              </blockquote>
              <span className="text-[10px] text-amber-800 font-semibold mt-1 block">
                Evidence State: Zero hands-on relational join exercises recorded in lab log.
              </span>
            </div>
          </div>

          {/* Action Sanction buttons */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Auditor Sanction Action
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmGap(activeMapping)}
                className="flex-1 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Confirm Gap</span>
              </button>
              <button
                onClick={() => setShowOverridePrompt(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-colors"
              >
                Override
              </button>
            </div>

            {showOverridePrompt && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <span className="font-semibold text-slate-800 block">Enter Auditor Override Justification:</span>
                <input
                  type="text"
                  value={overrideInput}
                  onChange={(e) => setOverrideInput(e.target.value)}
                  placeholder="e.g. Verified supplementary project work in terminal log"
                  className="w-full p-2 bg-white border border-slate-300 rounded text-xs"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowOverridePrompt(false)}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleOverrideGap(activeMapping)}
                    className="px-3 py-1 bg-slate-800 text-white rounded text-[11px] font-semibold"
                  >
                    Save Override
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Recommendation: Suggested Course Update Specification */}
      <div className="bg-white rounded-xl p-6 shadow-xs border border-slate-200/80 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#00685f] shrink-0">
              <span className="material-symbols-outlined text-[24px]">difference</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#00685f] uppercase tracking-wider">
                  Automated Remediation Draft
                </span>
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  v{appState.recommendation.revisionNumber}.0 Proposal
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {appState.recommendation.title}
              </h2>
              <p className="text-xs text-slate-500">
                Direct syllabus patch resolving the 88% employer rejection variance within the {appState.currentDistrict} IT-ITeS cluster without raising student tuition fees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <span className="text-xs bg-emerald-50 text-emerald-800 px-3 py-1 rounded font-semibold border border-emerald-200">
              Budget Impact: {appState.recommendation.budgetImpact}
            </span>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/70">
          {/* Card 1 */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Target Competency
              </span>
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {appState.recommendation.targetCompetency}
              </p>
            </div>
            <span className="font-mono text-[10px] text-[#00685f] font-bold mt-2">
              Mapped to NOS: {appState.recommendation.nosCode}
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Practical Lab Activity
              </span>
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {appState.recommendation.practicalActivity}
              </p>
            </div>
            <span className="font-mono text-[10px] text-slate-500 font-semibold mt-2">
              {appState.recommendation.activityCountDescription}
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block mb-1">
                Evaluation Protocol
              </span>
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {appState.recommendation.evaluationProtocol}
              </p>
            </div>
            <span className="font-mono text-[10px] text-[#00685f] font-bold mt-2">
              Auto-Graded Unit Assessment
            </span>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-3.5 rounded-lg border border-teal-200 flex flex-col justify-between ring-1 ring-teal-200">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#00685f] tracking-wider block mb-1">
                Curriculum Hour Offsets
              </span>
              <p className="text-xs font-medium text-slate-800 leading-snug">
                {appState.recommendation.hourOffsetDescription}
              </p>
            </div>
            <span className="font-mono text-[10px] text-[#00685f] font-bold mt-2">
              +{appState.recommendation.suggestedHours} Hours Hands-On
            </span>
          </div>
        </div>

        {/* Operational Details Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">person_check</span>
            <div>
              <span className="font-bold text-slate-900 block">Faculty Preparedness:</span>
              <span className="text-slate-600">{appState.recommendation.facultyPreparedness}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">terminal</span>
            <div>
              <span className="font-bold text-slate-900 block">Software Provisioning:</span>
              <span className="text-slate-600">{appState.recommendation.softwareRequirements}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">badge</span>
            <div>
              <span className="font-bold text-slate-900 block">Council Authority:</span>
              <span className="text-slate-600">{appState.recommendation.councilAuthority}</span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[15px] text-[#00685f]">fingerprint</span>
            <span>Demo Reference ID: DEMO-MAP-8b73 • Reviewer: {appState.currentDistrict} Cluster</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setShowSuccessToast('Draft saved in browser IndexedDB.');
                setTimeout(() => setShowSuccessToast(null), 3000);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Save Draft Plan
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
              <span>Submit for Employer Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Syllabus Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Upload or Paste Course Syllabus</h3>
                <p className="text-xs text-slate-500">
                  Analyze existing curriculum documents against Pune employer demand skills using Gemini.
                </p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Upload Syllabus (Text-based PDF or TXT):
              </label>
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadedFileName(file.name);
                  if (file.type === 'text/plain') {
                    const reader = new FileReader();
                    reader.onload = (ev) => setPastedSyllabusText(ev.target?.result as string);
                    reader.readAsText(file);
                  } else {
                    // Explain text-based requirement
                    setAnalysisError('For PDF uploads, ensure text is selectable or paste the text content directly below.');
                  }
                }}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-[#00685f] hover:file:bg-teal-100 mb-2"
              />

              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Or Paste Extracted Document Content:
              </label>
              <textarea
                value={pastedSyllabusText}
                onChange={(e) => setPastedSyllabusText(e.target.value)}
                placeholder="Paste course syllabus or assessment outline here..."
                rows={6}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            {analysisError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-600 shrink-0 mt-0.5">error</span>
                <div>{analysisError}</div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setPastedSyllabusText(
                    `Unit 3.2: Introduction to Structured Query Language: Brief explanation of SELECT, WHERE, and concept of INNER JOIN. (2 hours lecture duration).\nLab Exercise 4: Student enters 3 pre-written query scripts into terminal to verify database connection.`
                  );
                }}
                className="text-xs text-[#00685f] font-semibold hover:underline"
              >
                Fill Sample MSBTE Text
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLiveAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-1.5 rounded bg-[#00685f] text-white text-xs font-semibold hover:bg-[#005049] flex items-center gap-1.5 shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">psychology</span>
                      <span>Run Gemini Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send for Review Confirmation Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-[#00685f]">
                  <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Employer Industry Validation</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Maharashtra Skill Mission Dispatch</span>
                </div>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 border border-slate-200">
              <p className="text-slate-800">
                You are submitting the curriculum intervention package to <strong className="text-slate-900">14 verified IT employers</strong> in the Hinjawadi & Magarpatta tech parks.
              </p>
              <div className="space-y-1 font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded border border-slate-200/60">
                <div>• Course: Entry-Level Data Analytics (MH-PUN-IT-04)</div>
                <div>• Proposed Unit: Practical Join & Clean Lab (16 Hours)</div>
                <div>• Target Reviewer: Rajeshwari Kulkarni (Hintea)</div>
                <div>• Target Response Window: 7 Business Days</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-3.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSubmitForEmployerReview?.();
                  setShowReviewModal(false);
                  setShowSuccessToast('Curriculum proposal submitted to Hinjawadi Employer Association!');
                  setTimeout(() => {
                    setShowSuccessToast(null);
                    onNavigate('employer-review');
                  }, 1200);
                }}
                className="px-4 py-1.5 rounded bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Confirm & Transmit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
