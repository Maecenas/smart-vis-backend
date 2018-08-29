'use strict';

const Influx = require('influx');
const { influxdb } = require('../../config/default');

const influx = new Influx.InfluxDB({
  host: influxdb.HOST,
  database: influxdb.DATABASE,
  schema: [
    {
      measurement: influxdb.MEASUREMENT,
      fields: {
        userid: Influx.FieldType.STRING,
        projectid: Influx.FieldType.STRING,
        taxonomy: Influx.FieldType.STRING,
        type: Influx.FieldType.STRING,
        parameter: Influx.FieldType.STRING
      },
      tags: [
      ]
    }
  ]
});

(async () => {
  try {
    let names = await influx.getDatabaseNames();
    if (!names.includes(influxdb.DATABASE)) {
      await influx.createDatabase(influxdb.DATABASE);
    }
  } catch (err) {
    console.error('[ERR] Creating InfluxDB database: ' + influxdb.DATABASE + err);
  }
})();

module.exports = { influx };
