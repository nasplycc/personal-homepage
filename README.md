# Personal Homepage 🚀

一个基于 Flask 的个人主页系统，带有可视化后台管理界面。

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 特性

- 🎨 **赛博朋克风格 UI** - 矩阵雨背景 + 霓虹光效
- 🔐 **安全后台** - 登录验证 + 密码加密
- 📱 **响应式设计** - 适配桌面和移动端
- 🐳 **Docker 部署** - 一键启动
- 📊 **可视化管理** - Flask-Admin 后台
- 🚀 **轻量级** - 内存占用 < 100MB

## 🌐 在线演示

访问 GitHub Pages 演示：https://nasplycc.github.io/personal-homepage/

## 📦 项目结构

```
personal-homepage/
├── app/
│   ├── main.py              # Flask 主程序
│   ├── templates/
│   │   ├── index.html       # 前端页面
│   │   └── login.html       # 登录页面
│   └── static/
│       ├── css/
│       │   └── style.css    # 样式文件
│       └── js/
│           └── app.js       # 前端脚本
├── demo/                     # GitHub Pages 静态演示
├── data/                     # 数据库目录 (已忽略)
├── docker-compose.yml        # Docker 配置
├── Dockerfile               # 镜像构建
├── requirements.txt         # Python 依赖
└── README.md                # 说明文档
```

## 🚀 快速开始

### 使用 Docker (推荐)

```bash
# 克隆项目
git clone https://github.com/nasplycc/personal-homepage.git
cd personal-homepage

# 启动服务
docker compose up -d

# 查看日志
docker logs -f personal-homepage
```

访问：`http://localhost:5533`

### 管理后台

- 地址：`http://localhost:5533/login`
- 默认账号：`admin` / `admin123`
- ⚠️ **首次登录后请立即修改密码！**

## ⚙️ 配置

### 修改端口

编辑 `docker-compose.yml`：

```yaml
ports:
  - "5533:5533"  # 修改左侧端口
```

### 修改密码

```bash
docker exec -it personal-homepage bash
cd /app/app
python -c "
from main import app, db, AdminUser
from werkzeug.security import generate_password_hash
with app.app_context():
    user = AdminUser.query.filter_by(username='admin').first()
    user.password_hash = generate_password_hash('your-new-password')
    db.session.commit()
    print('密码已修改!')
"
```

## 🎨 自定义

### 修改个人信息

1. 登录管理后台
2. 点击左侧 **个人信息**
3. 编辑名字、标题、简介等

### 添加社交链接

1. 点击 **社交链接**
2. 点击 **+** 添加新链接
3. 选择图标（GitHub/Telegram/Email 等）

### 自定义技能

1. 点击 **技能标签**
2. 添加技能名称、熟练度、颜色

## 🛠️ 技术栈

- **后端**: Flask + Flask-Admin + Flask-Login
- **数据库**: SQLite
- **前端**: HTML5 + CSS3 + JavaScript
- **部署**: Docker + Docker Compose
- **演示**: GitHub Pages

## 📝 API

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/profile` | GET | 获取个人信息 |
| `/api/links` | GET | 获取社交链接 |
| `/api/skills` | GET | 获取技能列表 |
| `/api/projects` | GET | 获取项目列表 |

## 🔒 安全建议

1. 首次登录后立即修改默认密码
2. 不要将 `data/homepage.db` 提交到 Git
3. 生产环境使用更强的 `SECRET_KEY`
4. 考虑使用 Nginx 反向代理 + HTTPS

## 📄 License

MIT License

## 🙏 致谢

感谢所有贡献者和使用者！

---

**Made with ❤️ by Jaben Zhou**
