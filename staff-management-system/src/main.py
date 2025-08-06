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
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-string')  # JWT密钥
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)  # Token过期时间

# 数据库配置
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
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

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# 文件上传配置
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# 初始化扩展
db.init_app(app)
jwt = JWTManager(app)

# 强制CORS配置 - 允许所有来源
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# 专门处理OPTIONS请求
@app.route('/api/auth/login', methods=['OPTIONS'])
@app.route('/api/auth/register', methods=['OPTIONS'])
@app.route('/api/tasks', methods=['OPTIONS'])
@app.route('/api/submissions', methods=['OPTIONS'])
@app.route('/api/points', methods=['OPTIONS'])
@app.route('/api/upload', methods=['OPTIONS'])
def handle_options():
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# 注册蓝图
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tasks_bp, url_prefix='/api')
app.register_blueprint(submissions_bp, url_prefix='/api')
app.register_blueprint(points_bp, url_prefix='/api')
app.register_blueprint(upload_bp, url_prefix='/api')

# 创建数据库表和初始账户
with app.app_context():
    db.create_all()
    print("数据库表创建完成")
    
    # 自动创建初始账户
    from src.models.user import User
    
    # 创建管理员账户
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(
            username='admin',
            email='admin@company.com',
            role='admin'
        )
        admin.set_password('admin123')
        db.session.add(admin)
        print("管理员账户已创建: admin / admin123")
    
    # 创建测试员工账户
    employee = User.query.filter_by(username='employee').first()
    if not employee:
        employee = User(
            username='employee',
            email='employee@company.com',
            role='user'
        )
        employee.set_password('employee123')
        db.session.add(employee)
        print("员工账户已创建: employee / employee123")
    
    db.session.commit()
    print("初始账户创建完成")

@app.route('/')
def health_check():
    return jsonify({
        'message': 'Staff Management System API',
        'status': 'running',
        'version': '1.0.0'
    })

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
    return jsonify({'error': 'Token无效，请重新登录'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': '需要登录才能访问'}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

