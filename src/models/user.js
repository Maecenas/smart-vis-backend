'use strict';

const Sequelize = require('sequelize');
const sequelize = require('../controllers/db.js');

let User = sequelize.define('user', {
  id: {
    type: Sequelize.STRING(40),
    primaryKey: true,
    allowNull: false,
    defaultValue: Sequelize.UUIDV4
  },
  username: {
    type: Sequelize.STRING(40),
    allowNull: false
  },
  mail: {
    type: Sequelize.STRING(40),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  passwordHashcode: {
    type: Sequelize.STRING(40),
    allowNull: false,
    field: 'password_hashcode'
  },
  microsoftId: {
    type: Sequelize.STRING(40),
    unique: true,
    field: 'microsoft_id'
  }
}, {
  freezeTableName: true,
  timestamps: false
});

User.sync({ force: false });

module.exports = User;
