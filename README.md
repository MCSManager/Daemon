<img src="https://public-link.oss-cn-shenzhen.aliyuncs.com/mcsm_picture/logo.png" alt="MCSManager icon.png" width="500px" />


[![Status](https://img.shields.io/badge/npm-v6.14.15-blue.svg)](https://www.npmjs.com/)
[![Status](https://img.shields.io/badge/node-v14.17.6-blue.svg)](https://nodejs.org/en/download/)
[![Status](https://img.shields.io/badge/License-Apache%202.0-red.svg)](https://github.com/MCSManager)

[Official Website](http://mcsmanager.com/) | [Team Homepage](https://github.com/MCSManager) | [Panel Project](https://github.com/MCSManager/MCSManager) | [UI Project](https://github.com/MCSManager/UI) | [Daemon project](https://github.com/MCSManager/Daemon)

Please go to the main project repository: [https://github.com/MCSManager/MCSManager](https://github.com/MCSManager/MCSManager)

<br />

## Manual installation

Prerequisite: [Web-side program](https://github.com/MCSManager/MCSManager-Web-Production) needs to be installed to use this software normally.

Install `Node 14+` and `npm` tools and clone the [Daemon code for deployment](https://gitee.com/mcsmanager/MCSManager-Daemon-Production), then use the following commands to initialize and start the Daemon side.

```bash
# Download the Daemon program
git clone https://github.com/MCSManager/MCSManager-Daemon-Production.git
# rename the folder and enter
mv MCSManager-Daemon-Production daemon
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


## License

Copyright 2023 [MCSManager Dev](https://github.com/mcsmanager), Apache-2.0 license.



