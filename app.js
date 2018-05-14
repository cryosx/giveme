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
    return res.json({ message: 'Not implemented' });
  })
  .post((req, res) => {
    const { email, username, password } = req.body;

    bcrypt.genSalt(saltedRounds, (err, salt) => {
      if (err) console.log(err);

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) console.log(err);

        new User({ email, username, password: hash })
          .save()
          .then(user => {
            // console.log(user);
            return req.login(user, err => {
              if (err) return next(err);
              return res.json({ user });
            });
          })
          .catch(err => {
            // console.log(err);
            return res.json({ message: 'Error' });
          });
      });
    });
  });

app
  .route('/login')
  .get((req, res) => {
    return res.json({ message: 'Not implemented' });
  })
  .post(
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: 'Invalid username or password.',
      successFlash: 'Welcome!'
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
