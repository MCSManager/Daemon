/*
 * @Author: Copyright(c) 2020 Suwings
 * @Date: 2020-11-23 17:45:02
 * @LastEditTime: 2021-03-28 16:10:11
 * @Description: 定义网络协议与常用发送/广播/解析功能，客户端也应当拥有此文件
 * @Projcet: MCSManager Daemon
 * @License: MIT
 */

// eslint-disable-next-line no-unused-vars
const { Socket } = require("socket.io");
const { logger } = require("./log");

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
module.exports.msg = (socket, event, data) => {
  const packet = new Packet(STATUS_OK, event, data);
  socket.emit(event, packet);
};

/**
 * @param {Socket} socket
 * @param {string} event
 * @param {object} err
 */
module.exports.error = (socket, event, err) => {
  const packet = new Packet(STATUS_ERR, event, err);
  logger.error(`会话 ${socket.id} 在 ${event} 中发送错误:\n`, err);
  socket.emit(event, packet);
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
  delete globalSocket[socket.id];
};

module.exports.socketObjects = () => {
  return globalSocket;
};

// 全局 Socket 广播
module.exports.broadcast = (event, obj) => {
  for (const id in globalSocket) {
    module.exports.msg(globalSocket[id], event, obj);
  }
};
