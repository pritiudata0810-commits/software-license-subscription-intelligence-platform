'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Layers,
  X,
  RefreshCw,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [softwareList, setSoftwareList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    softwareId: '',
    priority: 'MEDIUM',
    reason: '',
    requiredDate: '',
    comments: '',
  });

  const fetchRequestsData = async () => {
    setLoading(true);
    try {
      const [rqRes, swRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/software'),
      ]);

      if (rqRes.ok) {
        const d = await rqRes.json();
        if (d.success) setRequests(d.requests);
      }
      if (swRes.ok) {
        const swd = await swRes.json();
        if (swd.success) {
          setSoftwareList(swd.software);
          if (swd.software.length > 0 && !formData.softwareId) {
            setFormData((prev) => ({ ...prev, softwareId: swd.software[0].id }));
          }
        }
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(
          data.availableUnusedSeats > 0
            ? `Request submitted! Note: System detected ${data.availableUnusedSeats} unused seat(s) in pool. An existing license will be allocated upon approval.`
            : 'Software request submitted for manager review.'
        );
        setShowAddModal(false);
        setFormData({
          softwareId: softwareList[0]?.id || '',
          priority: 'MEDIUM',
          reason: '',
          requiredDate: '',
          comments: '',
        });
        fetchRequestsData();
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    }
  };

  // Check currently selected software in modal for existing unused seats
  const selectedSoftware = softwareList.find((s) => s.id === formData.softwareId);
  const availableSeatsInSelected = selectedSoftware ? selectedSoftware.availableLicenses : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Software Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Request new software tools with smart reuse detection to prevent redundant procurement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRequestsData}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Software</span>
          </button>
        </div>
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

      {/* Requests Feed Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Software Requested</th>
                <th className="py-3.5 px-4">Requester</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Reason & Justification</th>
                <th className="py-3.5 px-4">Pool Pre-Check</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submission Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{r.softwareName}</div>
                      <div className="text-[10px] text-slate-400">{r.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.user?.name}</div>
                      <div className="text-[10px] text-slate-400">{r.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          r.priority === 'URGENT' || r.priority === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : r.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-600">{r.reason}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        {r.hasAvailableUnused ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            {r.availableUnusedSeats} Unused Seats in Pool
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">0 Available (Requires Buy)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'APPROVED' || r.status === 'FULFILLED_EXISTING'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {r.status === 'FULFILLED_EXISTING' ? 'Fulfilled (Reuse)' : r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No software requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Submission Modal with Smart Pool Check */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" /> Submit Software Request
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Software</label>
                <select
                  value={formData.softwareId}
                  onChange={(e) => setFormData({ ...formData, softwareId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {softwareList.map((sw) => (
                    <option key={sw.id} value={sw.id}>
                      {sw.name} ({sw.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Smart Unused Pre-Check Display */}
              <div
                className={`p-3 rounded-2xl border flex items-start gap-2.5 ${
                  availableSeatsInSelected > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}
              >
                {availableSeatsInSelected > 0 ? (
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-xs">
                    {availableSeatsInSelected > 0
                      ? `${availableSeatsInSelected} Existing License Seat(s) Available!`
                      : 'No Existing Unused Seats'}
                  </div>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {availableSeatsInSelected > 0
                      ? 'The system will recommend fulfilling this request from existing unused inventory rather than buying new licenses.'
                      : 'If approved, IT management will authorize procurement of an additional license seat.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Required By</label>
                  <input
                    type="date"
                    value={formData.requiredDate}
                    onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Business Justification / Reason</label>
                <textarea
                  rows={3}
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain why this software is needed for your project workflow..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Additional Notes (Optional)</label>
                <input
                  type="text"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Project name, client code, etc."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
