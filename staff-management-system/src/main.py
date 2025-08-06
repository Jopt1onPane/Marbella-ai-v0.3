import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from datetime import timedelta

from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.tasks import tasks_bp
from src.routes.submissions import submissions_bp
from src.routes.points import points_bp
from src.routes.upload import upload_bp

app = Flask(__name__)

# 配置
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'asdf#FGSgvasgf$5$WGT')  # 使用相同的密钥
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Token过期时间
app.config['JWT_ALGORITHM'] = 'HS256'  # 明确指定算法
app.config['JWT_DECODE_ALGORITHMS'] = ['HS256']  # 明确指定解码算法

# 调试JWT配置
print(f"🔍 调试: SECRET_KEY = {app.config['SECRET_KEY'][:10]}...")
print(f"🔍 调试: JWT_SECRET_KEY = {app.config['JWT_SECRET_KEY'][:10]}...")
print(f"🔍 调试: JWT_ALGORITHM = {app.config['JWT_ALGORITHM']}")
print(f"🔍 调试: JWT_DECODE_ALGORITHMS = {app.config['JWT_DECODE_ALGORITHMS']}")

# 数据库配置
DATABASE_URL = os.getenv('DATABASE_URL')
print(f"🔍 调试: DATABASE_URL = {DATABASE_URL}")

if not DATABASE_URL:
    print("⚠️  警告: 未设置DATABASE_URL环境变量，使用SQLite")
    # 如果没有设置DATABASE_URL，使用SQLite
    if os.name == 'nt':  # Windows系统
        # Windows环境，使用当前目录
        base_dir = os.path.dirname(os.path.abspath(__file__))
        db_dir = os.path.join(base_dir, 'database')
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
        db_path = os.path.join(db_dir, 'app.db')
    else:
        # Linux/Unix环境（如Render），使用/tmp目录
        db_path = os.path.join('/tmp', 'app.db')
    
    DATABASE_URL = f"sqlite:///{db_path}"
elif DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    print("✅ 使用PostgreSQL数据库")
else:
    print("✅ 使用外部数据库")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 文件上传配置
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)

# JWT错误处理
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token已过期，请重新登录'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': '需要访问令牌'}), 401

# 配置CORS - 使用Flask-CORS扩展，避免多重头冲突
CORS(app, 
     origins=['*'],  # 允许所有来源
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization', 'X-Requested-With'],
     supports_credentials=False  # 避免与通配符Origin冲突
)

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(submissions_bp, url_prefix='/api')
app.register_blueprint(points_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# 数据库初始化
def init_database():
    """初始化数据库表和管理员账户"""
    try:
        with app.app_context():
            db.create_all()
            print("✅ 数据库表创建完成")
            
            # 自动创建初始账户
            from src.models.user import User
            
            # 创建唯一的管理员账户 admin/admin123
            admin = User.query.filter_by(username='admin').first()
            if not admin:
                admin = User(
                    username='admin',
                    email='admin@company.com',
                    role='admin'
                )
                admin.set_password('admin123')
                db.session.add(admin)
                print("👑 管理员账户已创建: admin / admin123")
            
            db.session.commit()
            print("💾 初始账户创建完成")
            
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")

# 在应用启动时初始化数据库
init_database()

@app.route('/')
def health_check():
    return jsonify({
        'message': 'Staff Management System API',
        'status': 'running',
        'version': '1.0.0'
    })

@app.route('/health/db')
def db_health_check():
    """数据库健康检查"""
    try:
        # 测试数据库连接
        from src.models.user import User
        user_count = User.query.count()
        admin_count = User.query.filter_by(role='admin').count()
        
        # 检查管理员账户
        admin_user = User.query.filter_by(username='admin').first()
        admin_exists = bool(admin_user)
        
        # 获取所有用户列表（调试用）
        all_users = User.query.all()
        user_list = [{'username': u.username, 'role': u.role, 'id': u.id} for u in all_users]
        
        db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        db_type = 'PostgreSQL' if 'postgresql' in db_url else 'SQLite' if 'sqlite' in db_url else 'Unknown'
        
        return jsonify({
            'database_status': 'connected',
            'database_type': db_type,
            'total_users': user_count,
            'admin_users': admin_count,
            'admin_account_exists': admin_exists,
            'all_users': user_list,
            'database_url_partial': db_url.split('@')[-1] if '@' in db_url else 'local'
        }), 200
    except Exception as e:
        return jsonify({
            'database_status': 'error',
            'error': str(e),
            'database_url': app.config.get('SQLALCHEMY_DATABASE_URI', 'not_set')
        }), 500

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '资源不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token已过期，请重新登录'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    print(f"❌ 调试: 无效Token错误: {error}")
    return jsonify({'error': f'Token无效: {str(error)}'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': '需要登录才能访问'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

