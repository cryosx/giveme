const moment = require('moment');
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tasks', table => {
    table.increments();
    table.string('title', 100).notNullable();
    table.text('description').notNullable();
    table.json('location').notNullable();
    table
      .specificType('reward', 'money')
      .notNullable()
      .defaultTo('0');
    table
      .integer('owner_id')
      .unsigned()
      .notNullable();
    table
      .foreign('owner_id')
      .references('id')
      .inTable('users');
    table.timestamp('expires_at').defaultTo(
      moment()
        .utc()
        .add(1, 'day')
        .format()
    );
    table.timestamp('completed_at');
    table.timestamps(true, true);
  });

  return;
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('tasks');
};
