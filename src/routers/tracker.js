'use strict';

const Router = require('koa-router');
const { Activity } = require('../controllers/mongo');

const tracker = new Router();

tracker.all('requireLogin', '*', async (ctx, next) => {
    if (ctx.isAuthenticated()) {
      await next();
    } else {
      ctx.throw(401, 'Login Required');
    }
  })
  .post('postAction', '/', async (ctx) => {
    try {
      let params = ctx.request.body;

      //Insert MongoDB
      let activities = params.activities.map(activity => {
          return {
            userid: ctx.state.user.id,
            projectid: params.projectid,
            time: new Date(activity.time*1000),
            taxonomy: activity.taxonomy,
            type: activity.type,
            parameter: JSON.stringify(activity.parameter)
          }
      });

      try {
        await Activity.insertMany(activities);
      } catch(err) {
        ctx.throw(400, err);
      }

      //TODO: Insert InfluxDB

      ctx.body = { success: true, params: params };
    } catch (err) {
      ctx.throw(400, err);
    }
  });
  
module.exports = tracker;