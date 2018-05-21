const moment = require('moment');
exports.up = function(knex, Promise) {
  // const createUserTasks = `
  // CREATE TABLE user_tasks (
  //   user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE CHECK (user_id > 0),
  //   task_id int NOT NULL REFERENCES tasks(id) ON DELETE CASCADE CHECK (task_id > 0),
  //   task_owner_id int NOT NULL REFERENCES users(id) CHECK (user_id <> task_owner_id),
  //   PRIMARY KEY (user_id, task_id)
  // );`;
  // return knex.schema.raw(createUserTasks);
  return knex.schema.createTable('user_tasks', table => {
    table
      .integer('user_id')
      .unsigned()
      .notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('users');
    table
      .integer('task_id')
      .unsigned()
      .notNullable();
    table
      .foreign('task_id')
      .references('id')
      .inTable('tasks');
    table.primary(['user_id', 'task_id']);
  });

  return;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user_tasks');
};
