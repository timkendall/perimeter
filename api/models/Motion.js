/**
* Motion.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    /*
     * When the motion was detected
     */
    time: 'datetime',
    /*
     * The numerical value of difference calculated in the frame
     */
    difference: 'integer',
    /*
     * The camera where this recording came from
     */
    camera: {
      model: 'camera'
    },
    /*
     * The record where this motion was detected
     */
    recording: {
      model: 'recording'
    }
  }
};

