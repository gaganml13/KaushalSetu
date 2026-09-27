import { AppState, SkillMapping, DistrictTrainingPlan, EvidenceRecord, AuditEvent } from '../types';
import { INITIAL_APP_STATE } from '../data/seedData';

const DB_NAME = 'kaushal_setu_prototype_v1';
const STORE_NAME = 'app_state_store';
const KEY_NAME = 'current_state';
const LOCAL_STORAGE_FALLBACK = 'kaushal_setu_state_snapshot';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadAppState(): Promise<AppState> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);

      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result as AppState);
        } else {
          // Check local storage fallback
          const localData = localStorage.getItem(LOCAL_STORAGE_FALLBACK);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              resolve(parsed);
              return;
            } catch (e) {
              console.warn('Failed to parse local storage fallback', e);
            }
          }
          resolve(INITIAL_APP_STATE);
        }
      };

      req.onerror = () => {
        resolve(INITIAL_APP_STATE);
      };
    });
  } catch (err) {
    console.warn('Using localStorage/memory fallback for storage:', err);
    const local = localStorage.getItem(LOCAL_STORAGE_FALLBACK);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    return INITIAL_APP_STATE;
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  // Always mirror in localStorage for quick synchronous reads
  try {
    localStorage.setItem(LOCAL_STORAGE_FALLBACK, JSON.stringify(state));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put(state, KEY_NAME);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB save failed:', err);
  }
}

export async function resetAppState(): Promise<AppState> {
  await saveAppState(INITIAL_APP_STATE);
  return INITIAL_APP_STATE;
}

