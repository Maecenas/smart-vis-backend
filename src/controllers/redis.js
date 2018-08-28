'use strict';

const Promise = require('bluebird');
const Redis = require('redis');
Promise.promisifyAll(Redis);
const { redis } = require('../../config/default');

const client = Redis.createClient(
  redis.PORT,
  redis.HOST,
  redis.OPTIONS
);

client.on('connect', () => {
  console.log('Redis client connected');
})
  .on('error', err => {
    console.log('Something went wrong ' + err);
  });

module.exports = client;
