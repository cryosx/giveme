const bookshelf = require('./bookshelf.js');

class User extends bookshelf.Model {
  get tableName() {
    return 'users';
  }
  get hasTimestamps() {
    return true;
  }

  activeTasks() {
    return this.belongsToMany('Task', 'user_tasks');
  }

  myTasks() {
    return this.hasMany('Task', 'owner_id');
  }
}

module.exports = bookshelf.model('User', User);
