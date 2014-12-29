/**
* Recording.js
*
* @description :: Represents a camera recording
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    /*
     * Path to the video file
     */
    file: {
      type: 'string',
      required: true
    },
    /*
     * Date and time when this recording starts
     */
    start: {
      type: 'datetime',
      required: true
    },
    /*
     * Date and time when this recording ends
     */
    end: {
      type: 'datetime',
      required: true
    },
    /*
     * Length of this recording in seconds
     */
    duration: {
      type: 'integer',
      required: true
    },
    /*
     * The resolution of the video
     */
    resolution: 'string',
    /*
     * The FPS of the video
     */
    fps: 'integer',
    /*
     * The camera where this recording came from
     */
    camera: {
      model: 'camera'
    }
  }
};

