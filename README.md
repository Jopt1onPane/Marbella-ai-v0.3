# 人员管理系统

这是一个现代化的公司人员管理系统，支持任务发布、积分管理和工资计算功能。

## 功能特性

### 管理员功能
- 🎯 **任务管理**: 创建、编辑、删除和监控任务
- 📊 **积分系统**: 为任务设置积分奖励，跟踪员工贡献
- 💰 **工资计算**: 基于积分和月利润自动计算员工工资
- 👥 **员工管理**: 查看员工信息和任务完成情况
- 📋 **审核系统**: 审核员工提交的任务完成证据

### 员工功能
- 📝 **任务接受**: 浏览和接受可用任务
- 📤 **任务提交**: 上传完成证据（文字、截图、文件）
- 📈 **积分查看**: 查看个人积分和贡献统计
- 💵 **工资查询**: 查看个人工资计算详情

## 技术栈

### 前端
- React 19 + Vite
- Tailwind CSS
- Radix UI 组件库
- Axios HTTP客户端
- React Router 路由管理

### 后端
- Flask (Python)
- SQLAlchemy ORM
- JWT 认证
- SQLite 数据库
- CORS 跨域支持

## 快速开始

### 1. 启动后端服务

```bash
cd staff-management-system
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python src/main.py
```

后端服务将在 `http://localhost:5000` 启动

### 2. 启动前端服务

```bash
cd staff-management-frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:5173` 启动

### 3. 访问系统

- **管理员账户**: admin / admin123
- **员工账户**: 需要管理员创建

## 系统架构

### 核心业务流程

1. **任务发布流程**
   - 管理员创建任务，设置积分奖励
   - 员工浏览和接受任务
   - 员工完成任务并提交证据
   - 管理员审核并分配积分

2. **工资计算流程**
   - 管理员设置月利润和分配比例
   - 系统计算积分价值（月利润 × 比例 ÷ 总积分）
   - 自动计算每个员工的工资
   - 管理员确认并发放工资

### 数据库设计

- **用户表**: 存储用户信息和角色
- **任务表**: 存储任务详情和状态
- **任务提交表**: 存储员工提交的证据
- **积分记录表**: 记录积分分配历史
- **月设置表**: 存储每月利润和分配设置

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/profile` - 获取用户信息

### 任务接口
- `GET /api/tasks` - 获取任务列表
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/assign` - 接受任务
- `POST /api/tasks/:id/submit` - 提交任务

### 积分接口
- `GET /api/points/monthly` - 获取月度积分统计
- `POST /api/monthly/settings` - 设置月度参数
- `GET /api/monthly/salary` - 计算月度工资

## 部署说明

### 生产环境部署

1. **后端部署**
   ```bash
   # 使用 Gunicorn
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
   ```

2. **前端部署**
   ```bash
   npm run build
   # 将 dist 目录部署到 Web 服务器
   ```

### 环境变量配置

创建 `.env` 文件：
```env
FLASK_SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///app.db
```

## 开发指南

### 代码结构

```
staff-management-system/
├── src/
│   ├── models/          # 数据模型
│   ├── routes/          # API 路由
│   ├── main.py          # 应用入口
│   └── database/        # 数据库文件
└── requirements.txt     # Python 依赖

staff-management-frontend/
├── src/
│   ├── components/      # React 组件
│   ├── pages/          # 页面组件
│   ├── lib/            # 工具库
│   └── App.jsx         # 应用入口
└── package.json        # Node.js 依赖
```

### 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 编写单元测试覆盖核心功能

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库文件权限
   - 确保 SQLite 已正确安装

2. **前端无法连接后端**
   - 检查后端服务是否启动
   - 确认 CORS 配置正确
   - 检查 API 地址配置

3. **JWT 认证失败**
   - 检查 Token 是否过期
   - 确认 JWT 密钥配置一致

## 更新日志

### v1.0.0 (2024-01-01)
- ✅ 基础任务管理功能
- ✅ 用户认证和权限控制
- ✅ 积分系统和工资计算
- ✅ 现代化 UI 设计
- ✅ 文件上传功能

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。 