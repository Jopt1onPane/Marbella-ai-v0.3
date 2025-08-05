from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import os
import uuid
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload', __name__)

# 允许的文件扩展名
ALLOWED_EXTENSIONS = {
    'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 
    'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有文件被上传'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': '没有选择文件'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': '不支持的文件类型'}), 400
        
        # 创建上传目录
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
        
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # 返回相对路径
        relative_path = f"/uploads/{unique_filename}"
        
        return jsonify({
            'message': '文件上传成功',
            'filename': unique_filename,
            'path': relative_path,
            'original_name': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'文件上传失败: {str(e)}'}), 500

@upload_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """提供文件下载服务"""
    try:
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        return send_from_directory(upload_dir, filename)
    except Exception as e:
        return jsonify({'error': '文件不存在'}), 404

