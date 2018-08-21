'use strict';

const Koa = require('koa');
const bodyParser = require('koa-parser');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const sessionWare = require('koa-session');
const { env } = require('../config/default');
const router = require('./routers');
const passport = require('./controllers/auth');
const app = new Koa();

app.use(logger());
app.use(cors());
// app.proxy = true;
app.use(bodyParser());
app.keys = ['secret'];
app.use(sessionWare({
  // cookie: { secure: false, maxAge: 86400000 }
  // store: RedisStore(redisConf.session)
  // store: sessionStorage
}, app));

app.use(passport.initialize());
app.use(passport.session());

// Log HTTP request
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms} ms`);
});

// Add router
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env.PORT, () => {
  console.log(`listening on ${env.PORT}`);
});
module.exports = app;
