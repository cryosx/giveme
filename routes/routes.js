const express = require('express');
const user = require('./user.js');
const task = require('./task.js');

const User = require('../db/models/User.js');

const router = express.Router();

router.route('/').get((req, res) => {
  return res.json({ message: 'Not implemented' });
});

router.use('/user', user);
router.use('/task', task);

module.exports = router;
