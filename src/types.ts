/**
 * Kaushal Setu — Turn Local Job Demand into Better Training
 * Shared typed application state and domain models
 * Smart India Hackathon 2026 • Region: Maharashtra
 */

export type District = 'Pune' | 'Mumbai' | 'Nagpur';
export type Sector = 'IT–ITeS' | 'Automotive' | 'Healthcare';
export type DemoRole =
  | 'district_admin'
  | 'district-admin'
  | 'institute_coordinator'
  | 'institute-coordinator'
  | 'employer_reviewer'
  | 'employer-reviewer'
  | 'learner';
export type Language = 'en' | 'mr';

export type VerificationStatus =
  | 'sample_exchange'
  | 'sample_posting'
  | 'sample_survey'
  | 'curriculum_reference'
  | 'verified_gov_feed'
  | 'deduplicated'
  | 'signed_transcript'
  | 'statutory_ref'
  | string;

export type SourceType =
  | 'public_exchange'
  | 'aggregated_postings'
  | 'industry_taskforce'
  | 'curriculum_standard'
  | string;

export interface EvidenceRecord {
  id: string;
  sourceType: SourceType;
  title: string;
  organisation?: string;
  organization?: string;
  referenceCode: string;
  district: District;
  sector: Sector;
  role: string;
  targetRole?: string;
  publicationDate: string;
  dateCollected?: string;
  geographicCoverage: string;
  intendedModelUse: string;
  documentedLimitations: string;
  verificationStatus: VerificationStatus;
  skill: string;
  extractedSkills?: string[];
  samplePostingsCount?: number;
  proficiency: string;
  excerpt: string;
  sourceUrl?: string;
  isDemo: boolean;
}

export interface SkillMapping {
  id: string;
  courseId: string;
  skillId: string;
  skillCode: string;
  skillName: string;
  marketExpectation: string;
  demandFrequencyPercent: number;
  postingsCount: number;
  taughtTheoryCitation: string;
  isTaught: boolean;
  practisedLabsCitation: string;
  isPractised: boolean;
  assessedCitation: string;
  isAssessed: boolean;
  status:
    | 'aligned'
    | 'practical_deficit'
    | 'tooling_deficit'
    | 'adequate'
    | 'elective_aligned'
    | string;
  alignmentScorePercent: number;
  employerDemandExcerpt: string;
  employerSource: string;
  currentSyllabusExcerpt: string;
  currentSyllabusLocation: string;
  currentLabRubricExcerpt: string;
  currentLabRubricLocation: string;
  isConfirmedGap: boolean;
  auditorSanctioned: boolean;
  overrideNote?: string;
  needsHumanReview: boolean;
}

