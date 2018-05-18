const bookshelf = require('./bookshelf.js');

class Task extends bookshelf.Model {
  get tableName() {
    return 'tasks';
  }
  get hasTimestamps() {
    return true;
  }

  owner() {
    return this.belongsTo('User', 'owner_id');
  }

  participants() {
    return this.belongsToMany('User', 'user_tasks');
  }
}

module.exports = bookshelf.model('Task', Task);
