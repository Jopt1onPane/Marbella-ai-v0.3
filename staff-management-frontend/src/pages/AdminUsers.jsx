import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Search,
  Filter,
  Eye,
  Edit,
  UserPlus,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';
import { userAPI } from '@/lib/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPointsThisMonth: 0,
    totalTasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [currentMonth] = useState('2025-08');

  // 获取用户数据
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [usersResponse, statsResponse] = await Promise.all([
          userAPI.getUsers(),
          userAPI.getUserStats()
        ]);
        
        setUsers(usersResponse.data.users || []);
        
        // 计算统计数据
        const totalUsers = usersResponse.data.users?.length || 0;
        const activeUsers = usersResponse.data.users?.filter(u => u.role === 'user').length || 0;
        
        setUserStats({
          totalUsers,
          activeUsers,
          totalPointsThisMonth: statsResponse.data.total_users * 50, // 简单估算
          totalTasksCompleted: statsResponse.data.total_users * 2 // 简单估算
        });
        
        setError('');
      } catch (err) {
        console.error('获取用户列表失败:', err);
        setError('获取用户列表失败，请刷新页面重试');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const getRoleBadge = (role) => {
    const config = {
      admin: { label: '管理员', color: 'bg-purple-100 text-purple-800' },
      user: { label: '员工', color: 'bg-blue-100 text-blue-800' }
    };
    const { label, color } = config[role] || config.user;
    return <Badge className={color}>{label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { label: '活跃', color: 'bg-green-100 text-green-800' },
      inactive: { label: '非活跃', color: 'bg-gray-100 text-gray-800' }
    };
    const { label, color } = config[status] || config.active;
    return <Badge className={color}>{label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculatePointValue = (points) => {
    // 假设当前积分价值为每积分2.5元
    const pointValue = 2.5;
    return (points * pointValue).toFixed(2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // 统计数据现在从userStats状态获取

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月积分</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalPointsThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完成任务</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalTasksCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索用户名或邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="筛选角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="user">员工</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 用户列表 */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">暂无用户</h3>
              <p className="text-gray-500">
                {searchTerm ? '没有找到匹配的用户' : '系统中还没有注册用户'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 左侧用户信息 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
                          <p className="text-gray-600">{user.email}</p>
                          <div className="flex gap-2 mt-2">
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {user.monthly_stats?.tasks_completed || 0}
                        </p>
                        <p className="text-sm text-blue-800">本月完成任务</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {user.monthly_stats?.points_earned || 0}
                        </p>
                        <p className="text-sm text-green-800">本月获得积分</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          ¥{calculatePointValue(user.monthly_stats?.points_earned || 0)}
                        </p>
                        <p className="text-sm text-purple-800">预估收入</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {user.monthly_stats?.success_rate || 0}%
                        </p>
                        <p className="text-sm text-yellow-800">成功率</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>注册: {formatDate(user.created_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>最后登录: {formatDate(user.last_login)}</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>总积分: {user.total_stats?.total_points || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 右侧操作 */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    <Button
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDetailDialogOpen(true);
                      }}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      编辑用户
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 用户详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {selectedUser?.username.charAt(0).toUpperCase()}
              </div>
              {selectedUser?.username} - 详细信息
            </DialogTitle>
            <DialogDescription>
              查看用户的详细统计信息和任务历史
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">用户名:</span>
                      <span className="font-medium">{selectedUser.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">邮箱:</span>
                      <span className="font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">角色:</span>
                      {getRoleBadge(selectedUser.role)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">状态:</span>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">注册时间:</span>
                      <span className="font-medium">{formatDate(selectedUser.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">本月统计 ({currentMonth})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">完成任务:</span>
                      <span className="font-medium">{selectedUser.monthly_stats?.tasks_completed || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">获得积分:</span>
                      <span className="font-medium">{selectedUser.monthly_stats?.points_earned || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">预估收入:</span>
                      <span className="font-medium text-green-600">
                        ¥{calculatePointValue(selectedUser.monthly_stats?.points_earned || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">成功率:</span>
                      <span className="font-medium">{selectedUser.monthly_stats?.success_rate || 0}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 最近任务 */}
              {selectedUser.recent_tasks && selectedUser.recent_tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">最近任务</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedUser.recent_tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <p className="text-sm text-gray-600">{formatDate(task.date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {task.status === 'completed' ? '已完成' :
                               task.status === 'submitted' ? '已提交' : '已拒绝'}
                            </Badge>
                            <span className="font-medium text-purple-600">
                              {task.points} 积分
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;

