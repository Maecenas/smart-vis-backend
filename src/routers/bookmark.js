/* eslint-disable no-shadow,consistent-return */
'use strict';

const Router = require('koa-router');
const { Bookmark, Op } = require('../models');
const limit = 8;

const bookmark = new Router({
  prefix: '/bookmark'
});
bookmark.get('getBookmarks', '/', async (ctx) => {
  let page = Math.max(Number.parseInt(ctx.query.page, 10) || 0, 1);
  let offset = (page - 1) * limit;
  try {
    let { count, rows: bookmarks } = await Bookmark.findAndCountAll({
      where: {
        projectId: {
          [Op.eq]: ctx.params.projectID
        }
      },
      offset,
      limit,
      order: [['updated_at', 'DESC']]
    });
    ctx.body = {
      success: true,
      count,
      bookmarks: bookmarks
        && bookmarks.map(_ => _.getFiltered()) || null
    };
  } catch (err) {
    ctx.throw(400, err);
  }
})
  .post('postBookmark', '/', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
      return ctx;
    }
    try {
      let params = ctx.request.body;
      params.projectId = ctx.params.projectID;
      let bookmark = await Bookmark.create(params);
      ctx.body = { success: true, bookmark: bookmark.getFiltered() };
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('getBookmark', '/:bookmarkID', async (ctx) => {
    try {
      let bookmark = await Bookmark.findById(ctx.params.bookmarkID);
      if (bookmark) {
        ctx.body = {
          success: true,
          bookmark: bookmark
            && bookmark.getFiltered() || null
        };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .patch('patchBookmark', '/:bookmarkID', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
      return ctx;
    }
    try {
      let [affectedCount] = await Bookmark.update(ctx.request.body, {
        where: {
          id: {
            [Op.eq]: ctx.params.bookmarkID
          }
        }
      });
      if (affectedCount === 1) {
        ctx.body = { success: true };
      } else {
        ctx.body = { success: false };
      }
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .delete('deleteBookmark', '/:bookmarkID', async (ctx) => {
    if (!ctx.state.user.isProjectOwner) {
      ctx.body = { success: false, msg: 'Not authorized' };
      return ctx;
    }
    try {
      let affectedRows = await Bookmark.destroy({
        where: {
          id: {
            [Op.eq]: ctx.params.bookmarkID
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

module.exports = bookmark;
