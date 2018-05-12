const express = require('express');

const knex = require('../db/knex.js');
const User = require('../db/models/User.js');

const router = express.Router();

function isAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/');
  return next();
}

module.exports = router;
