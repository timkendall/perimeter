import { EventEmitter } from 'events';
import RethinkDB from 'rethinkdb';
/*
 * @class Model
 *
 * @description A simple model class. Extends EventEmitter
 * to provide the ability to 'push' events regarding the Model.
 * Right now this class is tightly coupled to RethinkDB. The goal
 * is to perhaps release this as a seperate ORM module.
 */
class Model extends EventEmitter {
  constructor (modelName, data = {}) {
    super();
    // Name of table in DB
    this._modelName = modelName;
    // Actual data that is persisted
    this._data = data;
    // Start listening for changes
    RethinkDB.table(this._modelName)
      .changes()
      .run(connection, (err, cursor) => {
        if (err) throw err;
        cursor.each((err, row) => {
          if (err) throw err;
          /*
           * TODO
           *
           * Emit correct events based on changes.
           */
          //console.log(JSON.stringify(row, null, 2));
          this.emit('created', row);
        });
    });
  }
  /*
   * Statics
   */
  static find (id) {

  }

  static findAll () {

  }
  /*
   * Methods
   */
  save () {
    RethinkDB.table(this._modelName)
      .insert(this._data)
      .run(connection, function (err, result) {
        if (err) throw err;
        console.log(JSON.stringify(result, null, 2));
    });
  }
  /*
   * (Pending) Lifecycle Hooks
   */
}

export default Model;