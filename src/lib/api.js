const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', body, token, adminToken } = options;

  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || (typeof window !== 'undefined' && localStorage.getItem('token'));
  const adminAuthToken = adminToken || (typeof window !== 'undefined' && localStorage.getItem('adminToken'));

  if (adminAuthToken) {
    headers['Authorization'] = `Bearer ${adminAuthToken}`;
  } else if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || data.message || 'Terjadi kesalahan');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const auth = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  adminLogin: (credentials) => request('/auth/admin/login', { method: 'POST', body: credentials }),
};

export const queue = {
  take: () => request('/queue/take', { method: 'POST' }),
  myQueue: () => request('/queue/my-queue'),
  monitor: () => request('/queue/monitor'),
};

export const admin = {
  queues: () => request('/admin/queues'),
  updateStatus: (id, status) => request(`/admin/queue/${id}/status`, { method: 'PUT', body: { status } }),
  callPatient: (id) => request(`/admin/queue/${id}/call`, { method: 'PUT' }),
  deleteQueue: (id) => request(`/admin/queue/${id}`, { method: 'DELETE' }),
  users: () => request('/admin/users'),
  updatePassword: (id, password) => request(`/admin/user/${id}/password`, { method: 'PUT', body: { password } }),
  deleteUser: (id) => request(`/admin/user/${id}`, { method: 'DELETE' }),
  resetUserQueue: (id) => request(`/admin/user/${id}/reset-queue`, { method: 'PUT' }),
  archives: () => request('/admin/archives'),
  archive: (date) => request(`/admin/archives/${date}`),
};
