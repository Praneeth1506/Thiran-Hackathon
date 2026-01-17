import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, MapPin, Tag } from 'lucide-react';
import { complaintAPI } from '../utils/api';
import '../styles/Pages.css';

const CitizenPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ description: '', location: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load complaints from backend on mount
    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await complaintAPI.getAll();
            setComplaints(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load complaints');
            console.error('Error loading complaints:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (complaint = null) => {
        if (complaint) {
            setEditingId(complaint._id);
            setFormData({
                description: complaint.description || '',
                location: complaint.location || ''
            });
        } else {
            setEditingId(null);
            setFormData({ description: '', location: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Note: Update logic is not explicitly in base API, but adding for completeness
            // For now, we only have 'create' which the backend uses for processing
            const response = await complaintAPI.create({
                description: formData.description,
                location: formData.location || 'Not specified'
            });

            await loadComplaints();
            setIsModalOpen(false);
            setFormData({ description: '', location: '' });

            if (response.tasks && response.tasks.length > 0) {
                const departments = [...new Set(response.tasks.map(t => t.department))].join(', ');
                console.log(`Complaint submitted successfully. Assigned to: ${departments}`);
            }
        } catch (err) {
            setError(err.message || 'Failed to save complaint');
            console.error('Error saving complaint:', err);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            deleteComplaint(id);
        }
    };

    const deleteComplaint = async (id) => {
        try {
            await complaintAPI.delete(id);
            await loadComplaints();
        } catch (err) {
            setError(err.message || 'Failed to delete complaint');
        }
    };

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        if (s === 'RESOLVED' || s === 'COMPLETED') return 'status-resolved';
        if (s === 'IN_PROGRESS' || s === 'PROCESSING' || s === 'ASSIGNED') return 'status-progress';
        return 'status-pending';
    };

    const getPriorityStyle = (priority) => {
        const p = priority?.toUpperCase() || 'MEDIUM';
        switch (p) {
            case 'HIGH':
            case 'CRITICAL':
            case 'URGENT':
                return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
            case 'MEDIUM':
                return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
            case 'LOW':
                return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
            default:
                return 'bg-slate-500/10 border-white/5 text-slate-400';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Citizen Helpdesk</h2>
                    <p className="page-subtitle">Raise and monitor your public service complaints in real-time.</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    Create Report
                </button>
            </div>

            {error && (
                <div className="glass-morphism" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #f43f5e' }}>
                    <p className="text-rose-300 flex items-center gap-2 text-sm">
                        <AlertCircle size={16} />
                        {error}
                        <button className="ml-auto text-[10px] underline" onClick={() => setError(null)}>Dismiss</button>
                    </p>
                </div>
            )}

            {loading ? (
                <div className="glass-morphism empty-state">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
                    <p className="text-sm text-slate-400">Loading your records...</p>
                </div>
            ) : complaints.length > 0 ? (
                <div className="glass-morphism overflow-hidden">
                    <div className="overflow-x-auto">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}></th>
                                    <th style={{ width: '35%' }}>Report Details</th>
                                    <th style={{ width: '15%' }}>Department</th>
                                    <th style={{ width: '10%' }}>Priority</th>
                                    <th style={{ width: '15%' }}>Location</th>
                                    <th style={{ width: '10%' }}>Status</th>
                                    <th style={{ width: '10%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((complaint) => {
                                    const statusStyle = getStatusStyle(complaint.status);
                                    const firstIssue = complaint.issues_detected?.[0]?.replace('_', ' ') || 'General Report';

                                    return (
                                        <tr key={complaint._id}>
                                            <td>
                                                {statusStyle === 'status-resolved' ? <CheckCircle2 size={18} className="text-emerald-400" /> :
                                                    statusStyle === 'status-progress' ? <Clock size={18} className="text-amber-400" /> :
                                                        <AlertCircle size={18} className="text-indigo-400" />}
                                            </td>
                                            <td>
                                                <div className="flex flex-col gap-1 py-1">
                                                    <div className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-2">
                                                        <Tag size={10} className="text-indigo-400" />
                                                        {firstIssue}
                                                    </div>
                                                    <div className="text-xs text-slate-400 leading-relaxed truncate max-w-[300px]" title={complaint.description}>
                                                        {complaint.description}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold tracking-wider text-slate-300">
                                                    {complaint.department || 'GENERAL'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold tracking-wider border ${getPriorityStyle(complaint.priority)}`}>
                                                    {complaint.priority || 'MEDIUM'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <MapPin size={12} className="text-slate-500" />
                                                    <span className="truncate max-w-[120px]">{complaint.location || 'Not Specified'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${statusStyle}`}>
                                                    {complaint.status?.replace('_', ' ') || 'PENDING'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenModal(complaint)} className="action-btn action-btn-edit" title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(complaint._id)} className="action-btn action-btn-delete" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="glass-morphism empty-state h-[300px]">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/5">
                        <Plus size={32} className="text-slate-600" />
                    </div>
                    <p className="text-lg font-semibold mb-2">No active reports</p>
                    <p className="text-sm text-slate-500 mb-6">Your community reports will appear here once submitted.</p>
                    <button className="btn btn-outline" onClick={() => handleOpenModal()}>Submit Incident</button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-morphism modal-content max-w-lg w-full">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                {editingId ? 'Modify Report' : 'File New Report'}
                            </h3>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Incident Description *</label>
                                <textarea
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all min-h-[150px] text-sm leading-relaxed"
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the issue you're reporting in detail (e.g., Streetlight out on 5th Ave)..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location (Optional)</label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-slate-100 focus:outline-none focus:border-indigo-500 transition-all w-full text-sm"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g., Main Street, Near Central Park..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" className="btn btn-outline px-6" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary px-8">
                                    {editingId ? 'Update Report' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CitizenPage;
