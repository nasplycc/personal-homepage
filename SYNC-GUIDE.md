# 个人主页自动同步系统

## 📋 功能说明

本系统实现了 NAS 后端数据库到 GitHub Pages 静态演示页面的**自动同步**功能。

### 工作流程

```
NAS 后端 (Flask + SQLite)
    ↓ 修改数据
数据库更新
    ↓ 定时检查 (每 30 分钟)
自动导出静态文件 (demo/data.json)
    ↓ 检测变化
自动推送到 GitHub
    ↓ GitHub Actions
自动部署到 GitHub Pages
    ↓
https://nasplycc.github.io/personal-homepage/
```

---

## 🔧 技术实现

### 1. 导出 API (`/api/export`)

- **位置**: `app/main.py`
- **功能**: 从数据库读取所有数据，生成静态 JSON 文件
- **输出**: 
  - `demo/data.json` - 包含个人资料、链接、技能、项目
  - `demo/.hash` - 数据哈希（用于检测变化）
  - `demo/.last-export` - 导出时间戳

### 2. 自动同步脚本 (`scripts/sync-to-github.sh`)

- **功能**: 
  - 调用 `/api/export` 导出最新数据
  - 比较哈希检测数据是否变化
  - 如有变化，自动提交并推送到 GitHub
- **日志**: `sync.log`

### 3. 定时任务 (OpenClaw Cron)

- **频率**: 每 30 分钟
- **任务 ID**: `3dc8b2d2-ff58-437e-b98e-b557f1cbfe5d`
- **通知**: 同步结果推送到 Telegram

### 4. GitHub Actions 自动部署

- **工作流**: `.github/workflows/deploy-pages.yml`
- **触发条件**: `demo/` 目录有变更时自动部署
- **部署目标**: GitHub Pages

---

## 📁 文件结构

```
personal-homepage/
├── app/
│   └── main.py              # Flask 应用（含 /api/export）
├── demo/
│   ├── index.html           # 静态演示首页
│   ├── style.css            # 样式文件
│   ├── app.js               # 前端脚本（支持 data.json 加载）
│   ├── data.json            # 自动生成的数据文件
│   ├── .hash                # 数据哈希（不提交）
│   └── .last-export         # 导出时间（不提交）
├── scripts/
│   └── sync-to-github.sh    # 自动同步脚本
├── .github/
│   └── workflows/
│       └── deploy-pages.yml # GitHub Pages 部署工作流
├── docker-compose.yml       # Docker 编排（挂载 demo 目录）
└── .gitignore               # Git 忽略配置
```

---

## 🚀 使用方法

### 手动触发同步

```bash
# 进入项目目录
cd /vol1/1000/github/personal-homepage

# 运行同步脚本
bash scripts/sync-to-github.sh
```

### 手动导出静态文件

```bash
# 调用导出 API
curl -X POST http://localhost:5533/api/export
```

### 查看同步日志

```bash
cat /vol1/1000/github/personal-homepage/sync.log
```

---

## ⚙️ 配置说明

### Docker 挂载

`docker-compose.yml` 中已配置：

```yaml
volumes:
  - ./demo:/app/demo    # 容器内导出文件映射到宿主机
```

### 环境变量

- `APP_DIR=/app` - 应用基础目录（用于导出路径）

### Git 忽略

`.gitignore` 中已排除同步元数据：

```
demo/.hash
demo/.last-sync-hash
demo/.last-export
```

---

## 📊 数据流程

1. **你在 NAS 后端修改数据**（通过 Flask-Admin 后台）
2. **等待最多 30 分钟**（或手动运行同步脚本）
3. **系统自动检测变化**并导出静态文件
4. **自动推送到 GitHub**
5. **GitHub Actions 自动部署**
6. **在线演示更新** → https://nasplycc.github.io/personal-homepage/

---

## 🔍 故障排查

### 导出失败

```bash
# 检查 Flask 应用是否运行
docker ps | grep personal-homepage

# 查看应用日志
docker logs personal-homepage

# 手动测试导出
curl -X POST http://localhost:5533/api/export
```

### 推送失败

```bash
# 检查 Git 认证
cd /vol1/1000/github/personal-homepage
git remote -v

# 手动推送测试
git push origin master
```

### 同步脚本不运行

```bash
# 检查定时任务状态
# 在 OpenClaw 中查看 cron 任务列表

# 手动运行测试
bash /vol1/1000/github/personal-homepage/scripts/sync-to-github.sh
```

---

## 📝 注意事项

1. **数据备份**: 同步前会保留数据库，不会丢失数据
2. **网络要求**: 需要能访问 GitHub API
3. **权限**: Git 需要 push 权限
4. **频率**: 默认 30 分钟检查一次，避免频繁推送

---

*最后更新：2026-04-26*
