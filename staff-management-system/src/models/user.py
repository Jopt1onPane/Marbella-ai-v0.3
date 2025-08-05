from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_points = db.Column(db.Integer, default=0)

    # 关系
    created_tasks = db.relationship('Task', foreign_keys='Task.created_by', backref='creator', lazy='dynamic')
    assigned_tasks = db.relationship('Task', foreign_keys='Task.assigned_to', backref='assignee', lazy='dynamic')
    submissions = db.relationship('TaskSubmission', backref='user', lazy='dynamic')
    point_records = db.relationship('PointRecord', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'total_points': self.total_points
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    publisher_name = db.Column(db.String(100), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    max_points = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='open')  # 'open', 'assigned', 'submitted', 'completed', 'cancelled'
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关系
    submissions = db.relationship('TaskSubmission', backref='task', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'publisher_name': self.publisher_name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'max_points': self.max_points,
            'status': self.status,
            'created_by': self.created_by,
            'assigned_to': self.assigned_to,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'creator_name': self.creator.username if self.creator else None,
            'assignee_name': self.assignee.username if self.assignee else None
        }

class TaskSubmission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.Text)
    file_paths = db.Column(db.Text)  # JSON格式存储文件路径
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)
    awarded_points = db.Column(db.Integer, default=0)
    review_status = db.Column(db.String(20), default='pending')  # 'pending', 'approved', 'rejected'
    review_comments = db.Column(db.Text)

    def to_dict(self):
        return {
            'id': self.id,
            'task_id': self.task_id,
            'user_id': self.user_id,
            'description': self.description,
            'file_paths': self.file_paths,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'awarded_points': self.awarded_points,
            'review_status': self.review_status,
            'review_comments': self.review_comments,
            'task_title': self.task.title if self.task else None,
            'user_name': self.user.username if self.user else None
        }

class MonthlySetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    year = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    total_profit = db.Column(db.Numeric(10, 2))
    profit_percentage = db.Column(db.Numeric(5, 2))  # 用于积分分配的利润百分比
    points_value = db.Column(db.Numeric(10, 4))  # 每积分价值
    is_finalized = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (db.UniqueConstraint('year', 'month', name='unique_year_month'),)

    def to_dict(self):
        return {
            'id': self.id,
            'year': self.year,
            'month': self.month,
            'total_profit': float(self.total_profit) if self.total_profit else None,
            'profit_percentage': float(self.profit_percentage) if self.profit_percentage else None,
            'points_value': float(self.points_value) if self.points_value else None,
            'is_finalized': self.is_finalized,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PointRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))
    points = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'earned', 'bonus', 'deduction'
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'points': self.points,
            'type': self.type,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'task_title': self.task.title if self.task else None
        }

