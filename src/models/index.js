/* eslint-disable no-console */
'use strict';

const { sequelize, sequelize: { Op } } = require('../controllers/sequelize');
const fp = require('../utils/functional');
const User = sequelize.import(__dirname + '/user');
const Project = sequelize.import(__dirname + '/project');
const Data = sequelize.import(__dirname + '/data');
const Bookmark = sequelize.import(__dirname + '/bookmark');

sequelize.Model.prototype.getFiltered = function (filter = this.filter) {
  return fp.filter(this.get({ plain: true }), filter);
};

Project.belongsTo(User, { constraints: false });
User.hasMany(Project, { constraints: false });
Data.belongsTo(Project, { constraints: false });
Project.hasMany(Data, { constraints: false });
Bookmark.belongsTo(Project, { constraints: false });
Project.hasMany(Bookmark, { constraints: false });

(async () => {
  try {
    if (sequelize.config.database.match(/_test$/)) {
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync({ force: false });
    }
    let alterQueries = [
      'ALTER TABLE `bookmark` MODIFY `project_id` CHAR(36) BINARY NOT NULL',
      'ALTER TABLE `data` MODIFY `project_id` CHAR(36) BINARY NOT NULL',
      'ALTER TABLE `project` MODIFY `user_id` CHAR(36) BINARY NOT NULL'
    ].map(query => {
      sequelize.query(query);
    });
    await Promise.all(alterQueries);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();

module.exports = { Bookmark, Data, Project, User, Op };
