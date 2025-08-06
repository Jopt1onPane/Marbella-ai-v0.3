from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # 验证必需字段
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': '用户名、邮箱和密码都是必需的'}), 400
        
        # 检查用户是否已存在
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': '用户名已存在'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': '邮箱已被注册'}), 400
        
        # 创建新用户 - 强制安全规则：只有admin可以是管理员
        role = 'user'  # 所有注册用户都是普通用户
        if data['username'] == 'admin':
            # admin用户名保留给系统管理员
            return jsonify({'error': 'admin用户名为系统保留，请选择其他用户名'}), 400
            
        user = User(
            username=data['username'],
            email=data['email'],
            role=role  # 强制为普通用户
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': '注册成功',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'注册失败: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': '用户名和密码都是必需的'}), 400
        
        # 查找用户（支持用户名或邮箱登录）
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        # 创建访问令牌
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': '登录成功',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'登录失败: {str(e)}'}), 500

@auth_bp.route('/test-token', methods=['GET'])
@jwt_required()
def test_token():
    """测试JWT token是否有效"""
    try:
        user_id = get_jwt_identity()
        print(f"🔍 调试: JWT验证成功，用户ID: {user_id}")
        user = User.query.get(user_id)
        
        if not user:
            print(f"❌ 调试: 找不到用户 ID: {user_id}")
            return jsonify({'error': '用户不存在'}), 404
        
        print(f"✅ 调试: 找到用户 {user.username}, 角色: {user.role}")
        return jsonify({
            'message': 'Token验证成功',
            'user_id': user_id,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"❌ 调试: Token验证失败: {e}")
        return jsonify({'error': f'Token验证失败: {str(e)}'}), 500

@auth_bp.route('/debug-jwt', methods=['POST'])
def debug_jwt():
    """调试JWT token生成和验证"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': '需要用户名和密码'}), 400
        
        # 查找用户
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': '用户名或密码错误'}), 401
        
        # 生成token
        from flask import current_app
        import jwt
        from datetime import datetime, timedelta
        
        # 手动生成token进行测试
        payload = {
            'sub': user.id,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + timedelta(hours=24),
            'type': 'access'
        }
        
        secret_key = current_app.config['JWT_SECRET_KEY']
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        
        print(f"🔍 调试: 手动生成token成功")
        print(f"🔑 调试: 用户ID: {user.id}")
        print(f"🔑 调试: 密钥: {secret_key[:10]}...")
        print(f"🔑 调试: Token: {token[:50]}...")
        
        return jsonify({
            'message': 'JWT调试信息',
            'user_id': user.id,
            'username': user.username,
            'role': user.role,
            'secret_key_preview': secret_key[:10] + '...',
            'token_preview': token[:50] + '...',
            'token': token
        }), 200
        
    except Exception as e:
        print(f"❌ 调试: JWT调试失败: {e}")
        return jsonify({'error': f'JWT调试失败: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户信息失败: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT无状态，客户端删除token即可
    return jsonify({'message': '登出成功'}), 200

