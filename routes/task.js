const express = require('express');
const moment = require('moment');

const knex = require('../db/knex.js');
const Task = require('../db/models/Task.js');
const UserTasks = require('../db/models/UserTasks.js');

const router = express.Router();

router.route('/').get((req, res) => {
  return Task.fetchAll({ withRelated: ['owner'] })
    .then(tasks => {
      return res.json(tasks);
    })
    .catch(err => {
      return res.json(err);
    });
});

router.route('/new').post(isAuthenticated, (req, res) => {
  const { title, description, lat, lng, reward } = req.body;
  const { id } = req.user;

  const location = { lat, lng };
  // const jsonLocation = JSON.stringify(location);

  return new Task({ title, description, location, reward, owner_id: id })
    .save()
    .then(task => {
      return res.json(task);
    })
    .catch(err => {
      return res.json(err);
    });
});

router.route('/clear').get((req, res) => {
  return Task.fetchAll().then(tasks => {
    tasks.forEach(task => {
      task.destroy();
    });
    return res.json(tasks);
  });
});

router.route('/:id/accept').get(isAuthenticated, (req, res) => {
  const user_id = req.user.id;
  const task_id = req.params.id;
  // return UserTasks.fetchAll().then(userTasks => {
  //   return res.json(userTasks);
  // });
  return new UserTasks({ user_id, task_id })
    .save()
    .then(userTask => {
      return res.json(userTask);
    })
    .catch(err => {
      console.log(err);
      return res.json(err);
    });
});
router.route('/:id').get((req, res) => {
  const { id } = req.params;

  return new Task({ id })
    .fetch({ withRelated: ['owner'] })
    .then(task => {
      return res.json(task);
    })
    .catch();
});

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/');
  return next();
}

module.exports = router;
