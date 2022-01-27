```
______  _______________________  ___
___   |/  /_  ____/_  ___/__   |/  /_____ _____________ _______ _____________
__  /|_/ /_  /    _____ \__  /|_/ /_  __  /_  __ \  __  /_  __  /  _ \_  ___/
_  /  / / / /___  ____/ /_  /  / / / /_/ /_  / / / /_/ /_  /_/ //  __/  /
/_/  /_/  \____/  /____/ /_/  /_/  \__,_/ /_/ /_/\__,_/ _\__, / \___//_/
                                                        /____/
```

[![Status](https://img.shields.io/badge/npm-v8.1.0-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v14.17.6-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-GPL-red.svg)](https://github.com/Suwings/MCSManager)


适用于 MCSManager 未来版本的分布式守护进程程序，当前正在开发阶段。

[官方网站](http://mcsm.suwings.top/) | 当前正在开发中

<br />

## 相关项目

[MCSManager 前端项目](https://github.com/Suwings/MCSManager-UI)

[MCSManager 8.X 版本主项目](https://github.com/Suwings/MCSManager)

<br />

## MCSManager 简介

这是一款可以管理多个 Minecraft 服务端（支持群组端）的 Web 管理面板，并且可以分配多个子账号来分别管理不同的 Minecraft 服务端，支持绝大部分主流的服务端，甚至是其他非 Minecraft 的程序。

控制面板可运行在 Windows 与 Linux 平台，无需数据库与任何系统配置，只需安装 node 环境即可快速运行，属于轻量级的 Minecraft 服务端控制面板。

<br />

## 当前状态

项目处于开发阶段，如果想促进开发或关注进度您可以点击左上角的 `star` 给予我们基本的支持。

项目已发布第一个release，可以投入生产环境。

若您想成为本项目的赞助者，请访问官方网站浏览至最底下。

<br />

## 运行环境

推荐 `Node 10.16.0` 以上，无需数据库和更改任何系统配置，开箱即可运行。

<br />

## 预计功能

- 基于 Socket.io 的通信接口
- 应用实例管理
- 身份验证
- 面板与守护进程多对多关联
- 文件管理
- 高扩展性的路由设计

<br />

## 一键安装

暂无

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
