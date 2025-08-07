from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from src.models.user import db, User, Task, TaskSubmission, PointRecord
from src.routes.notifications import create_submission_notification
from functools import wraps
import json

tasks_bp = Blueprint('tasks', __name__)

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

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        user_id = get_jwt_identity()
        print(f"🔍 调试: 获取任务列表，用户ID: {user_id}, 类型: {type(user_id)}")

        if not user_id:
            print("❌ 调试: 无法获取用户ID")
            return jsonify({'error': '无效的用户认证'}), 401

        # 确保用户ID是整数类型用于数据库查询
        if isinstance(user_id, str):
            try:
                user_id_int = int(user_id)
            except ValueError:
                print(f"❌ 调试: 无法转换用户ID为整数: {user_id}")
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            user_id_int = user_id

        user = User.query.get(user_id_int)
        if not user:
            print(f"❌ 调试: 找不到用户 ID: {user_id}")
            return jsonify({'error': '用户不存在'}), 404
            
        print(f"✅ 调试: 找到用户 {user.username}, 角色: {user.role}")
        
        # 获取查询参数
        status = request.args.get('status')
        assigned_to_me = request.args.get('assigned_to_me', 'false').lower() == 'true'
        
        query = Task.query
        
        if user.role == 'user':
            if assigned_to_me:
                # 用户查看自己的任务
                query = query.filter_by(assigned_to=user_id_int)
            else:
                # 用户查看可接受的任务
                query = query.filter_by(status='open')
        
        if status:
            query = query.filter_by(status=status)
        
        tasks = query.order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取任务列表失败: {str(e)}'}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
@require_admin
def create_task():
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['title', 'description', 'publisher_name', 'start_date', 'end_date', 'max_points']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} 是必需的'}), 400
        
        # 解析日期
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        if end_date < start_date:
            return jsonify({'error': '结束日期不能早于开始日期'}), 400
        
        # 确保积分是整数类型
        try:
            max_points = int(data['max_points'])
        except (ValueError, TypeError):
            return jsonify({'error': '积分必须是有效的数字'}), 400
        
        if max_points <= 0:
            return jsonify({'error': '积分必须大于0'}), 400
        
        user_id = get_jwt_identity()
        
        # 确保用户ID是整数类型用于数据库查询
        if isinstance(user_id, str):
            try:
                user_id_int = int(user_id)
            except ValueError:
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            user_id_int = user_id
        
        task = Task(
            title=data['title'],
            description=data['description'],
            publisher_name=data['publisher_name'],
            start_date=start_date,
            end_date=end_date,
            max_points=max_points,
            created_by=user_id_int
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': '任务创建成功',
            'task': task.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': '日期格式错误，请使用 YYYY-MM-DD 格式'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'创建任务失败: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        
        return jsonify({
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取任务详情失败: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
@require_admin
def update_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        
        data = request.get_json()
        
        # 更新字段
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'publisher_name' in data:
            task.publisher_name = data['publisher_name']
        if 'start_date' in data:
            task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            task.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'max_points' in data:
            if data['max_points'] <= 0:
                return jsonify({'error': '积分必须大于0'}), 400
            task.max_points = data['max_points']
        if 'status' in data:
            task.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': '任务更新成功',
            'task': task.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': '日期格式错误，请使用 YYYY-MM-DD 格式'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'更新任务失败: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>/assign', methods=['POST'])
@jwt_required()
def assign_task(task_id):
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
            
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        
        if task.status != 'open':
            return jsonify({'error': '任务不可接受'}), 400
        
        if task.assigned_to:
            return jsonify({'error': '任务已被其他人接受'}), 400
        
        # 检查任务是否已过期
        if task.end_date < date.today():
            return jsonify({'error': '任务已过期'}), 400
        
        task.assigned_to = user_id_int
        task.status = 'assigned'
        
        db.session.commit()
        
        return jsonify({
            'message': '任务接受成功',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'接受任务失败: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>/submit', methods=['POST'])
@jwt_required()
def submit_task(task_id):
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
            
        task = Task.query.get(task_id)
        
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        
        if task.assigned_to != user_id_int:
            return jsonify({'error': '您没有权限提交此任务'}), 403
        
        if task.status not in ['assigned', 'submitted']:
            return jsonify({'error': '任务状态不允许提交'}), 400
        
        data = request.get_json()
        
        # 检查是否已有提交记录
        existing_submission = TaskSubmission.query.filter_by(
            task_id=task_id, 
            user_id=user_id_int
        ).first()
        
        if existing_submission:
            # 更新现有提交
            existing_submission.description = data.get('description', '')
            existing_submission.file_paths = json.dumps(data.get('file_paths', []))
            existing_submission.submitted_at = datetime.utcnow()
            existing_submission.review_status = 'pending'
            submission = existing_submission
        else:
            # 创建新提交
            submission = TaskSubmission(
                task_id=task_id,
                user_id=user_id_int,
                description=data.get('description', ''),
                file_paths=json.dumps(data.get('file_paths', []))
            )
            db.session.add(submission)
        
        task.status = 'submitted'
        db.session.commit()
        
        # 创建通知给管理员
        create_submission_notification(submission)
        
        return jsonify({
            'message': '任务提交成功',
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'提交任务失败: {str(e)}'}), 500

@tasks_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
@require_admin
def delete_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({'error': '任务不存在'}), 404
        
        # 检查任务是否可以删除
        if task.status in ['assigned', 'submitted']:
            return jsonify({'error': '无法删除已分配或已提交的任务'}), 400
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            'message': '任务删除成功'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'删除任务失败: {str(e)}'}), 500