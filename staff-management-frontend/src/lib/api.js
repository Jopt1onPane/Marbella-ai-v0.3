import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'https://staff-management-backend-gzyj.onrender.com') + '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 避免CORS凭据问题
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// 任务相关API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (id) => api.post(`/tasks/${id}/assign`),
  submitTask: (id, data) => api.post(`/tasks/${id}/submit`, data),
};

// 提交审核相关API
export const submissionsAPI = {
  getSubmissions: (params) => api.get('/submissions', { params }),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  reviewSubmission: (id, data) => api.post(`/submissions/${id}/review`, data),
  getMySubmissions: () => api.get('/submissions/my'),
};

// 用户相关API
export const userAPI = {
  getUsers: () => api.get('/users'),
  getUserStats: () => api.get('/users/stats'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// 积分相关API
export const pointsAPI = {
  getMyPoints: () => api.get('/points/my'),  // 新增：获取当前用户积分
  getUserPoints: (userId, params) => api.get(`/points/user/${userId}`, { params }),
  getMonthlyPoints: (params) => api.get('/points/monthly', { params }),
  setMonthlySettings: (data) => api.post('/monthly/settings', data),
  calculateMonthlySalary: (params) => api.get('/monthly/salary', { params }),
  finalizeMonthlySettings: (data) => api.post('/monthly/finalize', data),
};

// 文件上传API
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;

