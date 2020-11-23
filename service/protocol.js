/*
 * @Projcet: MCSManager Daemon
 * @Author: Copyright(c) 2020 Suwings
 * @License: MIT
 * @Description: 定义网络协议与常用发送/广播/解析功能，客户端也应当拥有此文件
 */

// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");

const STATUS_OK = 200;
const STATUS_ERR = 500;

class Packet {
  /**
   * @param {string} status
   * @param {string} event
   * @param {object} data
   */
  constructor(status = 200, event = null, data = null) {
    this.status = status;
    this.event = event;
    this.data = data;
  }
}

/**
 * @return {Packet}
 */
module.exports.Packet = Packet;

/**
 * @param {Socket} socket
 * @param {string} event
 * @param {object} data
 * @return {void}
 */
module.exports.send = (socket, event, data) => {
  const packet = new Packet(STATUS_OK, event, data);
  socket.emit("protocol", packet);
};

/**
 * @param {Socket} socket
 * @param {string} event
 * @param {object} err
 */
module.exports.sendError = (socket, event, err) => {
  const packet = new Packet(STATUS_ERR, event, err);
  socket.emit("protocol", packet);
};

/**
 * @param {object} text
 */
module.exports.parse = (text) => {
  if (typeof text == "object") {
    return new Packet(text.status, text.event, text.data);
  }
  const obj = JSON.parse(text);
  return new Packet(obj.status, obj.event, obj.data);
};

/**
 * @param {object} obj
 */
module.exports.stringify = (obj) => {
  return JSON.stringify(obj);
};

// 全局 Socket 储存
const globalSocket = {};

/**
 * @param {Socket} socket
 */
module.exports.addGlobalSocket = (socket) => {
  globalSocket[socket.id] = socket;
};

/**
 * @param {Socket} socket
 */
module.exports.delGlobalSocket = (socket) => {
  return globalSocket[socket.id];
};

module.exports.socketObjects = () => {
  return globalSocket;
};

// 全局 Socket 广播
module.exports.broadcast = (event, obj) => {
  for (const id in globalSocket) {
    module.exports.send(globalSocket[id], event, obj);
  }
};
