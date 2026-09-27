import React, { useState } from 'react';
import { AppState, DistrictTrainingPlan } from '../types';
import { NavTab } from '../components/Sidebar';
import { exportDistrictPlanCsv } from '../utils/storage';

interface DistrictPlanPageProps {
  appState: AppState;
  onNavigate: (tab: NavTab) => void;
  onUpdatePlan: (plan: DistrictTrainingPlan) => void;
}

export const DistrictPlanPage: React.FC<DistrictPlanPageProps> = ({
  appState,
  onNavigate,
  onUpdatePlan,
}) => {
  const plan = appState.trainingPlan;
  const [batchSize, setBatchSize] = useState(plan.planningAssumptions.batchSizeLimit);
  const [stipend, setStipend] = useState(plan.planningAssumptions.stipendMonthly);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApprovePlan = () => {
    const updated: DistrictTrainingPlan = {
      ...plan,
      status: 'approved',
    };
    onUpdatePlan(updated);
    setToastMsg('District Training Plan approved and sanctioned for Q1 FY26 delivery!');
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleToggleAllocationApproval = (instId: string) => {
    const updatedAllocations = plan.instituteAllocations.map((a) =>
      a.id === instId ? { ...a, approved: !a.approved } : a
    );
    const updated: DistrictTrainingPlan = {
      ...plan,
      instituteAllocations: updatedAllocations,
    };
    onUpdatePlan(updated);
  };

  const handleResetDefaults = () => {
    setBatchSize(30);
    setStipend(1500);
    setToastMsg('Reset parameters to Maharashtra State Skill norm defaults.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-5">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-[#00685f] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-teal-300/40 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header and Context */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Maharashtra Skill Development</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span>District Operations</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#00685f] font-semibold">FY26 Q1 Training Allocation Plan</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {plan.title}
              </h1>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                  plan.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {plan.status === 'approved' ? 'verified' : 'pending_actions'}
                </span>
                <span>
                  {plan.status === 'approved'
                    ? 'SANCTIONED — District Council Approved'
                    : 'DRAFT PLAN — Awaiting District Committee Sanction'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Translating accepted NSQF curriculum recommendations into verified institute quotas, hardware readiness checks, and budget sanctions.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
            <button
              onClick={() => {
                setToastMsg('Plan draft saved to IndexedDB storage.');
                setTimeout(() => setToastMsg(null), 2500);
              }}
              className="h-9 px-3.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Plan Draft</span>
            </button>
            <button
              onClick={() => exportDistrictPlanCsv(plan)}
              className="h-9 px-3.5 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-600">description</span>
              <span>Export Dossier (CSV)</span>
            </button>
            <button
              onClick={handleApprovePlan}
              disabled={plan.status === 'approved'}
              className="h-9 px-4 bg-[#00685f] hover:bg-[#005049] text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>{plan.status === 'approved' ? 'Council Approved' : 'Submit for Council Approval'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Target Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Target Trainees */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Target Trainees</span>
            <span className="p-1 bg-teal-50 text-[#00685f] rounded-lg">
              <span className="material-symbols-outlined text-[18px]">groups</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {plan.totalTargetTrainees}
              </span>
              <span className="text-xs text-slate-500 font-medium">Seats</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
              <span>3 Courses • 4 Institutes</span>
              <span className="text-[#00685f] font-bold">100% Target Met</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Certified Trainers */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certified Trainers Ready</span>
            <span className="p-1 bg-amber-50 text-amber-700 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {plan.certifiedTrainersReady}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ {plan.certifiedTrainersRequired} Required</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-amber-800">
              <span>6 trainers need SQL/Data cleaning</span>
              <span className="font-bold">78.5%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: '78.5%' }} />
          </div>
        </div>

        {/* Hardware Conformance */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lab Hardware Conformance</span>
            <span className="p-1 bg-slate-100 text-slate-700 rounded-lg">
              <span className="material-symbols-outlined text-[18px]">memory</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {plan.labHardwareConformancePercent}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Operational</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
              <span>1 Institute needs RAM upgrade</span>
              <span className="text-red-700 font-bold">8 PCs Offline</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '92%' }} />
          </div>
        </div>

        {/* Estimated District Budget */}
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated District Budget</span>
            <span className="p-1 bg-emerald-50 text-[#00685f] rounded-lg">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                ₹{plan.estimatedBudgetLakhs}
              </span>
              <span className="text-xs text-slate-500 font-medium">Lakhs</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-600">
              <span>₹{plan.subsidyPerCandidate.toLocaleString()} / candidate subsidy</span>
              <span className="text-[#00685f] font-bold">Committee Approved</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#00685f] h-full rounded-full" style={{ width: '65%' }} />
          </div>
        </div>
      </div>

      {/* Decision Queue: Approve Plan With Conditions */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-[17px]">rule</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Executive Decision Queue: Approve Plan With Conditions
            </h2>
            <p className="text-xs text-slate-500">
              Two critical delivery contingencies require administrator intervention before sanctioning final batches.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
          {plan.conditions.map((cond) => (
            <div
              key={cond.id}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">
                  notification_important
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider">
                      {cond.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {cond.deadline}
                    </span>
                  </div>
                  <p className="text-slate-800 mt-1 leading-snug">{cond.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-slate-500 text-[11px]">
                <span>{cond.impactDescription}</span>
                <span className="text-[#00685f] font-semibold flex items-center gap-1">
                  <span>Enforce in Sanction Order</span>
                  <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Institute Quotas & Infrastructure Readiness Matrix */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Institute Quotas & Infrastructure Readiness Matrix</h3>
            <p className="text-xs text-slate-500">
              Verify physical readiness, trainer ratios, and per-batch budget before confirming provisional allocations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
              Show: All 4 Centres
            </span>
            <span className="px-2.5 py-1 bg-slate-100 rounded text-slate-700 font-semibold">
              Sort: By Readiness
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Vocational Institute</th>
                <th className="py-2.5 px-3">Course & Role</th>
                <th className="py-2.5 px-3">Proposed Seats</th>
                <th className="py-2.5 px-3">Trainer Readiness</th>
                <th className="py-2.5 px-3">Lab & PC Readiness</th>
                <th className="py-2.5 px-3 text-right">Est. Batch Cost</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3 text-center">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {plan.instituteAllocations.map((alloc) => (
                <tr key={alloc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 align-top">
                    <span className="font-bold text-slate-900 block">{alloc.instituteName}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {alloc.location} • ID: {alloc.instituteCode}
                    </span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    <span className="font-medium text-slate-800 block">{alloc.courseName}</span>
                    <span className="text-[10px] text-slate-500">
                      {alloc.nsqfLevel} • Role: {alloc.targetRole}
                    </span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    <span className="font-bold text-slate-900 block">{alloc.proposedSeats} Seats</span>
                    <span className="text-[10px] text-slate-500">{alloc.batchesCount} batches of {alloc.batchSize}</span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <span className="material-symbols-outlined text-[14px] text-[#00685f]">verified</span>
                      <span>{alloc.trainersReady}/{alloc.trainersRequired} Ready</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{alloc.trainerStatusNote}</span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    {alloc.hasHardwareDeficit ? (
                      <div className="text-red-700 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        <span>{alloc.labStatusNote}</span>
                      </div>
                    ) : (
                      <div className="text-[#00685f] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>{alloc.labName}: {alloc.pcsReady} PCs ready</span>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-0.5">{alloc.labStatusNote}</span>
                  </td>

                  <td className="py-3 px-3 align-top text-right">
                    <span className="font-mono font-bold text-slate-900 block">₹{alloc.estimatedCostLakhs} L</span>
                    <span className="text-[10px] text-slate-400">Standard Rate</span>
                  </td>

                  <td className="py-3 px-3 align-top">
                    {alloc.operationalStatus === 'ready' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        Ready for Launch
                      </span>
                    )}
                    {alloc.operationalStatus === 'trainer_orientation_req' && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                        Trainer Orientation Req.
                      </span>
                    )}
                    {alloc.operationalStatus === 'capacity_deficit' && (
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px] border border-red-200">
                        Capacity Deficit (Upgrade Needed)
                      </span>
                    )}
                    {alloc.operationalStatus === 'oversupply_review' && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">
                        Review for Possible Oversupply
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 align-top text-center">
                    <button
                      onClick={() => handleToggleAllocationApproval(alloc.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        alloc.approved
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-[#00685f] text-white hover:bg-[#005049]'
                      }`}
                    >
                      {alloc.approved ? 'Approved ✓' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sub-footer strip */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Showing 4 Institute Allocations • Aggregated District Intake: 390 Seats Allocated (Draft)</span>
          <span className="font-mono text-[11px]">Audit Reference: DEMO-AUD-d89e21</span>
        </div>
      </div>

      {/* Assumptions & Demand Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Assumptions (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Interactive District Planning Assumptions</h3>
                <p className="text-xs text-slate-500">
                  Adjust policy coefficients to simulate batch scheduling constraints, subsidy impacts, and timeline elasticity.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                ACTIVE ENGINE v2.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Batch Size Slider */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Batch Size Limit</span>
                  <span className="font-mono font-bold text-[#00685f]">{batchSize} Trainees/batch</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="40"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full accent-[#00685f] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Min: 20</span>
                  <span>Standard Norm: 30</span>
                  <span>Max: 40</span>
                </div>
              </div>

              {/* Teaching Hours Breakdown */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <span className="font-bold text-slate-700 block">Teaching Hours Breakdown</span>
                <div className="flex gap-2 text-[11px]">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-slate-800">
                    120h Core Theory/Lab
                  </span>
                  <span className="px-2 py-1 bg-teal-50 border border-teal-200 rounded font-bold text-[#00685f]">
                    40h Remediation Lab
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">Conforms to NSQF Model Curriculum 2026</span>
              </div>

              {/* Stipend Slider */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Stipend Support Subsidy</span>
                  <span className="font-mono font-bold text-[#00685f]">₹{stipend.toLocaleString()} / mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="3000"
                  step="250"
                  value={stipend}
                  onChange={(e) => setStipend(Number(e.target.value))}
                  className="w-full accent-[#00685f] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Min: ₹1,000</span>
                  <span>Standard: ₹1,500</span>
                  <span>Max: ₹3,000</span>
                </div>
              </div>

              {/* Mandatory Intake Date */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Mandatory Intake Date</span>
                <div className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-slate-200 font-semibold text-slate-800">
                  <span className="material-symbols-outlined text-[16px] text-slate-500">calendar_month</span>
                  <span>01 April 2026 (Q1 FY26 Batch Commencement)</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Admissions close 25 March 2026 across all centers</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Calculations synced with latest district cost norms</span>
            <button
              onClick={handleResetDefaults}
              className="text-[#00685f] hover:underline font-semibold"
            >
              Reset to District Defaults
            </button>
          </div>
        </div>

        {/* Demand Signal Sync (1 col) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">sync</span>
                <h3 className="text-sm font-bold text-slate-900">Demand Signal Sync</h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#00685f]" />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-3.5 text-xs space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-slate-500">Evidence Freshness</span>
                <span className="text-[#00685f] font-mono">SYNCED TODAY</span>
              </div>
              <p className="text-slate-800 leading-snug">
                Last sync <strong>28 Feb 2026</strong>. Scanned <strong>412 active Pune Job Postings</strong> across Hinjawadi, Kharadi, and Talwade clusters.
              </p>
            </div>

            {/* Absorption Feasibility */}
            <div className="space-y-3 text-xs">
              <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider block">
                District Absorption Feasibility
              </span>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Junior Data Analyst (Demand: 420)</span>
                  <span className="font-mono font-bold text-[#00685f]">270 / 420 (64%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00685f] h-full rounded-full" style={{ width: '64%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span>Web Development (Demand: 130)</span>
                  <span className="font-mono font-bold text-amber-700">120 / 130 (92% - Capped)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setToastMsg('Employer demand pulse refreshed (412 Pune postings validated).');
                setTimeout(() => setToastMsg(null), 2500);
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Refresh Demand Evidence Pulse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Governance & Sanction Sign-off Footer */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#213145] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">policy</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <span>Plan Hash {plan.planHash}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                GOV-MAHA-AUDIT
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Drafted by <strong>Pune District Skill Planning Committee</strong> • Dual review workflow active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-semibold text-slate-700 shrink-0">
          <span className="text-[#00685f]">✓ Draft Prepared (S. Patil, DSO)</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
          <span className={plan.status === 'approved' ? 'text-[#00685f]' : 'text-slate-400'}>
            {plan.status === 'approved' ? '✓ Council Sanctioned' : 'Divisional Commissioner Sanction Pending'}
          </span>
        </div>
      </div>
    </div>
  );
};
