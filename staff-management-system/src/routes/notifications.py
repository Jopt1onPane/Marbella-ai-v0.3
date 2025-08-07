from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from src.models.user import db, User, Notification, Task, TaskSubmission
from functools import wraps

notifications_bp = Blueprint('notifications', __name__)

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

@notifications_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    """获取当前用户的通知"""
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
        if not user:
            return jsonify({'error': '用户不存在'}), 404

        # 获取查询参数
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        limit = request.args.get('limit', 50, type=int)
        
        query = Notification.query.filter_by(user_id=user_id_int)
        
        if unread_only:
            query = query.filter_by(is_read=False)
        
        notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取通知失败: {str(e)}'}), 500

@notifications_bp.route('/notifications/count', methods=['GET'])
@jwt_required()
def get_notification_count():
    """获取当前用户未读通知数量"""
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
        if not user:
            return jsonify({'error': '用户不存在'}), 404

        unread_count = Notification.query.filter_by(
            user_id=user_id_int, 
            is_read=False
        ).count()
        
        return jsonify({
            'unread_count': unread_count
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取通知数量失败: {str(e)}'}), 500

@notifications_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
@jwt_required()
def mark_notification_read(notification_id):
    """标记通知为已读"""
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

        notification = Notification.query.filter_by(
            id=notification_id,
            user_id=user_id_int
        ).first()
        
        if not notification:
            return jsonify({'error': '通知不存在'}), 404
        
        notification.is_read = True
        db.session.commit()
        
        return jsonify({
            'message': '通知已标记为已读',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'标记通知失败: {str(e)}'}), 500

@notifications_bp.route('/notifications/read-all', methods=['POST'])
@jwt_required()
def mark_all_notifications_read():
    """标记所有通知为已读"""
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

        # 批量更新所有未读通知
        Notification.query.filter_by(
            user_id=user_id_int,
            is_read=False
        ).update({'is_read': True})
        
        db.session.commit()
        
        return jsonify({
            'message': '所有通知已标记为已读'
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'标记通知失败: {str(e)}'}), 500

@notifications_bp.route('/notifications/admin/submissions', methods=['GET'])
@jwt_required()
@require_admin
def get_admin_submission_notifications():
    """获取管理员的任务提交通知"""
    try:
        # 获取所有管理员用户
        admin_users = User.query.filter_by(role='admin').all()
        
        if not admin_users:
            return jsonify({'notifications': []}), 200
        
        # 获取所有待审核的提交
        pending_submissions = TaskSubmission.query.filter_by(
            review_status='pending'
        ).order_by(TaskSubmission.submitted_at.desc()).all()
        
        notifications = []
        for submission in pending_submissions:
            for admin_user in admin_users:
                # 检查是否已存在通知
                existing_notification = Notification.query.filter_by(
                    user_id=admin_user.id,
                    related_submission_id=submission.id,
                    type='submission_pending'
                ).first()
                
                if not existing_notification:
                    # 创建新通知
                    notification = Notification(
                        user_id=admin_user.id,
                        title='新的任务提交',
                        message=f'用户 {submission.user.username} 提交了任务 "{submission.task.title}"，等待审核。',
                        type='submission_pending',
                        related_task_id=submission.task_id,
                        related_submission_id=submission.id
                    )
                    db.session.add(notification)
                    notifications.append(notification)
        
        db.session.commit()
        
        # 返回所有管理员的通知
        all_notifications = []
        for admin_user in admin_users:
            user_notifications = Notification.query.filter_by(
                user_id=admin_user.id,
                is_read=False
            ).order_by(Notification.created_at.desc()).all()
            all_notifications.extend([n.to_dict() for n in user_notifications])
        
        return jsonify({
            'notifications': all_notifications
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取管理员通知失败: {str(e)}'}), 500

def create_submission_notification(submission):
    """创建任务提交通知（供其他模块调用）"""
    try:
        # 获取所有管理员用户
        admin_users = User.query.filter_by(role='admin').all()
        
        for admin_user in admin_users:
            # 检查是否已存在通知
            existing_notification = Notification.query.filter_by(
                user_id=admin_user.id,
                related_submission_id=submission.id,
                type='submission_pending'
            ).first()
            
            if not existing_notification:
                # 创建新通知
                notification = Notification(
                    user_id=admin_user.id,
                    title='新的任务提交',
                    message=f'用户 {submission.user.username} 提交了任务 "{submission.task.title}"，等待审核。',
                    type='submission_pending',
                    related_task_id=submission.task_id,
                    related_submission_id=submission.id
                )
                db.session.add(notification)
        
        db.session.commit()
        
    except Exception as e:
        print(f"创建通知失败: {e}")
        db.session.rollback()
