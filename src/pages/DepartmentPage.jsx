import React, { useState, useEffect } from 'react';
import { Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import storage from '../utils/storage';
import '../styles/Pages.css';

const DepartmentPage = () => {
    const [selectedDept, setSelectedDept] = useState('Electricity');
    const [complaints, setComplaints] = useState([]);

    // Load complaints from localStorage on mount
    useEffect(() => {
        const loadedComplaints = storage.getComplaints();
        setComplaints(loadedComplaints);
    }, []);

    const handleStatusChange = (id, newStatus) => {
        storage.updateComplaintStatus(id, newStatus);
        setComplaints(storage.getComplaints());
    };

    const filteredComplaints = complaints.filter(c =>
        selectedDept === 'All' || c.department === selectedDept
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Department Dashboard</h2>
                    <p className="page-subtitle">Review and update citizen reports for the chosen department.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="dept-selector"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="Electricity">Electricity Dept</option>
                        <option value="Roads">Roads Dept</option>
                        <option value="Water">Water Dept</option>
                        <option value="Sanitation">Sanitation Dept</option>
                        <option value="General">General Dept</option>
                        <option value="All">All Departments</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredComplaints.length > 0 ? filteredComplaints.map((complaint) => (
                    <div key={complaint.id} className="glass-morphism p-6 complaint-card flex items-center justify-between">
                        <div className="flex gap-6 items-start">
                            <div style={{ marginTop: '0.25rem' }}>
                                {complaint.status === 'Resolved' ? <CheckCircle2 size={24} className="text-emerald-400" /> :
                                    complaint.status === 'In Progress' ? <Clock size={24} className="text-amber-400" /> :
                                        <AlertCircle size={24} className="text-red-400" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{complaint.title}</h3>
                                <div className="flex gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                                    {complaint.citizen && (
                                        <span className="font-medium text-slate-300">By: {complaint.citizen}</span>
                                    )}
                                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold tracking-wider">
                                        {complaint.department}
                                    </span>
                                    <span>{complaint.date}</span>
                                    <span className={`status-badge ${complaint.status === 'Resolved' ? 'status-resolved' :
                                        complaint.status === 'In Progress' ? 'status-progress' :
                                            'status-pending'
                                        }`}>{complaint.status}</span>
                                </div>
                                <p style={{ color: 'var(--text-main)', marginTop: '1rem', opacity: 0.8 }}>
                                    {complaint.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2" style={{ minWidth: '160px' }}>
                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">
                                Update Status
                            </label>
                            <select
                                className="bg-slate-800 border-white/10 text-sm px-3 py-2 rounded-lg text-white"
                                style={{
                                    background: 'var(--bg-elevated)',
                                    border: '1.5px solid var(--border)',
                                    cursor: 'pointer'
                                }}
                                value={complaint.status}
                                onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                )) : (
                    <div className="glass-morphism empty-state">
                        <div className="empty-state-icon">🏢</div>
                        <p className="text-lg font-semibold mb-2">No complaints for {selectedDept}</p>
                        <p className="text-sm">There are currently no complaints assigned to this department.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentPage;
