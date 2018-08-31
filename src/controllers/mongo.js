'use strict';

const { mongodb } = require('../../config/default');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.connect(mongodb.CONNECTION_URI, { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', function(){
    console.log('Mongodb Connection Error!');
});
db.once('open', function(){
    console.log('Mongodb Connection Success!');
});

const activitySchema = new Schema({
  userid: String,
  projectid: String,
  component: String,
  time: { type: Date, default: Date.now },
  taxonomy: String,
  type: String,
  parameter: String
});
const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Activity }
