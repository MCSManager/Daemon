<img src="https://public-link.oss-cn-shenzhen.aliyuncs.com/mcsm_picture/logo.png" alt="MCSManager 图标.png" width="500px" />

<br />

[![Status](https://img.shields.io/badge/npm-v6.14.15-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v14.17.6-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-GPL-red.svg)](https://github.com/Suwings/MCSManager)

[官方网站](http://mcsmanager.com/) | [使用文档](https://docs.mcsmanager.com/) | [团队主页](https://github.com/MCSManager) | [面板端项目](https://github.com/MCSManager/MCSManager) | [网页前端项目](https://github.com/MCSManager/UI) | [守护进程项目](https://github.com/MCSManager/Daemon)

适用于 MCSManager 未来版本的分布式守护进程程序，当前正在开发阶段。


<br />


## MCSManager 简介
  
**分布式，稳定可靠，开箱即用，高扩展性，支持 Minecraft 和其他少数游戏的控制面板。**

MCSManager 面板（简称：MCSM 面板）是一款全中文，轻量级，开箱即用，多实例和支持 Docker 的 Minecraft 服务端管理面板。

此软件在 Minecraft 和其他游戏社区内中已有一定的流行程度，它可以帮助你集中管理多个物理服务器，动态在任何主机上创建游戏服务端，并且提供安全可靠的多用户权限系统，可以很轻松的帮助你管理多个服务器。

<br />

## 当前状态

项目处于开发阶段，如果想促进开发或关注进度您可以点击左上角的 `star` 给予我们基本的支持。

项目已发布第一个release，可以投入生产环境。

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

使用密钥在web端添加实例即可。
如需停止直接输入:

```bash
exit
```

如需长期后台运行请使用 `Screen` 软件配合使用，或者手动写入到系统服务。

<br />

## 版权信息

使用 GNU General Public License v3.0 开源协议。

您可以对代码进行修改，复制和商业使用，但您必须将您修改后的源代码无条件的免费公开下载。另外，修改后的程序必须携带原有的版权声明与原作者信息声明。

<br />
