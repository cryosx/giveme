const bookshelf = require('./bookshelf.js');

class User extends bookshelf.Model {
  get tableName() {
    return 'users';
  }
  get hasTimestamps() {
    return true;
  }

  tasks() {
    return this.hasMany('Task', 'owner_id');
  }
}

module.exports = bookshelf.model('User', User);
