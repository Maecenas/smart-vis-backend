/* eslint-disable no-shadow */
'use strict';

const Router = require('koa-router');
const { Project, Op } = require('../models');
const { stsClient: client } = require('../controllers/oss');
const { oss } = require('../../config/default');

const project = new Router({
  prefix: '/project'
});

project.use('*', async (ctx, next) => {
  ctx.state.user.isProjectOwner = ctx.state.user.id === ctx.params.userID;
  await next();
})
  .get('getProjects', '/', async (ctx) => {
    let page = Math.max(Number.parseInt(ctx.query.page, 10) || 0, 1);
    let queryOffset;
    let queryLimit;
    if (page !== 1) {
      queryOffset = page * 8 - 9;
      queryLimit = 8;
    } else {
      queryOffset = 0;
      queryLimit = 7;
    }
    try {
      if (ctx.state.user.isProjectOwner) {
        let { count, rows: projects } = await Project.findAndCountAll({
          where: {
            userId: {
              [Op.eq]: ctx.params.userID
            }
          },
          offset: queryOffset,
          limit: queryLimit,
          order: [['updated_at', 'DESC']]
        });
        ctx.body = {
          success: true,
          count,
          projects: projects
            && projects.map(_ => _.getFiltered()) || null
        };
      } else {
        let { count, rows: projects } = await Project.findAndCountAll({
          where: {
            [Op.and]: [
              { userId: ctx.params.userID },
              { isPublic: true }
            ]
          },
          offset: queryOffset,
          limit: queryLimit,
          order: [['updated_at', 'DESC']]
        });
        ctx.body = {
          success: true,
          count,
          projects: projects
            && projects.map(_ => _.getFiltered()) || null };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .post('postProject', '/', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
    }
    try {
      let params = ctx.request.body;
      params.userId = ctx.params.userID;
      let project = await Project.create(params);
      ctx.body = { success: true, project: project.getFiltered() };
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('getProject', '/:projectID', async (ctx) => {
    try {
      let project = await Project.findOne({
        where: {
          id: {
            [Op.eq]: ctx.params.projectID
          }
        },
        include: ['data']
      });
      if (ctx.state.user.isProjectOwner || project.isPublic) {
        ctx.body = {
          success: true,
          project: project
            && project.getFiltered() || null,
          data: project
            && project.data
            && project.data.map(_ => _.getFiltered()) || null
        };
      } else {
        ctx.body = { success: false, msg: 'Not authorized' };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .patch('patchProject', '/:projectID', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
    }
    try {
      let [, affectedRows] = await Project.update(ctx.request.body, {
        where: {
          id: {
            [Op.eq]: ctx.params.projectID
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
  })
  .delete('deleteProject', '/:projectID', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
    }
    try {
      let affectedRows = await Project.destroy({
        where: {
          id: {
            [Op.eq]: ctx.params.projectID
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
  })
  .get('getProjectToken', '/:projectID/token', async function (ctx) {
    try {
      let project = await Project.findById(ctx.params.projectID);
      if (!project) {
        ctx.body = { success: false, msg: 'Invalid projectID' };
      }
      if (!ctx.state.user.isProjectOwner && !project.isPublic) {
        ctx.body = { success: false, msg: 'Not authorized' };
      }
      let response = await client.grantProject({
        userID: ctx.params.userID,
        projectID: ctx.params.projectID,
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

module.exports = project;