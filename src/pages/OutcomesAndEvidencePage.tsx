import React, { useState } from 'react';
import { AppState, AuditEvent, EvidenceRecord } from '../types';
import { NavTab } from '../components/Sidebar';
import { triggerDownload } from '../utils/storage';

interface OutcomesAndEvidencePageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
}

export const OutcomesAndEvidencePage: React.FC<OutcomesAndEvidencePageProps> = ({
  appState,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'evidence' | 'tracer'>('audit');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const auditList: AuditEvent[] = appState.auditEvents || appState.auditTrail || [];

  // Filtering audit events
  const filteredAuditEvents = auditList.filter((ev: AuditEvent) => {
    const actionName = ev.action || ev.actionType || '';
    if (filterAction !== 'all' && actionName !== filterAction) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const details = ev.details || ev.notes || '';
      const actor = ev.actor || '';
      return (
        details.toLowerCase().includes(q) ||
        actor.toLowerCase().includes(q) ||
        actionName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export audit events
  const handleExportAuditCsv = () => {
    const headers = ['id', 'timestamp', 'actor', 'action', 'entityType', 'entityId', 'details'];
    const rows = auditList.map((e: AuditEvent) => [
      e.id,
      e.timestamp,
      `"${e.actor}"`,
      e.action || e.actionType || '',
      e.entityType || e.entity || '',
      e.entityId || String(e.revision || ''),
      `"${(e.details || e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    triggerDownload(csvContent, `kaushal_setu_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span>Governance & Quality</span>
            <span>/</span>
            <span>Pune IT–ITeS Cluster</span>
            <span>/</span>
            <span className="text-teal-700">Audit Ledger & Outcomes</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Audit Trail & Empirical Evidence Ledger</span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Activity History & Audit Trail
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            End-to-end provenance: Demand signals &rarr; Course gap diagnoses &rarr; Employer reviews &rarr; District plan sanctions &rarr; Learner outcomes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAuditCsv}
            className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Audit Trail (CSV)</span>
          </button>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Audit Events</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{auditList.length} Recorded</div>
          <div className="text-xs text-slate-500 mt-1">Chronologically sequenced & SHA-indexed</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Empirical Signals</div>
          <div className="text-2xl font-bold text-teal-700 mt-1">{appState.evidenceRecords.length} Raw Postings</div>
          <div className="text-xs text-slate-500 mt-1">48 Pune enterprise interviews</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Placement Benchmark</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">78.4% Target</div>
          <div className="text-xs text-slate-500 mt-1">FY 25-26 Pune district objective</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tracer Verification</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">100% Transparent</div>
          <div className="text-xs text-slate-500 mt-1">Browser-local demonstration store</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">history</span>
            <span>System Audit Trail ({auditList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'evidence'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            <span>Raw Evidence Registry ({appState.evidenceRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tracer')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
              activeTab === 'tracer'
                ? 'border-teal-600 text-teal-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-lg">analytics</span>
            <span>Tracer Study & Placement Alignment</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filters strip */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actor, action, or details..."
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="INITIALIZE_SEED">INITIALIZE_SEED</option>
                <option value="Gap Submission">Gap Submission</option>
                <option value="District Desk Review">District Desk Review</option>
                <option value="Employer Appraisal & Concurrence">Employer Appraisal & Concurrence</option>
                <option value="UPDATE_RECOMMENDATION">UPDATE_RECOMMENDATION</option>
                <option value="UPDATE_SKILL_MAPPING">UPDATE_SKILL_MAPPING</option>
                <option value="UPDATE_EMPLOYER_REVIEW">UPDATE_EMPLOYER_REVIEW</option>
                <option value="UPDATE_DISTRICT_PLAN">UPDATE_DISTRICT_PLAN</option>
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Showing {filteredAuditEvents.length} of {auditList.length} entries
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredAuditEvents.map((ev: AuditEvent) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {ev.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-900">
                      {ev.actor}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-800 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-200">
                        {ev.action || ev.actionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {ev.entityType || ev.entity}: <span className="font-mono text-slate-900">{ev.entityId || String(ev.revision || '')}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md truncate" title={ev.details || ev.notes}>
                      {ev.details || ev.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Raw Evidence Registry */}
      {activeTab === 'evidence' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-600">
              Raw demand evidence gathered across job boards, employer feedback surveys, and enterprise roundtables.
            </div>
            <div className="text-xs font-semibold text-slate-700">
              Total: {appState.evidenceRecords.length} records
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Employer / Organization</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Skills Extracted</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appState.evidenceRecords.map((rec: EvidenceRecord) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">{rec.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rec.organisation || rec.organization || rec.title}</td>
                    <td className="py-3 px-4 text-slate-700">{rec.targetRole || rec.role}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(rec.extractedSkills || [rec.skill]).map((sk: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="bg-teal-50 text-teal-800 text-[11px] px-2 py-0.5 rounded border border-teal-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-50 text-emerald-800 text-[11px] px-2 py-0.5 rounded border border-emerald-200 font-medium">
                        {rec.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{rec.dateCollected || rec.publicationDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tracer Study & Placement Alignment */}
      {activeTab === 'tracer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Tracer Study Methodology & Placement Impact</h2>
            <p className="text-sm text-slate-600 mb-6">
              Empirical tracking of Junior Data Analyst graduates from Sahyadri Skills Centre and affiliated Pune ITIs.
              Tracks placement rates before and after the introduction of Practical SQL Joins and Data Cleaning labs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Historical Cohort (Pre-Update)
                </div>
                <div className="text-3xl font-extrabold text-slate-700">54.2%</div>
                <div className="text-xs text-slate-500 mt-1">90-day placement rate (Batch 2025-A)</div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                  <div>&bull; Primary interview bottleneck: Failed live technical SQL screening (68% candidates).</div>
                  <div>&bull; Candidate feedback: Theoretical knowledge of SQL joins with zero hands-on experience.</div>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-teal-300 bg-teal-50/50">
                <div className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                  Projected / Post-Intervention Cohort
                </div>
                <div className="text-3xl font-extrabold text-teal-700">79.5%</div>
                <div className="text-xs text-teal-900 mt-1">Projected 90-day placement rate (Batch 2026-A)</div>
                <div className="mt-4 pt-3 border-t border-teal-200 text-xs text-teal-900 space-y-1">
                  <div>&bull; 14 regional employers reviewed proposed curriculum additions for candidate interviews.</div>
                  <div>&bull; Lab assessment benchmarks align with employer taskforce evaluation rubrics.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
