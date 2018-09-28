/* eslint-disable max-len */
'use strict';

module.exports = (sequelize, DataTypes) => {
  const ComponentComment = sequelize.define('componentComment', {
    componentId: {
      type: DataTypes.STRING(32),
      allowNull: false,
      field: 'component_id',
      references: {
        model: 'component',
        key: 'id'
      }
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
    score: {
      type: DataTypes.TINYINT(1),
      validate: {
        isInt: true,
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT
    }
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
    underscored: true
  });
  // Workaround of sub-parted composite primary key
  ComponentComment.removeAttribute('id');
  ComponentComment.prototype.filter = ['componentId', 'userId', 'score', 'comment', 'created_at', 'updated_at'];
  return ComponentComment;
};
