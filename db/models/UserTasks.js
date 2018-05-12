const bookshelf = require('./bookshelf.js');

class UserTasks extends bookshelf.Model {
  get tableName() {
    return 'user_tasks';
  }
  get hasTimestamps() {
    return true;
  }

  user() {
    return this.belongsTo('User', 'user_id');
  }
  task() {
    return this.belongsTo('Task', 'task_id');
  }
}

module.exports = bookshelf.model('UserTasks', UserTasks);
