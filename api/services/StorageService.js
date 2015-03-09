/**
 * StorageService.js
 *
 * @description :: Handle local storage.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
 var disk = require('diskusage');

 module.exports = {
    /*
     * Taking into account current disk size and camera streams (24/7), estimate how
     * long we can store recordings for.
     *
     * Called every time a new camera is added or camera options are changed.
     */
    estimateExpirability: function (cameras) {

    },

    /*
     * Return info about current disk (free, total)
     */
    getStorageInfo: function () {
      disk.check('/', function (err, info) {
        console.log(info.free);
        console.log(info.total);
      });
    }
 }