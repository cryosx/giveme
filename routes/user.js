const express = require('express');

const knex = require('../db/knex.js');
const User = require('../db/models/User.js');
const UserTasks = require('../db/models/UserTasks.js');
const Task = require('../db/models/Task.js');

const router = express.Router();

router.route('/').get(isAuthenticated, (req, res) => {
  const { id } = req.user;
  return res.redirect(`/user/${id}`);
});

// router.route('/:id/tasks').get(isAuthorized, (req, res) => {
//   const { id } = req.user;

// });

router.route('/:id/task/:task_id/leave').get(isAuthorized, (req, res) => {
  console.log('\n\nLEAVE\n\n');
  const user_id = req.user.id;
  const task_id = req.params.task_id;

  return new Task({ id: task_id })
    .participants()
    .dettach(user_id)
    .then(data => {
      return res.json({ success: true });
    })
    .catch(err => {
      const { code } = err;
      if (code === '23505') console.log(err);
      return res.status(400).json(err);
    });
});

router.route('/:id').get(isAuthorized, (req, res) => {
  const { id } = req.user;

  return new User({ id })
    .fetch({ withRelated: ['myTasks', 'activeTasks'] })
    .then(user => {
      return res.json(user);
    })
    .catch(err => {
      return res.json(err);
    });

  // let user = new User({ id }).fetch({ withRelated: ['tasks'] }).then(user => {
  //   return user;
  // });

  // let participatingIn = new UserTasks({ user_id })
  //   .fetch({
  //     withRelated: ['task']
  //   })
  //   .then(userTasks => {
  //     return userTasks;
  //   });

  // Promise.all([user, participatingIn])
  //   .then(tasks => {
  //     return res.json(tasks);
  //   })
  //   .catch(err => {
  //     return res.json(err);
  //   });
});

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authenticated: false });
  }
  return next();
}

function isAuthorized(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ authorized: false });
  }

  const { id } = req.params;
  const user_id = req.user.id;

  if (id != user_id) {
    return res.status(401).json({ authorized: false });
  }
  return next();
}

module.exports = router;
