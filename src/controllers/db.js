'use strict';

const Sequelize = require('sequelize');
const dbConf = require('../../config/default.js').database;

/**
 * 连接指定类型的数据库
 * host：数据库地址
 * max：连接池最大连接数量
 * min：连接池最小连接数量
 * idle：每个线程最长等待时间
 * @type {Sequelize}
 */

module.exports = new Sequelize(dbConf.DATABASE, dbConf.USER, dbConf.PASSWORD, {
  host: dbConf.HOST,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  pool: {
    max: 5,
    min: 0,
    idle: 30000
  },
  define: {
    timestamps: false
  }
});
