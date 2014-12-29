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

var Motion = function (src, threshold) {
    try {
      this.camera = new cv.VideoCapture(src);
      this.detected = [];
      this.threshold = threshold || 5;
      this.watching = false;
    } catch (e) {
      self.emit('error', e);
    }

    this.collapseRect = function (rect) {
      return rect[0] + rect[1] + rect[2] + rect[3];
    }
}
util.inherits(Motion, Stream);

Motion.prototype.start = function() {
    var self = this;

    try {
      /*
       * Open video stream
       */
      self.camera.read(function (err, image) {
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
           self.camera.read(function (err, m2) {
              var rec = track.track(m2)
              /*
               * Calculate changes in frames
               */
              if (prevRec) {
                var diff = self.collapseRect(rec) - self.collapseRect(prevRec)
                if (diff > self.threshold) {
                  var motion = { time: Date.now(), difference: diff };
                  self.detected.push(motion);
                  self.emit('motion', motion);
                }
              }
              prevRec = rec;
              iter();
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
  watch: function (src) {
    return new Motion(src);
  }
};