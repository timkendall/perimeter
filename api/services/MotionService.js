/**
 * MotionService.js
 *
 * @description :: Control camera motion analysis.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var cv = require('opencv'),
  fs = require('fs'),
  path = require('path'),
  _ = require('lodash'),
  Q = require('q'),
  Stream = require('stream').Stream,
  util = require('util');

var MotionWatcher = function (camera, threshold) {
  var self = this;
    try {
      this.camera = camera;
      this.stream = new cv.VideoCapture(0); // Need to translate paths
      this.threshold = threshold || 5;
      this.watching = false;
    } catch (e) {
      self.emit('error', e);
    }

    this.collapseRect = function (rect) {
      return rect[0] + rect[1] + rect[2] + rect[3];
    }
}
util.inherits(MotionWatcher, Stream);

MotionWatcher.prototype.start = function() {
    var self = this;

    self.watching = true;
    try {

      /*
       * Open video stream
       */
      self.stream.read(function (err, image) {
        if (err) throw err;

        /*
         *  Start tracking motion (kinda hacky atm)
         */
        var track = new cv.TrackedObject(image, [200, 0, 1280, 720], {
          channel: 'value'
        });
        /*
         * Continously track motion
         */
         var prevRec = null;
         var iter = function () {
           self.stream.read(function (err, m2) {
              var rec = track.track(m2)
              /*
               * Calculate changes in frames
               */
              if (prevRec) {
                var diff = self.collapseRect(rec) - self.collapseRect(prevRec)
                if (diff > self.threshold) {
                  /*
                   * Create motion record
                   */
                   Motion.create({
                    time: new Date(),
                    difference: diff,
                    camera: self.camera.id
                   }).exec(function (err, record) {

                   });

                }
              }
              prevRec = rec;
              if (self.watching) iter();
            });
          }

          // Start
          iter();
          self.watching = true;
          self.emit('start', null)
        });
  } catch (e) {
    /*
     *
     */
    self.emit('error', e);
  }
}


module.exports = {
  watch: function (camera) {
    var motionWatcher = new MotionWatcher(camera);
    motionWatcher.start();
    return motionWatcher;
  },

  unwatch: function (motionWatcher) {
    motionWatcher.watching = false;
    motionWatcher.stream.close();
  }
};