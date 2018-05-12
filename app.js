const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Redis = require('connect-redis')(session);
const bcrypt = require('bcrypt');

const User = require('./db/models/User.js');
const routes = require('./routes/routes.js');

const app = express();

const saltedRounds = 12;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    store: new Redis(),
    secret: 'giveme giveme giveme, ma cat',
    resave: false,
    saveUninitialized: true
  })
);
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
  new User({ id: user.id })
    .fetch()
    .then(user => {
      if (user === null) {
        return done(null, false, { message: 'no user' });
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
    return new User({ email })
      .fetch()
      .then(user => {
        if (user === null) {
          return done(null, false, { message: 'bad email or password' });
        }
        user = user.toJSON();
        bcrypt.compare(password, user.password).then(res => {
          if (res) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'bad usernamr or password' });
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
  .route('/register')
  .get((req, res) => {
    return res.redirect('register.html');
  })
  .post((req, res) => {
    bcrypt.genSalt(saltedRounds, function(err, salt) {
      if (err) console.log(err);

      bcrypt.hash(req.body.password, salt, function(err, hash) {
        if (err) console.log(err);
        const { email, username } = req.body;

        new User({ email, username, password: hash })
          .save()
          .then(user => {
            // console.log(user);
            return res.redirect('/');
          })
          .catch(err => {
            // console.log(err);
            return res.send('Wrong username');
          });
      });
    });
  });

app
  .route('/login')
  .get((req, res) => {
    return res.redirect('/login.html');
  })
  .post(
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
    })
  );

app.route('/logout').get((req, res) => {
  req.logout();
  return res.redirect('/');
});

app.use('/', routes);

app.route('*').get((req, res) => {
  console.log('\nCatchall\n');
  return res.redirect('/');
});

module.exports = app;
