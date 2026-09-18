'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldAlert,
  Clock,
  Layers,
  DollarSign
} from 'lucide-react';

export default function RiskAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, critical: 0, warning: 0, info: 0 });
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [dismissSuccess, setDismissSuccess] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts || []);
        setCounts({
          total: data.totalCount || 0,
          critical: data.criticalCount || 0,
          warning: data.warningCount || 0,
          info: data.infoCount || 0,
        });
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDismissAlert = async (id: string) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setDismissSuccess('Alert dismissed from view.');
      setTimeout(() => setDismissSuccess(''), 3000);
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Risk & Alert Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time proactive monitoring for contract deadlines, idle financial waste, and capacity ceilings.
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Alerts</span>
        </button>
      </div>

      {dismissSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{dismissSuccess}</span>
        </div>
      )}

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-xs">
        <button
          onClick={() => setFilterSeverity('ALL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterSeverity === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All Alerts ({counts.total})
        </button>
        <button
          onClick={() => setFilterSeverity('CRITICAL')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            filterSeverity === 'CRITICAL'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Critical ({counts.critical})</span>
        </button>
        <button
          onClick={() => setFilterSeverity('WARNING')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            filterSeverity === 'WARNING'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-amber-700 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Warnings ({counts.warning})</span>
        </button>
        <button
          onClick={() => setFilterSeverity('INFO')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${
            filterSeverity === 'INFO'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-sky-700 hover:bg-sky-50'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Informational ({counts.info})</span>
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, idx) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isWarning = alert.severity === 'WARNING';

            return (
              <div
                key={alert.id || idx}
                className={`p-5 rounded-3xl border shadow-sm transition flex items-start justify-between gap-4 ${
                  isCritical
                    ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                    : isWarning
                    ? 'bg-amber-50/70 border-amber-200/80 text-amber-950'
                    : 'bg-white border-slate-200/80 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      isCritical
                        ? 'bg-rose-600 text-white'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-sky-600 text-white'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-rose-200/80 text-rose-800'
                            : isWarning
                            ? 'bg-amber-200/80 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert.severity} • {alert.entityType}
                      </span>
                      <h3 className="text-xs font-bold">{alert.title}</h3>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">{alert.message}</p>
                    <div className="mt-2 text-[10px] opacity-70 flex items-center gap-2">
                      <span>Detected: {new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-slate-400 hover:text-slate-600 transition flex-shrink-0"
                  title="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-800">No Active Risk Alerts</div>
            <p className="text-xs text-slate-400 mt-1">
              Your software subscriptions and contract renewals are in healthy compliance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
