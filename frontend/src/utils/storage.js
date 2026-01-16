// Storage keys
const STORAGE_KEYS = {
    COMPLAINTS: 'civiclink_complaints',
    ACTIVITY_LOGS: 'civiclink_activity_logs',
};

// Initialize default data
const DEFAULT_COMPLAINTS = [
    {
        id: 1,
        title: 'Street Light Outage',
        department: 'Electricity',
        status: 'Pending',
        priority: 'High',
        description: 'The light at Main St. has been off for 3 days.',
        date: '2024-01-14',
        citizen: 'John Doe'
    },
    {
        id: 2,
        title: 'Pothole on 5th Ave',
        department: 'Roads',
        status: 'In Progress',
        priority: 'Critical',
        description: 'Deep pothole causing traffic issues.',
        date: '2024-01-12',
        citizen: 'Jane Smith'
    },
];

const DEFAULT_LOGS = [
    {
        id: 101,
        action: 'Complaint Created',
        user: 'John Doe',
        target: 'Street Light Outage',
        timestamp: '2024-01-14 14:30:05',
        type: 'create'
    },
    {
        id: 102,
        action: 'Status Updated',
        user: 'Electricity Admin',
        target: 'Transformer Sparking',
        timestamp: '2024-01-15 09:15:22',
        type: 'update'
    },
];

// Storage utilities
export const storage = {
    // Get complaints from localStorage
    getComplaints: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize with default data if empty
            storage.setComplaints(DEFAULT_COMPLAINTS);
            return DEFAULT_COMPLAINTS;
        } catch (error) {
            console.error('Error reading complaints from localStorage:', error);
            return DEFAULT_COMPLAINTS;
        }
    },

    // Save complaints to localStorage
    setComplaints: (complaints) => {
        try {
            localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
        } catch (error) {
            console.error('Error saving complaints to localStorage:', error);
        }
    },

    // Add a new complaint
    addComplaint: (complaint) => {
        const complaints = storage.getComplaints();
        const newComplaint = {
            ...complaint,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            status: 'Pending',
            priority: complaint.priority || 'Medium',
        };
        complaints.push(newComplaint);
        storage.setComplaints(complaints);

        // Log the action
        storage.addLog({
            action: 'Complaint Created',
            user: complaint.citizen || 'Anonymous',
            target: complaint.title,
            type: 'create',
        });

        return newComplaint;
    },

    // Update a complaint
    updateComplaint: (id, updates) => {
        const complaints = storage.getComplaints();
        const index = complaints.findIndex(c => c.id === id);
        if (index !== -1) {
            const oldComplaint = complaints[index];
            complaints[index] = { ...oldComplaint, ...updates };
            storage.setComplaints(complaints);

            // Log the action
            storage.addLog({
                action: 'Complaint Updated',
                user: 'System User',
                target: complaints[index].title,
                type: 'update',
            });

            return complaints[index];
        }
        return null;
    },

    // Delete a complaint
    deleteComplaint: (id) => {
        const complaints = storage.getComplaints();
        const complaint = complaints.find(c => c.id === id);
        if (complaint) {
            const filtered = complaints.filter(c => c.id !== id);
            storage.setComplaints(filtered);

            // Log the action
            storage.addLog({
                action: 'Complaint Deleted',
                user: 'System User',
                target: complaint.title,
                type: 'delete',
            });

            return true;
        }
        return false;
    },

    // Update complaint status
    updateComplaintStatus: (id, newStatus) => {
        const complaints = storage.getComplaints();
        const index = complaints.findIndex(c => c.id === id);
        if (index !== -1) {
            const oldStatus = complaints[index].status;
            complaints[index].status = newStatus;
            storage.setComplaints(complaints);

            // Log the action
            storage.addLog({
                action: 'Status Updated',
                user: 'Department Admin',
                target: `${complaints[index].title} (${oldStatus} → ${newStatus})`,
                type: 'update',
            });

            return complaints[index];
        }
        return null;
    },

    // Update complaint priority
    updateComplaintPriority: (id, newPriority) => {
        const complaints = storage.getComplaints();
        const index = complaints.findIndex(c => c.id === id);
        if (index !== -1) {
            const oldPriority = complaints[index].priority || 'Medium';
            complaints[index].priority = newPriority;
            storage.setComplaints(complaints);

            // Log the action
            storage.addLog({
                action: 'Priority Updated',
                user: 'Department Admin',
                target: `${complaints[index].title} (${oldPriority} → ${newPriority})`,
                type: 'update',
            });

            return complaints[index];
        }
        return null;
    },

    // Get activity logs
    getLogs: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
            if (data) {
                return JSON.parse(data);
            }
            // Initialize with default data if empty
            storage.setLogs(DEFAULT_LOGS);
            return DEFAULT_LOGS;
        } catch (error) {
            console.error('Error reading logs from localStorage:', error);
            return DEFAULT_LOGS;
        }
    },

    // Save logs to localStorage
    setLogs: (logs) => {
        try {
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
        } catch (error) {
            console.error('Error saving logs to localStorage:', error);
        }
    },

    // Add a new log entry
    addLog: (logData) => {
        const logs = storage.getLogs();
        const newLog = {
            ...logData,
            id: Date.now(),
            timestamp: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(',', ''),
        };
        logs.unshift(newLog); // Add to beginning
        storage.setLogs(logs);
        return newLog;
    },

    // Clear all data (useful for testing)
    clearAll: () => {
        localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
        localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    },

    // Reset to default data
    resetToDefaults: () => {
        storage.setComplaints(DEFAULT_COMPLAINTS);
        storage.setLogs(DEFAULT_LOGS);
    },
};

export default storage;
