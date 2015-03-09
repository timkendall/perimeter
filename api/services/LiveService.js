/**
 * LiveService.js
 *
 * @description :: Handle streaming live video to browser and devices
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var ws = require('ws'),
  ffmpeg = require('fluent-ffmpeg');

module.exports = {
  /*
   * Pass it a camera to startup a live stream
   */
  stream: function(camera) {
    /*
     * Start socket server to accept incoming video stream
     */
    var STREAM_SECRET = 'secret',
      STREAM_PORT = 8082,
      WEBSOCKET_PORT = 8084,
      STREAM_MAGIC_BYTES = 'jsmp'; // Must be 4 bytes
    var width = 960,
      height = 540;
    // Websocket Server
    var socketServer = new(require('ws').Server)({
      port: WEBSOCKET_PORT
    });
    socketServer.on('connection', function(socket) {
      // Send magic bytes and video size to the newly connected socket
      // struct { char magic[4]; unsigned short width, height;}
      var streamHeader = new Buffer(8);
      streamHeader.write(STREAM_MAGIC_BYTES);
      streamHeader.writeUInt16BE(width, 4);
      streamHeader.writeUInt16BE(height, 6);
      socket.send(streamHeader, {
        binary: true
      });
      console.log('New WebSocket Connection (' + socketServer.clients.length + ' total)');
      socket.on('close', function(code, message) {
        console.log('Disconnected WebSocket (' + socketServer.clients.length + ' total)');
      });
    });
    socketServer.broadcast = function(data, opts) {
      for (var i in this.clients) {
        if (this.clients[i].readyState == 1) {
          this.clients[i].send(data, opts);
        } else {
          console.log('Error: Client (' + i + ') not connected.');
        }
      }
    };
    // HTTP Server to accept incomming MPEG Stream
    var streamServer = require('http').createServer(function(request, response) {
      var params = request.url.substr(1).split('/');
      width = (params[1] || 320) | 0;
      height = (params[2] || 240) | 0;
      if (params[0] == STREAM_SECRET) {
        console.log('Stream Connected: ' + request.socket.remoteAddress + ':' + request.socket.remotePort + ' size: ' + width + 'x' + height);
        request.on('data', function(data) {
          socketServer.broadcast(data, {
            binary: true
          });
        });
      } else {
        console.log('Failed Stream Connection: ' + request.socket.remoteAddress + request.socket.remotePort + ' - wrong secret.');
        response.end();
      }
    }).listen(STREAM_PORT);
    console.log('Listening for MPEG Stream on http://127.0.0.1:' + STREAM_PORT + '/<secret>/<width>/<height>');
    console.log('Awaiting WebSocket connections on ws://127.0.0.1:' + WEBSOCKET_PORT + '/');

    /*
     * Start FFmpeg process to grab video
     */
    var stream = ffmpeg(camera.path)

      .addOption('-vf', 'scale=960:540')
      .addOption('-b', 0)
      .addOption('-f', 'mpeg1video')
      .addOption('-b', '800k')
      .addOption('-r', '30')
      .addOption('-threads', 4)
      .addOption('-preset', 'ultrafast')

      .on('progress', function(progress) {
        /*
         * Do something to figure out which hour we're on
         */
      }).on('end', function() {
        /*
         * Update camera model with 'inactive' status?
         */
      }).on('error', function() {
        /*
         * Update camera model with 'error' status?
         */
        console.log('FFmpeg couldn\'t connect to stream!')
      })
      // Output the hour's file
      .addOutput('http://localhost:8082/secret/960/540/')
      .run();
  }
}