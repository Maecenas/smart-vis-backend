'use strict';

const sequelize = require('../controllers/db');
const User = sequelize.import(__dirname + '/user');
const Project = sequelize.import(__dirname + '/project');
const Data = sequelize.import(__dirname + '/data');
const Dimension = sequelize.import(__dirname + '/dimension');
const Bookmark = sequelize.import(__dirname + '/bookmark');

(async () => {
  try {
    if (sequelize.config.database.match(/_test$/)) {
      await sequelize.sync({ force: true });
      let alterQueries = [
        'ALTER TABLE `bookmark` MODIFY `project_id` CHAR(36) NOT NULL',
        'ALTER TABLE `data` MODIFY `project_id` CHAR(36) NOT NULL',
        'ALTER TABLE `dimension` MODIFY `data_id` CHAR(36) NOT NULL',
        'ALTER TABLE `project` MODIFY `user_id` CHAR(36) NOT NULL'
      ].map(query => {
        sequelize.query(query);
      });
      await Promise.all(alterQueries);
    } else {
      await sequelize.sync({ force: false });
    }
  } catch (err) {
    throw err;
  }
})();

Project.belongsTo(User, { constraints: false });
User.hasMany(Project, { constraints: false });
Data.belongsTo(Project, { constraints: false });
Project.hasMany(Data, { constraints: false });
Dimension.belongsTo(Data, { constraints: false });
Data.hasMany(Dimension, { constraints: false });
Bookmark.belongsTo(Project, { constraints: false });
Project.hasMany(Bookmark, { constraints: false });

module.exports = { Bookmark, Data, Dimension, Project, User };
