/* eslint-disable no-shadow,consistent-return */
'use strict';

const Router = require('koa-router');
const { Data, Op } = require('../models');

const data = new Router({
  prefix: '/data'
});

data.get('getData', '/', async (ctx) => {
  try {
    let data = await Data.findAll({
      where: {
        projectId: {
          [Op.eq]: ctx.params.projectID
        }
      }
    });
    ctx.body = {
      success: true,
      data: data
        && data.map(_ => _.getFiltered()) || null
    };
  } catch (err) {
    ctx.throw(400, err);
  }
})
  .post('postDatum', '/', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
      return ctx;
    }
    try {
      let params = ctx.request.body;
      params.projectId = ctx.params.projectID;
      let datum = await Data.create(params);
      ctx.body = { success: true, data: datum.getFiltered() };
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('getDatum', '/:dataID', async (ctx) => {
    try {
      let datum = await Data.findById(ctx.params.dataID);
      if (datum) {
        ctx.body = {
          success: true,
          data: datum
            && datum.getFiltered() || null
        };
      } else {
        ctx.body = { success: false };
        return ctx;
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .delete('deleteDatum', '/:dataID', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
      return ctx;
    }
    try {
      let affectedRows = await Data.destroy({
        where: {
          id: {
            [Op.eq]: ctx.params.dataID
          }
        }
      });
      if (affectedRows === 1) {
        ctx.body = { success: true };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  });

module.exports = data;
