import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  Award, 
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Plus,
  TrendingUp,
  Target,
  FileText
} from 'lucide-react';
import { tasksAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [acceptingTask, setAcceptingTask] = useState(null);
  const user = getUser();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data.tasks || []);
      setError('');
    } catch (err) {
      console.error('获取任务失败:', err);
      setError('获取任务列表失败，请刷新页面重试');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId) => {
    setAcceptingTask(taskId);
    try {
      await tasksAPI.assignTask(taskId);
      setSuccess('任务接受成功！');
      setTimeout(() => setSuccess(''), 3000);
      fetchTasks(); // 刷新任务列表
    } catch (err) {
      setError(err.response?.data?.error || '接受任务失败，请重试');
    } finally {
      setAcceptingTask(null);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: '可接受', color: 'bg-green-100 text-green-800 border-green-200' },
      assigned: { label: '已分配', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      submitted: { label: '待审核', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: '已完成', color: 'bg-purple-100 text-purple-800 border-purple-200' }
    };
    const { label, color } = config[status] || config.open;
    return <Badge className={`${color} border`}>{label}</Badge>;
  };

  const getDifficultyBadge = (difficulty) => {
    const config = {
      easy: { label: '简单', color: 'bg-green-100 text-green-800 border-green-200' },
      medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      hard: { label: '困难', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    const { label, color } = config[difficulty] || config.medium;
    return <Badge className={`${color} border`}>{label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isTaskExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
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
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="p-8 space-y-8">
        {/* 页面标题 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">任务列表</h1>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="搜索任务..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48 h-12">
                    <Filter className="mr-2 h-5 w-5" />
                    <SelectValue placeholder="筛选状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部任务</SelectItem>
                    <SelectItem value="open">可接受</SelectItem>
                    <SelectItem value="assigned">已分配</SelectItem>
                    <SelectItem value="submitted">待审核</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 成功提示 */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 任务列表 */}
        <div className="space-y-6">
          {filteredTasks.length === 0 ? (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="text-center py-20">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">暂无任务</h3>
                <p className="text-gray-500 mb-8 text-lg">
                  {searchTerm ? '没有找到匹配的任务' : '当前没有可接受的任务'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className="bg-white shadow-sm border-0 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{task.title}</h3>
                          <div className="flex flex-wrap gap-3 mb-4">
                            {getStatusBadge(task.status)}
                            {getDifficultyBadge(task.difficulty)}
                            {task.category && (
                              <Badge variant="outline" className="border-gray-300 text-gray-700">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{task.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="text-sm text-gray-500">开始日期</p>
                            <p className="font-semibold">{formatDate(task.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-5 w-5 mr-3 text-yellow-500" />
                          <div>
                            <p className="text-sm text-gray-500">截止日期</p>
                            <p className="font-semibold">{formatDate(task.end_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Award className="h-5 w-5 mr-3 text-green-500" />
                          <div>
                            <p className="text-sm text-gray-500">积分奖励</p>
                            <p className="font-semibold text-lg">{task.max_points} 分</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <User className="h-5 w-5 mr-3 text-purple-500" />
                          <div>
                            <p className="text-sm text-gray-500">发布人</p>
                            <p className="font-semibold">{task.publisher_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {task.status === 'open' && !isTaskExpired(task.end_date) && (
                        <Button
                          onClick={() => handleAcceptTask(task.id)}
                          disabled={acceptingTask === task.id}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-500"
                        >
                          {acceptingTask === task.id ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              接受中...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-5 w-5" />
                              接受任务
                            </>
                          )}
                        </Button>
                      )}
                      {isTaskExpired(task.end_date) && (
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          已过期
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;

