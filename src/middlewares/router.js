'use strict';

const Router = require('koa-router');
const auth = require('../routers/auth');
const api = require('../routers/api');

const router = new Router();

router.use('/auth', auth.routes(), auth.allowedMethods());
router.use('/api', api.routes(), api.allowedMethods());

router.all('404', '*', ctx => {
  ctx.throw(404);
});

module.exports = router;
