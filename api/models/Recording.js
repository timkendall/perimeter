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
     * Video metadata
     */
    meta: {
      type: 'json'
    },
     /*
     * Path to the thumbnail file
     */
    thumbnail: {
      type: 'string'
    },
    /*
     * Array of motions detected during this recording
     */
    motions: {
      collection: 'motion',
      via: 'recording'
    },
    /*
     * The camera where this recording came from
     */
    camera: {
      model: 'camera'
    }
  }
};

