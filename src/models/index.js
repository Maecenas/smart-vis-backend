/* eslint-disable no-console,max-len */
'use strict';

const { sequelize, sequelize: { Op } } = require('../controllers/sequelize');
const fp = require('../utils/functional');
const User = sequelize.import(__dirname + '/user');
const Project = sequelize.import(__dirname + '/project');
const Data = sequelize.import(__dirname + '/data');
const Bookmark = sequelize.import(__dirname + '/bookmark');
const Component = sequelize.import(__dirname + '/component');
const ComponentComment = sequelize.import(__dirname + '/componentComment');

sequelize.Model.prototype.getFiltered = function (filter = this.filter) {
  return fp.filter(this.get({ plain: true }), filter);
};

Project.belongsTo(User, { constraints: false });
User.hasMany(Project, { constraints: false });
Data.belongsTo(Project, { constraints: false });
Project.hasMany(Data, { constraints: false });
Bookmark.belongsTo(Project, { constraints: false });
Project.hasMany(Bookmark, { constraints: false });
ComponentComment.belongsTo(Component, { constraints: false });
Component.hasMany(ComponentComment, { constraints: false });
ComponentComment.belongsTo(User, { constraints: false });
User.hasMany(ComponentComment, { constraints: false });

(async () => {
  try {
    if (sequelize.config.database.match(/_test$/)) {
      await sequelize.sync({ force: true });
      // Ugly workarounds of Sequelize
      const alterQueries = [
        'ALTER TABLE `bookmark` MODIFY `project_id` CHAR(36) NOT NULL',
        'ALTER TABLE `data` MODIFY `project_id` CHAR(36) NOT NULL',
        'ALTER TABLE `project` MODIFY `user_id` CHAR(36) NOT NULL',
        'ALTER TABLE `componentComment` ADD UNIQUE INDEX `component_comment` (`component_id`, `user_id`(5))'
      ]
        .map(query => {
          sequelize.query(query);
        });
      const componentQueries = [
        {
          id: 'collapsible',
          name: 'Collapsible Tree',
          description: 'Collapsible Tree is a node-link tree.Click on the nodes to expand or collapse.',
          category: 'tree'
        },
        {
          id: 'treemap',
          name: 'Treemap',
          description: 'A treemap recursively subdivides area into rectangles; the area of any node in the tree corresponds to its value.',
          category: 'tree'
        },
        {
          id: 'sunburst',
          name: 'Sunburst',
          description: 'The root node of the tree is at the center, with leaves on the circumference. The area of each arc corresponds to its value.',
          category: 'tree'
        },
        {
          id: 'piechart',
          name: 'Pie Graph',
          description: 'This is a common chart of showing the size of each value relative to the total value.Slide rollers to switch it between Pie and Ring.',
          category: 'statistics'
        },
        {
          id: 'stackedBar',
          name: 'Bar Chart',
          description: 'The distribution of data is represented by a series of highly varying longitudinal stripes, and you can create stacked bar charts for multiple series of data.Use rollers to change the width of bar.',
          category: 'statistics'
        },
        {
          id: 'linechart',
          name: 'Line Chart',
          description: 'The  line graph shows the continuous data A changing with B.Use rollers to change the width of bar.',
          category: 'statistics'
        },
        {
          id: 'scatterplot',
          name: 'Scatterplot Chart',
          description: 'Scatter plot is the distribution map of data points on the plane of rectangular coordinate system.',
          category: 'statistics'
        },
        {
          id: 'parallelCoordinates',
          name: 'Parallel Coordinates',
          description: 'This is a common way of visualizing high-dimensional geometry and analyzing multivariate data.',
          category: 'multidimensional'
        },
        {
          id: 'scatterplotMatrix',
          name: 'Scatter Plot Matrix',
          description: 'The scatterplot matrix visualizations pairwise correlations for multi-dimensional data; each cell in the matrix is a scatterplot.',
          category: 'multidimensional'
        },
        {
          id: 'choropleth',
          name: 'Choropleth Map',
          description: 'A choropleth map is a kind of a thematic map that can be used to display data that varies across geographic regions.',
          category: 'multidimensional'
        },
        {
          id: 'map',
          name: 'Map',
          description: 'A choropleth map combined with the bubble map.',
          category: 'multidimensional'
        },
        {
          id: 'forceDirected',
          name: 'Force Directed Layout',
          description: 'This is a physical simulation of charged particles and springs places related characters in closer proximity, while unrelated characters are farther apart.',
          category: 'multidimensional'
        }
      ]
        .map(params => {
          Component.create(params);
        });
      await Promise.all([...alterQueries, ...componentQueries]);
    } else {
      await sequelize.sync({ force: false });
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
})();

module.exports = { Bookmark, Component, ComponentComment, Data, Project, User, Op };
