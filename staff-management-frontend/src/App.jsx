import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import JWTTest from '@/pages/JWTTest';
import Tasks from '@/pages/Tasks';
import MyTasks from '@/pages/MyTasks';
import AdminTasks from '@/pages/AdminTasks';
import AdminSubmissions from '@/pages/AdminSubmissions';
import AdminUsers from '@/pages/AdminUsers';
import AdminMonthly from '@/pages/AdminMonthly';
import { isAuthenticated, isAdmin } from '@/lib/auth';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 公开路由 */}
          <Route 
            path="/login" 
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <Login />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated() ? <Navigate to="/" replace /> : <Register />
            } 
          />
          
          {/* JWT测试页面 */}
          <Route path="/jwt-test" element={<JWTTest />} />
          
          {/* 受保护的路由 */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 员工路由 */}
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-tasks" element={
            <ProtectedRoute>
              <Layout>
                <MyTasks />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 管理员路由 */}
          <Route path="/admin/tasks" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminTasks />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/submissions" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminSubmissions />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminUsers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/monthly" element={
            <ProtectedRoute adminOnly>
              <Layout>
                <AdminMonthly />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;