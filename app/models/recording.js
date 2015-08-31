import { Model } from '../system/index';

class Recording extends Model {
  constructor (data = {}) {
    super('recording', data);
  }
}

export default Recording;