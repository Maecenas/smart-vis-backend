'use strict';

const validator = require('../utils/validator');

module.exports = (sequelize, DataTypes) => {
  let User = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mail: {
      type: DataTypes.STRING(191),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    microsoftId: {
      type: DataTypes.UUID,
      field: 'microsoft_id',
      unique: true
    },
    industry: {
      type: DataTypes.STRING
    },
    company: {
      type: DataTypes.STRING
    },
    isEducational: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_educational'
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    underscored: true,
    setterMethods: {
      password(value) {
        this.setDataValue('password', validator.hash(value));
      }
    }
  });
  User.findByMail = async function (mail) {
    return await this.findOne({
      where: {
        mail: {
          [sequelize.Op.eq]: mail
        }
      }
    });
  };
  User.prototype.filter = ['id', 'username', 'mail', 'created_at', 'updated_at'];
  return User;
};
