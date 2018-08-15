'use strict';

const Sequelize = require('sequelize');
const db = require('../../config/default.js').database;

/**
 * 连接指定类型的数据库
 * host：数据库地址
 * max：连接池最大连接数量
 * min：连接池最小连接数量
 * idle：每个线程最长等待时间
 * @type {Sequelize}
 */

module.exports = new Sequelize(db.DATABASE, db.USER, db.PASSWORD, {
  dialect: 'mysql',
  host: db.HOST,
  port: db.PORT || 3306,
  logging: db.LOGGING === false ? false : db.LOGGING || console.log,
  dialectOptions: {
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  define: {
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    underscored: true
  },
  sync: { force: false },
  pool: {
    max: 5,
    min: 0,
    idle: 30000
  }
});
