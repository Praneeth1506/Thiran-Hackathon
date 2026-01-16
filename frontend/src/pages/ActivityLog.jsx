import React, { useState, useEffect } from 'react';
import { History, ArrowRight, RefreshCw } from 'lucide-react';
import storage from '../utils/storage';
import '../styles/Pages.css';

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);

    // Load logs from localStorage on mount
    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = () => {
        const loadedLogs = storage.getLogs();
        setLogs(loadedLogs);
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
                    <h2 className="page-title">System Activity Log</h2>
                    <p className="page-subtitle">Audit trail of all actions performed in the system.</p>
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

            {logs.length > 0 ? (
                <div className="glass-morphism overflow-hidden">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>User</th>
                                <th>Target</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <span className="font-mono text-xs text-slate-400">
                                            {log.timestamp}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getActionColor(log.type)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="font-medium text-slate-200">
                                            {log.user}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-slate-400">
                                            {log.target}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <button className="action-btn opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">📊</div>
                    <p className="text-lg font-semibold mb-2">No activity logs yet</p>
                    <p className="text-sm">Activity logs will appear here as actions are performed in the system.</p>
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
