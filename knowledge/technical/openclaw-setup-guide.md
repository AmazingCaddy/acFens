# OpenClaw 部署指南

本文档记录了在 Azure VM（Ubuntu）上部署 OpenClaw Gateway 的完整过程，包括 Node.js 安装、网关配置、HTTPS 访问、GitHub Copilot 模型接入、Discord 和飞书 Channel 对接。

---

## 目录

1. [环境信息](#1-环境信息)
2. [Node.js 安装](#2-nodejs-安装)
3. [OpenClaw 安装与基础配置](#3-openclaw-安装与基础配置)
4. [配置远程访问（LAN 绑定 + 端口）](#4-配置远程访问lan-绑定--端口)
5. [Azure NSG 防火墙放行](#5-azure-nsg-防火墙放行)
6. [配置 HTTPS 访问（Nginx + Let's Encrypt）](#6-配置-https-访问nginx--lets-encrypt)
7. [配置 GitHub Copilot 作为 LLM Provider](#7-配置-github-copilot-作为-llm-provider)
8. [配置 Discord Channel](#8-配置-discord-channel)
9. [配置飞书（Feishu）Channel](#9-配置飞书feishuchannel)
10. [常用运维命令](#10-常用运维命令)
11. [配置多 Agent（多机器人）](#11-配置多-agent多机器人)

---

## 1. 环境信息

| 项目 | 值 |
|:--|:--|
| 云平台 | Azure VM |
| 操作系统 | Ubuntu (Linux) |
| Node.js | v22.22.2（通过 nvm 安装） |
| OpenClaw 版本 | 2026.3.28 |
| DNS 域名 | `<your-hostname>.cloudapp.azure.com` |
| Gateway 端口 | 18000 |

---

## 2. Node.js 安装

OpenClaw 需要 Node.js 22.16+ 或 Node 24。通过 nvm 安装：

```bash
# 安装 nvm
curl -so- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"

# 安装 Node.js 22
nvm install 22

# 验证
node --version   # v22.22.2
npm --version    # 10.9.7
```

---

## 3. OpenClaw 安装与基础配置

### 3.1 安装 OpenClaw

```bash
npm install -g openclaw@latest
openclaw --version
```

### 3.2 设置 gateway.mode

```bash
openclaw config set gateway.mode local
```

### 3.3 生成 auth token 并初始化

```bash
openclaw doctor --generate-gateway-token
```

doctor 会交互式引导完成：
- 创建 Session store 目录
- 安装 bash shell completion
- 安装 systemd gateway service（选 Node runtime）

### 3.4 配置文件位置

主配置文件：`~/.openclaw/openclaw.json`

---

## 4. 配置远程访问（LAN 绑定 + 端口）

### 4.1 设置 bind 和 port

```bash
openclaw config set gateway.port 18000
openclaw config set gateway.bind lan
```

### 4.2 同步更新 systemd service 文件

⚠️ **重要**：systemd service 文件中 `--port` 和 `OPENCLAW_GATEWAY_PORT` 的优先级高于配置文件，必须同步修改！

```bash
sed -i 's/--port 18789/--port 18000/g; s/OPENCLAW_GATEWAY_PORT=18789/OPENCLAW_GATEWAY_PORT=18000/g' \
  ~/.config/systemd/user/openclaw-gateway.service

systemctl --user daemon-reload
systemctl --user restart openclaw-gateway.service
```

### 4.3 验证

```bash
ss -tlnp | grep 18000
curl -s -o /dev/null -w "HTTP %{http_code}" http://127.0.0.1:18000
# 期望输出：HTTP 200
```

---

## 5. Azure NSG 防火墙放行

在 Azure 门户中，VM → Networking → NSG，添加 Inbound 规则：

| 规则名 | 端口 | 协议 | 操作 |
|:--|:--|:--|:--|
| HTTP | 80 | TCP | Allow |
| HTTPS | 443 | TCP | Allow |

> ⚠️ **不要暴露 18000 端口！** Gateway 端口由 Nginx 在本机内部转发（127.0.0.1:18000），无需对外开放。暴露 18000 会绕过 HTTPS 保护，形成安全隐患。
>
> 80 端口用于 Certbot 自动续期和 HTTP→HTTPS 重定向。

---

## 6. 配置 HTTPS 访问（Nginx + Let's Encrypt）

### 6.1 为什么需要 HTTPS

OpenClaw Control UI 需要浏览器的 Secure Context 才能使用设备身份功能。

### 6.2 给 Azure VM 分配 DNS 名称

Azure Portal → VM → Networking → 公网 IP → Configuration → 填写 DNS name label → Save。

验证：
```bash
dig +short <your-hostname>.cloudapp.azure.com
```

### 6.3 安装 Nginx 和 Certbot

```bash
sudo apt-get update -qq
sudo apt-get install -y -qq nginx certbot python3-certbot-nginx
```

### 6.4 配置 Nginx 反向代理

```bash
cat > /tmp/openclaw-nginx.conf << 'EOF'
server {
    listen 80;
    server_name <your-hostname>.cloudapp.azure.com;
    location / {
        proxy_pass http://127.0.0.1:18000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo cp /tmp/openclaw-nginx.conf /etc/nginx/sites-available/openclaw
sudo ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/openclaw
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6.5 申请 SSL 证书

```bash
sudo certbot --nginx \
  -d <your-hostname>.cloudapp.azure.com \
  --non-interactive \
  --agree-tos \
  --email <your-email> \
  --redirect
```

证书有效期 90 天，Certbot 自动续期。

### 6.6 更新 OpenClaw allowedOrigins

```bash
openclaw config set gateway.controlUi.allowedOrigins \
  '["http://localhost:18000","http://127.0.0.1:18000","https://<your-hostname>.cloudapp.azure.com"]'
openclaw gateway restart
```

### 6.7 验证

```bash
curl -s -o /dev/null -w "HTTP %{http_code}" https://<your-hostname>.cloudapp.azure.com
# 期望输出：HTTP 200
```

---

## 7. 配置 GitHub Copilot 作为 LLM Provider

### 7.1 登录 GitHub Copilot

```bash
openclaw models auth login-github-copilot
```

按提示在浏览器打开 https://github.com/login/device 输入设备码完成授权。

### 7.2 设置默认模型

⚠️ 模型 ID 必须使用 `github-copilot/` 前缀！

```bash
# ✅ 正确
openclaw models set github-copilot/claude-opus-4.6

# ❌ 错误（会报 "No API key found for provider anthropic"）
openclaw models set anthropic/claude-opus-4-6
```

### 7.3 常见可用模型

| 模型 ID | 说明 |
|:--|:--|
| `github-copilot/claude-opus-4.6` | Claude Opus 4.6 |
| `github-copilot/claude-sonnet-4.6` | Claude Sonnet 4.6 |
| `github-copilot/claude-sonnet-4.5` | Claude Sonnet 4.5 |
| `github-copilot/claude-haiku-4.5` | Claude Haiku 4.5 |

### 7.4 验证

```bash
openclaw models status
```

确认：
- Default 显示 `github-copilot/claude-opus-4.6`
- `github-copilot` 显示 `Premium 100% left`

---

## 8. 配置 Discord Channel

### 8.1 创建 Discord Bot

1. 打开 [Discord Developer Portal](https://discord.com/developers/applications)
2. New Application → 起名 → 创建
3. **Bot 页面**：
   - Reset Token 复制 token（只显示一次！）
   - Privileged Gateway Intents 下开启 **Message Content Intent**（必须，否则 Bot 在 guild channel 收不到消息内容）
4. **OAuth2 → URL Generator**：
   - Scopes 勾选 `bot` 和 `applications.commands`（后者用于 slash command 如 `/model`）
   - Bot Permissions 勾选：View Channels、Send Messages、Send Messages in Threads、Read Message History、Embed Links、Attach Files、Add Reactions
5. 复制生成的 URL，邀请 Bot 到你的私人服务器

> 如果没有私人服务器，先创建一个：Discord 左侧 ➕ → Create My Own → For me and my friends。

### 8.2 配置 OpenClaw

```bash
openclaw config set channels.discord.enabled true
openclaw config set channels.discord.token '<你的 Bot Token>'
openclaw config set channels.discord.dmPolicy pairing
openclaw config set channels.discord.groupPolicy open
openclaw gateway restart
```

### 8.3 Guild Channel 配置

⚠️ **重要**：Discord guild 消息默认需要 @bot 才会触发回复（`requireMention` 默认 `true`）。如果希望 channel 里不 @bot 也能回复，需要配置：

```json
{
  "channels": {
    "discord": {
      "guilds": {
        "*": {
          "requireMention": false,
          "users": ["<你的 Discord 用户 ID>"]
        }
      }
    }
  }
}
```

- `"*"` 表示对所有 guild 生效
- `users` 列表中的用户才有权限使用 `/model` 等 slash command
- 获取你的 Discord 用户 ID：Discord 设置 → 高级 → 开启开发者模式 → 右键点击自己头像 → Copy User ID

### 8.4 设备配对

首次私聊 Bot 会收到配对码：

```bash
openclaw pairing approve discord <配对码>
```

### 8.5 Slash Commands

在 channel 里可以用 slash command：

- `/model` — 切换当前 session 的模型
- `/models` — 查看可用模型列表

> ⚠️ 需要邀请时包含 `applications.commands` scope，且用户在 guild `users` 列表中。

> ⚠️ Discord 在中国大陆需要翻墙才能使用。

---

## 9. 配置飞书（Feishu）Channel

### 9.1 在飞书开放平台创建机器人

1. 登录 [飞书开放平台](https://open.feishu.cn/app)
2. 创建企业自建应用
3. 「凭证与基础信息」中获取 **App ID** 和 **App Secret**

### 9.2 配置应用权限

「权限管理」中添加：

| 权限 | 说明 | 必须 |
|:--|:--|:--|
| `im:message` | 消息读写 | ✅ |
| `im:message:send_as_bot` | 以机器人身份发消息 | ✅ |
| `im:message:send` | 发送消息 | ✅ |
| `im:message.group_at_msg:readonly` | 群 @消息 | ✅ |
| `im:message.p2p_msg:readonly` | 私聊消息 | ✅ |
| `im:resource` | 文件资源 | 推荐 |
| `contact:contact.base:readonly` | 通讯录基础信息 | ✅ |
| `contact:user.employee_id:readonly` | 员工 ID | 推荐 |

> ⚠️ 缺少 `im:message:send_as_bot` 会导致机器人能收消息但无法回复！

### 9.3 启用机器人 & 事件订阅

1. 「应用能力」→ 添加「机器人」
2. 「事件与回调」→ 选 **长连接 WebSocket** → 添加事件 `im.message.receive_v1`

> 长连接方式无需公网 Webhook，更简单安全。

### 9.4 发布应用

「版本管理与发布」→ 创建版本 → 提交发布

> ⚠️ 每次改权限后都要重新发布！

### 9.5 配置 OpenClaw

```bash
openclaw config set channels.feishu.enabled true
openclaw config set channels.feishu.appId '<你的 App ID>'
openclaw config set channels.feishu.appSecret '<你的 App Secret>'
openclaw config set channels.feishu.domain feishu       # 国际版用 lark
openclaw config set channels.feishu.groupPolicy open
openclaw gateway restart
```

验证连接：
```bash
openclaw logs 2>&1 | grep feishu
# 期望看到：WebSocket client started
```

### 9.6 用户配对

首次私聊机器人会收到配对码：

```bash
openclaw pairing approve feishu <配对码>
```

---

## 10. 常用运维命令

### Gateway 管理

```bash
openclaw gateway status          # 查看状态
openclaw gateway restart         # 重启
openclaw logs --follow           # 实时日志
openclaw doctor                  # 健康检查
```

### 模型管理

```bash
openclaw models status           # 当前模型状态
openclaw models list --all       # 列出所有可用模型
openclaw models set <model-id>   # 设置默认模型
```

### 设备 & 配对管理

```bash
openclaw devices list            # 列出所有设备
openclaw devices approve <id>    # 批准配对
openclaw pairing approve discord <code>   # Discord 配对
openclaw pairing approve feishu <code>    # 飞书配对
```

### Systemd 服务

```bash
systemctl --user status openclaw-gateway.service    # 服务状态
systemctl --user restart openclaw-gateway.service   # 重启服务
systemctl --user daemon-reload                      # 重载配置
journalctl --user -u openclaw-gateway.service -f    # 实时日志
```

### SSL 证书

```bash
sudo certbot certificates         # 查看证书状态
sudo certbot renew --dry-run      # 测试续期
sudo certbot renew                # 手动续期
```

---

### 踩坑记录

1. **systemd 端口不同步**：`openclaw.json` 改了端口但 systemd service 文件没改，导致端口不生效。两边必须同步修改。
2. **飞书 `groupAccess` 字段无效**：正确字段名是 `groupPolicy`，不是参考文档中的 `groupAccess`。
3. **GitHub Copilot 模型前缀错误**：必须用 `github-copilot/` 前缀，用 `anthropic/` 会报找不到 API key。
4. **不要在 NSG 暴露 Gateway 端口**：有 Nginx 反向代理后，18000 端口只需监听 127.0.0.1，对外只暴露 443（和 80 给 Certbot）。直接暴露 Gateway 端口是安全隐患。
5. **磁盘扩容后分区自动扩展**：Azure VM Ubuntu 24.04 扩容 OS 盘后，重启会自动扩展分区和文件系统（cloud-init growpart），无需手动 growpart/resize2fs。
6. **Discord guild channel 不回复（no-mention）**：`requireMention` 默认为 `true`，必须在 `guilds` 中显式设为 `false`。仅在 guild 级别设置即可，无需按 channel 单独配置。
7. **Discord 频繁重启导致连不上**：反复 `openclaw gateway restart` 会触发 Discord 的 identify 速率限制，导致 Bot 卡在 `awaiting gateway readiness`。遇到时停掉 gateway 等几分钟再启动。
8. **Discord channel session 损坏导致 Bot 只 typing 不回复**：如果 Bot 显示"正在输入"但没有回复（DM 正常），可能是该 channel 的 session 文件损坏。找到 session 文件重命名为 `.bak`，重启 gateway 即可：
   ```bash
   # 在 sessions.json 中找到对应 channel 的 sessionId
   grep "<channel-id>" ~/.openclaw/agents/main/sessions/sessions.json
   # 重命名损坏的 session 文件
   mv ~/.openclaw/agents/main/sessions/<sessionId>.jsonl ~/.openclaw/agents/main/sessions/<sessionId>.jsonl.bak
   openclaw gateway restart
   ```
9. **Discord slash command 报 "not authorized"**：需要在 guild 配置的 `users` 列表中加入你的 Discord 用户 ID，且邀请 Bot 时需包含 `applications.commands` scope。

---

*记录于 2026-04-04 | 更新于 2026-04-06 | 基于实际部署过程整理*

## 11. 配置多 Agent（多机器人）

OpenClaw 支持在一个 Gateway 上运行多个 Agent，各有独立的 workspace、人设和路由。

### 11.1 整体架构

```
┌─────────────────────────────────────────────┐
│             OpenClaw Gateway                 │
├──────────────────┬──────────────────────────┤
│ 🧓 main (OldWang) │ 💻 coder (Coder)         │
│ workspace:       │ workspace:               │
│ ~/.openclaw/     │ ~/.openclaw/             │
│   workspace/     │   workspace-coder/       │
│ 路由：            │ 路由：                    │
│ feishu:default   │ feishu:coder             │
│ discord:default  │ (待绑)                    │
│ 群里一直响应      │ 群里需@才响应             │
└──────────────────┴──────────────────────────┘
```

### 11.2 创建新 Agent

```bash
# 1. 创建 workspace 目录
mkdir -p ~/.openclaw/workspace-coder

# 2. 写入 IDENTITY.md 和 SOUL.md（人设文件）
# IDENTITY.md: Name, Emoji, Vibe
# SOUL.md: 核心原则、风格、语言偏好

# 3. 添加 agent
openclaw agents add coder --workspace ~/.openclaw/workspace-coder

# 4. 设置 identity（从 IDENTITY.md 读取）
openclaw agents set-identity --agent coder --from-identity --workspace ~/.openclaw/workspace-coder

# 5. 验证
openclaw agents list
```

### 11.3 配置飞书多 Account

在飞书开放平台新建第二个机器人应用，获取 App ID 和 App Secret。

```bash
# 添加新 account 凭据
openclaw config set channels.feishu.accounts.coder.appId "cli_xxx"
openclaw config set channels.feishu.accounts.coder.appSecret "xxx"
openclaw config set channels.feishu.accounts.coder.name "Coder"
```

⚠️ **关键陷阱**：添加 accounts 后，必须确保有 `"default": {}` 条目，否则原有机器人会断开！

```json5
// 正确配置
channels: {
  feishu: {
    appId: "cli_主bot的id",
    appSecret: "主bot的secret",
    accounts: {
      "default": {},   // ← 必须！继承顶层凭证
      "coder": {
        appId: "cli_新bot的id",
        appSecret: "新bot的secret",
        name: "Coder"
      }
    }
  }
}
```

### 11.4 配置路由绑定

```bash
# 把 coder account 的消息路由到 coder agent
openclaw agents bind --agent coder --bind feishu:coder

# 查看所有绑定
openclaw agents bindings
```

路由规则：
- 没有显式绑定的 channel/account → 路由到 `main`（默认 agent）
- 有绑定的 → 路由到指定 agent

### 11.5 配置群聊行为

不同 Agent 在群聊里可以有不同的触发方式：

```bash
# 主 Agent：群里一直响应（不需要@）
# 这是顶层 requireMention: false 控制的

# Coder Agent：群里需要@才响应
openclaw config set channels.feishu.accounts.coder.requireMention true
```

### 11.6 新飞书机器人的后台配置

新机器人在飞书开放平台需要：
1. 添加「机器人」能力
2. 开通权限（同第 9 节）
3. 事件订阅 → **长连接 WebSocket** → 添加 `im.message.receive_v1`
4. 发布上线

无需配置回调 URL（WebSocket 模式自动连接）。

### 11.7 重启生效

```bash
openclaw gateway restart
```

### 11.8 子 Agent 并发配置

多 Agent 使用子 agent（sessions_spawn）时的并发限制：

```bash
# 每个 agent session 最大活跃子 agent 数（默认 5，范围 1-20）
openclaw config set agents.defaults.subagents.maxChildrenPerAgent 10

# 全局最大并发子 agent 数（默认 8）
openclaw config set agents.defaults.subagents.maxConcurrent 16
```

---

### 多 Agent 踩坑记录

1. **accounts 陷阱**：添加 `accounts.coder` 后不加 `"default": {}`，会导致原有 bot 断开连接。OpenClaw 只启动 accounts 里显式列出的账号。
2. **重启断连**：`openclaw gateway restart` 会中断当前所有 session（包括自己正在聊的）。在聊天中执行需提前告知用户。
3. **群聊双响**：两个 bot 都在同一个群里时，默认都会响应。用 `requireMention` 控制哪个需要 @才响应。

---

*记录于 2026-04-19 | 基于实际配置过程整理*
