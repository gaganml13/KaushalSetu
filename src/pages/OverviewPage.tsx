import React, { useState, useMemo } from 'react';
import { AppState } from '../types';
import { NavTab } from '../components/Sidebar';
import { getDistrictDemandSummary } from '../utils/selectors';

interface OverviewPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ appState, onNavigate }) => {
  const [courseFilter, setCourseFilter] = useState<'all' | 'employer_review' | 'capacity_alert' | 'evaluation'>('all');

  const district = appState.currentDistrict;
  const sector = appState.currentSector;

  // Use unified selector for consistent metrics across pages
  const demandSummary = useMemo(
    () => getDistrictDemandSummary(appState.evidenceRecords, district, sector),
    [appState.evidenceRecords, district, sector]
  );

  const confirmedGapsCount = appState.skillMappings.filter((m) => m.isConfirmedGap).length;
  const pendingReviewsCount = appState.employerReviews.length;

  const totalAllocatedSeats = appState.trainingPlan.instituteAllocations.reduce(
    (sum, a) => sum + a.proposedSeats,
    0
  );

  const priorityCourses = [
    {
      id: 'course-data-analytics',
      title: 'Entry-Level Data Analytics',
      code: 'MH-PUN-IT-04',
      nsqfLevel: 'NSQF Level 4 (Proposed Draft)',
      role: 'Junior Data Analyst',
      gapDescription: 'SQL joins & practical data cleaning missing from practical lab assessments',
      gapType: 'Practical Gap',
      gapSeverity: 'error',
      evidenceStatus: `${demandSummary.totalEvidenceRecords} employer signals • Review active`,
      category: 'employer_review',
    },
    {
      id: 'course-web-dev',
      title: 'Web Development Basics',
      code: 'MH-PUN-IT-02',
      nsqfLevel: 'NSQF Level 3 (Proposed Draft)',
      role: 'Frontend Developer',
      gapDescription: 'Git version control workflow missing from lab rubric',
      gapType: 'Tooling Update',
      gapSeverity: 'secondary',
      evidenceStatus: 'Under review',
      category: 'capacity_alert',
    },
    {
      id: 'course-cloud-ops',
      title: 'Cloud Operations Assistant',
      code: 'MH-PUN-IT-09',
      nsqfLevel: 'NSQF Level 5 (Proposed Draft)',
      role: 'Junior DevOps Associate',
      gapDescription: 'Container runtime coverage and Linux scripting evaluation insufficient',
      gapType: 'Infrastructure Gap',
      gapSeverity: 'tertiary',
      evidenceStatus: 'Evidence gathering',
      category: 'evaluation',
    },
  ];

