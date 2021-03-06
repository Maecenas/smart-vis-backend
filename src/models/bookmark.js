/* eslint-disable max-len */
'use strict';

module.exports = (sequelize, DataTypes) => {
  let Bookmark = sequelize.define('bookmark', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'project_id',
      references: {
        model: 'project',
        key: 'id'
      }
    },
    dataId: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'data_ids'
    },
    component: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    indexes: [
      {
        fields: [{ attribute: 'project_id', length: 5 }],
        name: 'project_id'
      }
    ],
    paranoid: true,
    timestamps: true,
    underscored: true
  });
  Bookmark.prototype.filter = ['id', 'dataId', 'component', 'note', 'state', 'created_at', 'updated_at'];
  return Bookmark;
};
