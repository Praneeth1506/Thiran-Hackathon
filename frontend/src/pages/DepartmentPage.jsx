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

    const handlePriorityChange = (id, newPriority) => {
        storage.updateComplaintPriority(id, newPriority);
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


            {filteredComplaints.length > 0 ? (
                <div className="glass-morphism" style={{ overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}></th>
                                <th style={{ width: '20%' }}>Title</th>
                                <th style={{ width: '10%' }}>Department</th>
                                <th style={{ width: '10%' }}>Priority</th>
                                <th style={{ width: '10%' }}>Date</th>
                                <th style={{ width: '12%' }}>Citizen</th>
                                <th style={{ width: '10%' }}>Status</th>
                                <th style={{ width: '11%' }}>Update Status</th>
                                <th style={{ width: '12%' }}>Update Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredComplaints.map((complaint) => (
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
                                                {complaint.description.length > 60
                                                    ? complaint.description.substring(0, 60) + '...'
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
                                            {complaint.priority || 'Medium'}
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
                                        <select
                                            className="bg-slate-800 border-white/10 text-sm px-2 py-1.5 rounded-lg text-white w-full"
                                            style={{
                                                background: 'var(--bg-elevated)',
                                                border: '1.5px solid var(--border)',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                position: 'relative',
                                                zIndex: 10
                                            }}
                                            value={complaint.status}
                                            onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="bg-slate-800 border-white/10 text-sm px-2 py-1.5 rounded-lg text-white w-full priority-select"
                                            style={{
                                                background: 'var(--bg-elevated)',
                                                border: '1.5px solid var(--border)',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                position: 'relative',
                                                zIndex: 10
                                            }}
                                            value={complaint.priority || 'Medium'}
                                            onChange={(e) => handlePriorityChange(complaint.id, e.target.value)}
                                        >
                                            <option value="Low" style={{ background: '#1e3a8a', color: '#93c5fd' }}>🔵 Low</option>
                                            <option value="Medium" style={{ background: '#713f12', color: '#fde047' }}>🟡 Medium</option>
                                            <option value="High" style={{ background: '#7c2d12', color: '#fdba74' }}>🟠 High</option>
                                            <option value="Critical" style={{ background: '#7f1d1d', color: '#fca5a5' }}>🔴 Critical</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <p className="text-lg font-semibold mb-2">No complaints for {selectedDept}</p>
                    <p className="text-sm">There are currently no complaints assigned to this department.</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentPage;
