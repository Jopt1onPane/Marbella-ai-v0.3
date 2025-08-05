import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  Award, 
  User,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Target,
  TrendingUp
} from 'lucide-react';
import { tasksAPI, uploadAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submissionData, setSubmissionData] = useState({
    description: '',
    files: []
  });
  const [submittingTask, setSubmittingTask] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const user = getUser();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await tasksAPI.getTasks({ assigned_to_me: true });
      setTasks(response.data.tasks || []);
      setError('');
    } catch (err) {
      setError('获取我的任务失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadPromises = files.map(file => uploadAPI.uploadFile(file));
      const responses = await Promise.all(uploadPromises);
      
      const newFiles = responses.map(response => ({
        name: response.data.original_name,
        path: response.data.path,
        filename: response.data.filename
      }));

      setSubmissionData(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles]
      }));
    } catch (err) {
      setError('文件上传失败');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleSubmitTask = async (taskId) => {
    try {
      setSubmittingTask(taskId);
      
      const submitData = {
        description: submissionData.description,
        file_paths: submissionData.files.map(file => file.path)
      };

      await tasksAPI.submitTask(taskId, submitData);
      
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'submitted' }
          : task
      ));
      
      setSubmissionData({ description: '', files: [] });
      setIsSubmitDialogOpen(false);
      setSelectedTask(null);
      setSuccess('任务提交成功！');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || '提交任务失败');
    } finally {
      setSubmittingTask(null);
    }
  };

  const removeFile = (index) => {
    setSubmissionData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const getStatusBadge = (status) => {
    const config = {
      assigned: { label: '进行中', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      submitted: { label: '待审核', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      completed: { label: '已完成', color: 'bg-green-100 text-green-800 border-green-200' }
    };
    const { label, color } = config[status] || config.assigned;
    return <Badge className={`${color} border`}>{label}</Badge>;
  };

  const isTaskExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalPoints = () => {
    return tasks.reduce((sum, task) => sum + (task.max_points || 0), 0);
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.status === 'completed').length;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">我的任务</h1>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">总任务数</p>
                  <p className="text-3xl font-bold text-blue-900">{tasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">已完成</p>
                  <p className="text-3xl font-bold text-green-900">{getCompletedTasks()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">总积分</p>
                  <p className="text-3xl font-bold text-purple-900">{getTotalPoints()}</p>
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

        {/* 任务列表 */}
        <div className="space-y-6">
          {tasks.length === 0 ? (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="text-center py-20">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">暂无任务</h3>
                <p className="text-gray-500 mb-8 text-lg">您还没有接受任何任务</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="bg-white shadow-sm border-0 hover:shadow-lg transition-all duration-200">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{task.title}</h3>
                          <div className="flex flex-wrap gap-3 mb-4">
                            {getStatusBadge(task.status)}
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
                      {task.status === 'assigned' && !isTaskExpired(task.end_date) && (
                        <Button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsSubmitDialogOpen(true);
                          }}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-500"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          提交任务
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

        {/* 提交任务对话框 */}
        <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">提交任务</DialogTitle>
            </DialogHeader>
            {selectedTask && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">{selectedTask.title}</h4>
                  <p className="text-blue-800 text-sm">{selectedTask.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">完成说明</Label>
                    <Textarea
                      id="description"
                      value={submissionData.description}
                      onChange={(e) => setSubmissionData({...submissionData, description: e.target.value})}
                      placeholder="请详细描述任务完成情况..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-gray-700">上传文件</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploadingFiles ? '上传中...' : '选择文件'}
                      </label>
                    </div>
                  </div>

                  {submissionData.files.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">已上传文件</Label>
                      <div className="mt-2 space-y-2">
                        {submissionData.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-600">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              删除
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSubmitDialogOpen(false);
                      setSelectedTask(null);
                      setSubmissionData({ description: '', files: [] });
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={() => handleSubmitTask(selectedTask.id)}
                    disabled={submittingTask === selectedTask.id}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                  >
                    {submittingTask === selectedTask.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        提交中...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        提交任务
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyTasks;

