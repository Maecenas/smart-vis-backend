'use strict';

const Router = require('koa-router');
const { influx } = require('../controllers/influxdb');
const { influxdb } = require('../../config/default');
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

      // Insert MongoDB
      let activities = params.activities.map(activity => ({
        userid: ctx.state.user.id,
        projectid: params.projectid,
        time: new Date(Number.parseInt(activity.time, 10)),
        taxonomy: activity.taxonomy,
        type: activity.type,
        parameter: JSON.stringify(activity.parameter)
      }));

      // Insert InfluxDB
      let points = activities.map(_ => {
        let { time: timestamp, ...fields } = _;
        return {
          measurement: influxdb.MEASUREMENT,
          timestamp,
          fields
        };
      });

      await Promise.all([
        Activity.insertMany(activities),
        influx.writePoints(points)
      ]);

      ctx.body = { success: true, params: params };
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = tracker;
