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

router.route('/:id/mark-complete').get(isAuthenticated, (req, res) => {
  const user_id = req.user.id;
  const task_id = req.params.id;

  return new Task({ id: task_id })
    .participants()
    .then(participants => {
      // participants.
    })
    .catch();
});
router.route('/:id/confirm-complete').get(isAuthorized, (req, res) => {
  const user_id = req.user.id;
  const task_id = req.params.id;
});

router.route('/:id/accept').get(isAuthenticated, (req, res) => {
  const user_id = req.user.id;
  const task_id = req.params.id;

  return new Task({ id: task_id })
    .fetch()
    .then(task => {
      task = task.toJSON();
      if (task.owner_id === user_id)
        return res.status(400).json({ err: 'You cannot join your own task' });
      return new Task({ id: task_id })
        .participants()
        .attach(user_id)
        .then(data => {
          return res.json({ success: true });
        })
        .catch(err => {
          const { code } = err;
          console.log(err);
          return res.status(400).json(err);
        });
    })
    .catch(err => {
      const { code } = err;
      console.log(err);
      return res.status(400).json(err);
    });
});

router.route('/:id/leave').get(isAuthenticated, (req, res) => {
  const user_id = req.user.id;
  const task_id = req.params.id;

  return new Task({ id: task_id })
    .participants()
    .detach(user_id)
    .then(data => {
      return res.json({ success: true });
    })
    .catch(err => {
      const { code } = err;
      if (code === '23505') console.log(err);
      return res.status(400).json(err);
    });
});

router.route('/:id').get((req, res) => {
  const { id } = req.params;

  return new Task({ id })
    .fetch({ withRelated: ['owner', 'participants'] })
    .then(task => {
      return res.json(task);
    })
    .catch();
});

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/');
  return next();
}

function isAuthorized(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }

  const task_id = req.params.id;
  const user_id = req.user.id;

  let owner_id = null;

  new Task({ id: task_id })
    .fetch()
    .then(task => {
      if (task['owner_id'] !== user_id) {
        return res.status(401).json({ authorized: false });
      }
      return next();
    })
    .catch(err => {
      console.log(err);
      return res.status(401).json({ authorized: false });
    });
}

module.exports = router;
