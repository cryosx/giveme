const express = require('express');
const user = require('./user.js');
const task = require('./task.js');

const User = require('../db/models/User.js');

const router = express.Router();

router.route('/').get((req, res) => {
  new User({ username: 'user', email: 'user@user.com', password: 'password' })
    .save()
    .then(user => {
      return res.json({ user });
    })
    .catch(err => {
      return res.json({ err });
    });
});

router.use('/user', user);
router.use('/task', task);

module.exports = router;
