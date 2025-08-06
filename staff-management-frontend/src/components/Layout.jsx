import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const isAdminUser = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

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
                    <span className="text-sm font-medium text-blue-900">当前积分</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    活跃
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">150</div>
                <div className="text-xs text-blue-700">预估价值: ¥375</div>
              </div>

              {/* 任务统计 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">总任务数</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    进行中
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                <div className="text-xs text-green-700">本月完成任务</div>
              </div>

              {/* 趋势统计 */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-900">本月趋势</span>
                  </div>
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    +12%
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">¥2,450</div>
                <div className="text-xs text-purple-700">预计月收入</div>
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
    </div>
  );
};

export default Layout;

