from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db, User, Task, TaskSubmission, PointRecord
from functools import wraps

submissions_bp = Blueprint('submissions', __name__)

def require_admin(f):
    """装饰器：要求管理员权限"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        
        # 确保用户ID是整数类型用于数据库查询
        if isinstance(user_id, str):
            try:
                user_id_int = int(user_id)
            except ValueError:
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            user_id_int = user_id
            
        user = User.query.get(user_id_int)
        if not user or user.role != 'admin':
            return jsonify({'error': '需要管理员权限'}), 403
        return f(*args, **kwargs)
    return wrapper

@submissions_bp.route('/submissions', methods=['GET'])
@jwt_required()
@require_admin
def get_submissions():
    try:
        # 获取查询参数
        status = request.args.get('status')
        
        query = TaskSubmission.query
        
        if status:
            query = query.filter_by(review_status=status)
        
        submissions = query.order_by(TaskSubmission.submitted_at.desc()).all()
        
        return jsonify({
            'submissions': [submission.to_dict() for submission in submissions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取提交列表失败: {str(e)}'}), 500

@submissions_bp.route('/submissions/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_submission(submission_id):
    try:
        user_id = get_jwt_identity()
        
        # 确保用户ID是整数类型用于数据库查询
        if isinstance(user_id, str):
            try:
                user_id_int = int(user_id)
            except ValueError:
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            user_id_int = user_id
            
        user = User.query.get(user_id_int)
        
        submission = TaskSubmission.query.get(submission_id)
        if not submission:
            return jsonify({'error': '提交记录不存在'}), 404
        
        # 检查权限：管理员或提交者本人可以查看
        if user.role != 'admin' and submission.user_id != user_id_int:
            return jsonify({'error': '没有权限查看此提交'}), 403
        
        return jsonify({
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取提交详情失败: {str(e)}'}), 500

@submissions_bp.route('/submissions/<int:submission_id>/review', methods=['POST'])
@jwt_required()
@require_admin
def review_submission(submission_id):
    try:
        submission = TaskSubmission.query.get(submission_id)
        if not submission:
            return jsonify({'error': '提交记录不存在'}), 404
        
        data = request.get_json()
        
        # 验证必需字段
        if 'review_status' not in data or 'awarded_points' not in data:
            return jsonify({'error': '审核状态和奖励积分都是必需的'}), 400
        
        review_status = data['review_status']
        awarded_points = data['awarded_points']
        
        if review_status not in ['approved', 'rejected']:
            return jsonify({'error': '审核状态必须是 approved 或 rejected'}), 400
        
        if awarded_points < 0 or awarded_points > submission.task.max_points:
            return jsonify({'error': f'奖励积分必须在 0 到 {submission.task.max_points} 之间'}), 400
        
        # 更新提交记录
        submission.review_status = review_status
        submission.awarded_points = awarded_points
        submission.review_comments = data.get('review_comments', '')
        submission.reviewed_at = datetime.utcnow()
        
        # 更新任务状态
        task = submission.task
        if review_status == 'approved':
            task.status = 'completed'
            
            # 给用户添加积分
            if awarded_points > 0:
                user = submission.user
                user.total_points += awarded_points
                
                # 创建积分记录
                point_record = PointRecord(
                    user_id=user.id,
                    task_id=task.id,
                    points=awarded_points,
                    type='earned',
                    description=f'完成任务: {task.title}'
                )
                db.session.add(point_record)
        else:
            # 拒绝的任务重新开放
            task.status = 'open'
            task.assigned_to = None
        
        db.session.commit()
        
        return jsonify({
            'message': '审核完成',
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'审核失败: {str(e)}'}), 500

@submissions_bp.route('/submissions/my', methods=['GET'])
@jwt_required()
def get_my_submissions():
    try:
        user_id = get_jwt_identity()
        
        # 确保用户ID是整数类型用于数据库查询
        if isinstance(user_id, str):
            try:
                user_id_int = int(user_id)
            except ValueError:
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            user_id_int = user_id
        
        submissions = TaskSubmission.query.filter_by(user_id=user_id_int)\
            .order_by(TaskSubmission.submitted_at.desc()).all()
        
        return jsonify({
            'submissions': [submission.to_dict() for submission in submissions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取我的提交失败: {str(e)}'}), 500

