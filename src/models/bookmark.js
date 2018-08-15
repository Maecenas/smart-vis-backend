'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('bookmark', {
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
        fields: ['project_id'],
        name: 'project_id'
      }
    ],
    paranoid: true,
    timestamps: true,
    underscored: true
  });
};
