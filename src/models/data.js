'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('data', {
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
    dataUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'data_url'
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
    name: {
      plural: 'data',
      singular: 'data'
    },
    paranoid: true,
    timestamps: true,
    underscored: true
  });
};
