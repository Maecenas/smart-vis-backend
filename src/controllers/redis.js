'use strict';

const Promise = require('bluebird');
const Redis = require('redis');
Promise.promisifyAll(Redis);

const client = Redis.createClient();

client.on('connect', () => {
  console.log('Redis client connected');
})
  .on('error', err => {
    console.log('Something went wrong ' + err);
  });

module.exports = client;
