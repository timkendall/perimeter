/*
 * @class System
 *
 * @description Represents an entire system or 'app'.
 */
import Model from './model';
import Subsystem from './subsystem';

class System {
  constructor () {
    this._subsystems = [];
  }

  registerSubsystem (subsystemClass) {
    try {
      const subsystem = new subsystemClass();
      this._subsystems.push(subsystem);
    } catch (error) {
      console.log(error);
    }
  }

  launch () {
    this._subsystems.forEach((subsystem) => {
      subsystem
        .launch()
        .catch((reason) => {
          if (subsystem.isCritical) {
            throw new Error(`Critical subsystem ${subsystem.name} failed to launch.`);
          }
        });
    });
  }
}

export default { System, Subsystem, Model };