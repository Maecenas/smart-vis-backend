'use strict';

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('dimension', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    dataId: {
      type: DataTypes.UUID,
      field: 'data_id',
      references: {
        model: 'data',
        key: 'id'
      }
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    indexes: [
      {
        fields: ['data_id'],
        name: 'data_id'
      }
    ],
    paranoid: true,
    timestamps: true,
    underscored: true
  });
};
