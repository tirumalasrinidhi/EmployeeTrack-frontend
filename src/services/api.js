import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// ---- Employees ----
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  getMe: () => api.get('/employees/me'),
  updateMe: (data) => api.put('/employees/me', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  updateSalary: (id, data) => api.post(`/employees/${id}/salary`, data),
  resetPassword: (id, data) => api.post(`/employees/${id}/reset-password`, data),
  toggleStatus: (id) => api.patch(`/employees/${id}/toggle-status`),
  delete: (id) => api.delete(`/employees/${id}`),
};

// ---- Departments ----
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// ---- Attendance ----
export const attendanceAPI = {
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
  getMine: () => api.get('/attendance/mine'),
  getAll: () => api.get('/attendance'),
  getByEmployee: (id) => api.get(`/attendance/employee/${id}`),
};

// ---- Leaves ----
export const leaveAPI = {
  apply: (data) => api.post('/leaves', data),
  getMine: () => api.get('/leaves/mine'),
  getAll: () => api.get('/leaves'),
  approve: (id) => api.patch(`/leaves/${id}/approve`),
  reject: (id) => api.patch(`/leaves/${id}/reject`),
};

// ---- Payroll ----
export const payrollAPI = {
  process: (data) => api.post('/payroll/process', data),
  correct: (data) => api.post('/payroll/correct', data),
  getAll: () => api.get('/payroll'),
  getMy: () => api.get('/payroll/my'),
  getByEmployee: (id) => api.get(`/payroll/employee/${id}`),
  getById: (id) => api.get(`/payroll/${id}`),
  getSalaryConfigStatus: () => api.get('/payroll/salary-config-status'),
};

// ---- Payslips ----
export const payslipAPI = {
  getAll: () => api.get('/payslips'),
  getMine: () => api.get('/payslips/mine'),
  getById: (id) => api.get(`/payslips/${id}`),
  download: (id) => api.get(`/payslips/${id}/download`, { responseType: 'blob' }),
};

// ---- Reports ----
export const reportAPI = {
  monthlyPayroll: (month, year) => api.get(`/reports/payroll/monthly?month=${month}&year=${year}`),
  departmentPayroll: () => api.get('/reports/payroll/department'),
  attendance: () => api.get('/reports/attendance'),
  leaves: () => api.get('/reports/leaves'),
  payrollSummary: () => api.get('/reports/payroll/summary'),
};

// ---- Dashboard ----
export const dashboardAPI = {
  employee: () => api.get('/dashboard/employee'),
  admin: () => api.get('/dashboard/admin'),
  hr: () => api.get('/dashboard/hr'),
};

export default api;
