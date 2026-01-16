import React, { useState, useEffect } from 'react';
import { Filter, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { taskAPI, complaintAPI } from '../utils/api';
import '../styles/Pages.css';

const DepartmentPage = () => {
    const [selectedDept, setSelectedDept] = useState('Electricity');
    const [tasks, setTasks] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load tasks and complaints from backend on mount
    useEffect(() => {
        loadData();
    }, []);

    // Load data when department changes
    useEffect(() => {
        if (!loading) {
            loadData();
        }
    }, [selectedDept]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all tasks and filter by selected department
            const deptFilter = selectedDept === 'All' ? null : selectedDept;
            const tasksData = await taskAPI.getAll(deptFilter);
            
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            
            // Also load all complaints for fallback display
            const complaintsData = await complaintAPI.getAll();
            setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
        } catch (err) {
            setError(err.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await taskAPI.updateStatus(taskId, newStatus, 'Department Admin', 'Status updated from dashboard');
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to update status');
            console.error('Error updating status:', err);
        }
    };

    const handlePriorityChange = (id, newPriority) => {
        // TODO: Implement priority update API endpoint
        alert('Priority update will be available soon');
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            deleteTask(id);
        }
    };

    const deleteTask = async (id) => {
        try {
            await taskAPI.delete(id);
            await loadData();
        } catch (err) {
            setError(err.message || 'Failed to delete task');
            console.error('Error deleting task:', err);
        }
    };

    const displayComplaints = selectedDept === 'All' 
        ? complaints 
        : complaints.filter(c => c.department === selectedDept);

    // Use tasks if available, otherwise fall back to complaints
    const displayItems = tasks && tasks.length > 0 ? tasks : displayComplaints;

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

            {error && (
                <div className="glass-morphism" style={{ padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ color: '#fca5a5' }}>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">⏳</div>
                    <p className="text-lg font-semibold mb-2">Loading tasks...</p>
                </div>
            ) : displayItems.length > 0 ? (
                <div className="glass-morphism" style={{ overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}></th>
                                <th style={{ width: '30%' }}>Description</th>
                                <th style={{ width: '10%' }}>Department</th>
                                <th style={{ width: '10%' }}>Priority</th>
                                <th style={{ width: '10%' }}>Date</th>
                                <th style={{ width: '10%' }}>Status</th>
                                <th style={{ width: '8%' }}>Update</th>
                                <th style={{ width: '5%' }}>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayItems.map((item) => (
                                <tr key={item._id || item.id}>
                                    <td>
                                        {item.status === 'Resolved' ? <CheckCircle2 size={20} className="text-emerald-400" /> :
                                            item.status === 'In Progress' ? <Clock size={20} className="text-amber-400" /> :
                                                <AlertCircle size={20} className="text-red-400" />}
                                    </td>
                                    <td>
                                        <div className="text-sm text-slate-300" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                                            <div className="font-semibold text-white mb-1">{item.title || item.issue_type || 'Work Order'}</div>
                                            {(item.description || item.complaint_text || '').substring(0, 120)}
                                            {(item.description || item.complaint_text || '').length > 120 ? '...' : ''}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="px-2 py-1 rounded bg-slate-800 border border-white/5 uppercase text-[10px] font-bold tracking-wider">
                                            {item.department || 'General'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`px-2 py-1 rounded uppercase text-[10px] font-bold tracking-wider ${item.priority === 'Critical' ? 'bg-red-900/30 border border-red-500/50 text-red-300' :
                                            item.priority === 'High' ? 'bg-orange-900/30 border border-orange-500/50 text-orange-300' :
                                                item.priority === 'Medium' ? 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300' :
                                                    'bg-blue-900/30 border border-blue-500/50 text-blue-300'
                                            }`}>
                                            {item.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td className="text-slate-300">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${item.status === 'Resolved' ? 'status-resolved' :
                                            item.status === 'In Progress' ? 'status-progress' :
                                                'status-pending'
                                            }`}>{item.status || 'Pending'}</span>
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
                                            value={item.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(item._id || item.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(item._id || item.id)}
                                            className="action-btn action-btn-delete"
                                            title="Delete Task"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-morphism empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <p className="text-lg font-semibold mb-2">No tasks for {selectedDept}</p>
                    <p className="text-sm">There are currently no tasks assigned to this department.</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentPage;
