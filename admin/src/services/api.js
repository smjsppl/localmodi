const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('adminToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    return fetchWithAuth('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  getProfile: async () => {
    return fetchWithAuth('/admin/me');
  },
};

// Invite API
export const inviteAPI = {
  getInvites: async () => {
    return fetchWithAuth('/admin/invites');
  },
  createInvite: async (inviteData) => {
    return fetchWithAuth('/admin/invites', {
      method: 'POST',
      body: JSON.stringify(inviteData),
    });
  },
  deleteInvite: async (inviteId) => {
    return fetchWithAuth(`/admin/invites/${inviteId}`, {
      method: 'DELETE',
    });
  },
  resendInvite: async (inviteId) => {
    return fetchWithAuth(`/admin/invites/${inviteId}/resend`, {
      method: 'POST',
    });
  },
};

// Category API
export const categoryAPI = {
  getCategories: async () => {
    return fetchWithAuth('/categories');
  },
  createCategory: async (categoryData) => {
    return fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },
  updateCategory: async (categoryId, categoryData) => {
    return fetchWithAuth(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  },
  deleteCategory: async (categoryId) => {
    return fetchWithAuth(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return fetchWithAuth('/admin/stats');
  },
  getRecentActivity: async () => {
    return fetchWithAuth('/admin/activity');
  },
};

export default {
  auth: authAPI,
  invites: inviteAPI,
  categories: categoryAPI,
  dashboard: dashboardAPI,
};
