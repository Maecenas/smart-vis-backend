/* eslint-disable no-shadow */
'use strict';

const Router = require('koa-router');
const { User, Op } = require('../models');
const { stsClient: client } = require('../controllers/oss');
const { oss } = require('../../config/default');

const user = new Router({
  prefix: '/user'
});

user.get('/', async (ctx) => {
  ctx.redirect(ctx.router.url('getUser', { userID: ctx.state.user.id }));
})
  .all('requireOwner', '/:userID', async (ctx, next) => {
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
      ctx.body = {
        success: true,
        user: ctx.state.user || await User.findById(userID).getFiltered()
      };
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .patch('patchUser', '/:userID', async (ctx) => {
    try {
      let [affectedCount] = await User.update(ctx.request.body, {
        where: {
          id: {
            [Op.eq]: ctx.params.userID
          }
        }
      });
      if (affectedCount === 1) {
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
  .delete('deleteUser', '/:userID', async (ctx) => {
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
    if (ctx.state.user.id !== ctx.params.userID) {
      ctx.body = { success: false, msg: 'Not authorized' };
    } else {
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
    }
  });

module.exports = user;
