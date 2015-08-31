import { EventEmitter } from 'events';
import _ from 'lodash';
/*
 * @class Subsystem
 *
 * @description A simple base class representing a subsystem.
 * Extends EventEmitter to communicate with other
 * subsystems. Includes lifecycle hooks to assist
 * with application bootstraping and monitoring.
 */
class Subsystem extends EventEmitter {
  constructor (name, isCritical) {
    super();
    this.name = name;
    /*
     * Set if the subsystem is critical. When launching
     * the parent system, if isCritical is 'false', the system
     * can continue to launch with just a warning.
     */
    this.isCritical = isCritical;
    this.logs = [];
    /*
     * Lifecycle Hooks
     */
    this.willLaunch = _.noop();
    this.didLaunch = _.noop();
    this.didFail = _.noop();
  }

  log (message, data) {
    this.logs.push({ message, data });
  }
}

export default Subsystem;