exports.up = function(knex, Promise) {
  return knex.schema.createTable('tasks', table => {
    table.increments();
    table.string('name', 100).notNullable();
    table.text('description').notNullable();
    table.string('location').notNullable();
    table
      .integer('owner_id')
      .unsigned()
      .notNullable();
    table
      .foreign('owner_id')
      .references('id')
      .inTable('users');

    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tasks');
};
