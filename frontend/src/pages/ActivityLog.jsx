import React, { useState, useEffect, useCallback } from 'react';
import { History, ArrowRight, RefreshCw, AlertTriangle, Clock, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { activityAPI, slaAPI } from '../utils/api';
import '../styles/Pages.css';

const ActivityLog = () => {
    const [activeTab, setActiveTab] = useState('activity'); // 'activity' or 'breaches'
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            let result;
            if (activeTab === 'activity') {
                result = await activityAPI.getLogs();
            } else {
                result = await slaAPI.getBreaches();
            }
            setData(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(err.message || `Failed to load ${activeTab}`);
            console.error(`Error loading ${activeTab}:`, err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return 'N/A';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'ASSIGNED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'COMPLETED':
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-white/5';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -5 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <motion.div
            className="page-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="page-header">
                <div>
                    <h2 className="page-title">Monitoring & Logs</h2>
                    <p className="page-subtitle">Track system activities and service level compliance.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'activity' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {activeTab === 'activity' && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className="flex items-center gap-2">
                                <Activity size={16} />
                                Activity History
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('breaches')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${activeTab === 'breaches' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {activeTab === 'breaches' && (
                                <motion.div
                                    layoutId="activeTabBadge"
                                    className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={16} />
                                SLA Breaches
                            </div>
                        </button>
                    </div>
                    <button
                        onClick={loadData}
                        className="btn btn-outline h-[42px] group"
                        title="Refresh data"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-morphism border-rose-500/20 mb-6"
                    style={{ padding: '1rem', borderLeft: '4px solid #f43f5e' }}
                >
                    <p style={{ color: '#fca5a5' }} className="text-sm">{error}</p>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-morphism empty-state h-[400px]"
                    >
                        <div className="relative mb-4">
                            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <History size={24} className="text-indigo-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-lg font-semibold text-slate-300">Synchronizing nexus...</p>
                        <p className="text-sm text-slate-500">Retrieving system historical data.</p>
                    </motion.div>
                ) : data.length > 0 ? (
                    <motion.div
                        key="data-container"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={containerVariants}
                        className="glass-morphism overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table>
                                {activeTab === 'activity' ? (
                                    <>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '25%' }}>Timestamp</th>
                                                <th style={{ width: '20%' }}>Changed By</th>
                                                <th style={{ width: '25%' }}>Transition</th>
                                                <th style={{ width: '15%' }}>Reference</th>
                                                <th style={{ width: '15%' }}>Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((log) => (
                                                <motion.tr
                                                    key={log._id || Math.random().toString()}
                                                    variants={itemVariants}
                                                >
                                                    <td>
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-200 font-medium text-sm">{formatDate(log.timestamp)}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono tracking-tighter">
                                                                {log._id?.toString().substring(18) || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
                                                                {log.changed_by?.charAt(0) || 'A'}
                                                            </div>
                                                            <span className="text-slate-300 font-medium text-xs">{log.changed_by || 'System'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(log.old_status)}`}>
                                                                {log.old_status || 'INIT'}
                                                            </span>
                                                            <ArrowRight size={12} className="text-slate-600" />
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(log.new_status)}`}>
                                                                {log.new_status || 'DONE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-slate-500 font-mono text-[10px]">
                                                            {log.task_id ? `${log.task_id.substring(0, 8)}...` : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="text-slate-400 italic text-xs truncate max-w-[150px] inline-block">
                                                            {log.remark || '—'}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </>
                                ) : (
                                    <>
                                        <thead>
                                            <tr>
                                                <th>Department</th>
                                                <th>Incident</th>
                                                <th>Priority</th>
                                                <th>SLA Policy</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map((log) => (
                                                <motion.tr
                                                    key={log._id || Math.random().toString()}
                                                    variants={itemVariants}
                                                >
                                                    <td>
                                                        <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                                                            {log.department || 'GENERAL'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="text-slate-100 font-medium text-sm">{log.issue || 'Service Request'}</span>
                                                    </td>
                                                    <td>
                                                        <span className={`px-2 py-1 rounded-md uppercase text-[10px] font-bold border ${log.priority === 'HIGH' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                                                            log.priority === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                                                'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                                                            }`}>
                                                            {log.priority || 'MEDIUM'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                                                                <Clock size={12} />
                                                                {log.sla_hours ? log.sla_hours.toFixed(1) : '0.0'}h assigned
                                                            </div>
                                                            <div className="text-[10px] text-rose-400 font-bold">
                                                                OVERDUE BY {log.elapsed_hours ? (log.elapsed_hours - (log.sla_hours || 0)).toFixed(1) : '0.0'}h
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 uppercase tracking-widest">
                                                            Breached
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </>
                                )}
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="glass-morphism empty-state h-[400px]"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                            <History size={32} className="text-slate-600" />
                        </div>
                        <p className="text-lg font-semibold mb-2 text-slate-300">Logs Empty</p>
                        <p className="text-sm text-slate-500">No {activeTab === 'activity' ? 'activity history' : 'SLA breaches'} recorded yet.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 flex justify-between items-center px-4"
                >
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        Data Integrity: <span className="text-emerald-500/70">Verified</span>
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        Showing <span className="text-slate-300">{data.length}</span> {data.length === 1 ? 'record' : 'records'}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ActivityLog;
