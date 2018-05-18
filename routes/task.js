const express = require('express');
const moment = require('moment');

const knex = require('../db/knex.js');
const Task = require('../db/models/Task.js');
const UserTasks = require('../db/models/UserTasks.js');

const router = express.Router();

router.route('/').get((req, res) => {
  return Task.fetchAll({ withRelated: ['owner'] })
    .then(tasks => {
      // res.set({
      //   'Access-Control-Allow-Headers': 'Content-Type',
      //   'Access-Control-Allow-Methods': 'GET, POST',
      //   'Access-Control-Allow-Origin': '*'
      // });
      console.log(tasks);
      return res.json(tasks);
    })
    .catch(err => {
      return res.json(err);
    });
});

router.route('/new').post(isAuthenticated, (req, res) => {
  const { title, description, location, reward, expires_at } = req.body;
  const { id } = req.user;

  // const location = { lat, lng };
  // const jsonLocation = JSON.stringify(location);

  return new Task({
    title,
    description,
    reward,
    location,
    expires_at,
    owner_id: id
  })
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
  return new Task({ id: task_id })
    .participants()
    .attach(user_id)
    .then(data => {
      return res.json({ success: true });
    })
    .catch(err => {
      const { code } = err;
      if (code === '23505') console.log(err);
      return res.status(400).json(err);
    });
  // return new UserTasks({ user_id, task_id })
  //   .save()
  //   .then(userTask => {
  //     return res.json(userTask);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     return res.json(err);
  //   });
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
