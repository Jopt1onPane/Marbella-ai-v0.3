from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from sqlalchemy import func, extract
from src.models.user import db, User, PointRecord, MonthlySetting
from functools import wraps

points_bp = Blueprint('points', __name__)

@points_bp.route('/points/my', methods=['GET'])
@jwt_required()
def get_my_points():
    """获取当前用户的积分"""
    try:
        user_id = get_jwt_identity()
        print(f"🔍 调试: 获取我的积分，用户ID: {user_id}, 类型: {type(user_id)}")

        if not user_id:
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
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取用户的积分记录
        point_records = PointRecord.query.filter_by(user_id=user_id_int).order_by(PointRecord.created_at.desc()).all()
        
        # 计算总积分
        total_points = sum(record.points for record in point_records if record.type == 'earned')
        
        return jsonify({
            'user': user.to_dict(),
            'total_points': total_points,
            'point_records': [record.to_dict() for record in point_records]
        }), 200
        
    except Exception as e:
        print(f"❌ 调试: 获取积分失败: {e}")
        return jsonify({'error': f'获取积分失败: {str(e)}'}), 500

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

@points_bp.route('/points/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_points(user_id):
    try:
        current_user_id = get_jwt_identity()
        
        # 确保用户ID是整数类型用于数据库查询
        if isinstance(current_user_id, str):
            try:
                current_user_id_int = int(current_user_id)
            except ValueError:
                return jsonify({'error': '无效的用户ID格式'}), 400
        else:
            current_user_id_int = current_user_id
            
        current_user = User.query.get(current_user_id_int)
        
        # 检查权限：管理员或用户本人可以查看
        if current_user.role != 'admin' and current_user_id_int != user_id:
            return jsonify({'error': '没有权限查看此用户积分'}), 403
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': '用户不存在'}), 404
        
        # 获取积分记录
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        query = PointRecord.query.filter_by(user_id=user_id)
        
        if year and month:
            query = query.filter(
                extract('year', PointRecord.created_at) == year,
                extract('month', PointRecord.created_at) == month
            )
        
        point_records = query.order_by(PointRecord.created_at.desc()).all()
        
        # 计算月度积分总数
        monthly_points = sum(record.points for record in point_records if record.type == 'earned')
        
        return jsonify({
            'user': user.to_dict(),
            'monthly_points': monthly_points,
            'point_records': [record.to_dict() for record in point_records]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取用户积分失败: {str(e)}'}), 500

@points_bp.route('/points/monthly', methods=['GET'])
@jwt_required()
@require_admin
def get_monthly_points():
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        # 获取所有用户的月度积分统计
        users_points = db.session.query(
            User.id,
            User.username,
            User.email,
            func.coalesce(func.sum(PointRecord.points), 0).label('monthly_points')
        ).outerjoin(
            PointRecord,
            (PointRecord.user_id == User.id) &
            (extract('year', PointRecord.created_at) == year) &
            (extract('month', PointRecord.created_at) == month) &
            (PointRecord.type == 'earned')
        ).group_by(User.id, User.username, User.email).all()
        
        # 计算总积分
        total_points = sum(user.monthly_points for user in users_points)
        
        # 获取月度设置
        monthly_setting = MonthlySetting.query.filter_by(year=year, month=month).first()
        
        result = {
            'year': year,
            'month': month,
            'total_points': total_points,
            'users': [
                {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'monthly_points': user.monthly_points
                }
                for user in users_points
            ],
            'monthly_setting': monthly_setting.to_dict() if monthly_setting else None
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': f'获取月度积分统计失败: {str(e)}'}), 500

@points_bp.route('/monthly/settings', methods=['GET'])
@jwt_required()
@require_admin
def get_monthly_settings():
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        monthly_setting = MonthlySetting.query.filter_by(year=year, month=month).first()
        
        return jsonify({
            'monthly_setting': monthly_setting.to_dict() if monthly_setting else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'获取月度设置失败: {str(e)}'}), 500

@points_bp.route('/monthly/settings', methods=['POST'])
@jwt_required()
@require_admin
def set_monthly_settings():
    try:
        data = request.get_json()
        
        # 验证必需字段
        required_fields = ['year', 'month', 'total_profit', 'profit_percentage']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} 是必需的'}), 400
        
        year = data['year']
        month = data['month']
        total_profit = float(data['total_profit'])
        profit_percentage = float(data['profit_percentage'])
        
        if total_profit < 0:
            return jsonify({'error': '总利润不能为负数'}), 400
        
        if profit_percentage < 0 or profit_percentage > 100:
            return jsonify({'error': '利润百分比必须在 0 到 100 之间'}), 400
        
        # 检查是否已存在设置
        existing_setting = MonthlySetting.query.filter_by(year=year, month=month).first()
        
        if existing_setting:
            if existing_setting.is_finalized:
                return jsonify({'error': '该月份设置已确认，无法修改'}), 400
            
            # 更新现有设置
            existing_setting.total_profit = total_profit
            existing_setting.profit_percentage = profit_percentage
            monthly_setting = existing_setting
        else:
            # 创建新设置
            monthly_setting = MonthlySetting(
                year=year,
                month=month,
                total_profit=total_profit,
                profit_percentage=profit_percentage
            )
            db.session.add(monthly_setting)
        
        db.session.commit()
        
        return jsonify({
            'message': '月度设置保存成功',
            'monthly_setting': monthly_setting.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': '数值格式错误'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'保存月度设置失败: {str(e)}'}), 500

@points_bp.route('/monthly/salary', methods=['GET'])
@jwt_required()
@require_admin
def calculate_monthly_salary():
    try:
        year = request.args.get('year', datetime.now().year, type=int)
        month = request.args.get('month', datetime.now().month, type=int)
        
        # 获取月度设置
        monthly_setting = MonthlySetting.query.filter_by(year=year, month=month).first()
        if not monthly_setting:
            return jsonify({'error': '请先设置该月份的利润和百分比'}), 400
        
        if not monthly_setting.total_profit or not monthly_setting.profit_percentage:
            return jsonify({'error': '月度设置不完整'}), 400
        
        # 获取所有用户的月度积分
        users_points = db.session.query(
            User.id,
            User.username,
            User.email,
            func.coalesce(func.sum(PointRecord.points), 0).label('monthly_points')
        ).outerjoin(
            PointRecord,
            (PointRecord.user_id == User.id) &
            (extract('year', PointRecord.created_at) == year) &
            (extract('month', PointRecord.created_at) == month) &
            (PointRecord.type == 'earned')
        ).group_by(User.id, User.username, User.email).all()
        
        # 计算总积分
        total_points = sum(user.monthly_points for user in users_points)
        
        if total_points == 0:
            return jsonify({
                'message': '该月份没有积分记录',
                'year': year,
                'month': month,
                'total_points': 0,
                'point_value': 0,
                'users': []
            }), 200
        
        # 计算积分价值
        profit_pool = float(monthly_setting.total_profit) * float(monthly_setting.profit_percentage) / 100
        point_value = profit_pool / total_points
        
        # 更新月度设置中的积分价值
        monthly_setting.points_value = point_value
        db.session.commit()
        
        # 计算每个用户的工资
        users_salary = []
        for user in users_points:
            salary = user.monthly_points * point_value
            users_salary.append({
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'monthly_points': user.monthly_points,
                'salary': round(salary, 2)
            })
        
        return jsonify({
            'year': year,
            'month': month,
            'total_profit': float(monthly_setting.total_profit),
            'profit_percentage': float(monthly_setting.profit_percentage),
            'profit_pool': round(profit_pool, 2),
            'total_points': total_points,
            'point_value': round(point_value, 4),
            'users': users_salary
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'计算工资失败: {str(e)}'}), 500

@points_bp.route('/monthly/finalize', methods=['POST'])
@jwt_required()
@require_admin
def finalize_monthly_settings():
    try:
        data = request.get_json()
        year = data.get('year', datetime.now().year)
        month = data.get('month', datetime.now().month)
        
        monthly_setting = MonthlySetting.query.filter_by(year=year, month=month).first()
        if not monthly_setting:
            return jsonify({'error': '月度设置不存在'}), 404
        
        monthly_setting.is_finalized = True
        db.session.commit()
        
        return jsonify({
            'message': '月度设置已确认',
            'monthly_setting': monthly_setting.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'确认月度设置失败: {str(e)}'}), 500

