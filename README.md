<img src="https://public-link.oss-cn-shenzhen.aliyuncs.com/mcsm_picture/logo.png" alt="MCSManager 图标.png" width="500px" />

<br />

[![Status](https://img.shields.io/badge/npm-v6.14.15-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v14.17.6-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-AGPL-red.svg)](https://github.com/Suwings/MCSManager)

[官方网站](http://mcsmanager.com/) | [使用文档](https://docs.mcsmanager.com/) | [团队主页](https://github.com/MCSManager) | [面板端项目](https://github.com/MCSManager/MCSManager) | [网页前端项目](https://github.com/MCSManager/UI) | [守护进程项目](https://github.com/MCSManager/Daemon)

适用于 MCSManager 的分布式守护进程程序，与面板端分离直接管理和控制真实程序。

项目主仓库请前往：[https://github.com/MCSManager/MCSManager](https://github.com/MCSManager/MCSManager)

<br />

## MCSManager 简介

**分布式，稳定可靠，开箱即用，高扩展性，支持 Minecraft 和其他少数游戏的控制面板。**

MCSManager 面板（简称：MCSM 面板）是一款全中文，轻量级，开箱即用，多实例和支持 Docker 的 Minecraft 服务端管理面板。

此软件在 Minecraft 和其他游戏社区内中已有一定的流行程度，它可以帮助你集中管理多个物理服务器，动态在任何主机上创建游戏服务端，并且提供安全可靠的多用户权限系统，可以很轻松的帮助你管理多个服务器。

<br />

## 项目状态

项目处于发行状态，如果想促进开发或关注进度您可以点击右上角的 `star` `watch` 给予我们基本的支持。

若您想成为本项目的赞助者，请访问官方网站浏览至最底下。

<br />

## 手动安装

先决条件：需要安装[Web 端程序](https://github.com/MCSManager/MCSManager-Web-Production)才能正常使用本软件。

安装 `Node 14+` 与 `npm` 工具，并克隆[部署用 Daemon 代码](https://gitee.com/mcsmanager/MCSManager-Daemon-Production)，然后使用以下命令初始化并启动 Daemon 端。

> 名词 Daemon 中文代表“守护进程”之意，在此处代表本地或远程主机的守护进程，用于真实运行服务端程序的进程，Web 端面板用于管理与调控，不与服务端程序实际文件进行任何接触。

```bash
# cd MCSManager-Daemon-Production
npm install
node app.js
```

程序会输出以下内容

```log
 访问地址 localhost:24444
 访问密钥 [你的密钥，是一串16进制数字]
 密钥作为守护进程唯一认证手段
```

使用密钥在 web 端添加实例即可。
如需停止直接输入:

```bash
exit
```

如需长期后台运行请使用 `Screen` 软件配合使用，或者手动写入到系统服务。

<br />

## Docker 部署

拉取代码并构建镜像

```console
$ git clone https://github.com/MCSManager/Daemon
$ cd Daemon
$ docker build -t mcs-daemon .
```

运行

```console
$ docker run -d \
    --name mcs-daemon \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v $(pwd)/data:/app/data \
    -p 24444:24444 \
    mcs-daemon
```

> 必须将 `/var/run/docker.sock` 映射至容器内才能正常使用 docker 实例

<br />

## 贡献

如果你在使用过程中发现任何问题，可以提交 Issue 或自行 Fork 修改后提交 Pull Request。

代码需要保持现有格式，不得格式化多余代码，具体可[参考这里](https://github.com/MCSManager/MCSManager/issues/544)。

<br />

## 版权约束

此开源项目使用 [AGPL 协议](LICENSE) 作为开源协议，未经过官方闭源开发授权，您如果对代码有任何修改，则必须要公开您修改后的源代码，具体约束如下。

**准许**

- 对软件源代码进行修改，复制，分发。
- 利用软件进行商业使用，赚取利润。

**必须**

- 公开提供您修改后的完整源代码。
- 在代码文件、界面中保留版权声明。

**禁止**

- 禁止售卖此软件，申请专利，著作权等。

> 更多授权与版权约束详情，请前往官方网站界面了解更多。

<br />
