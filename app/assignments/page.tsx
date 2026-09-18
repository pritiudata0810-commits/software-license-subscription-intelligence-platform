'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  UserCheck,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Building2,
  User,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revokeConfirmId, setRevokeConfirmId] = useState<string | null>(null);

  const fetchAssignmentsData = async () => {
    setLoading(true);
    try {
      const [asRes, uRes, lRes] = await Promise.all([
        fetch('/api/assignments'),
        fetch('/api/users'),
        fetch('/api/licenses'),
      ]);

      if (asRes.ok) {
        const d = await asRes.json();
        if (d.success) setAssignments(d.assignments);
      }
      if (uRes.ok) {
        const ud = await uRes.json();
        if (ud.success) {
          setUsers(ud.users);
          if (ud.users.length > 0 && !selectedUserId) setSelectedUserId(ud.users[0].id);
        }
      }
      if (lRes.ok) {
        const ld = await lRes.json();
        if (ld.success) {
          setLicenses(ld.licenses);
          if (ld.licenses.length > 0 && !selectedLicenseId) setSelectedLicenseId(ld.licenses[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching assignments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentsData();
  }, []);

  const handleAssignLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseId: selectedLicenseId,
          userId: selectedUserId,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('License seat successfully provisioned to employee.');
        setShowAssignModal(false);
        setNotes('');
        fetchAssignmentsData();
      } else {
        setError(data.error || 'Failed to assign license');
      }
    } catch (err: any) {
      setError(err.message || 'Error assigning license');
    }
  };

  const handleRevokeAssignment = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || 'License revoked successfully.');
        setRevokeConfirmId(null);
        fetchAssignmentsData();
      } else {
        setError(data.error || 'Failed to revoke license');
        setRevokeConfirmId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error revoking license');
    }
  };

  // Find currently selected license to show remaining available capacity in real time
  const activeSelectedLicense = licenses.find((l) => l.id === selectedLicenseId);
  const availableSeats = activeSelectedLicense ? activeSelectedLicense.availableQuantity : 0;

  const filteredAssignments = assignments.filter((a) => {
    const userName = a.user?.name || '';
    const swName = a.license?.software?.name || '';
    const query = search.toLowerCase();
    return userName.toLowerCase().includes(query) || swName.toLowerCase().includes(query);
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">License Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Allocate software seats to team members, enforce quota limits, and revoke unneeded licenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAssignmentsData}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          {canManage && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign License</span>
            </button>
          )}
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

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by employee or software..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredAssignments.length} active assignment(s)
        </span>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Software Allocated</th>
                <th className="py-3.5 px-4">Assigned Date</th>
                <th className="py-3.5 px-4">Status</th>
                {canManage && <th className="py-3.5 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAssignments.length > 0 ? (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{a.user?.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {a.department?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-blue-600">{a.license?.software?.name}</div>
                      <div className="text-[10px] text-slate-400">{a.license?.software?.category}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(a.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                        Active Seat
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setRevokeConfirmId(a.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition"
                        >
                          Revoke Seat
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="py-10 text-center text-slate-400">
                    No active license assignments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {revokeConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Revoke License Seat</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to revoke this license from the employee? The seat will be returned to the unassigned pool immediately.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setRevokeConfirmId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeAssignment(revokeConfirmId)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign License Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" /> Allocate License Seat
              </h3>
              <button onClick={() => setShowAssignModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAssignLicense} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Employee</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.department?.code || 'General'} - {u.designation || u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Software License Pool</label>
                <select
                  value={selectedLicenseId}
                  onChange={(e) => setSelectedLicenseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {licenses.map((lic) => (
                    <option key={lic.id} value={lic.id}>
                      {lic.software?.name} — {lic.availableQuantity} available of {lic.totalQuantity} seats
                    </option>
                  ))}
                </select>
              </div>

              {/* Real-time Availability Badge */}
              <div
                className={`p-3 rounded-2xl border flex items-center gap-2.5 ${
                  availableSeats > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {availableSeats > 0 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <div className="text-xs">
                  <span className="font-bold">
                    {availableSeats > 0
                      ? `${availableSeats} Seats Available in this Pool`
                      : '0 Seats Available — Pool Exhausted!'}
                  </span>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {availableSeats > 0
                      ? 'Assignment is permitted and will deduct 1 seat from the unused pool.'
                      : 'Cannot allocate seat. Purchase more licenses or reallocate from another user.'}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allocation Notes (Optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Project justification, workstation ID..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={availableSeats <= 0}
                  className="px-4 py-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Allocate Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
