import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Home,
  FileText,
  CheckSquare,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  TrendingUp,
  Target
} from 'lucide-react';
import { getUser, isAdmin, logout } from '@/lib/auth';
import { tasksAPI, pointsAPI, userAPI, notificationsAPI } from '@/lib/api';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    currentPoints: 0,
    totalTasks: 0,
    monthlyTrend: 0
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const isAdminUser = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        if (isAdminUser) {
          // 管理员获取所有统计数据
          const [tasksResponse, userStatsResponse] = await Promise.all([
            tasksAPI.getTasks(),
            userAPI.getUserStats()
          ]);
          
          setStats({
            currentPoints: 0, // 管理员不显示个人积分
            totalTasks: tasksResponse.data.tasks?.length || 0,
            monthlyTrend: userStatsResponse.data.total_users || 0 // 显示实际用户数量
          });
        } else {
          // 普通用户获取个人统计数据
          const [tasksResponse, pointsResponse] = await Promise.all([
            tasksAPI.getTasks({ assigned_to_me: true }),
            pointsAPI.getMyPoints()
          ]);
          
          setStats({
            currentPoints: pointsResponse.data.total_points || 0,
            totalTasks: tasksResponse.data.tasks?.length || 0,
            monthlyTrend: (pointsResponse.data.total_points || 0) * 2.5 // 简单估算月收入
          });
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 保持默认值
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdminUser]);

  // 获取通知数据
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (isAdminUser) {
          // 管理员获取提交通知
          const [countResponse, notificationsResponse] = await Promise.all([
            notificationsAPI.getNotificationCount(),
            notificationsAPI.getNotifications({ unread_only: true })
          ]);
          
          setUnreadCount(countResponse.data.unread_count || 0);
          setNotifications(notificationsResponse.data.notifications || []);
        }
      } catch (error) {
        console.error('获取通知失败:', error);
      }
    };

    fetchNotifications();
    
    // 每30秒刷新一次通知
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAdminUser]);

  const navigation = isAdminUser
    ? [
        { name: '仪表板', href: '/', icon: Home },
        { name: '任务管理', href: '/admin/tasks', icon: FileText },
        { name: '审核中心', href: '/admin/submissions', icon: CheckSquare },
        { name: '用户管理', href: '/admin/users', icon: Users },
        { name: '月度设置', href: '/admin/monthly', icon: Settings },
      ]
    : [
        { name: '仪表板', href: '/', icon: Home },
        { name: '任务大厅', href: '/tasks', icon: FileText },
        { name: '我的任务', href: '/my-tasks', icon: CheckSquare },
        { name: '我的积分', href: '/my-points', icon: Award },
      ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 左侧 - Logo和移动端菜单 */}
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <Link to="/" className="flex items-center ml-4 lg:ml-0 hover:opacity-80 transition-opacity">
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">
                  员工管理积分系统
                </span>
              </Link>
            </div>

            {/* 中间 - 搜索框 (桌面端) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索任务、用户..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* 右侧 - 通知和用户菜单 */}
            <div className="flex items-center space-x-4">
              {/* 通知按钮 */}
              {isAdminUser && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative hover:bg-gray-100 transition-colors"
                  onClick={() => setIsNotificationOpen(true)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              )}

              {/* 用户菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100 transition-colors p-2 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                      <div className="text-xs text-gray-500">
                        {isAdminUser ? '管理员' : '员工'}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <Badge variant="secondary" className="w-fit">
                        {isAdminUser ? '管理员' : '员工'}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    个人设置
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* 主布局容器 - 左右分栏 */}
      <div className="flex h-screen pt-16">
        {/* 左侧仪表盘 - 固定宽度 */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* 导航菜单 */}
            <nav className="flex-1 px-6 py-8 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center w-full px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 border-2
                      ${active
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 shadow-md'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:border-gray-200'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={`mr-4 h-6 w-6 transition-colors ${
                      active ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                    }`} />
                    <span className="flex-1 text-lg">{item.name}</span>
                    {active && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 底部统计信息 */}
            <div className="p-6 border-t border-gray-200 space-y-4">
              {/* 积分统计 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      {isAdminUser ? '系统积分' : '当前积分'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    {loading ? '加载中' : '活跃'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {loading ? '...' : stats.currentPoints}
                </div>
                <div className="text-xs text-blue-700">
                  预估价值: ¥{loading ? '...' : (stats.currentPoints * 2.5).toFixed(0)}
                </div>
              </div>

              {/* 任务统计 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">
                      {isAdminUser ? '总任务数' : '我的任务'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {loading ? '加载中' : '进行中'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {loading ? '...' : stats.totalTasks}
                </div>
                <div className="text-xs text-green-700">
                  {isAdminUser ? '系统任务总数' : '本月完成任务'}
                </div>
              </div>

              {/* 趋势统计 */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">
                      {isAdminUser ? '用户统计' : '本月趋势'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    {loading ? '...' : (isAdminUser ? '活跃' : '+12%')}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {loading ? '...' : (isAdminUser ? stats.monthlyTrend : `¥${stats.monthlyTrend.toFixed(0)}`)}
                </div>
                <div className="text-xs text-purple-700">
                  {isAdminUser ? '注册用户总数' : '预计月收入'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 遮罩层 (移动端) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-600 bg-opacity-50 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 右侧操作区域 - 自适应宽度 */}
        <main className="flex-1 lg:ml-0 bg-gray-50 overflow-auto">
          <div className="h-full min-h-screen">
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* 通知对话框 */}
      {isAdminUser && (
        <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">通知中心</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
                  <p className="text-gray-500">没有新的通知消息</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(notification.created_at).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            await notificationsAPI.markAsRead(notification.id);
                            setNotifications(notifications.filter(n => n.id !== notification.id));
                            setUnreadCount(Math.max(0, unreadCount - 1));
                          } catch (error) {
                            console.error('标记已读失败:', error);
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        标记已读
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {notifications.length > 0 && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await notificationsAPI.markAllAsRead();
                      setNotifications([]);
                      setUnreadCount(0);
                    } catch (error) {
                      console.error('标记全部已读失败:', error);
                    }
                  }}
                >
                  全部标记为已读
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Layout;

