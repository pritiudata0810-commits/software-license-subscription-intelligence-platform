'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Search,
  Plus,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  Building2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  TrendingUp,
  DollarSign
} from 'lucide-react';

export default function SoftwarePage() {
  const { user } = useAuth();
  const [softwareList, setSoftwareList] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    vendorId: '',
    category: 'Productivity & Office',
    description: '',
    version: '1.0',
    website: '',
    initialLicenses: 10,
    costPerLicense: 1000,
  });

  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/software', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (selectedCategory) url.searchParams.set('category', selectedCategory);

      const [swRes, vRes] = await Promise.all([
        fetch(url.toString()),
        fetch('/api/vendors'),
      ]);

      if (swRes.ok) {
        const data = await swRes.json();
        if (data.success) setSoftwareList(data.software);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        if (vData.success) {
          setVendors(vData.vendors);
          if (vData.vendors.length > 0 && !formData.vendorId) {
            setFormData((prev) => ({ ...prev, vendorId: vData.vendors[0].id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching software:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSoftware();
  };

  const handleCreateSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Software "${formData.name}" created successfully with initial licenses.`);
        setShowAddModal(false);
        fetchSoftware();
      } else {
        setError(data.error || 'Failed to create software');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    }
  };

  const handleDeleteSoftware = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/software/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccess('Software deleted successfully.');
        setDeleteConfirmId(null);
        fetchSoftware();
      } else {
        setError(data.error || 'Failed to delete software');
        setDeleteConfirmId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error deleting software');
    }
  };

  const categories = [
    'All Categories',
    'Productivity & Office',
    'Design & Multimedia',
    'Design & Prototyping',
    'Project Management',
    'Team Collaboration',
    'Video Conferencing',
    '3D CAD & Engineering',
    'Cloud & Infrastructure',
  ];

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Software Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally manage software assets, vendor contracts, seat pools, and utilization rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSoftware}
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
              <span>Add Software</span>
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

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search software name or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto justify-between md:justify-end">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                viewMode === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Software Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Software Name</th>
                <th className="py-3.5 px-4">Vendor & Category</th>
                <th className="py-3.5 px-4">Seat / Token Allocation</th>
                <th className="py-3.5 px-4">Utilization</th>
                <th className="py-3.5 px-4">{viewMode === 'yearly' ? 'Yearly Cost' : 'Monthly Cost'}</th>
                <th className="py-3.5 px-4">{viewMode === 'yearly' ? 'Annual Unrecovered Cost' : 'Idle Waste'}</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {softwareList.length > 0 ? (
                softwareList.map((sw) => {
                  const isToken = sw.consumptionType === 'TOKEN_BASED';
                  const displayCost = viewMode === 'yearly' 
                    ? (sw.annualCost || sw.monthlyCost * 12) 
                    : sw.monthlyCost;
                  const displayWaste = viewMode === 'yearly'
                    ? (sw.potentialAnnualSaving || sw.unusedMonthlyCost * 12)
                    : sw.unusedMonthlyCost;

                  return (
                    <tr key={sw.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{sw.name}</span>
                          {isToken && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#E3DCFD] text-purple-800 border border-purple-200 uppercase tracking-wider">
                              Token
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">v{sw.version || '1.0'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{sw.vendor?.name || 'Unknown Vendor'}</span>
                        </div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                          {sw.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isToken ? (
                          <div>
                            <div className="font-bold text-slate-900">
                              {(sw.allocatedTokens ? (sw.allocatedTokens / 1_000_000).toFixed(1) + 'M' : '50.0M')} Tokens
                            </div>
                            <div className="text-[10px] text-purple-700 font-semibold">
                              {(sw.usedTokens ? (sw.usedTokens / 1_000_000).toFixed(1) + 'M' : '38.5M')} used ({Math.max(0, 100 - sw.utilizationRate).toFixed(1)}% idle)
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">
                              {sw.activeAssignments} / {sw.totalLicenses} Seats
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {sw.availableLicenses} available ({sw.unusedLicenses} unused)
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                sw.utilizationRate >= 75
                                  ? 'bg-emerald-500'
                                  : sw.utilizationRate >= 50
                                  ? 'bg-blue-600'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, sw.utilizationRate)}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">{sw.utilizationRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{formatINR(displayCost)}{viewMode === 'yearly' ? '/yr' : '/mo'}</div>
                        <div className="text-[10px] text-slate-400">
                          {isToken 
                            ? `@ ₹${sw.tokenUnitCost || 0.002}/token` 
                            : `@ ${formatINR(viewMode === 'yearly' ? sw.costPerLicense * 12 : sw.costPerLicense)}/seat`}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-bold ${displayWaste > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formatINR(displayWaste)}{viewMode === 'yearly' ? '/yr' : '/mo'}
                        </div>
                        {displayWaste > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {isToken ? 'Unused token quota' : (viewMode === 'yearly' ? 'Capital unrecovered' : `Save ${formatINR(sw.potentialAnnualSaving)}/yr`)}
                          </div>
                        )}
                      </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {sw.website && (
                          <a
                            href={sw.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                            title="Visit Website"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {canManage && (
                          <button
                            onClick={() => setDeleteConfirmId(sw.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Delete Software"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No software matches your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to remove this software from the catalog? Deletion will be rejected if active licenses are currently assigned to staff.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSoftware(deleteConfirmId)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete Software
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Software Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" /> Add New Software to Catalog
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateSoftware} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Software Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Adobe Creative Cloud"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vendor</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {categories.filter(c => c !== 'All Categories').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.initialLicenses}
                    onChange={(e) => setFormData({ ...formData, initialLicenses: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cost Per Seat / Month (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.costPerLicense}
                    onChange={(e) => setFormData({ ...formData, costPerLicense: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Software details, enterprise package notes..."
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
                  className="px-4 py-2 rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
                >
                  Create Software
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