  const filteredCourses = priorityCourses.filter((c) => {
    if (courseFilter === 'all') return true;
    return c.category === courseFilter;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Context & Header Block */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Skill Development Platform</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span>District Operations</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-semibold">{district} Dashboard</span>
          </nav>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 rounded-md text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
            <span className="font-mono text-slate-700 font-medium">Demonstration Region: {district} ({sector})</span>
          </div>
        </div>

        {/* Master Card Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex flex-col max-w-3xl">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {district} Skills Demand & Training Overview
              </h1>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-semibold">
                Q4 FY25-26
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Operational queue across {appState.trainingPlan.instituteAllocations.length} participating vocational institutes in {district} district. Derived from local demand signals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('course-alignment')}
              className="h-9 px-4 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>Review priority course</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <button
              onClick={() => onNavigate('demand-explorer')}
              className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">search_insights</span>
              <span>Explore demand</span>
            </button>
          </div>
        </div>
      </div>

      {/* Four Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Active Role Signals */}
        <div
          onClick={() => onNavigate('demand-explorer')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-teal-500 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sample Role Signals</span>
            <span className="material-symbols-outlined text-[#00685f] text-[20px] p-1.5 bg-emerald-50 rounded-lg group-hover:scale-105 transition-transform">
              trending_up
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{demandSummary.availableRoles.length}</span>
              <span className="text-sm text-slate-600 font-medium">Designations</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#00685f] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              <span>{demandSummary.totalEvidenceRecords} supporting evidence records</span>
            </div>
          </div>
          <div className="pt-2 bg-slate-50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl border-t border-slate-100">
            <p className="font-mono text-[11px] text-slate-500">{demandSummary.totalSamplePostings} sample openings analyzed</p>
          </div>
        </div>

        {/* Card 2: Courses Requiring Review */}
        <div
          onClick={() => onNavigate('course-alignment')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Courses Requiring Review</span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] p-1.5 bg-red-50 rounded-lg group-hover:scale-105 transition-transform">
              assignment_late
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{priorityCourses.length}</span>
              <span className="text-sm text-slate-600 font-medium">Courses</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[#ba1a1a] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">priority_high</span>
              <span>{confirmedGapsCount} confirmed practical gaps</span>
            </div>
          </div>
          <div className="pt-2 bg-slate-50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl border-t border-slate-100">
            <p className="font-mono text-[11px] text-slate-500 truncate">Priority: Entry-Level Data Analytics</p>
          </div>
        </div>

        {/* Card 3: Employer Reviews Pending */}
        <div
          onClick={() => onNavigate('employer-review')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-amber-400 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Employer Reviews</span>
            <span className="material-symbols-outlined text-amber-700 text-[20px] p-1.5 bg-amber-50 rounded-lg group-hover:scale-105 transition-transform">
              pending_actions
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{pendingReviewsCount}</span>
              <span className="text-sm text-slate-600 font-medium">Queue</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-amber-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              <span>{appState.recommendation.status === 'accepted' ? 'Accepted by employer' : 'Review in progress'}</span>
            </div>
          </div>
          <div className="pt-2 bg-slate-50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl border-t border-slate-100">
            <p className="font-mono text-[11px] text-slate-500 truncate">
              {demandSummary.distinctEmployersCount} organizations in {district}
            </p>
          </div>
        </div>

        {/* Card 4: Training Plans Awaiting Approval */}
        <div
          onClick={() => onNavigate('district-training-plan')}
          className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:border-slate-400 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">District Training Plan</span>
            <span className="material-symbols-outlined text-slate-700 text-[20px] p-1.5 bg-slate-100 rounded-lg group-hover:scale-105 transition-transform">
              approval
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">{totalAllocatedSeats}</span>
              <span className="text-sm text-slate-600 font-medium">Allocated Seats</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-slate-700 text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px]">checklist</span>
              <span>Target: {appState.trainingPlan.targetSeats} seats ({appState.trainingPlan.status.replace('_', ' ')})</span>
            </div>
          </div>
          <div className="pt-2 bg-slate-50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl border-t border-slate-100">
            <p className="font-mono text-[11px] text-slate-500">
              Est. budget: ₹{appState.trainingPlan.estimatedBudgetLakhs}L ({appState.trainingPlan.instituteAllocations.length} centers)
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Analytical & Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Horizontal Skill-Frequency Chart */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Most Requested Skills in {district} ({sector} Sample)
                </h2>
                <div className="group relative cursor-pointer flex items-center">
                  <span className="material-symbols-outlined text-slate-400 text-[16px]">info</span>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-30 leading-snug">
                    Skill mentions: Count of times each skill is evidenced in matching records for {district}.
                  </div>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                Q4 Demo Snapshot
              </span>
            </div>

            {/* Horizontal Frequency Bars */}
            <div className="flex flex-col gap-4 mt-4">
              {demandSummary.skills.map((skillItem) => {
                const mapping = appState.skillMappings.find((m) => m.skillName.toLowerCase().includes(skillItem.skill.toLowerCase()));
                const isGap = mapping?.isConfirmedGap;

                return (
                  <div key={skillItem.skill} className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-semibold text-slate-900">{skillItem.skill}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-500">{skillItem.samplePostings} sample postings</span>
                        <span className={`font-bold tabular-nums ${isGap ? 'text-red-700' : 'text-[#00685f]'}`}>
                          {skillItem.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isGap ? 'bg-[#ba1a1a]' : 'bg-[#00685f]'
                        }`}
                        style={{ width: `${skillItem.percentage}%` }}
                      />
                    </div>

                    <span className={`text-[11px] font-medium ${isGap ? 'text-red-700 font-semibold' : 'text-slate-500'}`}>
                      {isGap
                        ? 'Confirmed practical assessment deficit in current syllabus'
                        : 'Covered in existing syllabus theory & exercises'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanatory Footnote */}
          <div className="pt-3 mt-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-slate-400">tune</span>
              Chart derived from {demandSummary.totalEvidenceRecords} sample evidence records across {district}.
            </span>
            <button
              onClick={() => onNavigate('demand-explorer')}
              className="text-[#00685f] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Drill down</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Data Coverage & Limitations Panel */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[20px]">fact_check</span>
                <h2 className="text-base font-bold text-slate-900">Data Coverage & Sample Transparency</h2>
              </div>
              <span className="text-[11px] text-[#00685f] px-2 py-0.5 bg-emerald-50 rounded font-mono font-bold">
                Interactive Prototype
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 mb-4">
              Transparency report on evidence inputs supporting skill development planning for {district}.
            </p>

            {/* Checklist */}
            <div className="flex flex-col gap-2.5">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">dataset</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Sample Sources Included</span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Sample job aggregator records combined with regional employer interview questionnaires from {demandSummary.distinctEmployersCount} organizations.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">history</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Data Time Horizon</span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Snapshot cohort period: <strong className="text-slate-900 font-mono">Q4 FY25-26</strong>. Represents a demonstration seed snapshot for interactive evaluation.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">verified_user</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900">Curriculum Grounding</span>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Compared against the public MSBTE vocational curriculum standard v2.1.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Limitation Notice */}
          <div className="mt-4 p-3 bg-amber-50 text-slate-900 rounded-lg border border-amber-200/60 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0">info</span>
            <div className="flex flex-col text-xs leading-snug">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px]">Sample Data Notice</span>
              <p className="text-amber-800 mt-0.5">
                Records are illustrative demonstration samples stored browser-locally. This prototype demonstrates demand-driven training workflows without live government database links.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Course Intervention Queue */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Priority Course Intervention Queue</h2>
              <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded border border-red-200">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by confirmed practical deficits between local employer expectations and institutional syllabi.
            </p>
          </div>

          {/* Course filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                courseFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setCourseFilter('employer_review')}
              className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                courseFilter === 'employer_review' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Review
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Course Title & Code</th>
                <th className="py-2.5 px-3">Target Role</th>
                <th className="py-2.5 px-3">Diagnosed Deficit</th>
                <th className="py-2.5 px-3">Evidence Basis</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredCourses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{c.code} • {c.nsqfLevel}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{c.role}</td>
                  <td className="py-3 px-3">
                    <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {c.gapDescription}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{c.evidenceStatus}</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onNavigate('course-alignment')}
                      className="px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white rounded font-semibold text-xs transition cursor-pointer"
                    >
                      Review Alignment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
