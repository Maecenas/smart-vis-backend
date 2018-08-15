'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHashcode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hashcode'
    },
    microsoftId: {
      type: DataTypes.UUID,
      unique: true,
      field: 'microsoft_id'
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
    timestamps: false,
    underscored: true
  });
};
