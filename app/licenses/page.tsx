'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  KeyRound,
  Search,
  Plus,
  Filter,
  Calendar,
  Layers,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function LicensesPage() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<any[]>([]);
  const [softwareList, setSoftwareList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    softwareId: '',
    licenseType: 'PER_USER',
    totalQuantity: 20,
    costPerLicense: 1000,
    billingFrequency: 'MONTHLY',
    renewalDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/licenses', window.location.origin);
      if (statusFilter) url.searchParams.set('status', statusFilter);

      const [licRes, swRes] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/software'),
      ]);

      if (licRes.ok) {
        const data = await licRes.json();
        if (data.success) setLicenses(data.licenses);
      }
      if (swRes.ok) {
        const swData = await swRes.json();
        if (swData.success) {
          setSoftwareList(swData.software);
          if (swData.software.length > 0 && !formData.softwareId) {
            setFormData((prev) => ({ ...prev, softwareId: swData.software[0].id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching licenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, [statusFilter]);

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('License batch added successfully.');
        setShowAddModal(false);
        fetchLicenses();
      } else {
        setError(data.error || 'Failed to create license');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    }
  };

  const filteredLicenses = licenses.filter((lic) => {
    const swName = lic.software?.name || '';
    return swName.toLowerCase().includes(search.toLowerCase());
  });

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">License Inventory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track seat quotas, active allocations, unused idle capacity, and contract renewal deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLicenses}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add License Pool</span>
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

      {/* Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by software name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* License Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Software Product</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Total Seats</th>
                <th className="py-3.5 px-4">Active</th>
                <th className="py-3.5 px-4">Available (Unused)</th>
                <th className="py-3.5 px-4">Utilization</th>
                <th className="py-3.5 px-4">Cost / Seat</th>
                <th className="py-3.5 px-4">Renewal Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLicenses.length > 0 ? (
                filteredLicenses.map((lic) => (
                  <tr key={lic.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{lic.software?.name}</div>
                      <div className="text-[10px] text-slate-400">{lic.software?.category}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">
                      {lic.licenseType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {lic.totalQuantity}
                    </td>
                    <td className="py-3 px-4 font-semibold text-blue-600">
                      {lic.assignedQuantity}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {lic.availableQuantity}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lic.utilizationRate >= 75
                                ? 'bg-emerald-500'
                                : lic.utilizationRate >= 50
                                ? 'bg-blue-600'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, lic.utilizationRate)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800">{lic.utilizationRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {formatINR(lic.costPerLicense)}/mo
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(lic.renewalDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lic.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : lic.status === 'EXPIRING_SOON'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {lic.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No license pools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add License Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-600" /> Provision License Pool
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateLicense} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Software</label>
                <select
                  value={formData.softwareId}
                  onChange={(e) => setFormData({ ...formData, softwareId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  {softwareList.map((sw) => (
                    <option key={sw.id} value={sw.id}>{sw.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">License Type</label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="PER_USER">Per User</option>
                    <option value="ENTERPRISE">Enterprise</option>
                    <option value="FLOATING">Floating</option>
                    <option value="PER_CORE">Per Core</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Per Seat / Mo (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.costPerLicense}
                    onChange={(e) => setFormData({ ...formData, costPerLicense: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Renewal Date</label>
                  <input
                    type="date"
                    required
                    value={formData.renewalDate}
                    onChange={(e) => setFormData({ ...formData, renewalDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Contract Reference</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Order ID, license key or purchase order"
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
                  Save License Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
