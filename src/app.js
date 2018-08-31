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
app.use(cors({
  credentials: true
}));
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

// Add router
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env.PORT, () => {
  console.log(`listening on ${env.PORT}`);
});
module.exports = app;
