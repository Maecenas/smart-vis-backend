'use strict';

const Router = require('koa-router');
const client = require('../controllers/oss').stsClient;
const oss = require('../../config/default').oss;

const api = new Router();

api.all('requireLogin', '/*', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401, 'Login Required');
  }
});

api.all('requireOwner', '/user/:userID/*', async (ctx, next) => {
  let userID = ctx.params.userID;
  if (ctx.state.user.id === userID) {
    await next();
  } else {
    ctx.throw(403, 'Not authorized');
  }
});

api.get('getUserToken', '/user/:userID/token', async function (ctx) {
  try {
    let response = await client.grantUser(ctx.params);
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
    ctx.throw(400, { err });
  }
});

module.exports = api;
