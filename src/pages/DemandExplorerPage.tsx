import React, { useState, useMemo } from 'react';
import { AppState, EvidenceRecord, District, Sector } from '../types';
import { NavTab } from '../components/Sidebar';
import { triggerDownload } from '../utils/storage';
import { getDistrictDemandSummary, getFilteredEvidence } from '../utils/selectors';

interface DemandExplorerPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
  onDistrictChange?: (district: District) => void;
  onAddEvidenceRecords?: (records: EvidenceRecord[]) => void;
}

export const DemandExplorerPage: React.FC<DemandExplorerPageProps> = ({
  appState,
  onNavigate,
  onDistrictChange,
  onAddEvidenceRecords,
}) => {
  const district = appState.currentDistrict;
  const sector = appState.currentSector;

  // Use unified selector for consistent metrics across pages
  const demandSummary = useMemo(
    () => getDistrictDemandSummary(appState.evidenceRecords, district, sector),
    [appState.evidenceRecords, district, sector]
  );

  const availableRoles = demandSummary.availableRoles.length > 0
    ? demandSummary.availableRoles
    : ['Junior Data Analyst'];

  const [selectedRole, setSelectedRole] = useState<string>(availableRoles[0] || 'Junior Data Analyst');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [evidenceTab, setEvidenceTab] = useState<'all' | 'jobs' | 'feedback' | 'sector'>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<EvidenceRecord[]>([]);

  // Update selected role if current selected role not in district's roles
  React.useEffect(() => {
    if (availableRoles.length > 0 && !availableRoles.includes(selectedRole)) {
      setSelectedRole(availableRoles[0]);
    }
  }, [district, sector, availableRoles, selectedRole]);

  // Base filtered evidence for this district, sector, and role
  const districtEvidence = useMemo(
    () => getFilteredEvidence(appState.evidenceRecords, district, sector, selectedRole),
    [appState.evidenceRecords, district, sector, selectedRole]
  );

  // Tab counts based on current district & role evidence
  const allCount = districtEvidence.length;
  const jobsCount = districtEvidence.filter((r) => r.sourceType === 'aggregated_postings').length;
  const feedbackCount = districtEvidence.filter((r) => r.sourceType === 'industry_taskforce').length;
  const sectorCount = districtEvidence.filter(
    (r) => r.sourceType === 'curriculum_standard' || r.sourceType === 'public_exchange'
  ).length;

  // Filtered evidence for display applying: Tab + SkillFilter + SearchQuery
  const displayedEvidence = useMemo(() => {
    return districtEvidence.filter((rec) => {
      // 1. Tab filter
      if (evidenceTab === 'jobs' && rec.sourceType !== 'aggregated_postings') return false;
      if (evidenceTab === 'feedback' && rec.sourceType !== 'industry_taskforce') return false;
      if (
        evidenceTab === 'sector' &&
        rec.sourceType !== 'curriculum_standard' &&
        rec.sourceType !== 'public_exchange'
      ) {
        return false;
      }

      // 2. Skill filter
      if (selectedSkillFilter) {
        const matchesSkill =
          rec.skill.toLowerCase().includes(selectedSkillFilter.toLowerCase()) ||
          (rec.extractedSkills &&
            rec.extractedSkills.some((s) =>
              s.toLowerCase().includes(selectedSkillFilter.toLowerCase())
            ));
        if (!matchesSkill) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          rec.title.toLowerCase().includes(q) ||
          (rec.organisation || '').toLowerCase().includes(q) ||
          rec.excerpt.toLowerCase().includes(q) ||
          rec.skill.toLowerCase().includes(q) ||
          rec.geographicCoverage.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [districtEvidence, evidenceTab, selectedSkillFilter, searchQuery]);

  const handleResetFilters = () => {
    setSelectedSkillFilter(null);
    setSearchQuery('');
    setEvidenceTab('all');
    if (availableRoles.length > 0) {
      setSelectedRole(availableRoles[0]);
    }
  };

  const downloadSampleCsv = () => {
    const sample = `id,sourceType,title,organisation,referenceCode,district,sector,role,publicationDate,dateCollected,geographicCoverage,intendedModelUse,documentedLimitations,verificationStatus,skill,proficiency,excerpt,sourceUrl,samplePostingsCount,isDemo
DEMO-EVD-901,aggregated_postings,Regional Tech Analyst Hiring Ingest,Sahyadri Tech Solutions (Demo),DEMO-INGEST-01,${district},${sector},${selectedRole},2026-02-28,2026-02-28,Hinjawadi,Emerging skill extraction,Online postings sample,sample_posting,SQL Joins & Aggregations,Practical working knowledge,"Candidate must construct multi-table JOINs and inspect anomalous records",,35,true`;
    triggerDownload(sample, `KaushalSetu_${district}_Evidence_Template.csv`, 'text/csv;charset=utf-8;');
  };

  const handleCsvParse = (text: string) => {
    setImportCsvText(text);
    setImportStatus(null);
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      setImportStatus('CSV must contain a header row and at least 1 record.');
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const reqHeaders = ['id', 'title', 'role', 'skill', 'excerpt'];
    const missing = reqHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      setImportStatus(`Missing required columns: ${missing.join(', ')}`);
      setParsedRows([]);
      return;
    }

    const rows: EvidenceRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',');
      const record: EvidenceRecord = {
        id: values[0] || `DEMO-IMP-${Date.now()}-${i}`,
        sourceType: (values[1] as any) || 'aggregated_postings',
        title: values[2] || 'Imported Evidence Record',
        organisation: values[3] || 'Imported Organization (Demo)',
        referenceCode: values[4] || `DEMO-REF-${i}`,
        district: district,
        sector: sector,
        role: values[7] || selectedRole,
        publicationDate: values[8] || 'Feb 2026',
        dateCollected: values[9] || 'Feb 2026',
        geographicCoverage: values[10] || `${district} Metropolitan Area`,
        intendedModelUse: values[11] || 'Imported demand validation',
        documentedLimitations: values[12] || 'User uploaded batch',
        verificationStatus: 'sample_posting',
        skill: values[14] || 'Practical SQL & Hygiene',
        proficiency: values[15] || 'Working Knowledge',
        excerpt: values[16] || 'Imported job demand excerpt',
        samplePostingsCount: Number(values[18]) || 10,
        isDemo: true,
      };
      rows.push(record);
    }

    setParsedRows(rows);
    setImportStatus(`Parsed ${rows.length} valid records ready for local import.`);
  };

  const confirmImport = () => {
    if (parsedRows.length === 0) return;
    onAddEvidenceRecords?.(parsedRows);
    setShowImportModal(false);
    setImportCsvText('');
    setParsedRows([]);
  };

  // Empty state if selected district/sector has zero seeded records
  if (districtEvidence.length === 0) {
    return (
      <div className="flex flex-col w-full gap-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-xl mx-auto shadow-xs">
          <span className="material-symbols-outlined text-4xl text-amber-600 mb-2">find_in_page</span>
          <h2 className="text-lg font-bold text-slate-900">No sample evidence available for this selection</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            There are currently no illustrative demand records configured for <strong>{district}</strong> in the <strong>{sector}</strong> sector.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={() => onDistrictChange?.('Pune')}
              className="px-4 py-2 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              Return to Pune demo
            </button>
            <button
              onClick={() => onNavigate('overview')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              Back to Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Demand Intelligence</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>{district} Region</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-semibold text-slate-900">{sector}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Demand Explorer</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Q4 Demo Snapshot
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical demand signals extracted from sample job postings and local employer surveys in {district}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-700">upload_file</span>
            <span>Import Evidence (CSV)</span>
          </button>
          <button
            onClick={() => onNavigate('course-alignment')}
            className="h-9 px-3.5 bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
            <span>Compare with Course Syllabus</span>
          </button>
        </div>
      </div>

      {/* Global Context Filter Strip */}
      <div className="bg-white p-3.5 rounded-xl shadow-xs border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="h-8 px-2.5 bg-slate-100 rounded-md flex items-center gap-1.5 text-slate-800">
              <span className="material-symbols-outlined text-[15px] text-[#00685f]">location_on</span>
              <span className="font-semibold text-slate-500">District:</span>
              <span className="font-bold">{district}</span>
            </div>

            <div className="h-8 px-2.5 bg-slate-100 rounded-md flex items-center gap-1.5 text-slate-800">
              <span className="material-symbols-outlined text-[15px] text-[#00685f]">business_center</span>
              <span className="font-semibold text-slate-500">Sector:</span>
              <span className="font-bold">{sector}</span>
            </div>

            <div className="h-8 px-2.5 bg-teal-50 border border-teal-200/70 rounded-md flex items-center gap-1.5 text-xs text-[#00685f]">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span className="font-semibold text-teal-700">Role:</span>
              <span className="font-bold">{selectedRole}</span>
            </div>

            <div className="h-8 px-2.5 bg-slate-100 rounded-md flex items-center gap-1.5 text-slate-800">
              <span className="material-symbols-outlined text-[15px] text-slate-500">schedule</span>
              <span className="font-semibold text-slate-500">Period:</span>
              <span>Past 90 Days (Demo Cohort)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto text-xs text-slate-500">
            <span className="font-mono font-medium">
              {demandSummary.totalSamplePostings} sample postings • {demandSummary.distinctEmployersCount} organizations
            </span>
            <button
              onClick={handleResetFilters}
              className="text-slate-600 hover:text-red-700 flex items-center gap-1 font-semibold transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">restart_alt</span>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Target Roles & Skill Demands */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Target Role Selector */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Target Designation
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-0.5">Regional Role Cohorts</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                {district} Cluster ({availableRoles.length} Tracked)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableRoles.map((roleName) => {
                const isSelected = selectedRole === roleName;
                const roleRecords = districtEvidence.filter((r) => r.role === roleName || r.targetRole === roleName);
                const rolePostings = roleRecords.reduce((sum, r) => sum + (r.samplePostingsCount || 0), 0);

                return (
                  <div
                    key={roleName}
                    onClick={() => {
                      setSelectedRole(roleName);
                      setSelectedSkillFilter(null);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50/70 border-[#00685f] shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{roleName}</span>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[15px] text-[#00685f]">check_circle</span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200">
                        {roleRecords.length} Evidence Records
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Sample Postings</p>
                        <p className="text-sm font-extrabold text-slate-900 tabular-nums">{rolePostings}</p>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-medium">Supporting Sources</p>
                        <p className="text-sm font-extrabold text-[#00685f] tabular-nums">{roleRecords.length}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 text-[10px]">Click to analyze role skills</span>
                      {isSelected && <span className="font-bold text-[#00685f] text-[10px]">Active</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Skill Profile Breakdown */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#00685f] text-[18px]">tune</span>
                  <h2 className="text-base font-bold text-slate-900">
                    Required Skill Demand Profile: {selectedRole}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Derived from {districtEvidence.length} supporting evidence records ({demandSummary.totalSamplePostings} sample postings)
                </p>
              </div>
              {selectedSkillFilter && (
                <button
                  onClick={() => setSelectedSkillFilter(null)}
                  className="text-[11px] px-2 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded font-medium flex items-center gap-1"
                >
                  <span>Filtering: {selectedSkillFilter}</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>

            {/* Explanatory Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 flex items-start gap-2 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[#00685f] text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <strong className="text-slate-800">Sample Evidence Grounding:</strong> Click <strong>View Evidence</strong> on any skill row to inspect the supporting sample postings and employer survey transcripts on the right.
              </div>
            </div>

            {/* Skill rows */}
            <div className="space-y-3">
              {demandSummary.skills.map((skillItem, index) => {
                const isSelected = selectedSkillFilter === skillItem.skill;

                return (
                  <div
                    key={skillItem.skill}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-teal-50/70 border-[#00685f]'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {index + 1}. {skillItem.skill}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {skillItem.evidenceCount} matching records
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="font-bold text-slate-900">{skillItem.samplePostings}</span>
                        <span className="text-slate-500 text-[11px]">sample postings ({skillItem.percentage}%)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-300 bg-[#00685f]"
                        style={{ width: `${skillItem.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 text-[11px]">
                        Demand concentration: {skillItem.samplePostings} of {demandSummary.totalSamplePostings} sampled openings
                      </span>
                      <button
                        onClick={() => setSelectedSkillFilter(isSelected ? null : skillItem.skill)}
                        className="text-[#00685f] hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isSelected ? 'Clear Filter' : 'View Evidence'}</span>
                        <span className="material-symbols-outlined text-[14px]">
                          {isSelected ? 'close' : 'arrow_forward'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spatial Concentration */}
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Spatial Concentration: {district} Hiring Hubs
                </h3>
                <p className="text-xs text-slate-500">Distribution across major employment corridors</p>
              </div>
              <span className="text-xs font-mono font-bold text-[#00685f]">Sample Hub Share</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demandSummary.concentrationHubs.map((hub, idx) => (
                <div key={hub.hub} className="p-3 bg-slate-900 text-white rounded-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-teal-300">Cluster Zone {idx + 1}</span>
                    <p className="text-xs font-bold mt-0.5 leading-snug">{hub.hub}</p>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800">
                    <span className="text-base font-extrabold text-teal-200">{hub.sharePercent}%</span>
                    <span className="text-[10px] text-white/70">{hub.postingsCount} postings</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Supporting Evidence Drawer */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200/80 sticky top-20 flex flex-col">
            <div className="pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 uppercase tracking-wider border border-teal-200">
                  Supporting Evidence Registry
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {displayedEvidence.length} of {districtEvidence.length} Records
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Empirical Evidence Records
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fictional sample postings and industry survey feedback for {district}.
              </p>
            </div>

            {/* Search Input for Evidence */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evidence text, employer, skill..."
                className="w-full h-8 pl-8 pr-7 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined text-[14px]">clear</span>
                </button>
              )}
            </div>

            {/* Evidence Tabs with EXACT matching counts */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg mb-3">
              <button
                onClick={() => setEvidenceTab('all')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold transition text-center ${
                  evidenceTab === 'all'
                    ? 'bg-white text-[#00685f] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allCount})
              </button>
              <button
                onClick={() => setEvidenceTab('jobs')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold transition text-center ${
                  evidenceTab === 'jobs'
                    ? 'bg-white text-[#00685f] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Postings ({jobsCount})
              </button>
              <button
                onClick={() => setEvidenceTab('feedback')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold transition text-center ${
                  evidenceTab === 'feedback'
                    ? 'bg-white text-[#00685f] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Feedback ({feedbackCount})
              </button>
              <button
                onClick={() => setEvidenceTab('sector')}
                className={`flex-1 py-1 px-1.5 rounded text-[11px] font-semibold transition text-center ${
                  evidenceTab === 'sector'
                    ? 'bg-white text-[#00685f] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reports ({sectorCount})
              </button>
            </div>

            {/* Filter status badge */}
            {selectedSkillFilter && (
              <div className="mb-2 p-2 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-center justify-between">
                <span>Filtering by: <strong>{selectedSkillFilter}</strong></span>
                <button
                  onClick={() => setSelectedSkillFilter(null)}
                  className="text-teal-700 hover:underline font-bold text-[11px]"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Evidence List */}
            <div className="space-y-3 mb-4 max-h-[420px] overflow-y-auto pr-1">
              {displayedEvidence.length === 0 ? (
                <div className="p-6 text-center text-slate-600 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-3xl">filter_alt_off</span>
                  <p className="font-semibold text-slate-800">No sample evidence available for this selection.</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Try adjusting the search query, selecting another role tab, or returning to the primary Pune sample dataset.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 justify-center">
                    {district !== 'Pune' && (
                      <button
                        onClick={() => onDistrictChange?.('Pune')}
                        className="px-3 py-1.5 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg font-semibold text-xs transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">undo</span>
                        <span>Return to Pune demo</span>
                      </button>
                    )}
                    <button
                      onClick={handleResetFilters}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium text-xs transition cursor-pointer"
                    >
                      Clear search & filters
                    </button>
                  </div>
                </div>
              ) : (
                displayedEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-[15px] text-[#00685f]">
                          {ev.sourceType === 'industry_taskforce'
                            ? 'record_voice_over'
                            : ev.sourceType === 'curriculum_standard'
                            ? 'menu_book'
                            : 'work_outline'}
                        </span>
                        {ev.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{ev.publicationDate}</span>
                    </div>

                    <blockquote className="italic text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/60 my-2 leading-relaxed text-[11px]">
                      "{ev.excerpt}"
                    </blockquote>

                    <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 pt-1">
                      <div>
                        <span className="font-semibold text-slate-700">Source Org:</span> {ev.organisation}
                      </div>
                      <div className="flex items-center gap-0.5 text-[#00685f] font-medium">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        <span>{ev.geographicCoverage.split('(')[0]}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{ev.referenceCode}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {ev.sourceType === 'curriculum_standard'
                          ? 'Statutory Framework'
                          : ev.sourceType === 'industry_taskforce'
                          ? 'Sample Employer Survey'
                          : 'Sample Posting Feed'}
                      </span>
                    </div>

                    {ev.sourceUrl && (
                      <div className="mt-1.5 pt-1 text-[10px] text-slate-400 truncate">
                        URL: <a href={ev.sourceUrl} target="_blank" rel="noreferrer" className="text-teal-700 hover:underline">{ev.sourceUrl}</a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onNavigate('course-alignment')}
                className="w-full py-2 px-3 bg-[#00685f] hover:bg-[#005049] text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Course Alignment Matrix</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Evidence CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">upload_file</span>
                Import Supporting Evidence (CSV)
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Import additional local job postings or employer survey responses for {district}.
            </p>

            <textarea
              rows={5}
              value={importCsvText}
              onChange={(e) => handleCsvParse(e.target.value)}
              placeholder="Paste CSV rows here or download template..."
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
            />

            {importStatus && (
              <div className="p-2 bg-slate-100 rounded text-xs text-slate-700 font-mono">
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={downloadSampleCsv}
                className="text-xs text-[#00685f] hover:underline font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Download Sample Template</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  disabled={parsedRows.length === 0}
                  onClick={confirmImport}
                  className={`px-3 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition ${
                    parsedRows.length > 0
                      ? 'bg-[#00685f] hover:bg-[#005049]'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                >
                  Add {parsedRows.length} Records
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
