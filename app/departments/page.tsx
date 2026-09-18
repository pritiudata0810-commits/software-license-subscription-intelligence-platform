'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  Search,
  Plus,
  DollarSign,
  Users,
  KeyRound,
  TrendingUp,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budgetMonthly: 300000,
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/departments');
      const data = await res.json();
      if (data.success) setDepartments(data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Department ${formData.name} created successfully.`);
        setShowAddModal(false);
        setFormData({ name: '', code: '', budgetMonthly: 300000 });
        fetchDepartments();
      } else {
        setError(data.error || 'Failed to create department');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    }
  };

  const formatINR = (val: number) => `₹${Math.round(val || 0).toLocaleString('en-IN')}`;
  const canManage = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Department Allocations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor organizational cost centers, software license spending, and monthly IT budget adherence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDepartments}
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
              <span>Add Department</span>
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

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {dept.code}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                    <p className="text-[11px] text-slate-500">{dept.employeeCount || 0} Team Members</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    dept.budgetUtilizationRate > 90
                      ? 'bg-rose-100 text-rose-700'
                      : dept.budgetUtilizationRate > 70
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {dept.budgetUtilizationRate}% Budget Used
                </span>
              </div>

              {/* Spend vs Budget */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Actual Monthly Spend:</span>
                  <span className="font-bold text-slate-900">{formatINR(dept.actualSpendMonthly)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Monthly IT Budget:</span>
                  <span className="font-semibold text-slate-600">{formatINR(dept.budgetMonthly)}</span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      dept.budgetUtilizationRate > 90
                        ? 'bg-rose-500'
                        : dept.budgetUtilizationRate > 70
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, dept.budgetUtilizationRate)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Active Licenses:</span>
              <span className="font-bold text-blue-600">{dept.activeLicenseCount || 0} seats</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" /> Create Department
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Data & Analytics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DATA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Monthly IT Budget (₹)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.budgetMonthly}
                  onChange={(e) => setFormData({ ...formData, budgetMonthly: parseFloat(e.target.value) || 0 })}
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
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
