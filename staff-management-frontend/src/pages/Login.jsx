import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Building2, Users, Award } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔑 调试: 尝试登录', formData.username);
      
      // 首先测试JWT调试
      try {
        console.log('🔍 调试: 测试JWT生成');
        const debugResponse = await authAPI.debugJWT(formData);
        console.log('✅ 调试: JWT调试成功', debugResponse.data);
      } catch (debugErr) {
        console.error('❌ 调试: JWT调试失败', debugErr.response?.data);
      }
      
      const response = await authAPI.login(formData);
      const { access_token, user } = response.data;
      
      console.log('✅ 调试: 登录成功', user);
      console.log('🔑 调试: 获得Token', access_token ? 'Yes' : 'No');
      console.log('🔑 调试: Token预览', access_token ? access_token.substring(0, 50) + '...' : 'No token');
      
      setToken(access_token);
      setUser(user);
      
      // 验证token是否保存成功
      const savedToken = localStorage.getItem('access_token');
      console.log('💾 调试: Token已保存', savedToken ? 'Yes' : 'No');
      
      // 强制刷新页面确保状态更新
      window.location.href = '/';
    } catch (err) {
      console.error('❌ 调试: 登录失败', err.response?.data);
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-blue-800"></div>
      
      {/* 居中的登录容器 */}
      <div className="w-full max-w-md px-6">
        {/* 系统标题 */}
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">企业员工管理系统</h1>
          <p className="text-lg text-gray-600">Professional Staff Management Platform</p>
          <div className="mt-2 text-xs text-blue-500 opacity-75">Modern UI v7.0</div>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="space-y-1 pb-8 pt-8">
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center">
              <LogIn className="mr-3 h-8 w-8 text-blue-600" />
              系统登录
            </CardTitle>
            <CardDescription className="text-center text-base text-gray-600 mt-2">
              请输入您的账户信息
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800 text-center">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="username" className="text-base font-medium text-gray-700">
                  用户账户
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入用户名或邮箱"
                  className="h-14 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-medium text-gray-700">
                  登录密码
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入登录密码"
                  className="h-14 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    正在登录...
                  </>
                ) : (
                  '立即登录'
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-base text-gray-600">
                还没有账户？{' '}
                <Link
                  to="/register"
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline text-base"
                >
                  立即注册
                </Link>
              </p>
            </div>

            {/* 用户类型说明 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2 text-center">账户类型说明</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>管理员账户：</strong>发布任务、审核提交、管理员工、设置积分</p>
                <p><strong>员工账户：</strong>查看任务、接受任务、提交作业、查看积分</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;

