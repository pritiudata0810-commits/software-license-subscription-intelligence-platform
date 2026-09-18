'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  RefreshCw,
  User,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching requests for approval:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/requests/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comments: decision === 'APPROVED' ? 'Approved by manager.' : 'Rejected due to current allocation limits.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || `Request ${decision.toLowerCase()} successfully.`);
        fetchPendingRequests();
      } else {
        setError(data.error || 'Failed to process decision');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const pastDecisions = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Software Approvals & Provisioning</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review personnel software license requests, review pool availability recommendations, and authorize allocation.
          </p>
        </div>

        <button
          onClick={fetchPendingRequests}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Section 1: Pending Approvals Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Pending Requests Awaiting Review ({pendingRequests.length})</span>
          </h2>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{req.softwareName}</h3>
                        <p className="text-[11px] text-slate-500">{req.category} • Requested by {req.user?.name}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                        req.priority === 'URGENT' || req.priority === 'HIGH'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>

                  {/* Justification & Comments */}
                  <div className="my-4 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700">Reason: </span>
                      <span className="text-slate-600">{req.reason}</span>
                    </div>
                    {req.comments && (
                      <div>
                        <span className="font-semibold text-slate-700">Notes: </span>
                        <span className="text-slate-500">{req.comments}</span>
                      </div>
                    )}
                  </div>

                  {/* Explainable Intelligence Recommendation Box */}
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      req.hasAvailableUnused
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                        : 'bg-blue-50/80 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Intelligent Recommendation:</span>
                    </div>
                    <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                      {req.intelligenceRecommendation}
                    </p>
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleDecision(req.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs transition disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    disabled={actionLoadingId === req.id}
                    onClick={() => handleDecision(req.id, 'APPROVED')}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>
                      {req.hasAvailableUnused ? 'Approve & Allocate Existing Seat' : 'Approve Procurement'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white rounded-3xl border border-slate-200/80 text-center shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-800">All caught up!</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">No pending software requests awaiting review.</p>
          </div>
        )}
      </div>

      {/* Section 2: Historical Approvals */}
      <div className="space-y-3 pt-6">
        <h2 className="text-sm font-bold text-slate-900">Decision History ({pastDecisions.length})</h2>
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Software</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Decision</th>
                  <th className="py-3 px-4">Action Taken</th>
                  <th className="py-3 px-4">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pastDecisions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.softwareName}</td>
                    <td className="py-3 px-4">{r.user?.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'APPROVED' || r.status === 'FULFILLED_EXISTING'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status === 'FULFILLED_EXISTING' ? 'Fulfilled (Reuse)' : r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {r.approvals?.[0]?.actionTaken?.replace('_', ' ') || 'Processed'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {r.approvals?.[0]?.approvedBy?.name || 'Authorized Manager'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
