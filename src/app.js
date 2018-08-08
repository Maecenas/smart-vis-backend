'use strict';

const Koa = require('koa');
const defaultConf = require('../config/default');
const bodyParser = require('koa-parser');
const cors = require('koa-cors');
const logger = require('koa-logger');
const sessionWare = require('koa-session');
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

const passport = require('./controllers/auth');
app.use(passport.initialize())
  .use(passport.session());

// Log HTTP request
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.status} ${ctx.url} - ${ms} ms`);
});

// Add router
const router = require('./middlewares/routes');
app.use(router.routes()).use(router.allowedMethods());

router.all('404', '*', ctx => {
  ctx.throw(404);
});


app.listen(defaultConf.port);
console.log(`listening on ${defaultConf.port}`);
module.exports = app;
