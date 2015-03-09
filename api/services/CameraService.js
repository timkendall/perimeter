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
  Q = require('q'),
  watch = require('watch');
var FPS = 30,
  SIZE = '?x720'; // 720p
var filename = Date.now();
/*
 * Simple function to format date for file names
 */
function niceDate(date) {
  var dateStr = padStr(date.getFullYear()) + '-' + padStr(1 + date.getMonth()) + '-' + padStr(date.getDate()) + '-' + padStr(date.getHours()) + '-' + padStr(date.getMinutes()) + '-' + padStr(date.getSeconds());
  return dateStr;
}

function padStr(i) {
  return (i < 10) ? "0" + i : "" + i;
}
/*
 * Watch for saved video files
 */
function watchForSaves(folder, action) {
  watch.createMonitor(folder, function(monitor) {
    monitor.files[folder + '.zshrc'] // Stat object for my zshrc.
    monitor.on("created", function(f, stat) {
      action(f, stat);
    })
    monitor.on("changed", function(f, curr, prev) {
      // Handle file changes
      // console.log('Changed: ' + f)
    })
    monitor.on("removed", function(f, stat) {
      // Handle removed files
    })
    // monitor.stop(); // Stop watching
  });
}
module.exports = {
  /*
   * Hold references to our video streams
   */
  streams: [],
  /*
   * Create a video stream
   */
  createStream: function(camera, callback) {
    var self = this;
    var deferred = Q.defer();
    /*
     * Record 15sec from camera stream (OSX)
     */
    try {
      var stream = ffmpeg(camera.path)
      // Set input format (depends on OS)
      //.inputFormat('rtsp')
      // Set output format
      //.format('mp4')
      // Set size
      //.size(SIZE)
      // Set FPS
      //.fps(FPS)
      // Set video codec
      //.videoCodec('libx264')
      // Use ultrafast option (bigger files but much better CPU usage)
      //.addOption('-preset', 'ultrafast')

      // .noAudio()
      // .audioCodec('copy')

      .addOption('-c', 'copy')
      // Map everything from input to output (kinda dumb)
      .addOption('-map', 0)
      // Set segmentation
      .addOption('-f', 'segment')

      // Divide stream up into 1hr files
      .addOption('-segment_time', 3600)

      .addOption('-segment_format', 'mkv')

      // Divide up CPU load
      .addOption('-threads', 4)

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
      .addOutput('assets/video/' + camera.alias + '/clips/' + niceDate(new Date()) + '-%d.mkv')
      .run();
      /*
       * Create record when a segment is saved
       */
      var lastSave = null;
      watchForSaves('assets/video/' + camera.alias + '/clips/', function(file, stat) {
        try {
          if (lastSave) {
            /*
             * Grab metadata
             */
            ffmpeg.ffprobe(lastSave, function (err, metadata) {
              /*
               * Grab thumbnails?
               */

              /*
               * Save recording record in DB
               */
              Recording.create({
                file: lastSave,
                meta: metadata.streams[0] || null,
                camera: camera.id
              }).exec(function(err, recording) {
                if (err) throw new Error(err)
                else {
                  console.log('Recording saved')
                  Recording.publishCreate(recording)
                }
              });
            });
          }
          // Update last saved
          lastSave = file;
        } catch (e) {
          throw new Error(e);
        }
      });
      // Save reference so we can manipulate the stream later
      var record = {
        camera: camera,
        stream: stream,
        active: true
      }
      self.streams.push(record);
      // Wait until we are sure the stream is good before sending all good
      deferred.resolve(record);
    } catch (e) {
      console.log(e)
      deferred.reject(e);
    }
    deferred.promise.nodeify(callback); //  callback is passed results of deferred.reject and deferred.resolve in respectively
    return deferred.promise;
  },
  /*
   * Pause a video stream
   */
  pauseStream: function(src, callback) {
    var deferred = Q.defer();
    // Find the stream
    var streamRecord = _.find(this.streams, function(record) {
      return record.camera == src;
    });
    if (!streamRecord) {
      deferred.reject('Stream for ' + src + ' not found');
    } else {
      if (!streamRecord.active) deferred.reject('Stream for ' + src + ' already paused');
      else {
        // Pause the stream
        streamRecord.stream.kill('SIGSTOP');
        streamRecord.active = false;
        deferred.resolve('Stream for ' + src + ' successfully paused');
      }
    }
    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Resume a video stream
   */
  resumeStream: function(src, callback) {
    var deferred = Q.defer();
    // Find the stream
    var streamRecord = _.find(this.streams, function(record) {
      return record.camera == src;
    });
    if (!streamRecord) {
      deferred.reject(false);
    } else {
      /*
       * Only resume if not already active
       */
      if (streamRecord.active) deferred.reject(true);
      else {
        // Resume the stream
        streamRecord.active = true;
        streamRecord.stream.kill('SIGCONT');
        deferred.resolve(true);
      }
    }
    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Stop and permanently remove a video stream
   */
  destroyStream: function(src, callback) {
    var deferred = Q.defer();
    // Find the stream
    var streamRecord = _.find(this.streams, function(record) {
      return record.camera == src;
    });
    if (!streamRecord) deferred.reject('Stream for ' + src + ' not found');
    else {
      // Kill the stream
      streamRecord.stream.kill();
      // Remove reference
      _.remove(this.streams, function(streamRecord) {
        return streamRecord.camera == src;
      });
      deferred.resolve('Stream for ' + src + ' successfully stopped');
    }
    deferred.promise.nodeify(callback);
    return deferred.promise;
  }
};