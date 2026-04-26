#!/bin/bash
# 自动同步脚本：从 NAS 数据库导出静态文件并推送到 GitHub
# 用法：bash scripts/sync-to-github.sh

set -e

REPO_DIR="/vol1/1000/github/personal-homepage"
DEMO_DIR="$REPO_DIR/demo"
HASH_FILE="$DEMO_DIR/.hash"
LOG_FILE="$REPO_DIR/sync.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 开始同步检查..."

# 1. 调用导出 API
log "📤 调用 /api/export 导出静态文件..."
RESPONSE=$(curl -s -X POST http://localhost:5533/api/export)

if echo "$RESPONSE" | grep -q '"success":true'; then
    log "✅ 静态文件导出成功"
else
    log "❌ 导出失败：$RESPONSE"
    exit 1
fi

# 2. 检查数据是否变化
if [ ! -f "$HASH_FILE" ]; then
    log "⚠️  未找到哈希文件，跳过同步"
    exit 0
fi

NEW_HASH=$(cat "$HASH_FILE")

# 检查上次同步的哈希
SYNC_HASH_FILE="$DEMO_DIR/.last-sync-hash"
if [ -f "$SYNC_HASH_FILE" ]; then
    OLD_HASH=$(cat "$SYNC_HASH_FILE")
    if [ "$NEW_HASH" = "$OLD_HASH" ]; then
        log "ℹ️  数据未变化，跳过推送"
        exit 0
    fi
fi

log "📊 检测到数据变化，准备推送..."

# 3. 提交并推送到 GitHub
cd "$REPO_DIR"

# 检查是否有变化需要提交
if git diff --quiet demo/; then
    log "ℹ️  Git 无变化，跳过提交"
    exit 0
fi

git add demo/
git commit -m "🔄 自动同步：$(date '+%Y-%m-%d %H:%M')"

# 推送前更新同步哈希
cp "$HASH_FILE" "$SYNC_HASH_FILE"

# 推送到 GitHub
if git push origin master 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ 推送到 GitHub 成功！"
    log "🌐 在线演示：https://nasplycc.github.io/personal-homepage/"
else
    log "❌ 推送失败，请检查网络或 GitHub 认证"
    exit 1
fi

log "🎉 同步完成！"
