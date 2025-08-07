from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import User, db
from functools import wraps

user_bp = Blueprint('user', __name__)

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

@user_bp.route('/users', methods=['GET'])
@jwt_required()
@require_admin
def get_users():
    """获取所有用户列表 - 仅管理员"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'total_count': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': f'获取用户列表失败: {str(e)}'}), 500

@user_bp.route('/users/stats', methods=['GET'])
@jwt_required()
@require_admin
def get_user_stats():
    """获取用户统计信息 - 仅管理员"""
    try:
        total_users = User.query.count()
        admin_users = User.query.filter_by(role='admin').count()
        regular_users = total_users - admin_users
        
        return jsonify({
            'total_users': total_users,
            'admin_users': admin_users,
            'regular_users': regular_users
        }), 200
    except Exception as e:
        return jsonify({'error': f'获取用户统计失败: {str(e)}'}), 500

@user_bp.route('/users', methods=['POST'])
def create_user():
    
    data = request.json
    user = User(username=data['username'], email=data['email'])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()
    return jsonify(user.to_dict())

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return '', 204
