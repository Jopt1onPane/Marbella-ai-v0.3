import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { CenteredDialog, CenteredDialogContent, CenteredDialogDescription, CenteredDialogFooter, CenteredDialogHeader, CenteredDialogTitle } from '@/components/ui/centered-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Award, 
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Zap,
  Target,
  TrendingUp,
  Users,
  Activity
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
      setError(err.response?.data?.error || '删除任务失败，请重试');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getStatusCount = (status) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getTotalPoints = () => {
    return tasks.reduce((sum, task) => sum + (task.max_points || 0), 0);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 space-y-8">
        {/* 页面标题和操作区域 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">任务管理</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <CenteredDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-500">
                  <Plus className="mr-3 h-5 w-5" />
                  发布新任务
                </Button>
              </DialogTrigger>
              <CenteredDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <CenteredDialogHeader>
                  <CenteredDialogTitle className="text-2xl font-bold">发布新任务</CenteredDialogTitle>
                </CenteredDialogHeader>
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

                  <CenteredDialogFooter className="pt-6">
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
                  </CenteredDialogFooter>
                </form>
              </CenteredDialogContent>
            </CenteredDialog>
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
                  <CheckCircle className="h-8 w-8 text-white" />
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
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">总积分</p>
                  <p className="text-3xl font-bold text-green-900">¥{getTotalPoints()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* 搜索和筛选 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="搜索任务标题或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="open">可接受</SelectItem>
                <SelectItem value="assigned">已分配</SelectItem>
                <SelectItem value="submitted">待审核</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 任务列表 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    任务信息
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时间
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    积分
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{task.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                        <div className="flex items-center mt-2 text-xs text-gray-400">
                          <User className="h-3 w-3 mr-1" />
                          {task.publisher_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(task.start_date)}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(task.end_date)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">{task.max_points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setIsEditDialogOpen(true);
                          }}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务</h3>
              <p className="text-gray-500">还没有创建任何任务</p>
            </div>
          )}
        </div>
      </div>

      {/* 编辑任务对话框 */}
      <CenteredDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <CenteredDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CenteredDialogHeader>
            <CenteredDialogTitle className="text-2xl font-bold">编辑任务</CenteredDialogTitle>
          </CenteredDialogHeader>
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

              <CenteredDialogFooter className="pt-6">
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
                      更新中...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      更新任务
                    </>
                  )}
                </Button>
              </CenteredDialogFooter>
            </form>
          )}
        </CenteredDialogContent>
      </CenteredDialog>
    </div>
  );
};

export default AdminTasks;

