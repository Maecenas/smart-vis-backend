'use strict';

module.exports = (sequelize, DataTypes) => {
  let Data = sequelize.define('data', {
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
    dimensions: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dataUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'data_url'
    },
    name: {
      type: DataTypes.STRING,
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
    name: {
      plural: 'data',
      singular: 'data'
    },
    paranoid: true,
    timestamps: true,
    underscored: true
  });
  Data.prototype.filter = ['id', 'data', 'dataUrl', 'dimensions', 'created_at', 'updated_at'];
  return Data;
};
