/**
 * Camera.js
 *
 * @description :: Represents a camera (either hardware or IP)
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var Q = require('q'),
  fs = require('fs'),
  mkdirp = require('mkdirp');

module.exports = {
  attributes: {
    /*
     * The path to the video stream. This could be a hardware path (/dev/video0)
     * on Linux, device name or index on OSX, or an IP address.
     */
    path: {
      type: 'string',
      unique: true,
      required: true
    },
    /*
     * Type of camera - IP, HDMI, Integrated
     */
    kind: {
      type: 'string',
      defaultsTo: 'IP',
      required: true
    },
    /*
     * Credentials for IP cameras
     */
    username: {
      type: 'string'
    },
    password: {
      type: 'string'
    },
    /*
     * Wether the camera should be recording or not
     */
    record: {
      type: 'boolean',
      defaultsTo: true
    },
    /*
     * The status of the camera (active, inactive, error, disconnected)
     */
    status: {
      type: 'string',
      defaultsTo: 'inactive'
    },
    /*
     * An alias for the device (ex. Front Yard)
     */
    alias: {
      type: 'string',
      required: true,
      unique: true
    },
    /*
     * Settings fields, these should probably be their own model
     */
    fps: 'integer',
    resolution: 'string',
    motionDetection: {
      type: 'boolean',
      defaultsTo: true
    },
    facialDetection: {
      type: 'boolean',
      defaultsTo: false
    },
    facialRecognition: {
      type: 'boolean',
      defaultsTo: false
    },
    /*
     * Array of recordings from this camera
     */
    recordings: {
      collection: 'recording',
      via: 'camera'
    }
  },
  /*
   * Handle initialization of lower level actions when a camera is created
   */
  initialize: function(options, callback) {
    var deferred = Q.defer();
    Camera.findOne(options.id).exec(function(err, camera) {
      if (err) deferred.reject(err);
      if (!camera) deferred.reject(new Error('Camera not found.'));

      Camera.startRecording(camera)
      .then(Camera.startAnalyzing)
      .then(function() {
        // If we got here everything worked!
        deferred.resolve();
      }).
      catch (function(err) {
        deferred.reject(err);
      }).done();
    });
    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Start recording this camera with VideoService
   */
  startRecording: function(camera, callback) {
    var deferred = Q.defer();
    CameraService.createStream(camera).then(function(streamRecord) {
      console.log('Succesfully started video recording for ' + streamRecord.camera.alias)
      /*
       * Set camera status to 'Recording'
       */
      Camera.update({id: camera.id}, {status: 'Recording'}).exec(function (err, record){});

      deferred.resolve(camera);
    }).
    catch (function(err) {
       /*
       * Set camera status to 'Error'
       */
      Camera.update({id: camera.id}, {status: 'Error'}).exec(function (err, record){});

      deferred.reject(err);
    }).done();
    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
  /*
   * Start analyzing this camera with MotionService
   */
  startAnalyzing: function(camera, callback) {
    var deferred = Q.defer();
    /*
     * Start video analysis
     */
    var motionWatcher;
    if (camera.motionDetection) {
      try {
        //motionWatcher = MotionService.watch(camera);
      } catch (e) {
        deferred.reject(e);
      }
    }
    deferred.resolve(camera, {
      motion: motionWatcher,
      faceDetector: null
    });
    if (camera.facialDetection) {}
    if (camera.facialRecognition) {}
    deferred.promise.nodeify(callback);
    return deferred.promise;
  },
    /*
   * Handle deinitialization of lower level actions when a camera is created
   */
  deinitialize: function(options, callback) {
    // var deferred = Q.defer();
    // Camera.findOne(options.id).exec(function(err, camera) {
    //   if (err) deferred.reject(err);
    //   if (!camera) deferred.reject(new Error('Camera not found.'));
    //   Camera.stopRecording(camera)
    //   .then(Camera.stopAnalyzing)
    //   .then(Camera.stopLogging)
    //   .then(function() {
    //     // If we got here everything worked!
    //     deferred.resolve();
    //   }).
    //   catch (function(err) {
    //     deferred.reject(err);
    //   }).done();
    // });
    // deferred.promise.nodeify(callback);
    // return deferred.promise;
  },
  /*
   * Start recording this camera with VideoService
   */
  stopRecording: function(camera, callback) {
    // var deferred = Q.defer();

    // CameraService.destroyStream(updatedCamera.path).then(function() {
    //     console.log('Succesfully stopped video recording');
    //     Camera.update({id: camera.id}, {status: 'Inactive'}).exec(function (err, record){});
    //      deferred.resolve(camera);
    //   }).
    //   catch (function(err) {
    //     // Cancel the update
    //     cb(new Error('Failed to deinitalize camera!'));
    //   })

    //  deferred.promise.nodeify(callback);
    // return deferred.promise;

    // }).
    // catch (function(err) {
    //    /*
    //    * Set camera status to 'Error'
    //    */
    //   Camera.update({id: camera.id}, {status: 'Error'}).exec(function (err, record){});

    //   deferred.reject(err);
    // }).done();
    // deferred.promise.nodeify(callback);
    // return deferred.promise;
  },
  // Lifecycle Callbacks
  afterCreate: function(camera, cb) {
    /*
     * Create directory for recordings and thumbnails
     */
    mkdirp('assets/video/' + camera.alias + '/clips', function (err) {
      if (err) console.error('Couldn\'t create directory' + err)
      else console.log('pow!')
    });

    mkdirp('assets/video/' + camera.alias + '/thumbnails', function (err) {
      if (err) console.error('Couldn\'t create directory' + err)
      else console.log('pow!')
    });

    /*
     * Attempt to initialize hardware
     */
    if (camera.record) {
      Camera.initialize({
        id: camera.id
      }).then(function() {
        console.log('Camera fully initalized.')
      }).
      catch (function(err) {
        console.log('Failed to fully initalize camera.')
      });
    }

    cb();
  },

  afterUpdate: function(updatedCamera, cb) {
    /*
     * Handle things like changing recording status, motion detection, etc.
     */
    /*
     * Start or stop recording
     */
    if (updatedCamera.record === false && updatedCamera.status === 'Recording') {
      /*
       * SHOULD BE Camera.deinitialize()
       */
      CameraService.destroyStream(updatedCamera.path).then(function() {
        console.log('Succesfully stopped video recording');
      }).
      catch (function(err) {
        // Cancel the update
        cb(new Error('Failed to deinitalize camera!'));
      })
    } else if (updatedCamera.record === true && updatedCamera.status === 'Inactive') {
      /*
       * Initalize camera
       */
      Camera.initialize({
        id: updatedCamera.id
      }).then(function() {
        console.log('Camera fully initalized.')
      }).
      catch (function(err) {
        // Cancel the update
        cb(new Error('Failed to initialize camera!'));
      });
    }

    cb();
  },
  beforeDestroy: function(criteria, cb) {
    /*
     * Stop video capture before destroying record
     */
    cb();
  }
};