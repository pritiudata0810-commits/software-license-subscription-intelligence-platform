'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/audit-logs?page=${pageNum}&limit=25`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    const actor = log.user?.name || '';
    const action = log.action || '';
    const entity = log.entity || '';
    return actor.toLowerCase().includes(q) || action.toLowerCase().includes(q) || entity.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Audit Trail & Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of all user authentications, license provisions, approvals, and contract updates.
          </p>
        </div>

        <button
          onClick={() => fetchLogs(page)}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, actor or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {total} logged governance events
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity Affected</th>
                <th className="py-3.5 px-4">Transaction Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.user ? (
                        <div>
                          <div>{log.user.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{log.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Process</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          log.action.includes('ASSIGN') || log.action.includes('APPROVE')
                            ? 'bg-emerald-100 text-emerald-700'
                            : log.action.includes('DELETE') || log.action.includes('REJECT')
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] max-w-md truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No audit records match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
