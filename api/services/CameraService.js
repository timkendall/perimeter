/**
 * CameraService.js
 *
 * @description :: Control camera recordings.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var ffmpeg = require('fluent-ffmpeg'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q');

var FPS = 30,
    SIZE = '?x720'; // 720p
var filename = Date.now();

module.exports = {
  /*
   * Hold references to our video streams
   */
  activeVideoStreams: [],
  /*
   * Create a video stream
   */
  createStream: function (src, callback) {
    var self = this;

    var deferred = Q.defer();
    /*
     * Record 15sec from camera stream (OSX)
     */
    var stream,
      confirmation = false;
    try {
      stream = ffmpeg(src)
      // Set input format (depends on OS)
      .inputFormat('avfoundation')
      // Set output format
      .format('mp4')
      // Set size
      .size(SIZE)
      // Set FPS
      .fps(FPS)
      // Set video codec
      .videoCodec('libx264')
      // Map everything from input to output (kinda dumb)
      .addOption('-map', 0)
      // Set segmentation
      .addOption('-f', 'segment')
      // Divide stream up into 1hr files
      .addOption('-segment_time', 3600).on('error', function(err) {
        console.log(err)
      })
      .on('progress', function (progress) {
        /*
         * Do something to figure out which hour we're on
         */
         if (!confirmation) {
          confirmation = true;
           // Save reference so we can manipulate the stream later
          var record = {
            camera: src,
            stream: stream
          }
          self.activeVideoStreams.push(record);

          // Wait until we are sure the stream is good before sending all good
          deferred.resolve(record);
         }

      })
      .on('end', function() {
        /*
         * Update camera model with 'inactive' status?
         */
      })
      .on('error', function() {
        /*
         * Update camera model with 'error' status?
         */
      })
      // Output the hour's file
      .addOutput('/Users/Me/Desktop/temp/' + Date.now() + '-%d.mp4')
      .run();
    } catch (e) {
      deferred.reject(e);
    }

    deferred.promise.nodeify(callback); //  callback is passed results of deferred.reject and deferred.resolve in respectively
    return deferred.promise;
  },
  /*
   * Pause a video stream
   */
  pauseStream: function (src, callback) {
    var deferred = Q.defer();

    // Find the stream
    var streamRecord = _.find(this.activeVideoStreams, function (record) {
      return record.camera == src;
    });

    if (!stream) deferred.reject('Stream for ' + src + ' not found');

    // Pause the stream
    streamRecord.stream.kill('SIGSTOP');
    deferred.resolve('Stream for ' + src + ' successfully paused');

    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Resume a video stream
   */
  resumeStream: function (src, callback) {
    var deferred = Q.defer();

    // Find the stream
    var streamRecord = _.find(this.activeVideoStreams, function (record) {
      return record.camera == src;
    });

    if (!stream) deferred.reject('Stream for ' + src + ' not found');

    // Pause the stream
    streamRecord.stream.kill('SIGCONT');
    deferred.resolve('Stream for ' + src + ' successfully paused');

    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Stop and permanently remove a video stream
   */
  destroyStream: function (src, callback) {
    var deferred = Q.defer();

    // Find the stream
    var streamRecord = _.find(this.activeVideoStreams, function (record) {
      return record.camera == src;
    });

    if (!stream) deferred.reject('Stream for ' + src + ' not found');

    // Kill the stream
    streamRecord.stream.kill();
    // Remove reference
    _.remove(this.activeVideoStreams, function (streamRecord) { return streamRecord.camera  == src; });
    deferred.resolve('Stream for ' + src + ' successfully stopped');

    deferred.promise.nodeify(callback);
    return deferred.promise;
  }
};