# frp 内网穿透搭建指南

*创建于 2026-04-18*

## 目的

从外网 SSH 回家里（或公司）的 Mac，用于远程操作 Claude Code 等工具。

## 架构

```
外部设备 (iPad/笔记本/手机)
    ↓ ssh -p 6000 <YOUR_USER>@<YOUR_SERVER_IP>
Azure VM (frps, 端口 7000)
    ↓ 转发
Mac (sshd, 端口 22)
```

## 服务端 — Azure VM (<YOUR_SERVER_IP>)

### 安装

```bash
cd /tmp
curl -sL https://github.com/fatedier/frp/releases/download/v0.61.1/frp_0.61.1_linux_amd64.tar.gz -o frp.tar.gz
tar xzf frp.tar.gz
sudo mkdir -p /opt/frp
sudo cp frp_0.61.1_linux_amd64/frps /opt/frp/
sudo chmod +x /opt/frp/frps
```

### 配置 `/opt/frp/frps.toml`

```toml
bindPort = 7000
auth.token = "<YOUR_AUTH_TOKEN>"
```

### systemd 服务 `/etc/systemd/system/frps.service`

```ini
[Unit]
Description=frps service
After=network.target

[Service]
Type=simple
ExecStart=/opt/frp/frps -c /opt/frp/frps.toml
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable frps
sudo systemctl start frps
```

### Azure NSG 端口

- **7000** — frps 通信端口
- **6000** — Mac 家里 SSH 映射
- **6001** — （预留）公司机器 SSH 映射

## 客户端 — Mac (Docker 方式)

### 配置文件 `/Users/<YOUR_USER>/dockerVolumn/frp/frpc.toml`

```toml
serverAddr = "<YOUR_SERVER_IP>"
serverPort = 7000
auth.token = "<YOUR_AUTH_TOKEN>"

[[proxies]]
name = "mac-home-ssh"
type = "tcp"
localIP = "host.docker.internal"
localPort = 22
remotePort = 6000
```

> ⚠️ Docker 容器里必须用 `host.docker.internal` 而不是 `127.0.0.1`，否则连的是容器自己。

### 启动

```bash
docker run -d \
  --name frpc \
  --restart=always \
  -v /Users/<YOUR_USER>/dockerVolumn/frp/frpc.toml:/etc/frp/frpc.toml \
  snowdreamtech/frpc:0.61.1
```

### 常用操作

```bash
docker logs frpc          # 查看日志
docker stop frpc          # 停止（关闭远程访问）
docker start frpc         # 恢复
docker restart frpc       # 改配置后重启
```

## 连接方式

```bash
ssh -p 6000 <YOUR_USER>@<YOUR_SERVER_IP>
```

iPad 可用 Termius 或 Blink Shell。

## 踩坑记录

1. **brew install frpc 损坏** — v0.68.1 的 bottle 二进制只有 92.9KB（正常应十几MB），实际是 Microsoft Defender 拦截导致文件被截断/删除，并非 brew 自身问题
2. **Microsoft Defender 拦截 frpc** — 手动下载的二进制同样被拦截，用 Docker 方案可以绕过（容器内的二进制不受宿主机 Defender 影响）
3. **Docker 里 127.0.0.1 不是宿主机** — 必须用 `host.docker.internal` 访问 Mac 的 SSH

## 待办

- [x] 改密钥认证，关闭密码登录（2026-04-18 完成，macOS 需在 `/etc/ssh/sshd_config.d/` 下新建配置文件才能生效）
- [ ] 公司机器配第二个 frpc（name="mac-work-ssh", remotePort=6001）
- [ ] Mac 确保"远程登录"保持开启（系统设置 → 通用 → 共享 → 远程登录）
