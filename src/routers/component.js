/* eslint-disable no-shadow */
'use strict';

const Router = require('koa-router');
const { sequelize } = require('../controllers/sequelize');
const redis = require('../controllers/redis');
const { Component, ComponentComment, Op } = require('../models');

const component = new Router({
  prefix: '/component'
});
const comment = new Router({
  prefix: '/comment'
});

async function getComponentScore(componentId) {
  let score = await redis.getAsync('score:' + componentId);
  if (!score) {
    const [{ scores, comments }] = await ComponentComment.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('score')), 'scores'],
        [sequelize.fn('COUNT', 1), 'comments']
      ],
      where: {
        componentId: {
          [Op.eq]: componentId
        }
      },
      raw: true
    });
    score = scores / comments || 0;
    await redis.setAsync('score:' + componentId, score, 'EX', 86400);
  }
  return score;
}

component.get('getComponents', '/', async (ctx) => {
  try {
    const rawComponents = await Component.findAll();
    const components = rawComponents
      && await Promise.all(
        rawComponents
          .map(_ => _.getFiltered())
          .map(async (_) => ({
            ..._,
            score: await getComponentScore(_.id)
          }))
      )
      || null;
    ctx.body = {
      success: true,
      components
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { success: false, info: { msg: err.original.message || err.message || err } };
  }
})
  .get('getComponent', '/:componentID', async (ctx) => {
    try {
      const component = await Component.findById(ctx.params.componentID);
      if (component) {
        ctx.body = {
          success: true,
          component: {
            ...component.getFiltered(),
            score: await getComponentScore(ctx.params.componentID)
          }
        };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.status = 400;
      ctx.body = { success: false, info: { msg: err.original.message || err.message || err } };
    }
  });

comment.get('getComment', '/', async (ctx) => {
  try {
    const comment = await ComponentComment.findOne({
      where: {
        [Op.and]: [
          { componentId: { [Op.eq]: ctx.params.componentID } },
          { userId: { [Op.eq]: ctx.state.user.id } }
        ]
      }
    });
    ctx.body = {
      success: true,
      comment: comment
        && comment.getFiltered() || null
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = { success: false, info: { msg: err.original.message || err.message || err } };
  }
})
  .post('postComment', '/', async (ctx) => {
    try {
      const params = ctx.request.body;
      params.userId = ctx.state.user.id;
      params.componentId = ctx.params.componentID;
      const comment = await ComponentComment.create(params);
      ctx.body = { success: true, comment: comment.getFiltered() };
    } catch (err) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        info: { msg: err.original && err.original.message || err.message || err }
      };
    }
  })
  .patch('patchComment', '/', async (ctx) => {
    try {
      const [affectedCount] = await ComponentComment.update(ctx.request.body, {
        where: {
          [Op.and]: [
            { componentId: { [Op.eq]: ctx.params.componentID } },
            { userId: { [Op.eq]: ctx.state.user.id } }
          ]
        }
      });
      if (affectedCount === 1) {
        ctx.body = { success: true };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        info: { msg: err.original && err.original.message || err.message || err }
      };
    }
  });

component.use('/:componentID', comment.routes(), comment.allowedMethods());
module.exports = component;
