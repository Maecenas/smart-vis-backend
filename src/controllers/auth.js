'use strict';

const passport = require('koa-passport');
const validator = require('../utils/validator');
const { User } = require('../models');


// Serialize when doing ctx.login()
passport.serializeUser((user, done) => {
  try {
    if (user) {
      done(null, user);
    } else {
      done(null);
    }
  } catch (err) {
    done(err);
  }
});

// Deseralize when "auth":{"user":*} exists in the session in connection
passport.deserializeUser(async (user, done) => {
  try {
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
  usernameField: 'mail',
  passwordField: 'password'
}, async (mail, password, done) => {
  try {
    let user = await User.findOne({ where: { mail } });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!validator.validate(password, user.passwordHashcode)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(null, false, { message: err.message });
  }
}));

module.exports = passport;
