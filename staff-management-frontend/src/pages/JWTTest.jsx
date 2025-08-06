import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/lib/api';

const JWTTest = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const testJWT = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🧪 开始JWT测试');
      
      // 1. 测试JWT调试
      const debugResponse = await authAPI.debugJWT(formData);
      console.log('✅ JWT调试成功:', debugResponse.data);
      setResult(prev => prev + '\n✅ JWT调试成功: ' + JSON.stringify(debugResponse.data, null, 2));
      
      // 2. 测试登录
      const loginResponse = await authAPI.login(formData);
      console.log('✅ 登录成功:', loginResponse.data);
      setResult(prev => prev + '\n✅ 登录成功: ' + JSON.stringify(loginResponse.data, null, 2));
      
      // 3. 保存token
      const { access_token } = loginResponse.data;
      localStorage.setItem('access_token', access_token);
      console.log('💾 Token已保存');
      setResult(prev => prev + '\n💾 Token已保存');
      
      // 4. 测试token验证
      const tokenResponse = await authAPI.testToken();
      console.log('✅ Token验证成功:', tokenResponse.data);
      setResult(prev => prev + '\n✅ Token验证成功: ' + JSON.stringify(tokenResponse.data, null, 2));
      
    } catch (error) {
      console.error('❌ JWT测试失败:', error.response?.data);
      setResult(prev => prev + '\n❌ 错误: ' + JSON.stringify(error.response?.data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>JWT Token 调试工具</CardTitle>
          <CardDescription>
            测试JWT token的生成、保存和验证过程
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="admin123"
            />
          </div>
          <Button 
            onClick={testJWT} 
            disabled={loading}
            className="w-full"
          >
            {loading ? '测试中...' : '开始JWT测试'}
          </Button>
          {result && (
            <div className="mt-4">
              <Label>测试结果:</Label>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto max-h-96">
                {result}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTTest;
