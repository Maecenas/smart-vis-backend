'use strict';

const Sequelize = require('sequelize');
const { database: db } = require('../../config/default');

/**
 * Database connection and pool configuration
 *
 * @param {String} dialect Database dialect to connect
 * @param {String} host DataBase's connection host
 * @param {String|Number} port DataBase's connection port
 * @param {Function|Boolean} logging Logger function for Sequelize
 * @param: {Number} pool.max Connection pool's max size
 * @param: {Number} pool.min Connection pool's min size
 * @param: {Number} pool.idle Maximum waiting time for each connection client
 * @type {Sequelize}
 */
let sequelize = new Sequelize(db.DATABASE, db.USER, db.PASSWORD, {
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

module.exports = {
  sequelize
};
