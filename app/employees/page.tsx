'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Search,
  Plus,
  Mail,
  Briefcase,
  KeyRound,
  Shield,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  UserCheck
} from 'lucide-react';

export default function EmployeesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password@123',
    role: 'EMPLOYEE',
    designation: 'Staff Specialist',
    departmentId: '',
  });

  const fetchEmployeesData = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
      ]);

      if (uRes.ok) {
        const ud = await uRes.json();
        if (ud.success) setUsers(ud.users);
      }
      if (dRes.ok) {
        const dd = await dRes.json();
        if (dd.success) {
          setDepartments(dd.departments);
          if (dd.departments.length > 0 && !formData.departmentId) {
            setFormData((prev) => ({ ...prev, departmentId: dd.departments[0].id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Employee account created for ${formData.name}.`);
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: 'Password@123',
          role: 'EMPLOYEE',
          designation: 'Staff Specialist',
          departmentId: departments[0]?.id || '',
        });
        fetchEmployeesData();
      } else {
        setError(data.error || 'Failed to create employee');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.designation && u.designation.toLowerCase().includes(q))
    );
  });

  const canManage = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage organization team members, assigned software seats, and departmental permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchEmployeesData}
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
              <span>Add Employee</span>
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
            placeholder="Search employee by name, email, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredUsers.length} total personnel
        </span>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((emp) => (
          <div
            key={emp.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-slate-200 text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{emp.name}</h3>
                    <p className="text-[11px] text-slate-500">{emp.designation || 'Staff Member'}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    emp.role === 'ADMIN'
                      ? 'bg-indigo-100 text-indigo-700'
                      : emp.role === 'MANAGER'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {emp.role}
                </span>
              </div>

              {/* Department & Email */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{emp.department?.name || 'Unassigned Department'}</span>
                </div>
              </div>

              {/* Assigned Software Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Assigned Licenses</span>
                  <span className="font-bold text-slate-700">{emp.activeLicensesCount || 0} active</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {emp.assignedSoftware && emp.assignedSoftware.length > 0 ? (
                    emp.assignedSoftware.map((sw: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-medium text-[10px] border border-blue-100"
                      >
                        {sw}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No software licenses assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Add New Employee
              </h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@enterprise.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Senior Software Engineer"
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
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
