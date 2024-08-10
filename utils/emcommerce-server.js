const { Server } = require('socket.io');
const express = require('express');
const http = require('http');
/**
 * `module.exports` (alias: `server`) should be inside this class, in order to avoid circular dependency issue.
 * @type {EcommerceServer}
 */

class EcommerceServer {
  /**
   * Current server instance
   * @type {EcommerceServer}
   */
  static instance = null;
  app = undefined;
  httpServer = undefined;
  io = undefined;

  static getInstance() {
    if (EcommerceServer.instance == null) {
      EcommerceServer.instance = new EcommerceServer();
    }
    return EcommerceServer.instance;
  }

  constructor() {
    this.app = express();
    this.httpServer = http.createServer(this.app);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: '*',
      },
    });
  }
}

module.exports = {
  EcommerceServer,
};
