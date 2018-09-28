/* eslint-disable max-len */
'use strict';

module.exports = (sequelize, DataTypes) => {
  const Component = sequelize.define('component', {
    id: {
      type: DataTypes.STRING(32),
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING(32)
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    underscored: true
  });
  Component.prototype.filter = ['id', 'name', 'description', 'category', 'score', 'created_at', 'updated_at'];
  return Component;
};
