/* eslint-disable consistent-return,camelcase,no-undefined */
'use strict';

const Router = require('koa-router');
const passport = require('../controllers/auth');
const { User, Op } = require('../models');

const auth = new Router();

auth.post('signup', '/signup', async (ctx) => {
  try {
    let params = ctx.request.body;
    let foundUser = await User.findByMail(params.mail);
    if (foundUser) {
      ctx.body = { success: false, user: null, info: { msg: 'User already exists' } };
    } else {
      let user = await User.create(params);
      ctx.body = { success: true, user: user.getFiltered() };
    }
  } catch (err) {
    ctx.throw(400, err);
  }
})
  .post('login', '/login', (ctx, next) => {
    if (ctx.isAuthenticated()) {
      ctx.body = {
        success: true,
        user: ctx.state.user,
        info: { msg: 'Already logged in' }
      };
      return ctx;
    }
    return passport.authenticate('local', async (err, user, info) => {
      if (!user) {
        ctx.body = { success: false, info: info, user: null };
        return ctx;
      }
      ctx.body = { success: true, user: user.getFiltered() };
      return await ctx.login(user);
    })(ctx, next);
  })
  .get('logout', '/logout', ctx => {
    ctx.body = { auth: ctx.isAuthenticated(), user: ctx.state.user };
    ctx.logout();
  })
  .post('microsoft', '/microsoft', async (ctx) => {
    try {
      let params = ctx.request.body;
      // Must explicitly define and pass { password: null } to Model.create() or save()
      // for Sequelize's model validation would conflict with and overlay field setter
      params.password = params.password || null;
      let [user, created] = await User.findOrCreate({
        where: {
          microsoftId: {
            [Op.eq]: params.microsoftId
          }
        },
        defaults: params
      });
      ctx.body = { success: true, user: user.getFiltered() };
      if (created) {
        ctx.status = 201;
      }
      return await ctx.login(user);
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = auth;
