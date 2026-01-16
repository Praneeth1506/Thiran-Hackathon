// API configuration and service layer
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Complaint API endpoints
export const complaintAPI = {
  // Get all complaints
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/complaints`);
    return handleResponse(response);
  },

  // Create a new complaint
  create: async (complaintData) => {
    const response = await fetch(`${API_BASE_URL}/complaint/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: complaintData.description,
        location: complaintData.location || 'Not specified'
      })
    });
    return handleResponse(response);
  },

  // Process complaint with perception agent
  perceive: async (description) => {
    const response = await fetch(`${API_BASE_URL}/agent/perception`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    return handleResponse(response);
  },

  // Delete a complaint
  delete: async (complaintId) => {
    const response = await fetch(`${API_BASE_URL}/complaint/${complaintId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Task API endpoints
export const taskAPI = {
  // Get all tasks (optionally filtered by department)
  getAll: async (department = null) => {
    const url = new URL(`${API_BASE_URL}/tasks`);
    if (department) {
      url.searchParams.append('department', department);
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  // Update task status
  updateStatus: async (taskId, newStatus, changedBy = 'Admin', reason = '') => {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        new_status: newStatus,
        changed_by: changedBy,
        reason: reason
      })
    });
    return handleResponse(response);
  },

  // Delete a task
  delete: async (taskId) => {
    const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};

// Activity Logs API endpoints
export const activityAPI = {
  // Get activity logs
  getLogs: async () => {
    const response = await fetch(`${API_BASE_URL}/activity-logs`);
    return handleResponse(response);
  }
};

// SLA Breaches API endpoints
export const slaAPI = {
  // Get SLA breaches
  getBreaches: async () => {
    const response = await fetch(`${API_BASE_URL}/sla-breaches`);
    return handleResponse(response);
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  complaintAPI,
  taskAPI,
  activityAPI,
  slaAPI,
  healthCheck,
  API_BASE_URL
};
