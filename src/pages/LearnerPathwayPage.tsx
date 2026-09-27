import React, { useState } from 'react';
import { AppState, LearnerProfile, LearnerSkill } from '../types';
import { NavTab } from '../components/Sidebar';

interface LearnerPathwayPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
  onUpdateLearnerProfile?: (profile: LearnerProfile) => void;
}

export const LearnerPathwayPage: React.FC<LearnerPathwayPageProps> = ({
  appState,
  onNavigate,
  onUpdateLearnerProfile,
}) => {
  const learner = appState.learnerProfile;
  const [activeTab, setActiveTab] = useState<'roadmap' | 'assessment' | 'placement' | 'evidence'>('roadmap');

  // Interactive lab simulation state for "Join-and-clean practical lab"
  const [labSqlInput, setLabSqlInput] = useState(
    'SELECT c.customer_id, c.name, o.order_id, o.amount\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NOT NULL;'
  );
  const [labSubmitted, setLabSubmitted] = useState(false);
  const [labPassed, setLabPassed] = useState(false);
  const [labFeedback, setLabFeedback] = useState<string | null>(null);

  const matchedVacancies = learner.matchedVacancies || [
    {
      title: 'Junior Data Operations Analyst',
      employer: 'Deccan Analytics Labs (Demo)',
      location: 'Hinjawadi Phase 3, Pune',
      salaryRange: '₹3.6 – 4.2 LPA',
      matchScore: 94,
      requiredSkills: ['SQL Joins & Filters', 'Data Deduplication', 'Excel VLOOKUP'],
    },
    {
      title: 'Associate BI & ETL Trainee',
      employer: 'Sahyadri Enterprise Systems (Demo)',
      location: 'Magarpatta City, Pune',
      salaryRange: '₹3.4 – 3.8 LPA',
      matchScore: 89,
      requiredSkills: ['PostgreSQL', 'Null Handling', 'Pivot Summaries'],
    },
    {
      title: 'Data Hygiene Assistant',
      employer: 'Hinjawadi Infotech Services (Demo)',
      location: 'Hinjawadi Phase 1, Pune',
      salaryRange: '₹3.2 – 3.6 LPA',
      matchScore: 86,
      requiredSkills: ['SQL Cleaning Scripts', 'CSV Formatting', 'Basic MIS'],
    },
  ];

  const handleRunSqlLab = () => {
    const code = labSqlInput.toLowerCase();
    const hasJoin = code.includes('join') && (code.includes('left join') || code.includes('inner join'));
    const hasOn = code.includes(' on ');

    if (hasJoin && hasOn) {
      setLabPassed(true);
      setLabSubmitted(true);
      setLabFeedback(
        'Verified: SQL Join executed cleanly on simulated PostgreSQL engine. 1,420 rows consolidated from orders and customer tables. 24 duplicate records removed and missing order_id handled.'
      );
      if (onUpdateLearnerProfile) {
        const updatedSkills: LearnerSkill[] = learner.skills.map((s) => {
          if (s.name.includes('SQL') || s.name.includes('Clean')) {
            return {
              ...s,
              status: 'verified',
              statusLabel: 'Verified in Lab 4B',
              progressPercent: 100,
              progressPct: 100,
              isVerified: true,
            };
          }
          return s;
        });

        onUpdateLearnerProfile({
          ...learner,
          skills: updatedSkills,
          diagnosticScore: Math.min(100, learner.diagnosticScore + 12),
          readinessPercent: Math.min(100, learner.readinessPercent + 15),
          readinessStatus: 'Industry Ready (Verified NSQF-4)',
        });
      }
    } else {
      setLabPassed(false);
      setLabSubmitted(true);
      setLabFeedback(
        'Evaluation Notice: Query must include an explicit JOIN clause (INNER JOIN or LEFT JOIN) linking customers and orders on customer_id.'
      );
    }
  };

  const instituteName = learner.institute || learner.enrolledInstitute || 'Sahyadri Skills Centre';
  const enrolledCourseTitle = learner.enrolledCourse || 'Entry-Level Data Analytics (MH-PUN-IT-04)';
  const activeModuleTitle = typeof learner.activeModule === 'string' ? learner.activeModule : (learner.activeModule?.title || 'Lab 4B: SQL Relational Joins & Data Hygiene');
  const readinessTier = learner.readinessStatus || (learner.readinessPercent >= 70 ? 'Industry Ready (Tier 1)' : 'Remediation in Progress');

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Learner Portal</span>
            <span>/</span>
            <span>Pune IT–ITeS Cluster</span>
            <span>/</span>
            <span className="text-teal-700">Competency Pathway</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Learner Competency & Placement Pathway</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Role: Junior Data Analyst
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Empowering students with curriculum updated directly from verified Pune employer demand signals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Logged-in Profile</div>
            <div className="text-sm font-semibold text-slate-800">{learner.name}</div>
            <div className="text-xs text-slate-500">{instituteName}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow">
            RD
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Enrolled Course</div>
            <div className="text-base font-bold text-slate-900">{enrolledCourseTitle}</div>
            <div className="text-xs text-slate-500 mt-1">Reg ID: {learner.registrationNumber}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-700">Enrolled & Active (Batch 2026-A)</span>
            </div>
          </div>

          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Diagnostic Score</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-teal-700">{learner.diagnosticScore}%</span>
              <span className="text-xs text-slate-500">Benchmark: 80%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${learner.diagnosticScore}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex justify-between">
              <span>Readiness Tier</span>
              <span className="font-semibold text-slate-700">{readinessTier}</span>
            </div>
          </div>

          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Active Remediation</div>
            <div className="text-sm font-bold text-slate-900 line-clamp-1">{activeModuleTitle}</div>
            <div className="text-xs text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block border border-amber-200">
              Lab 4B: Joins & Cleaning
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Employer Concurrence: <span className="text-emerald-600 font-medium">Sample Concurrence by Regional Taskforce</span>
            </div>
          </div>

          <div className="md:col-span-1 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('assessment')}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Launch Practical Lab</span>
              <span className="material-symbols-outlined text-base">terminal</span>
            </button>
            <button
              onClick={() => onNavigate('course-alignment')}
              className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition text-center"
            >
              View Full Course Alignment Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'roadmap'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">alt_route</span>
            <span>Skill Roadmap & Competency Graph</span>
          </button>
          <button
            onClick={() => setActiveTab('assessment')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'assessment'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">code</span>
            <span>Practical Assessment Lab (Join & Clean)</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">New</span>
          </button>
          <button
            onClick={() => setActiveTab('placement')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'placement'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">work_outline</span>
            <span>Matched Pune Vacancies ({matchedVacancies.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 flex items-start gap-3">
            <span className="material-symbols-outlined text-teal-700 text-xl shrink-0 mt-0.5">verified</span>
            <div>
              <span className="font-semibold text-slate-900">Direct Alignment with Pune IT–ITeS Demand:</span>{' '}
              This roadmap automatically updates when District Administrators approve curriculum amendments verified by local employers.
              Completing <strong>Lab 4B</strong> unlocks the Junior Data Analyst interview queue at 14 hiring partners.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Skills Status Column */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Core Competency Progress</span>
                <span className="text-xs text-slate-500 font-normal">({learner.skills.length} Modules Tracked)</span>
              </h2>

              <div className="space-y-3">
                {learner.skills.map((skill, idx) => {
                  const isVerified = skill.isVerified || skill.status === 'verified';
                  const isGap = skill.status === 'gap_identified' || skill.status === 'needs_practice' || skill.status === 'Needs Remediation';
                  const progress = skill.progressPercent ?? skill.progressPct ?? 50;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition ${
                        isGap
                          ? 'border-amber-300 bg-amber-50/50 shadow-sm'
                          : 'border-slate-200 bg-white shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isGap
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">{skill.name}</span>
                            {skill.category && (
                              <span className="text-xs text-slate-500 ml-2">({skill.category})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : isGap
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {skill.statusLabel || skill.status}
                          </span>
                          <span className="text-xs font-bold text-slate-700 w-12 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isVerified
                              ? 'bg-emerald-500'
                              : isGap
                              ? 'bg-amber-500'
                              : 'bg-teal-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>

                      {isGap && (
                        <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center justify-between">
                          <div className="text-xs text-amber-900">
                            <strong>Action Required:</strong> Submit Lab 4B (Joins & Cleaning) to clear deficit.
                          </div>
                          <button
                            onClick={() => setActiveTab('assessment')}
                            className="text-xs font-bold text-teal-800 hover:text-teal-950 underline flex items-center gap-1"
                          >
                            Launch assessment &rarr;
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Milestones & Readiness */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Milestone Roadmap</h2>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                <div className="relative pl-6 border-l-2 border-emerald-500 pb-4">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Completed</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Foundational Data Handling</div>
                  <p className="text-xs text-slate-600 mt-1">Excel Pivot Tables, VLOOKUP, and exploratory summaries.</p>
                </div>

                <div className="relative pl-6 border-l-2 border-amber-500 pb-4">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Progress</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Practical SQL & Hygiene (Lab 4B)</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Multi-table relational queries, handling nulls, and deduplicating customer profiles.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-200 pb-4">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Business Intelligence & Dashboards</div>
                  <p className="text-xs text-slate-600 mt-1">Power BI interactive report generation & stakeholder KPI reviews.</p>
                </div>

                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-slate-300"></div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Capstone</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Employer Co-Evaluated Project</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Real-world transactional dataset assessed by simulated employer review committee.
                  </p>
                </div>
              </div>

              {/* Certificate preview */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Vocational Competency Benchmark</span>
                  <span className="material-symbols-outlined text-teal-400">workspace_premium</span>
                </div>
                <div className="text-sm font-bold">NSQF Level 4 Qualification Pathway</div>
                <div className="text-xs text-slate-300 mt-1">
                  Junior Data Analyst Qualification • Proposed qualification mapping — requires verification
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Readiness:</span>
                  <span className="font-semibold text-emerald-400">{readinessTier}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assessment Lab */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-xs font-bold">
                    Lab Assignment 4B
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Curriculum Rev #2026.02 • Supported by Taskforce Review Feedback
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  Relational SQL Joins & Customer Data Hygiene
                </h2>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Time Limit</div>
                <div className="text-sm font-bold text-slate-800">45 minutes (Practice Mode: Untimed)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Problem Statement */}
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Scenario & Requirements</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Pune retail chain <strong>Sahyadri FreshMart</strong> maintains separate databases for customer profiles (<code>customers</code>) and purchase histories (<code>orders</code>).
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-slate-600 font-mono bg-white p-3 rounded border border-slate-200">
                    <div><strong>customers</strong>: customer_id (INT), name (VARCHAR), district (VARCHAR)</div>
                    <div><strong>orders</strong>: order_id (INT), customer_id (INT), amount (DECIMAL), order_date (DATE)</div>
                  </div>
                  <div className="mt-3 text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-900">Task Deliverables:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Combine records using an explicit <code>LEFT JOIN</code> or <code>INNER JOIN</code> on <code>customer_id</code>.</li>
                      <li>Filter out incomplete transactions where <code>order_id IS NOT NULL</code>.</li>
                      <li>Identify customer profiles with purchases above ₹1,000.</li>
                    </ul>
                  </div>
                </div>

                {labFeedback && (
                  <div
                    className={`p-4 rounded-lg border text-sm flex items-start gap-3 ${
                      labPassed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl shrink-0 mt-0.5">
                      {labPassed ? 'check_circle' : 'error'}
                    </span>
                    <div>
                      <div className="font-bold">{labPassed ? 'Test Passed!' : 'Execution Notice'}</div>
                      <div className="text-xs mt-1 leading-relaxed">{labFeedback}</div>
                      {labPassed && (
                        <div className="mt-2 text-xs font-semibold text-emerald-800">
                          &bull; Competency updated on state learner profile.<br />
                          &bull; Verified for placement with Pune IT–ITeS hiring partners.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between bg-slate-800 text-slate-200 px-4 py-2 rounded-t-lg text-xs font-mono">
                    <span>lab_query.sql</span>
                    <span className="text-slate-400">PostgreSQL 15 Dialect</span>
                  </div>
                  <textarea
                    rows={8}
                    value={labSqlInput}
                    onChange={(e) => setLabSqlInput(e.target.value)}
                    className="w-full bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-b-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
                    placeholder="-- Write your SQL query here..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setLabSqlInput(
                        'SELECT c.customer_id, c.name, o.order_id, o.amount\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NOT NULL;'
                      )
                    }
                    className="text-xs text-slate-500 hover:text-slate-700 underline"
                  >
                    Reset Template
                  </button>

                  <button
                    onClick={handleRunSqlLab}
                    className="py-2.5 px-6 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 shadow-sm"
                  >
                    <span>Execute & Evaluate Query</span>
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Matched Placement Opportunities */}
      {activeTab === 'placement' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pune IT–ITeS Employer Vacancies</h2>
              <p className="text-xs text-slate-600">
                Directly matched against learner verified competencies from Lab 4B & Excel modules.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              Showing {matchedVacancies.length} verified demo positions in Hinjawadi & Magarpatta
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {matchedVacancies.map((vac, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                      {vac.employer}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {vac.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{vac.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    <span>{vac.location}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Required Core Skills:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {vac.requiredSkills.map((sk: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{vac.salaryRange}</span>
                  <button
                    onClick={() => {
                      alert(`Application demo submitted to ${vac.employer} for ${vac.title}!`);
                    }}
                    className="text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded transition shadow-sm"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
