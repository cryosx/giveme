const faker = require('faker');
const COUNT = 25;
exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('tasks')
    .del()
    .then(function() {
      // Inserts seed entries
      const tasks = [];
      for (let i = 0; i < COUNT; i++) {
        const task = {};
        task['title'] = faker.lorem.sentences(1);

        task['location'] = {
          lat: Math.random() * (21.7289115312 - 21.2400147673) + 21.2400147673,
          lng:
            Math.random() * (-157.5656249474 + 158.3936656493) - 158.3936656493
        };
        task['description'] = faker.lorem.paragraph(4);
        task['reward'] = faker.finance.amount(0, 100);
        task['expires_at'] = faker.date.future(1);
        task['owner_id'] = 1;
        task['created_at'] = faker.date.past(2);
        task['updated_at'] = task['created_at'];
        tasks.push(task);
      }
      return knex('tasks').insert(tasks);
    });
};
