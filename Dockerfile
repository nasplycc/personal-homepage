FROM python:3.11-slim

WORKDIR /app

# 配置 pip 国内源
RUN pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app/ ./app/

# 创建数据目录
RUN mkdir -p /app/data

WORKDIR /app/app

# 暴露端口
EXPOSE 5533

# 启动命令
CMD ["python", "main.py"]
