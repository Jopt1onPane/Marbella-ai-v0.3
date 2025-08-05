import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Award, 
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Users,
  Eye,
  FileText,
  TrendingUp,
  Target,
  Zap,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { tasksAPI } from '@/lib/api';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    max_points: '',
    category: '',
    difficulty: 'medium',
    publisher_name: '管理员'
  });

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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      if (new Date(newTask.end_date) < new Date(newTask.start_date)) {
        setError('结束日期不能早于开始日期');
        setSubmitting(false);
        return;
      }

      const response = await tasksAPI.createTask(newTask);
      
      setTasks([response.data.task, ...tasks]);
      setNewTask({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        max_points: '',
        category: '',
        difficulty: 'medium',
        publisher_name: '管理员'
      });
      setIsCreateDialogOpen(false);
      setSuccess('任务创建成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('创建任务失败:', err);
      setError(err.response?.data?.error || '创建任务失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    try {
      const response = await tasksAPI.updateTask(editingTask.id, editingTask);
      
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? response.data.task : task
      ));
      
      setIsEditDialogOpen(false);
      setEditingTask(null);
      setSuccess('任务更新成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('更新任务失败:', err);
      setError(err.response?.data?.error || '更新任务失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('确定要删除这个任务吗？此操作不可撤销。')) return;
    
    try {
      await tasksAPI.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setSuccess('任务删除成功！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('删除任务失败:', err);
      setError(err.response?.data?.error || '删除任务失败，请重试');
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
      open: { label: '待接受', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      assigned: { label: '进行中', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      submitted: { label: '待审核', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { label: '已取消', color: 'bg-red-100 text-red-800 border-red-200' }
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

  const getStatusCount = (status) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getTotalPoints = () => {
    return tasks.reduce((sum, task) => sum + (task.max_points || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题和操作区域 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">任务管理</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-500">
                  <Plus className="mr-3 h-5 w-5" />
                  发布新任务
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">发布新任务</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">任务标题 *</Label>
                      <Input
                        id="title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="输入任务标题"
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">任务分类</Label>
                      <Select value={newTask.category} onValueChange={(value) => setNewTask({...newTask, category: value})}>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="选择任务分类" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="设计">设计</SelectItem>
                          <SelectItem value="开发">开发</SelectItem>
                          <SelectItem value="测试">测试</SelectItem>
                          <SelectItem value="文档">文档</SelectItem>
                          <SelectItem value="调研">调研</SelectItem>
                          <SelectItem value="运营">运营</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">任务描述 *</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="详细描述任务要求..."
                      rows={6}
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="start_date" className="text-sm font-semibold text-gray-700">开始日期 *</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newTask.start_date}
                        onChange={(e) => setNewTask({...newTask, start_date: e.target.value})}
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="end_date" className="text-sm font-semibold text-gray-700">截止日期 *</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newTask.end_date}
                        onChange={(e) => setNewTask({...newTask, end_date: e.target.value})}
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="max_points" className="text-sm font-semibold text-gray-700">积分奖励 *</Label>
                      <Input
                        id="max_points"
                        type="number"
                        value={newTask.max_points}
                        onChange={(e) => setNewTask({...newTask, max_points: e.target.value})}
                        placeholder="100"
                        min="1"
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">任务难度</Label>
                    <Select value={newTask.difficulty} onValueChange={(value) => setNewTask({...newTask, difficulty: value})}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue placeholder="选择任务难度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">简单 (1-2天)</SelectItem>
                        <SelectItem value="medium">中等 (3-5天)</SelectItem>
                        <SelectItem value="hard">困难 (1周以上)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter className="pt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="px-8 py-3 text-lg"
                    >
                      取消
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          发布中...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          立即发布任务
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">总任务数</p>
                  <p className="text-3xl font-bold text-blue-900">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-500 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">进行中</p>
                  <p className="text-3xl font-bold text-yellow-900">{getStatusCount('assigned')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">待审核</p>
                  <p className="text-3xl font-bold text-purple-900">{getStatusCount('submitted')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-xl">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">总积分</p>
                  <p className="text-3xl font-bold text-green-900">{getTotalPoints()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="搜索任务标题或描述..."
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
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="open">待接受</SelectItem>
                    <SelectItem value="assigned">进行中</SelectItem>
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
                  {searchTerm ? '没有找到匹配的任务' : '还没有创建任何任务'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    创建第一个任务
                  </Button>
                )}
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
                        {task.assigned_user && (
                          <div className="flex items-center text-gray-600">
                            <User className="h-5 w-5 mr-3 text-purple-500" />
                            <div>
                              <p className="text-sm text-gray-500">执行人</p>
                              <p className="font-semibold">{task.assigned_user}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setEditingTask(task);
                          setIsEditDialogOpen(true);
                        }}
                        className="w-full lg:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        编辑任务
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 w-full lg:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除任务
                      </Button>
                      {task.status === 'assigned' && (
                        <Button variant="outline" size="lg" className="w-full lg:w-auto">
                          <Eye className="h-4 w-4 mr-2" />
                          查看进度
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 编辑任务对话框 */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">编辑任务</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <form onSubmit={handleEditTask} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="edit-title" className="text-sm font-semibold text-gray-700">任务标题 *</Label>
                    <Input
                      id="edit-title"
                      value={editingTask.title}
                      onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="edit-category" className="text-sm font-semibold text-gray-700">任务分类</Label>
                    <Select value={editingTask.category} onValueChange={(value) => setEditingTask({...editingTask, category: value})}>
                      <SelectTrigger className="h-12 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="设计">设计</SelectItem>
                        <SelectItem value="开发">开发</SelectItem>
                        <SelectItem value="测试">测试</SelectItem>
                        <SelectItem value="文档">文档</SelectItem>
                        <SelectItem value="调研">调研</SelectItem>
                        <SelectItem value="运营">运营</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="edit-description" className="text-sm font-semibold text-gray-700">任务描述 *</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    rows={6}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="edit-start_date" className="text-sm font-semibold text-gray-700">开始日期 *</Label>
                    <Input
                      id="edit-start_date"
                      type="date"
                      value={editingTask.start_date}
                      onChange={(e) => setEditingTask({...editingTask, start_date: e.target.value})}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="edit-end_date" className="text-sm font-semibold text-gray-700">截止日期 *</Label>
                    <Input
                      id="edit-end_date"
                      type="date"
                      value={editingTask.end_date}
                      onChange={(e) => setEditingTask({...editingTask, end_date: e.target.value})}
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="edit-max_points" className="text-sm font-semibold text-gray-700">积分奖励 *</Label>
                    <Input
                      id="edit-max_points"
                      type="number"
                      value={editingTask.max_points}
                      onChange={(e) => setEditingTask({...editingTask, max_points: e.target.value})}
                      min="1"
                      className="h-12 text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="edit-difficulty" className="text-sm font-semibold text-gray-700">任务难度</Label>
                  <Select value={editingTask.difficulty} onValueChange={(value) => setEditingTask({...editingTask, difficulty: value})}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">简单 (1-2天)</SelectItem>
                      <SelectItem value="medium">中等 (3-5天)</SelectItem>
                      <SelectItem value="hard">困难 (1周以上)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-8 py-3 text-lg"
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        保存中...
                      </>
                    ) : (
                      '保存更改'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTasks;

