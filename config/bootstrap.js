/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var exec = require('child_process').exec;

module.exports.bootstrap = function(cb) {
  /*
   * Catch anything
   */
  process.on('uncaughtException', function (err) {
    // handle the error safely
    console.log(err);
  });

  /*
   * Look for processes that may have failed to be killed if server errored out
   */
  // exec('top', function(err, stdout, stderr) {
  //   // stdout is a string containing the output of the command.
  //   // parse it and look for the apache and mysql processes.
  // });
  /*
   * Start up video streams
   */
  Camera.find().exec(function (err, cameras) {
    cameras.forEach(function (camera) {
      if (camera.record) {
        Camera.initialize({
          id: camera.id
        }).then(function() {
          console.log('Camera fully initalized.')
        }).
        catch (function(err) {
          console.log('Failed to fully initalize camera.')
        });

        LiveService.stream(camera);
      }
    });
  });
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};