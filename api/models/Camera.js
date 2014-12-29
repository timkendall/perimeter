/**
* Camera.js
*
* @description :: Represents a camera (either hardware or IP)
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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
     * Wether the camera should be recording or not
     */
    recording: {
      type: 'boolean',
      defaultsTo: false
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
    nickname: {
      type: 'string',
      defaultsTo: 'My Baller Camera'
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

  // Lifecycle Callbacks
  afterCreate: function (record, cb) {
    /*
     * Attempt to start recording video
     */
     CameraService.createStream(record.path)
      .then(function (streamRecord) {
        console.log('Succesfully started video recording for ' + streamRecord.camera)
      })
      .catch(function (err) {
        console.log(err)
      })
      .done();
     // if (record.motionDetection) {
     //  var motion = MotionService.watch(record.path);

     //  motion.start();

     //  motion.on('start', function () {
     //    console.log('Started watching for motion.')
     //  });
     //  motion.on('motion', function (motion) {

     //  });
     // }
    cb();
  },

  afterUpdate: function (updatedRecord, cb) {
    /*
     * Handle things like changing recording status, motion detection, etc.
     */
    cb();
  },

  beforeDestroy: function (criteria, cb) {
    /*
     * Stop video capture before destroying record
     */
    cb();
  }
};

