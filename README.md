<img src="https://public-link.oss-cn-shenzhen.aliyuncs.com/mcsm_picture/logo.png" alt="MCSManager icon.png" width="500px" />

<br />

[![Status](https://img.shields.io/badge/npm-v6.14.15-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v14.17.6-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-AGPL-red.svg)](https://github.com/Suwings/MCSManager)

[Official Website](http://mcsmanager.com/) | [Usage Documentation](https://docs.mcsmanager.com/) | [Team Homepage](https://github.com/MCSManager) | [MCSManager Project](https://github.com/MCSManager/MCSManager)

A distributed daemon program for MCSManager, separate from the panel side to directly manage and control the real program.

Please go to the main project repository: [https://github.com/MCSManager/MCSManager](https://github.com/MCSManager/MCSManager)

<br />

## Introduction to MCSManager

**Distributed, stable and reliable, out-of-the-box, highly scalable, support control panel for Minecraft and few other games.**

The MCSManager panel (referred to as: MCSM panel) is an all-Chinese, lightweight, out-of-the-box, multi-instance and Docker-supported Minecraft server management panel.

This software has a certain popularity in Minecraft and other gaming communities, it can help you centrally manage multiple physical servers, dynamically create game servers on any host, and provide a secure and reliable multi-user permission system that can be easily Easily help you manage multiple servers.

<br />


## Manual installation

Prerequisite: [Web-side program](https://github.com/MCSManager/MCSManager-Web-Production) needs to be installed to use this software normally.

Install `Node 14+` and `npm` tools and clone the [Daemon code for deployment](https://gitee.com/mcsmanager/MCSManager-Daemon-Production), then use the following commands to initialize and start the Daemon side.

> The noun Daemon means "daemon process" in Chinese, here it represents the daemon process of the local or remote host, which is used to actually run the process of the server program. The web panel is used for management and control, not the actual file of the server program. make any contact.

```bash
# cd MCSManager-Daemon-Production
npm install
node app.js
````

The program will output the following

````log
 Access address localhost:24444
 access key [your key, a string of hexadecimal numbers]
 The key is the only means of authentication for the daemon
````

Just add an instance on the web side using the key.
To stop direct input:

```bash
Ctrl+C
````

If you need to run in the background for a long time, please use the `Screen` software in conjunction with it, or manually write to the system service.

<br />

## Contribute

If you find any problems during use, you can submit an Issue or submit a Pull Request after fork modification.

The code needs to keep the existing format, and no redundant code should be formatted. For details, please refer to [here](https://github.com/MCSManager/MCSManager/issues/544).

<br />


