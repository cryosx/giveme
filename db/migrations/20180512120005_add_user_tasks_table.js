const moment = require('moment');
exports.up = function(knex, Promise) {
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
  });

  return;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user_tasks');
};
