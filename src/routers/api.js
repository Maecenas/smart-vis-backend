'use strict';

const Router = require('koa-router');
const user = require('./user');
const project = require('./project');
const api = new Router();

api.all('requireLogin', '/*', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401, 'Login Required');
  }
});

user.use('/:userID', project.routes(), project.allowedMethods());
api.use(user.routes(), user.allowedMethods());

module.exports = api;
