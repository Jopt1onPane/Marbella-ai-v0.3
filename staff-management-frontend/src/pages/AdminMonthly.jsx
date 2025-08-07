import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  Percent, 
  Calculator, 
  TrendingUp,
  Calendar,
  Award,
  Users,
  AlertCircle,
  CheckCircle,
  Save
} from 'lucide-react';
import { pointsAPI } from '@/lib/api';

const AdminMonthly = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [monthlyData, setMonthlyData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
    total_profit: '',
    profit_percentage: '25',
    point_value: 0,
    total_points_distributed: 0,
    total_amount_distributed: 0
  });

  const [stats, setStats] = useState({
    total_users: 0,
    active_users: 0,
    total_tasks: 0,
    completed_tasks: 0
  });

  useEffect(() => {
    // 加载月度设置
    loadMonthlySettings();
    // 加载月度积分统计
    loadMonthlyStats();
  }, []);

  useEffect(() => {
    // 计算积分价值
    if (monthlyData.total_profit && monthlyData.profit_percentage && monthlyData.total_points_distributed > 0) {
      const profitAmount = parseFloat(monthlyData.total_profit);
      const percentage = parseFloat(monthlyData.profit_percentage) / 100;
      const distributionAmount = profitAmount * percentage;
      const pointValue = distributionAmount / monthlyData.total_points_distributed;
      
      setMonthlyData(prev => ({
        ...prev,
        point_value: pointValue,
        total_amount_distributed: distributionAmount
      }));
    } else {
      setMonthlyData(prev => ({
        ...prev,
        point_value: 0,
        total_amount_distributed: 0
      }));
    }
  }, [monthlyData.total_profit, monthlyData.profit_percentage, monthlyData.total_points_distributed]);

  const loadMonthlySettings = async () => {
    try {
      const [year, month] = monthlyData.month.split('-');
      const response = await pointsAPI.getMonthlySettings({ year, month });
      
      if (response.data.monthly_setting) {
        const setting = response.data.monthly_setting;
        setMonthlyData(prev => ({
          ...prev,
          total_profit: setting.total_profit?.toString() || '',
          profit_percentage: setting.profit_percentage?.toString() || '25',
          point_value: setting.points_value || 0
        }));
      }
    } catch (error) {
      console.error('加载月度设置失败:', error);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const [year, month] = monthlyData.month.split('-');
      const response = await pointsAPI.getMonthlyPoints({ year, month });
      
      if (response.data.total_points !== undefined) {
        setMonthlyData(prev => ({
          ...prev,
          total_points_distributed: response.data.total_points
        }));
      }
    } catch (error) {
      console.error('加载月度统计失败:', error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const [year, month] = monthlyData.month.split('-');
      const data = {
        year: parseInt(year),
        month: parseInt(month),
        total_profit: parseFloat(monthlyData.total_profit),
        profit_percentage: parseFloat(monthlyData.profit_percentage)
      };
      
      await pointsAPI.setMonthlySettings(data);
      setSuccess('月度设置已保存成功！');
      
      // 重新加载设置
      await loadMonthlySettings();
    } catch (err) {
      setError(err.response?.data?.error || '保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculateDistribution = async () => {
    setLoading(true);
    setError('');
    
    try {
      await loadMonthlyStats();
      setSuccess('积分统计已更新！');
    } catch (err) {
      setError('获取积分统计失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">月度设置</h1>
        <p className="text-gray-600 mt-1">设置月度利润分配比例，计算积分价值和员工工资</p>
      </div>

      {/* 当前月度概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">当前月份</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃员工</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_users}</p>
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
                <p className="text-2xl font-bold text-gray-900">{monthlyData.total_points_distributed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">完成任务</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed_tasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 月度设置表单 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              月度利润设置
            </CardTitle>
            <CardDescription>
              设置本月公司利润和分配给积分系统的比例
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="month">月份</Label>
                <Input
                  id="month"
                  type="month"
                  value={monthlyData.month}
                  onChange={(e) => setMonthlyData({...monthlyData, month: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_profit">本月总利润 ($)</Label>
                <Input
                  id="total_profit"
                  type="number"
                  step="0.01"
                  value={monthlyData.total_profit}
                  onChange={(e) => setMonthlyData({...monthlyData, total_profit: e.target.value})}
                  placeholder="请输入本月总利润"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profit_percentage">分配比例 (%)</Label>
                <Input
                  id="profit_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={monthlyData.profit_percentage}
                  onChange={(e) => setMonthlyData({...monthlyData, profit_percentage: e.target.value})}
                  placeholder="25"
                  required
                />
                <p className="text-sm text-gray-500">
                  建议设置为20-30%之间
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalculateDistribution}
                  disabled={loading}
                  className="flex-1"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {loading ? '计算中...' : '重新计算'}
                </Button>
                
                <Button
                  type="submit"
                  disabled={submitting || !monthlyData.total_profit}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {submitting ? '保存中...' : '保存设置'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              积分价值计算
            </CardTitle>
            <CardDescription>
              根据利润和积分分布自动计算每积分的价值
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">计算公式</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>分配金额 = 总利润 × 分配比例</p>
                  <p>积分价值 = 分配金额 ÷ 总积分数</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-800 font-medium">总利润</span>
                  <span className="text-blue-900 font-bold">
                    ${monthlyData.total_profit ? parseFloat(monthlyData.total_profit).toLocaleString() : '0'}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">分配比例</span>
                  <span className="text-green-900 font-bold">{monthlyData.profit_percentage}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-purple-800 font-medium">分配金额</span>
                  <span className="text-purple-900 font-bold">
                    ${monthlyData.total_amount_distributed.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-800 font-medium">总积分数</span>
                  <span className="text-yellow-900 font-bold">{monthlyData.total_points_distributed}</span>
                </div>

                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                  <span className="text-orange-800 font-bold">每积分价值</span>
                  <span className="text-orange-900 font-bold text-xl">
                    ${monthlyData.point_value.toFixed(2)}
                  </span>
                </div>
              </div>

              {monthlyData.total_points_distributed === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    当前没有已分配的积分。请等待员工完成任务后重新计算。
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 员工工资预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            员工工资预览
          </CardTitle>
          <CardDescription>
            基于当前设置预览各员工的工资计算结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.point_value > 0 ? (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">工资计算就绪</h3>
              <p className="text-gray-500 mb-4">
                当前积分价值: ¥{monthlyData.point_value.toFixed(2)}/积分
              </p>
              <p className="text-sm text-gray-400">
                员工工资将根据其获得的积分数量自动计算
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">等待设置完成</h3>
              <p className="text-gray-500">
                请先设置月度利润并等待员工完成任务获得积分
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 消息提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminMonthly;

