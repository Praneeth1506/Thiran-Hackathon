import React, { useState, useEffect } from 'react';
import { History, ArrowRight, RefreshCw } from 'lucide-react';
import { slaAPI } from '../utils/api';
import '../styles/Pages.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load SLA breaches from backend on mount
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await slaAPI.getBreaches();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load SLA breaches');
            console.error('Error loading SLA breaches:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (type) => {
        switch (type) {
            case 'create':
                return 'bg-emerald-500/10 text-emerald-400';
            case 'update':
                return 'bg-amber-500/10 text-amber-400';
            case 'delete':
                return 'bg-red-500/10 text-red-400';
            default:
                return 'bg-indigo-500/10 text-indigo-400';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">SLA Breach</h2>
                    <p className="page-subtitle">Service Level Agreement violations detected in the system.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={loadLogs}
                        className="btn btn-outline"
                        title="Refresh logs"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <History size={24} className="text-indigo-400" />
                    </div>
                </div>
            </div>

            {error && (
                <div className="glass-morphism" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ color: '#fca5a5' }}>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">⏳</div>
                    <p className="text-lg font-semibold mb-2">Loading SLA breaches...</p>
                </div>
            ) : logs.length > 0 ? (
                <div className="glass-morphism overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Issue</th>
                                <th>Priority</th>
                                <th>SLA Hours</th>
                                <th>Elapsed Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id || log.id}>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold">
                                            {log.department || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-slate-300">
                                            {log.issue || 'Unknown Issue'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded uppercase text-[10px] font-bold ${log.priority === 'HIGH' ? 'bg-red-900/30 border border-red-500/50 text-red-300' :
                                            log.priority === 'MEDIUM' ? 'bg-orange-900/30 border border-orange-500/50 text-orange-300' :
                                                'bg-blue-900/30 border border-blue-500/50 text-blue-300'
                                            }`}>
                                            {log.priority || 'MEDIUM'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-slate-300 font-mono text-sm">
                                            {log.sla_hours ? log.sla_hours.toFixed(3) : '0.000'}h
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-amber-300 font-mono text-sm font-semibold">
                                            {log.elapsed_hours ? log.elapsed_hours.toFixed(3) : '0.000'}h
                                        </span>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-red-900/30 border border-red-500/50 text-red-300 text-xs font-bold">
                                            BREACHED
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">✅</div>
                    <p className="text-lg font-semibold mb-2">No SLA breaches detected</p>
                    <p className="text-sm">All tasks are meeting their Service Level Agreements.</p>
                </div>
            )}

            {logs.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Showing {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ActivityLog;
