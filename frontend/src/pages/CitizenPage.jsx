import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import storage from '../utils/storage';
import '../styles/Pages.css';

const CitizenPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', department: 'General', priority: 'Medium', description: '', citizen: '' });

    // Load complaints from localStorage on mount
    useEffect(() => {
        const loadedComplaints = storage.getComplaints();
        setComplaints(loadedComplaints);
    }, []);

    const handleOpenModal = (complaint = null) => {
        if (complaint) {
            setEditingId(complaint.id);
            setFormData({
                title: complaint.title,
                department: complaint.department,
                priority: complaint.priority || 'Medium',
                description: complaint.description,
                citizen: complaint.citizen || ''
            });
        } else {
            setEditingId(null);
            setFormData({ title: '', department: 'General', priority: 'Medium', description: '', citizen: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (editingId) {
            // Update existing complaint
            const updated = storage.updateComplaint(editingId, formData);
            if (updated) {
                setComplaints(storage.getComplaints());
            }
        } else {
            // Add new complaint
            storage.addComplaint(formData);
            setComplaints(storage.getComplaints());
        }

        setIsModalOpen(false);
        setFormData({ title: '', department: 'General', priority: 'Medium', description: '', citizen: '' });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this complaint?')) {
            storage.deleteComplaint(id);
            setComplaints(storage.getComplaints());
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

            {complaints.length > 0 ? (
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
                                <tr key={complaint.id}>
                                    <td>
                                        {complaint.status === 'Resolved' ? <CheckCircle2 size={20} className="text-emerald-400" /> :
                                            complaint.status === 'In Progress' ? <Clock size={20} className="text-amber-400" /> :
                                                <AlertCircle size={20} className="text-red-400" />}
                                    </td>
                                    <td>
                                        <div>
                                            <div className="font-semibold text-white mb-1">{complaint.title}</div>
                                            <div className="text-sm text-slate-400" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                {complaint.description.length > 80
                                                    ? complaint.description.substring(0, 80) + '...'
                                                    : complaint.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold tracking-wider">
                                            {complaint.department}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded uppercase text-[10px] font-bold tracking-wider ${complaint.priority === 'Critical' ? 'bg-red-900/30 border border-red-500/50 text-red-300' :
                                                complaint.priority === 'High' ? 'bg-orange-900/30 border border-orange-500/50 text-orange-300' :
                                                    complaint.priority === 'Medium' ? 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300' :
                                                        'bg-blue-900/30 border border-blue-500/50 text-blue-300'
                                            }`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td className="text-slate-300">{complaint.date}</td>
                                    <td className="text-slate-400">{complaint.citizen || 'Anonymous'}</td>
                                    <td>
                                        <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' :
                                            complaint.status === 'In Progress' ? 'status-progress' :
                                                'status-pending'
                                            }`}>{complaint.status}</span>
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
                                                onClick={() => handleDelete(complaint.id)}
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
                                {editingId ? 'Refine Report' : 'File New Report'}
                            </h3>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label>Incident Title</label>
                                <input
                                    autoFocus
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Street Light Malfunction"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label>Concerned Department</label>
                                    <select
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option>General</option>
                                        <option>Electricity</option>
                                        <option>Roads</option>
                                        <option>Water</option>
                                        <option>Sanitation</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Priority Level</label>
                                    <select
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label>Your Name (Optional)</label>
                                <input
                                    value={formData.citizen}
                                    onChange={e => setFormData({ ...formData, citizen: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label>Detailed Description</label>
                                <textarea
                                    style={{ height: '10rem', resize: 'none' }}
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Provide specific location and details..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Discard
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Apply Changes' : 'Submit Report'}
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
