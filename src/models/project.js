/* eslint-disable max-len */
'use strict';

module.exports = (sequelize, DataTypes) => {
  let Project = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'user',
        key: 'id'
      }
    },
    component: {
      type: DataTypes.STRING
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    thumbnail: {
      type: DataTypes.TEXT
    },
    state: {
      type: DataTypes.TEXT
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_public'
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    indexes: [
      {
        fields: [{ attribute: 'user_id', length: 5 }],
        name: 'user_id'
      }
    ],
    paranoid: true,
    timestamps: true,
    underscored: true
  });
  Project.prototype.filter = ['id', 'component', 'title', 'description', 'thumbnail', 'state', 'isPublic', 'created_at', 'updated_at'];
  return Project;
};