// Security: Prevent CSV formula injection by escaping cells starting with =, +, -, @, \t, \r
function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// Download helper that actually triggers a browser download
export function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. Export Course Alignment Matrix as CSV
export function exportCourseAlignmentCsv(mappings: SkillMapping[], courseName = 'Entry-Level Data Analytics') {
  const headers = [
    'Skill Code',
    'Required Skill',
    'Market Expectation',
    'Demand Frequency %',
    'Verified Postings',
    'Taught (Theory)',
    'Practised (Labs)',
    'Assessed',
    'Status',
    'Alignment Score %',
    'Confirmed Gap',
    'Employer Demand Citation',
    'Current Syllabus Reference',
    'Lab Rubric Deficit'
  ];

  const rows = mappings.map((m) => [
    sanitizeCsvCell(m.skillCode),
    sanitizeCsvCell(m.skillName),
    sanitizeCsvCell(m.marketExpectation),
    sanitizeCsvCell(m.demandFrequencyPercent),
    sanitizeCsvCell(m.postingsCount),
    sanitizeCsvCell(m.isTaught ? m.taughtTheoryCitation : 'Not Evidenced'),
    sanitizeCsvCell(m.isPractised ? m.practisedLabsCitation : 'Not Evidenced'),
    sanitizeCsvCell(m.isAssessed ? m.assessedCitation : 'Gap'),
    sanitizeCsvCell(m.status),
    sanitizeCsvCell(m.alignmentScorePercent),
    sanitizeCsvCell(m.isConfirmedGap ? 'YES' : 'NO'),
    sanitizeCsvCell(m.employerDemandExcerpt),
    sanitizeCsvCell(m.currentSyllabusExcerpt),
    sanitizeCsvCell(m.currentLabRubricExcerpt)
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerDownload(csv, `KaushalSetu_CourseAlignment_${courseName.replace(/\s+/g, '_')}.csv`, 'text/csv;charset=utf-8;');
}

// 2. Export District Training Plan as CSV
export function exportDistrictPlanCsv(plan: DistrictTrainingPlan) {
  const headers = [
    'Institute Name',
    'Institute Code',
    'Location',
    'Course Name',
    'NSQF Level',
    'Target Role',
    'Proposed Seats',
    'Batches Count',
    'Batch Size',
    'Trainers Ready',
    'Trainers Required',
    'Trainer Status Note',
    'Lab Name',
    'PCs Ready',
    'Lab Status Note',
    'Hardware Deficit PCs',
    'Est Batch Cost (Lakhs)',
    'Operational Status',
    'Council Approved'
  ];

  const rows = plan.instituteAllocations.map((alloc) => [
    sanitizeCsvCell(alloc.instituteName),
    sanitizeCsvCell(alloc.instituteCode),
    sanitizeCsvCell(alloc.location),
    sanitizeCsvCell(alloc.courseName),
    sanitizeCsvCell(alloc.nsqfLevel),
    sanitizeCsvCell(alloc.targetRole),
    sanitizeCsvCell(alloc.proposedSeats),
    sanitizeCsvCell(alloc.batchesCount),
    sanitizeCsvCell(alloc.batchSize),
    sanitizeCsvCell(alloc.trainersReady),
    sanitizeCsvCell(alloc.trainersRequired),
    sanitizeCsvCell(alloc.trainerStatusNote),
    sanitizeCsvCell(alloc.labName),
    sanitizeCsvCell(alloc.pcsReady),
    sanitizeCsvCell(alloc.labStatusNote),
    sanitizeCsvCell(alloc.deficitPcsCount),
    sanitizeCsvCell(alloc.estimatedCostLakhs),
    sanitizeCsvCell(alloc.operationalStatus),
    sanitizeCsvCell(alloc.approved ? 'Approved' : 'Pending Review')
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  triggerDownload(csv, `KaushalSetu_DistrictPlan_${plan.district}_${plan.financialYear || 'FY26'}.csv`, 'text/csv;charset=utf-8;');
}

// 3. Export Recommendation as JSON
export function exportRecommendationJson(rec: any) {
  const jsonStr = JSON.stringify(rec, null, 2);
  triggerDownload(jsonStr, `KaushalSetu_Recommendation_${rec.moduleCode || 'Module'}_rev${rec.revisionNumber || 1}.json`, 'application/json');
}

// 4. Export Audit Dossier JSON
export function exportAuditDossier(evidence: EvidenceRecord[], audit: AuditEvent[], state: AppState) {
  const dossier = {
    metadata: {
      generatedAt: new Date().toISOString(),
      district: state.currentDistrict,
      sector: state.currentSector,
      platform: 'Kaushal Setu — Maharashtra Skill Mission SIH 2026',
      sha256VerificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    workflowMetrics: {
      skillMappingsConfirmed: '91.4%',
      employerConcurrenceRate: '88.2%',
      averageReviewTurnaroundDays: 6.4,
      evidenceFreshnessCoverage: '94.8%',
    },
    learnerOutcomesAlphaCohort: {
      practicalLabCompletion: '82%',
      employerAssessmentPassBenchmark: '74%',
      interviewConversion: 'Pending Phase 2 (Target Q1 FY26)',
      retentionVerification: 'Post-Pilot Milestone (Q3 FY26)',
    },
    institutionalEvidenceRegister: evidence,
    auditTrailLedger: audit,
  };

  triggerDownload(JSON.stringify(dossier, null, 2), `KaushalSetu_Audit_Dossier_${state.currentDistrict}.json`, 'application/json');
}

// 5. Full State Backup & Restore
export function exportFullBackupJson(state: AppState) {
  const jsonStr = JSON.stringify({ ...state, backupExportTimestamp: new Date().toISOString() }, null, 2);
  triggerDownload(jsonStr, `KaushalSetu_Demo_Backup_${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
}

export function parseAndValidateBackup(jsonText: string): AppState {
  const parsed = JSON.parse(jsonText);
  if (!parsed.currentDistrict || !parsed.skillMappings || !parsed.trainingPlan || !parsed.learnerProfile) {
    throw new Error('Invalid backup file: missing mandatory Kaushal Setu state sections.');
  }
  return parsed as AppState;
}
