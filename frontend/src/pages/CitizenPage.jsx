import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
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
            setEditingId(complaint._id || complaint.id);
            setFormData({
                description: complaint.description || complaint.description,
                location: complaint.location || complaint.title || ''
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
            const response = await complaintAPI.create({
                description: formData.description,
                location: formData.location || 'Not specified'
            });
            
            // Backend returns complaint_context and tasks, refresh the list to get updated data
            await loadComplaints();
            
            setIsModalOpen(false);
            setFormData({ description: '', location: '' });
            
            // Show success message with detected department
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
        if (window.confirm('Are you sure you want to delete this complaint?')) {
            deleteComplaint(id);
        }
    };

    const deleteComplaint = async (id) => {
        try {
            await complaintAPI.delete(id);
            await loadComplaints();
        } catch (err) {
            setError(err.message || 'Failed to delete complaint');
            console.error('Error deleting complaint:', err);
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
                <div className="glass-morphism" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ color: '#fca5a5' }}>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">⏳</div>
                    <p className="text-lg font-semibold mb-2">Loading complaints...</p>
                </div>
            ) : complaints.length > 0 ? (
                <div className="glass-morphism" style={{ overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}></th>
                                <th style={{ width: '25%' }}>Title</th>
                                <th style={{ width: '12%' }}>Department</th>
                                <th style={{ width: '10%' }}>Priority</th>
                                <th style={{ width: '10%' }}>Date</th>
                                <th style={{ width: '15%' }}>Citizen</th>
                                <th style={{ width: '13%' }}>Status</th>
                                <th style={{ width: '10%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map((complaint) => (
                                <tr key={complaint._id || complaint.id}>
                                    <td>
                                        {complaint.status === 'Resolved' ? <CheckCircle2 size={20} className="text-emerald-400" /> :
                                            complaint.status === 'In Progress' ? <Clock size={20} className="text-amber-400" /> :
                                                <AlertCircle size={20} className="text-red-400" />}
                                    </td>
                                    <td>
                                        <div>
                                            <div className="font-semibold text-white mb-1">{complaint.issue_type || complaint.title}</div>
                                            <div className="text-sm text-slate-400" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                {(complaint.description || '').substring(0, 80)}
                                                {(complaint.description || '').length > 80 ? '...' : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold tracking-wider">
                                            {complaint.department || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded uppercase text-[10px] font-bold tracking-wider ${complaint.priority === 'Critical' ? 'bg-red-900/30 border border-red-500/50 text-red-300' :
                                                complaint.priority === 'High' ? 'bg-orange-900/30 border border-orange-500/50 text-orange-300' :
                                                    complaint.priority === 'Medium' ? 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300' :
                                                        'bg-blue-900/30 border border-blue-500/50 text-blue-300'
                                            }`}>
                                            {complaint.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td className="text-slate-300">{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="text-slate-400">{complaint.citizen || 'Anonymous'}</td>
                                    <td>
                                        <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' :
                                            complaint.status === 'In Progress' ? 'status-progress' :
                                                'status-pending'
                                            }`}>{complaint.status || 'Pending'}</span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(complaint)}
                                                className="action-btn action-btn-edit"
                                                title="Edit Report"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(complaint._id || complaint.id)}
                                                className="action-btn action-btn-delete"
                                                title="Delete Report"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">📋</div>
                    <p className="text-lg font-semibold mb-2">No complaints yet</p>
                    <p className="text-sm">Click "Create Report" to file your first complaint.</p>
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-morphism modal-content">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                                {editingId ? 'Edit Report' : 'File New Report'}
                            </h3>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label>Incident Description *</label>
                                <textarea
                                    style={{ height: '10rem', resize: 'none' }}
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the issue you're reporting in detail..."
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label>Location (Optional)</label>
                                <input
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Main Street, Block 5 or address"
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
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
