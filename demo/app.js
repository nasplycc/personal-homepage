// ==================== 矩阵雨背景 - 中文代码版 ====================
function initMatrix() {
    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 中文字符 + 代码符号
    const chineseChars = '的了一是不在了人有我他这个要不人都在个上着地说来到和大为子也地用里出会所以可就过发以生和自年都时后那最里如天去长得小多没要为看开己手行方做里家十从两钱还女但并体无本口三经么好就月出能么么为在理物公动法内高起当工分老和学现力前所同马点此方定放几向道水见对二于下得已让电者事给化想代名心全分四前空几定放';
    const codeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz(){}[]<>=+-*/%_';
    const chars = chineseChars + codeChars;
    const charArray = chars.split('');
    
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * canvas.height / fontSize;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(2, 4, 10, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = fontSize + 'px JetBrains Mono';
        
        for (let i = 0; i < drops.length; i++) {
            const char = charArray[Math.floor(Math.random() * charArray.length)];
            
            const rand = Math.random();
            
            if (rand > 0.90) {
                // 最亮 - 白色 (10%)
                ctx.fillStyle = '#ffffff';
            } else if (rand > 0.65) {
                // 中等 - 绿色 (25%)
                ctx.fillStyle = '#00ff88';
            } else {
                // 基础 - 青色 (65%)
                ctx.fillStyle = '#00d4ff';
            }
            
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ==================== 时间戳 ====================
function updateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    document.getElementById('timestamp').textContent = timestamp;
}

// ==================== 导航切换 ====================
function switchSection(sectionId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
    
    const sections = ['home', 'about', 'projects', 'skills', 'connect'];
    sections.forEach(id => {
        const section = document.getElementById(`${id}-section`);
        if (section) section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.style.animation = 'none';
        targetSection.offsetHeight;
        targetSection.style.animation = 'fadeIn 0.5s ease-out';
    }
}

// ==================== 技能图标映射 ====================
function getSkillIconClass(skillName) {
    const name = skillName.toLowerCase();
    if (name.includes('docker')) return 'fab fa-docker docker';
    if (name.includes('nas') || name.includes('存储')) return 'fas fa-database nas';
    if (name.includes('linux')) return 'fab fa-linux linux';
    if (name.includes('python')) return 'fab fa-python python';
    if (name.includes('automation') || name.includes('自动化')) return 'fas fa-cog automation';
    return 'fas fa-code';
}

// ==================== 技能颜色映射 ====================
function getSkillColor(skillName) {
    const name = skillName.toLowerCase();
    if (name.includes('docker')) return '#00a8dc';
    if (name.includes('nas') || name.includes('存储')) return '#a855f7';
    if (name.includes('linux')) return '#ffd93d';
    if (name.includes('python')) return '#3b82f6';
    if (name.includes('automation') || name.includes('自动化')) return '#ec4899';
    return '#00d4ff';
}

// ==================== 项目图标映射 ====================
function getProjectIconClass(projectName) {
    const name = projectName.toLowerCase();
    if (name.includes('nas') || name.includes('存储')) return 'fas fa-server nas';
    if (name.includes('自动化') || name.includes('workflow')) return 'fas fa-robot automation';
    if (name.includes('ai') || name.includes('智能')) return 'fas fa-brain ai';
    return 'fas fa-folder';
}

// ==================== 加载个人资料 ====================
async function loadProfile() {
    try {
        let data;
        // 尝试从 API 加载，失败则从 data.json 加载
        try {
            const response = await fetch('/api/profile');
            data = await response.json();
        } catch {
            // 回退到 data.json（GitHub Pages 静态模式）
            const response = await fetch('data.json');
            const staticData = await response.json();
            data = staticData.profile;
        }
        
        const nameEl = document.getElementById('name');
        nameEl.textContent = data.name;
        nameEl.setAttribute('data-text', data.name);
        
        document.getElementById('title').textContent = data.title;
        document.getElementById('bio').innerHTML = data.bio.replace(/\n/g, '<br>');
        document.getElementById('about-bio').innerHTML = data.bio.replace(/\n/g, '<br>');
        
        if (data.location) {
            document.getElementById('location').textContent = data.location;
        }
        
        if (data.avatar) {
            document.getElementById('avatar').innerHTML = `<img src="${data.avatar}" alt="Avatar">`;
        }
        
        const userName = data.name.toLowerCase().replace(/ /g, '_');
        document.getElementById('terminal-user').textContent = userName;
        document.getElementById('terminal-desc').textContent = `— ${data.title}`;
        
    } catch (error) {
        console.error('Failed to load profile:', error);
    }
}

// ==================== 加载技能 ====================
async function loadSkills() {
    try {
        let skills;
        // 尝试从 API 加载，失败则从 data.json 加载
        try {
            const response = await fetch('/api/skills');
            skills = await response.json();
        } catch {
            // 回退到 data.json（GitHub Pages 静态模式）
            const response = await fetch('data.json');
            const staticData = await response.json();
            skills = staticData.skills;
        }
        
        const container = document.getElementById('skills');
        container.innerHTML = '';
        
        skills.forEach((skill, index) => {
            const iconClass = getSkillIconClass(skill.name);
            const color = skill.color || getSkillColor(skill.name);
            const iconParts = iconClass.split(' ');
            
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.innerHTML = `
                <div class="skill-top">
                    <div class="skill-icon-box ${iconParts[2] || ''}">
                        <i class="${iconParts[0]} ${iconParts[1]}"></i>
                    </div>
                    <div class="skill-info">
                        <div class="skill-name-row">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-percent">${skill.level}%</span>
                        </div>
                        <div class="skill-bar-bg">
                            <div class="skill-bar-fill" style="background: ${color};" data-width="${skill.level}"></div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(skillItem);
            
            setTimeout(() => {
                const bar = skillItem.querySelector('.skill-bar-fill');
                bar.style.width = skill.level + '%';
            }, 100 + index * 120);
        });
        
    } catch (error) {
        console.error('Failed to load skills:', error);
    }
}

// ==================== 加载项目 ====================
async function loadProjects() {
    try {
        let projects;
        // 尝试从 API 加载，失败则从 data.json 加载
        try {
            const response = await fetch('/api/projects');
            projects = await response.json();
        } catch {
            // 回退到 data.json（GitHub Pages 静态模式）
            const response = await fetch('data.json');
            const staticData = await response.json();
            projects = staticData.projects;
        }
        
        const container = document.getElementById('projects');
        container.innerHTML = '';
        
        if (projects.length === 0) {
            const defaultProjects = [
                { name: 'NAS 自托管', description: '搭建高可用 NAS 系统，数据存储与备份方案', icon: 'nas' },
                { name: '自动化工作流', description: '用脚本与自动化工具提升效率，解放双手', icon: 'automation' },
                { name: 'AI 工具探索', description: '探索 AI 应用与工具，让技术创造更多可能', icon: 'ai' }
            ];
            
            defaultProjects.forEach((project) => {
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                const iconMap = { nas: 'fa-server', automation: 'fa-robot', ai: 'fa-brain' };
                projectItem.innerHTML = `
                    <div class="project-icon-box ${project.icon}">
                        <i class="fas ${iconMap[project.icon]}"></i>
                    </div>
                    <div class="project-name">
                        ${project.name}
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="project-desc">${project.description}</div>
                `;
                container.appendChild(projectItem);
            });
        } else {
            projects.forEach((project) => {
                const iconClass = getProjectIconClass(project.name);
                const iconParts = iconClass.split(' ');
                
                const projectItem = document.createElement('div');
                projectItem.className = 'project-item';
                
                projectItem.innerHTML = `
                    <div class="project-icon-box ${iconParts[2] || ''}">
                        <i class="${iconParts[0]} ${iconParts[1]}"></i>
                    </div>
                    <div class="project-name">
                        ${project.name}
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div class="project-desc">${project.description || ''}</div>
                `;
                
                if (project.url) {
                    projectItem.onclick = () => window.open(project.url, '_blank');
                }
                
                container.appendChild(projectItem);
            });
        }
        
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

// ==================== 加载链接 ====================
async function loadLinks() {
    try {
        let links;
        // 尝试从 API 加载，失败则从 data.json 加载
        try {
            const response = await fetch('/api/links');
            links = await response.json();
        } catch {
            // 回退到 data.json（GitHub Pages 静态模式）
            const response = await fetch('data.json');
            const staticData = await response.json();
            links = staticData.links;
        }
        
        const container = document.getElementById('links');
        container.innerHTML = '';
        
        if (links.length === 0) {
            const defaultLinks = [
                { name: 'GitHub', icon: 'fab fa-github', url: 'https://github.com', class: 'github' },
                { name: 'Telegram', icon: 'fab fa-telegram', url: 'https://telegram.org', class: 'telegram' },
                { name: 'Email', icon: 'fas fa-envelope', url: 'mailto:hello@example.com', class: 'email' }
            ];
            
            defaultLinks.forEach(link => {
                const linkItem = document.createElement('a');
                linkItem.className = `link-item ${link.class}`;
                linkItem.href = link.url;
                linkItem.target = '_blank';
                linkItem.rel = 'noopener noreferrer';
                linkItem.innerHTML = `
                    <i class="${link.icon}"></i>
                    <span>${link.name}</span>
                `;
                container.appendChild(linkItem);
            });
        } else {
            links.forEach(link => {
                const linkItem = document.createElement('a');
                linkItem.className = `link-item ${link.icon.toLowerCase()}`;
                linkItem.href = link.url;
                linkItem.target = '_blank';
                linkItem.rel = 'noopener noreferrer';
                
                let iconClass = 'fas fa-link';
                if (link.icon === 'github') iconClass = 'fab fa-github';
                else if (link.icon === 'telegram') iconClass = 'fab fa-telegram';
                else if (link.icon === 'envelope' || link.icon === 'email') iconClass = 'fas fa-envelope';
                
                linkItem.innerHTML = `
                    <i class="${iconClass}"></i>
                    <span>${link.name}</span>
                `;
                container.appendChild(linkItem);
            });
        }
        
    } catch (error) {
        console.error('Failed to load links:', error);
    }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            switchSection(link.dataset.section);
        });
    });
    
    switchSection('home');
    
    loadProfile();
    loadSkills();
    loadProjects();
    loadLinks();
});
