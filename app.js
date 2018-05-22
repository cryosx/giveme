const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Redis = require('connect-redis')(session);
const bcrypt = require('bcrypt');

const User = require('./db/models/User.js');
const routes = require('./routes/routes.js');

const app = express();

const saltedRounds = 12;

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());
app.use(
  session({
    store: new Redis(),
    secret: 'giveme giveme giveme, ma cat',
    resave: false,
    saveUninitialized: true
  })
);
app.use(flash());

app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

// after login
passport.serializeUser((user, done) => {
  console.log('serializing');
  return done(null, {
    id: user.id,
    email: user.email
  });
});

// after every request
passport.deserializeUser((user, done) => {
  console.log('deserializing');
  new User({
    id: user.id
  })
    .fetch()
    .then(user => {
      if (user === null) {
        return done(null, false, {
          message: 'no user'
        });
      }
      user = user.toJSON();
      return done(null, {
        id: user.id,
        email: user.email
      });
    })
    .catch(err => {
      // console.log(err);
      return done(err);
    });
});

passport.use(
  new LocalStrategy({ usernameField: 'email' }, function(
    email,
    password,
    done
  ) {
    return new User({
      email
    })
      .fetch()
      .then(user => {
        if (user === null) {
          return done(null, false, {
            message: 'bad email or password'
          });
        }
        user = user.toJSON();
        bcrypt.compare(password, user.password).then(res => {
          if (res) {
            console.log('LOGGED IN');
            return done(null, user);
          } else {
            return done(null, false, {
              message: 'bad usernamr or password'
            });
          }
        });
      })
      .catch(err => {
        // console.log('error: ', err);
        return done(err);
      });
  })
);

app
  .route('/api/register')
  .get((req, res) => {
    return res.json({
      message: 'Not implemented'
    });
  })
  .post((req, res) => {
    const { email, username, password } = req.body;

    bcrypt.genSalt(saltedRounds, (err, salt) => {
      if (err) {
        // console.log(err);
        console.log('SALT ERR');
        return res.status(500).json({ err });
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.log('HASH ERR');
          return res.status(500).json({ err });
        }
        new User({
          email,
          username,
          password: hash
        })
          .save()
          .then(user => {
            console.log('USER CREATED');
            return req.login(user, err => {
              // if (err) return next(err);
              if (err) throw new Error(err);
              return res.json(user);
            });
          })
          .catch(err => {
            // console.log(err);
            console.log('Error');
            return res.status(500).json({
              message: 'Error'
            });
          });
      });
    });
  });

app
  .route('/api/login')
  .get((req, res) => {
    return res.json({
      message: 'Not implemented'
    });
  })
  .post(
    // passport.authenticate('local', {
    //   successRedirect: '/api',
    //   failureRedirect: '/api/login',
    //   failureFlash: 'Invalid username or password.',
    //   successFlash: 'Welcome!'
    // })
    passport.authenticate('local'),
    (req, res) => {
      const { id, email, username } = req.user;
      const user = { id, email, username };
      // console.log(user);
      return res.json(user);
    }
  );

app.route('/api/logout').get((req, res) => {
  req.logout();
  return res.json({ success: true });

  // return res.redirect('/api');
});

app.use('/api', routes);

app.route('*').get((req, res) => {
  console.log('\nCatchall\n');
  return res.redirect('/api');
});

module.exports = app;
