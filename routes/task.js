const express = require('express');
const moment = require('moment');

const knex = require('../db/knex.js');
const Task = require('../db/models/Task.js');

const router = express.Router();

router.route('/new').get((req, res) => {
  return new Task({
    title: 'Clean my car',
    description: 'Need my new car cleaned by tomorrow',
    location: { lat: -34, lng: 151 },
    expires_at: moment()
      .utc()
      .add(1, 'day')
      .format(),
    owner_id: 1
  })
    .save()
    .then(task => {
      const { id } = task;
      Task.where({ id })
        .fetch()
        .then(task => {
          return res.json({
            task
          });
        });
    })
    .catch();
});

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/');
  return next();
}

module.exports = router;
