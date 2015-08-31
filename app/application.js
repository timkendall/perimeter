import System from 'system';
/*
 * Perimeter
 *
 * This is where the app is bootstrapped.
 */
const application = new System();
/*
 * Subsystems
 */
import RESTClientSubsystem from 'perimeter/subsystems/REST-client';
application.registerSubsystem(RESTClientSubsystem, ''); // pass in optional alias, default identifer would be 'RESTClientSubsystem'
/*
 * Launch
 *
 * launch() will attempt to launch each subsystem on-by-one
 * and deliver a system status report to stdout.
 */
application.launch();
