/* eslint-disable consistent-return,camelcase,no-undefined */
'use strict';

const Router = require('koa-router');
const mailer = require('../controllers/mailer');
const passport = require('../controllers/auth');
const redis = require('../controllers/redis');
const { User, Op } = require('../models');

const auth = new Router();

auth.post('signupMail', '/signup_mail',
  async (ctx, next) => {
    try {
      let params = ctx.request.body;
      let foundUser = await User.findByMail(params.mail);
      if (foundUser) {
        ctx.body = { success: false, user: null, info: { msg: 'User already exists' } };
      } else {
        await next();
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  },
  async (ctx) => {
    let mail = ctx.request.body.mail;
    try {
      let isQueuing = await redis.getAsync('signup:retry:' + mail);
      if (isQueuing) {
        ctx.body = { success: false, info: 'Frequent request' };
        return ctx;
      }
      let code = Math.random().toString(10).slice(-6);
      await Promise.all([
        redis.setAsync('signup:' + mail, code, 'EX', 600),
        redis.setAsync('signup:retry:' + mail, code, 'EX', 60)
      ]);
      let res = await mailer.sendAuth({
        mail,
        code
      });
      if (res.startsWith('2')) {
        ctx.body = { success: true, info: res };
      } else {
        ctx.body = { success: false, info: res };
      }
    } catch (err) {
      throw err;
    }
  }
)
  .post('signup', '/signup', async (ctx) => {
    let params = ctx.request.body;
    let code = await redis.getAsync('signup:' + params.mail);
    if (params.code !== code) {
      ctx.body = { success: false, info: { msg: 'Incorrect verification code' } };
    } else {
      try {
        let user = await User.create(params);
        ctx.login(user);
        ctx.body = { success: true, user: user.getFiltered() };
      } catch (err) {
        ctx.throw(400, err);
      }
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
      params.password = params.password || '';
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
      ctx.body = { success: false, info: { msg: err.original.message || err.message || err } };
    }
  })
  .post('resetPasswordMail', '/reset_password_mail',
    async (ctx, next) => {
      try {
        let params = ctx.request.body;
        let foundUser = await User.findByMail(params.mail);
        if (!foundUser) {
          ctx.body = { success: false, user: null, info: { msg: 'User not exists' } };
        } else {
          await next();
        }
      } catch (err) {
        ctx.throw(400, err);
      }
    },
    async (ctx) => {
      let mail = ctx.request.body.mail;
      try {
        let isQueuing = await redis.getAsync('reset:retry:' + mail);
        if (isQueuing) {
          ctx.body = { success: false, info: 'Frequent request' };
          return ctx;
        }
        let code = Math.random().toString(10).slice(-6);
        await Promise.all([
          redis.setAsync('reset:' + mail, code, 'EX', 600),
          redis.setAsync('reset:retry:' + mail, code, 'EX', 60)
        ]);
        let res = await mailer.sendAuth({
          mail,
          code
        });
        if (res.startsWith('2')) {
          ctx.body = { success: true, info: res };
        } else {
          ctx.body = { success: false, info: res };
        }
      } catch (err) {
        throw err;
      }
    }
  )
  .post('resetPassword', '/reset_password', async (ctx) => {
    let params = ctx.request.body;
    let code = await redis.getAsync('reset:' + params.mail);
    if (params.code !== code) {
      ctx.body = { success: false, info: { msg: 'Incorrect verification code' } };
      return ctx;
    }
    try {
      let [affectedCount] = await User.update(
        {
          password: params.password
        },
        {
          where: {
            mail: {
              [Op.eq]: params.mail
            }
          }
        });
      if (affectedCount === 1) {
        ctx.body = { success: true };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = auth;
