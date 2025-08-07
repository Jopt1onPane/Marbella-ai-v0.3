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
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  User,
  Calendar,
  FileText,
  Image,
  Download,
  Search,
  Filter,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { submissionsAPI } from '@/lib/api';

const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: 'approved',
    awarded_points: '',
    feedback: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // 获取提交数据
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await submissionsAPI.getSubmissions();
        setSubmissions(response.data.submissions || []);
        setError('');
      } catch (err) {
        console.error('获取提交列表失败:', err);
        setError('获取提交列表失败，请刷新页面重试');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleReviewSubmission = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await submissionsAPI.reviewSubmission(selectedSubmission.id, {
        review_status: reviewData.status,
        awarded_points: parseInt(reviewData.awarded_points) || 0,
        review_comments: reviewData.feedback
      });
      
      // 更新本地状态
      setSubmissions(submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? response.data.submission
          : sub
      ));
      
      setIsReviewDialogOpen(false);
      setSelectedSubmission(null);
      setReviewData({
        status: 'approved',
        awarded_points: '',
        feedback: ''
      });
      setError('');
    } catch (err) {
      console.error('审核失败:', err);
      setError(err.response?.data?.error || '审核失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { label: '待审核', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: '已通过', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const { label, color, icon: Icon } = config[status] || config.pending;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">审核中心</h1>
        </div>
        <div className="space-y-4">
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

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">审核中心</h1>
        <p className="text-gray-600 mt-1">审核员工提交的任务完成证据，分配积分奖励</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待审核</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'pending').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">已通过</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已拒绝</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.status === 'rejected').length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">已发积分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.awarded_points).reduce((sum, s) => sum + s.awarded_points, 0)}
                </p>
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
                placeholder="搜索任务、用户或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">待审核</SelectItem>
                  <SelectItem value="approved">已通过</SelectItem>
                  <SelectItem value="rejected">已拒绝</SelectItem>
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

      {/* 提交列表 */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <CheckCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">暂无提交记录</h3>
              <p className="text-gray-500">
                {searchTerm ? '没有找到匹配的提交记录' : '还没有员工提交任务完成证据'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* 左侧信息 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {submission.task_title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getStatusBadge(submission.status)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {submission.user_name}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>提交时间: {formatDate(submission.submitted_at)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span>
                          积分: {submission.awarded_points !== null 
                            ? `${submission.awarded_points}/${submission.max_points}`
                            : `待定/${submission.max_points}`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">完成说明:</h4>
                      <p className="text-gray-600 whitespace-pre-line line-clamp-3">
                        {submission.description}
                      </p>
                    </div>
                    
                    {/* 附件列表 */}
                    {submission.files && submission.files.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">附件文件:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {submission.files.map((file, index) => (
                            <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                              {getFileIcon(file.type)}
                              <div className="ml-2 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">{file.size}</p>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 反馈信息 */}
                    {submission.feedback && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">审核反馈:</h4>
                            <p className="text-blue-800 text-sm">{submission.feedback}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 右侧操作 */}
                  <div className="flex flex-col gap-2 lg:w-48">
                    {submission.status === 'pending' ? (
                      <Button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewData({
                            status: 'approved',
                            awarded_points: submission.max_points.toString(),
                            feedback: ''
                          });
                          setIsReviewDialogOpen(true);
                        }}
                        className="w-full"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        审核
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewData({
                            status: submission.status,
                            awarded_points: submission.awarded_points?.toString() || '0',
                            feedback: submission.feedback || ''
                          });
                          setIsReviewDialogOpen(true);
                        }}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 审核对话框 */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.status === 'pending' ? '审核提交' : '查看审核详情'}
            </DialogTitle>
            <DialogDescription>
              任务: {selectedSubmission?.task_title} | 提交人: {selectedSubmission?.user_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <form onSubmit={handleReviewSubmission} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">完成说明</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-900 whitespace-pre-line">
                      {selectedSubmission.description}
                    </p>
                  </div>
                </div>
                
                {selectedSubmission.files && selectedSubmission.files.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">附件文件</Label>
                    <div className="mt-1 space-y-2">
                      {selectedSubmission.files.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg border">
                          {getFileIcon(file.type)}
                          <div className="ml-2 flex-1">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">审核结果</Label>
                  <Select 
                    value={reviewData.status} 
                    onValueChange={(value) => setReviewData({...reviewData, status: value})}
                    disabled={selectedSubmission.status !== 'pending'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">通过</SelectItem>
                      <SelectItem value="rejected">拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="awarded_points">
                    分配积分 (最大: {selectedSubmission.max_points})
                  </Label>
                  <Input
                    id="awarded_points"
                    type="number"
                    value={reviewData.awarded_points}
                    onChange={(e) => setReviewData({...reviewData, awarded_points: e.target.value})}
                    min="0"
                    max={selectedSubmission.max_points}
                    disabled={selectedSubmission.status !== 'pending' || reviewData.status === 'rejected'}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback">审核反馈</Label>
                <Textarea
                  id="feedback"
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                  placeholder="请提供审核意见和建议..."
                  rows={4}
                  disabled={selectedSubmission.status !== 'pending'}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  {selectedSubmission.status === 'pending' ? '取消' : '关闭'}
                </Button>
                {selectedSubmission.status === 'pending' && (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? '提交中...' : '提交审核'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubmissions;