export interface Recommendation {
  id: string;
  courseId: string;
  moduleCode: string;
  title: string;
  revisionNumber: number;
  status:
    | 'draft'
    | 'submitted'
    | 'changes_requested'
    | 'revised'
    | 'resubmitted'
    | 'accepted'
    | string;
  targetCompetency: string;
  nosCode: string;
  practicalActivity: string;
  activityCountDescription: string;
  evaluationProtocol: string;
  originalHours: number;
  addedPracticalHours: number;
  reducedTheoryHours: number;
  suggestedHours: number;
  hourOffsetModule: string;
  hourOffsetDescription: string;
  budgetImpact: string;
  facultyPreparedness: string;
  trainerOrientationHours: number;
  trainerOrientationCost: number;
  softwareRequirements: string;
  labSetupCost: number;
  councilAuthority: string;
  confidenceScore: number;
  reviewerNotes?: string;
  mandatedRevisionNote?: string;
  mandatedReqCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployerReviewDecision {
  id: string;
  recommendationId: string;
  recommendationRevision: number;
  decision: 'accept' | 'request_changes' | 'not_relevant' | string;
  status?: string;
  reviewerName: string;
  reviewerTitle: string;
  reviewerOrg: string;
  organization?: string;
  entityId: string;
  feedbackNotes: string;
  mandatedNote?: string;
  reqCode?: string;
  timestamp: string;
  digitalSignatureHash: string;
}

export interface InstituteAllocation {
  id: string;
  instituteName: string;
  instituteCode: string;
  location: string;
  courseName: string;
  nsqfLevel: string;
  targetRole: string;
  proposedSeats: number;
  batchesCount: number;
  batchSize: number;
  trainersReady: number;
  trainersRequired: number;
  trainerStatusNote: string;
  labName: string;
  pcsReady: number;
  labStatusNote: string;
  hasHardwareDeficit: boolean;
  deficitPcsCount: number;
  estimatedCostLakhs: number;
  operationalStatus:
    | 'ready'
    | 'trainer_orientation_req'
    | 'capacity_deficit'
    | 'oversupply_review'
    | string;
  approved: boolean;
}

export interface DistrictTrainingPlan {
  id: string;
  planHash: string;
  title: string;
  district: District;
  sector: Sector;
  cohort: string;
  financialYear?: string;
  targetSeats: number;
  plannedSeats?: number;
  status:
    | 'draft'
    | 'submitted'
    | 'approved_with_conditions'
    | 'approved'
    | string;
  totalTargetTrainees: number;
  certifiedTrainersReady: number;
  certifiedTrainersRequired: number;
  labHardwareConformancePercent: number;
  estimatedBudgetLakhs: number;
  subsidyPerCandidate: number;
  conditions: Array<{
    id: string;
    title: string;
    description: string;
    deadline: string;
    severity: 'mandatory' | 'guardrail' | string;
    resolved: boolean;
    impactDescription: string;
  }>;
  instituteAllocations: InstituteAllocation[];
  planningAssumptions: {
    batchSizeLimit: number;
    teachingHoursTotal: number;
    coreTheoryHours: number;
    remediationLabHours: number;
    stipendMonthly: number;
    mandatoryIntakeDate: string;
  };
  lastSyncDate: string;
}

export interface LearnerSkill {
  id: string;
  name: string;
  category?: string;
  description: string;
  score?: number;
  progressPercent: number;
  progressPct?: number;
  status:
    | 'verified'
    | 'theory_cleared'
    | 'needs_practice'
    | 'gap_identified'
    | 'Needs Remediation'
    | 'Mastered'
    | string;
  statusLabel: string;
  isSelfReported: boolean;
  isVerified: boolean;
}

export interface LearnerProfile {
  id: string;
  registrationNumber: string;
  name: string;
  batch: string;
  institute?: string;
  enrolledInstitute: string;
  enrolledCourse?: string;
  readinessStatus?: string;
  targetRole: string;
  sector: Sector;
  clusterLocation: string;
  readinessPercent: number;
  competenciesMet: number;
  competenciesTotal: number;
  diagnosticScore: number;
  diagnosticDate: string;
  diagnosticHash: string;
  verifiedBy: string;
  currentStage: 1 | 2 | 3 | 4;
  skills: LearnerSkill[];
  activeModule: any;
  nextMilestone: any;
  matchedVacancies?: any[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role?: DemoRole | string;
  action?: string;
  actionType?: string;
  entity?: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  revision?: number | string;
  notes?: string;
  hash?: string;
  verificationStatus?:
    | 'recorded'
    | 'submitted'
    | 'reviewed'
    | 'approved'
    | 'certified'
    | 'dispatched'
    | 'in_concurrence'
    | 'ratified'
    | string;
}

export interface AppState {
  currentDistrict: District;
  currentSector: Sector;
  currentPeriod: string;
  currentRole: DemoRole;
  language?: Language;
  currentLanguage?: Language;
  evidenceRecords: EvidenceRecord[];
  skillMappings: SkillMapping[];
  recommendation: Recommendation;
  recommendations: Recommendation[];
  employerReviews: EmployerReviewDecision[];
  trainingPlan: DistrictTrainingPlan;
  districtTrainingPlan: DistrictTrainingPlan;
  learnerProfile: LearnerProfile;
  auditTrail: AuditEvent[];
  auditEvents: AuditEvent[];
  isSampleMode: boolean;
  activeWalkthroughStep: number | null;
}
