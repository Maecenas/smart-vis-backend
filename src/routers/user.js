/* eslint-disable no-shadow */
'use strict';

const Router = require('koa-router');
const { User, Op } = require('../models');
const { stsClient: client } = require('../controllers/oss');
const { oss } = require('../../config/default');

const user = new Router({
  prefix: '/user'
});

user.all('requireOwner', '/:userID', async (ctx, next) => {
  let userID = ctx.params.userID;
  if (ctx.state.user.id === userID) {
    await next();
  } else {
    ctx.throw(403, 'Not authorized');
  }
})
  .get('getUser', '/:userID', async (ctx) => {
    try {
      let userID = ctx.params.userID;
      let user = await User.findById(userID);
      ctx.body = { success: true, user: user.getFiltered() };
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .patch('patchUser', '/:userID', async (ctx) => {
    try {
      let [, affectedRows] = await User.update(ctx.request.body, {
        where: {
          id: {
            [Op.eq]: ctx.params.userID
          }
        }
      });
      if (affectedRows === 1) {
        ctx.body = { success: true };
        ctx.logout();
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.status = 400;
      ctx.body = { msg: err.original.message || err.message };
    }
  })
  .put('putUser', '/:userID', async (ctx) => {
    try {
      let [, affectedRows] = await User.update(ctx.request.body, {
        where: {
          id: {
            [Op.eq]: ctx.params.userID
          }
        }
      });
      if (affectedRows === 1) {
        ctx.body = { success: true };
        ctx.logout();
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.status = 400;
      ctx.body = { msg: err.original.message || err.message };
    }
  })
  .del('delUser', '/:userID', async (ctx) => {
    try {
      let affectedRows = await User.destroy({
        where: {
          id: {
            [Op.eq]: ctx.params.userID
          }
        }
      });
      if (affectedRows === 1) {
        ctx.body = { success: true };
        ctx.logout();
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('getUserToken', '/:userID/token', async function (ctx) {
    try {
      let response = await client.grantUser({
        userID: ctx.params.userID,
        options: ctx.request.body
      });
      if (response) {
        ctx.body = {
          success: true,
          accessToken: response.credentials,
          oss: {
            region: oss.REGION,
            bucket: oss.BUCKET,
            roleArn: oss.sts.ROLE_ARN
          }
        };
      } else {
        ctx.body = { success: false, msg: 'Unknown Error' };
        console.log('[ERR]', response);
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = user;
