import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  TrendingUp, 
  CheckSquare, 
  Users,
  Calendar,
  Award,
  Plus,
  Eye
} from 'lucide-react';
import { getUser, isAdmin } from '@/lib/auth';
import { Link } from 'react-router-dom';
import { tasksAPI, pointsAPI, submissionsAPI, userAPI, authAPI } from '@/lib/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    myTasks: 0,
    myPoints: 0,
    pendingSubmissions: 0,
    totalUsers: 0,
    monthlyPoints: 0,
  });
  const [loading, setLoading] = useState(false);
  const user = getUser();
  const isAdminUser = isAdmin();

  // 加载真实统计数据
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      
      // 首先测试token是否有效
      console.log('🔍 调试: 开始加载仪表盘数据');
      const token = localStorage.getItem('access_token');
      console.log('🔑 调试: 当前token存在:', !!token);
      
      if (!token) {
        console.error('❌ 调试: 没有找到token，跳转登录页');
        window.location.href = '/login';
        return;
      }
      
      // 测试token有效性
      try {
        console.log('🔍 调试: 测试token有效性');
        const tokenTest = await authAPI.testToken();
        console.log('✅ 调试: Token验证成功', tokenTest.data);
      } catch (tokenError) {
        console.error('❌ 调试: Token验证失败', tokenError);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      try {
        const newStats = {
          totalTasks: 0,
          myTasks: 0,
          myPoints: 0,
          pendingSubmissions: 0,
          totalUsers: 0,
          monthlyPoints: 0,
        };

        // 获取任务数据
        try {
          const tasksRes = await tasksAPI.getTasks({});
          const allTasks = tasksRes.data.tasks || [];
          newStats.totalTasks = allTasks.length;
          
          if (isAdminUser) {
            // 管理员：计算待审核提交数
            newStats.pendingSubmissions = allTasks.filter(task => task.status === 'submitted').length;
          } else {
            // 普通用户：计算自己的任务数
            const myTasksRes = await tasksAPI.getTasks({ assigned_to_me: true });
            newStats.myTasks = (myTasksRes.data.tasks || []).length;
          }
        } catch (error) {
          console.error('获取任务数据失败:', error);
        }

        // 获取积分数据
        try {
          const pointsRes = await pointsAPI.getMyPoints();
          newStats.myPoints = pointsRes.data.total_points || 0;
        } catch (error) {
          console.error('获取积分数据失败:', error);
        }

        // 管理员获取用户统计
        if (isAdminUser) {
          try {
            const userStatsRes = await userAPI.getUserStats();
            newStats.totalUsers = userStatsRes.data.total_users || 0;
          } catch (error) {
            console.error('获取用户统计失败:', error);
          }
        }

        setStats(newStats);
      } catch (error) {
        console.error('加载统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAdminUser]);

  const StatCard = ({ title, value, description, icon: Icon, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {loading ? "..." : value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const QuickAction = ({ title, description, icon: Icon, to, color = "blue" }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <Link to={to}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${color}-100`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );

  return (
    <div className="space-y-8 p-6">
      {/* 现代化UI标识 */}
      <div className="hidden">Modern UI Dashboard v7.0.0</div>
      
      {/* 欢迎信息 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white shadow-xl">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">
            欢迎回来，{user?.username}！
          </h1>
          <p className="text-blue-100 text-lg">
            {isAdminUser 
              ? '管理您的团队任务和积分系统' 
              : '查看您的任务进度和积分收益'
            }
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {isAdminUser ? '管理员' : '员工'}
            </Badge>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdminUser ? (
          <>
            <StatCard
              title="总任务数"
              value={stats.totalTasks}
              description="系统中的所有任务"
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="待审核提交"
              value={stats.pendingSubmissions}
              description="需要您审核的任务"
              icon={CheckSquare}
              color="orange"
            />
            <StatCard
              title="团队成员"
              value={stats.totalUsers}
              description="注册用户总数"
              icon={Users}
              color="green"
            />
            <StatCard
              title="本月总积分"
              value={stats.monthlyPoints}
              description="团队累计积分"
              icon={Award}
              color="purple"
            />
          </>
        ) : (
          <>
            <StatCard
              title="可用任务"
              value={stats.totalTasks}
              description="可以接受的任务"
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="我的任务"
              value={stats.myTasks}
              description="已接受的任务"
              icon={CheckSquare}
              color="orange"
            />
            <StatCard
              title="我的积分"
              value={stats.myPoints}
              description="累计获得积分"
              icon={Award}
              color="green"
            />
            <StatCard
              title="本月收益"
              value={loading ? "加载中..." : `¥${(stats.myPoints * 2.5).toFixed(2)}`}
              description="基于积分预估收益"
              icon={TrendingUp}
              color="purple"
            />
          </>
        )}
      </div>

      {/* 快速操作 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">快速操作</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdminUser ? (
            <>
              <QuickAction
                title="发布新任务"
                description="创建新的工作任务"
                icon={Plus}
                to="/admin/tasks"
                color="blue"
              />
              <QuickAction
                title="审核提交"
                description="审核员工任务提交"
                icon={Eye}
                to="/admin/submissions"
                color="orange"
              />
              <QuickAction
                title="月度设置"
                description="设置利润分配比例"
                icon={Calendar}
                to="/admin/monthly"
                color="green"
              />
            </>
          ) : (
            <>
              <QuickAction
                title="浏览任务"
                description="查看可接受的任务"
                icon={FileText}
                to="/tasks"
                color="blue"
              />
              <QuickAction
                title="我的任务"
                description="管理已接受的任务"
                icon={CheckSquare}
                to="/my-tasks"
                color="orange"
              />
              <QuickAction
                title="我的积分"
                description="查看积分和收益"
                icon={Award}
                to="/my-points"
                color="green"
              />
            </>
          )}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">最近活动</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无最近活动</h3>
              <p className="text-gray-500">
                {isAdminUser 
                  ? '开始发布任务来查看活动记录' 
                  : '接受任务后这里会显示您的活动记录'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

