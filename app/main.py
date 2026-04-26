from flask import Flask, jsonify, render_template, redirect, url_for, request, flash
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
import json
import hashlib
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////app/data/homepage.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)

# ==================== 登录管理 ====================
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = '请先登录'
login_manager.login_message_category = 'info'

class AdminUser(UserMixin, db.Model):
    __tablename__ = 'admin_users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return AdminUser.query.get(int(user_id))

# ==================== 数据模型 ====================

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default='Nasply')
    title = db.Column(db.String(200), default='技术爱好者 / NAS 玩家')
    bio = db.Column(db.Text, default='热爱折腾，享受自动化带来的便利')
    avatar = db.Column(db.String(500), default='')
    location = db.Column(db.String(100), default='')
    email = db.Column(db.String(100), default='')

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    icon = db.Column(db.String(100), default='link')
    order = db.Column(db.Integer, default=0)

class Skill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer, default=50)
    color = db.Column(db.String(50), default='#00ff88')
    order = db.Column(db.Integer, default=0)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    url = db.Column(db.String(500), default='')
    tech = db.Column(db.String(200), default='')
    order = db.Column(db.Integer, default=0)

# ==================== 需要登录的 Admin 视图 ====================

class SecureAdminIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_authenticated:
            return redirect(url_for('login', next=request.url))
        return super().index()

class SecureModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated
    
    def _handle_view(self, name, **kwargs):
        if not self.is_accessible():
            return redirect(url_for('login', next=request.url))

# ==================== 导出静态文件 ====================

def export_static_files():
    """从数据库导出静态文件到 demo/ 目录"""
    with app.app_context():
        # 读取所有数据
        profile = Profile.query.first()
        if not profile:
            return {'success': False, 'error': 'No profile data'}
        
        links = Link.query.order_by(Link.order).all()
        skills = Skill.query.order_by(Skill.order).all()
        projects = Project.query.order_by(Project.order).all()
        
        # 生成静态数据 JSON
        static_data = {
            'profile': {
                'name': profile.name,
                'title': profile.title,
                'bio': profile.bio.replace('<br>', '\n'),
                'avatar': profile.avatar,
                'location': profile.location,
                'email': profile.email
            },
            'links': [{
                'name': l.name,
                'url': l.url,
                'icon': l.icon
            } for l in links],
            'skills': [{
                'name': s.name,
                'level': s.level,
                'color': s.color
            } for s in skills],
            'projects': [{
                'name': p.name,
                'description': p.description,
                'url': p.url,
                'tech': p.tech.split(',') if p.tech else []
            } for p in projects]
        }
        
        # 确保 demo 目录存在
        demo_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'demo')
        os.makedirs(demo_dir, exist_ok=True)
        
        # 写入 data.json
        data_path = os.path.join(demo_dir, 'data.json')
        with open(data_path, 'w', encoding='utf-8') as f:
            json.dump(static_data, f, ensure_ascii=False, indent=2)
        
        # 计算数据哈希（用于检测变化）
        data_hash = hashlib.md5(json.dumps(static_data, sort_keys=True).encode()).hexdigest()
        hash_path = os.path.join(demo_dir, '.hash')
        with open(hash_path, 'w') as f:
            f.write(data_hash)
        
        # 更新导出时间戳
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        with open(os.path.join(demo_dir, '.last-export'), 'w') as f:
            f.write(timestamp)
        
        return {
            'success': True,
            'files': ['demo/data.json', 'demo/.hash', 'demo/.last-export'],
            'hash': data_hash,
            'timestamp': timestamp
        }

@app.route('/api/export', methods=['POST'])
def api_export():
    """导出静态文件 API"""
    result = export_static_files()
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 500

# ==================== 路由 ====================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('admin.index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        print(f'🔐 登录尝试：username={username}')
        
        user = AdminUser.query.filter_by(username=username).first()
        
        if user:
            print(f'🔐 用户存在，检查密码...')
            if user.check_password(password):
                print(f'✅ 登录成功：{username}')
                login_user(user)
                next_page = request.args.get('next')
                return redirect(next_page or url_for('admin.index'))
            else:
                print(f'❌ 密码错误')
                flash('用户名或密码错误', 'error')
        else:
            print(f'❌ 用户不存在')
            flash('用户名或密码错误', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('已退出登录', 'info')
    next_page = request.args.get('next')
    return redirect(next_page or url_for('login'))

@app.route('/api/profile')
def api_profile():
    profile = Profile.query.first()
    if not profile:
        profile = Profile(name='Nasply', title='技术爱好者', bio='欢迎使用个人主页系统')
        db.session.add(profile)
        db.session.commit()
    return jsonify({
        'name': profile.name,
        'title': profile.title,
        'bio': profile.bio,
        'avatar': profile.avatar,
        'location': profile.location,
        'email': profile.email
    })

@app.route('/api/links')
def api_links():
    links = Link.query.order_by(Link.order).all()
    return jsonify([{
        'name': l.name,
        'url': l.url,
        'icon': l.icon
    } for l in links])

@app.route('/api/skills')
def api_skills():
    skills = Skill.query.order_by(Skill.order).all()
    return jsonify([{
        'name': s.name,
        'level': s.level,
        'color': s.color
    } for s in skills])

@app.route('/api/projects')
def api_projects():
    projects = Project.query.order_by(Project.order).all()
    return jsonify([{
        'name': p.name,
        'description': p.description,
        'url': p.url,
        'tech': p.tech.split(',') if p.tech else []
    } for p in projects])

# ==================== 初始化 ====================

def init_db():
    with app.app_context():
        db.create_all()
        
        # 删除所有旧用户，重新创建
        AdminUser.query.delete()
        
        # 创建管理员账户
        admin = AdminUser(username='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        
        print('🔐 管理员账户已创建/重置:')
        print('   用户名：admin')
        print('   密码：admin123')
        print('   ⚠️  请登录后立即修改密码！')
        
        # 初始化个人资料
        if not Profile.query.first():
            profile = Profile(
                name='Nasply',
                title='技术爱好者 / NAS 玩家',
                bio='热爱折腾，享受自动化带来的便利<br>专注于构建高效、智能的个人技术栈',
                location='中国'
            )
            db.session.add(profile)
            
            links = [
                Link(name='GitHub', url='https://github.com/JabenZhou', icon='github', order=1),
                Link(name='Telegram', url='https://t.me/JabenZhou', icon='telegram', order=2),
                Link(name='Email', url='mailto:your@email.com', icon='envelope', order=3),
            ]
            db.session.add_all(links)
            
            skills = [
                Skill(name='Docker', level=85, color='#00ff88', order=1),
                Skill(name='NAS & 存储', level=90, color='#00d4ff', order=2),
                Skill(name='Python', level=75, color='#ff6b6b', order=3),
                Skill(name='Linux', level=80, color='#ffd93d', order=4),
            ]
            db.session.add_all(skills)
            
            db.session.commit()
        
        print('✅ Database initialized!')

if __name__ == '__main__':
    init_db()
    
    # 使用需要登录的 Admin 视图
    admin = Admin(
        app, 
        name='个人主页管理', 
        template_mode='bootstrap4',
        index_view=SecureAdminIndexView(
            name='Home',
            url='/admin/'
        )
    )
    admin.add_view(SecureModelView(Profile, db.session, name='个人信息'))
    admin.add_view(SecureModelView(Link, db.session, name='社交链接'))
    admin.add_view(SecureModelView(Skill, db.session, name='技能标签'))
    admin.add_view(SecureModelView(Project, db.session, name='项目展示'))
    
    app.run(host='0.0.0.0', port=5533, debug=False)
