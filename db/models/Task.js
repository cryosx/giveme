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
}

module.exports = bookshelf.model('Task', Task);
