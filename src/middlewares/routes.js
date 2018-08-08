'use strict';

const Router = require('koa-router');
const passport = require('../controllers/auth');
const User = require('../models/user');
const validator = require('../utils/validator');
const fp = require('../utils/functional');

const auth = Router();

const userFields = ['id', 'username', 'mail'];

// POST /signup
auth.post('/signup', async (ctx) => {
  try {
    let body = ctx.request.body;
    let foundUser = await User.findOne({ where: { mail: body.mail } });
    if (foundUser) {
      ctx.body = { success: false, user: null, info: { message: 'User already exists' } };
    } else {
      let user = await User.create({
        username: body.username,
        mail: body.mail,
        passwordHashcode: validator.hash(body.password)
      });
      let userFiltered = fp.filter(user.dataValues, userFields);
      ctx.body = { success: true, user: userFiltered };
    }
  } catch (err) {
    ctx.throw(400, { err: err });
  }
});

// POST /login
auth.post('/login', (ctx, next) => {
  if (ctx.isAuthenticated()) {
    ctx.body = { success: true, info: { message: 'Already logged in' } };
    return ctx;
  }
  return passport.authenticate('local', (err, user, info) => {
    /**
     *  Failure:
     *  {
     *    success: false,
     *    user: null,
     *    info: { message: err.message }
     *  }
     *  Success:
     *  {
     *    success: true,
     *    user: UserModel
     *  }
     */
    if (!user) {
      ctx.body = { success: false, info: info, user: null };
      return ctx;
    }
    let userFiltered = fp.filter(user.dataValues, userFields);
    ctx.body = { success: true, user: userFiltered };
    return ctx.login(user);
  })(ctx, next);
});

// GET /logout
auth.get('/logout', ctx => {
  ctx.body = { auth: ctx.isAuthenticated() };
  ctx.logout();
});

// POST /microsoft
auth.post('/microsoft', async (ctx) => {
  try {
    let body = ctx.request.body;
    let foundUser = await User.findOne({ where: { microsoftId: body.microsoft_id } });
    if (foundUser) {
      let userFiltered = fp.filter(foundUser.dataValues, userFields);
      ctx.body = { success: true, user: userFiltered, info: { message: 'Welcome back' } };
    } else {
      let user = await User.create({
        username: body.username,
        mail: body.mail,
        passwordHashcode: validator.hash(Math.random().toString(36).slice(-8)),
        microsoftId: body.microsoft_id
      });
      let userFiltered = fp.filter(user.dataValues, userFields);
      ctx.body = { success: true, user: userFiltered, info: { message: 'Welcome to join us' } };
    }
  } catch (err) {
    ctx.throw(400, { err: err });
  }
});

// @login_required
auth.use('/api/*', (ctx, next) => {
  if (ctx.isAuthenticated()) {
    next();
  } else {
    ctx.throw(401, 'Login Required');
  }
});

module.exports = auth;
