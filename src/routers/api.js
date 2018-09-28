'use strict';

const Router = require('koa-router');
const user = require('./user');
const project = require('./project');
const data = require('./data');
const bookmark = require('./bookmark');
const component = require('./component');
const api = new Router();

api.all('requireLogin', '/*', async (ctx, next) => {
  if (ctx.isAuthenticated()) {
    await next();
  } else {
    ctx.throw(401, 'Login Required');
  }
});

project.use('/:projectID', bookmark.routes(), bookmark.allowedMethods());
project.use('/:projectID', data.routes(), data.allowedMethods());
user.use('/:userID', project.routes(), project.allowedMethods());
api.use(user.routes(), user.allowedMethods());
api.use(component.routes(), component.allowedMethods());

module.exports = api;
