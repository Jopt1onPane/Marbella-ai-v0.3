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
    console.log('🔍 调试: 发送请求', config.url, 'Token:', token ? 'exists' : 'missing');
    if (token) {
      // 确保token格式正确
      const cleanToken = token.trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
      console.log('🔑 调试: 已添加Authorization头');
      console.log('🔑 调试: Authorization值', `Bearer ${cleanToken.substring(0, 20)}...`);
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
  testToken: () => api.get('/auth/test-token'),  // 新增：测试token
  debugJWT: (data) => api.post('/auth/debug-jwt', data)  // 新增：调试JWT
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

// 通知API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotificationCount: () => api.get('/notifications/count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  getAdminSubmissionNotifications: () => api.get('/notifications/admin/submissions')
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

