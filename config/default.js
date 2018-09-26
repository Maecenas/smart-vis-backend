/* eslint-disable max-len,no-console */
'use strict';

module.exports = {
  env: {
    PORT: 3000
  },
  database: {
    HOST: 'mysql',
    PORT: '3306',
    USER: 'smartvis',
    PASSWORD: 'smartvis',
    DATABASE: 'smartvis',
    LOGGING: console.log
  },
  mongodb: {
    CONNECTION_URI: 'mongodb://root:password@localhost:27017/smartvis?authSource=admin'
  },
  redis: {
    PORT: 6379,
    HOST: 'redis',
    OPTIONS: {
    }
  },
  influxdb: {
    PORT: 8086,
    HOST: 'influxdb',
    DATABASE: 'smartvis',
    MEASUREMENT: 'activities'
  },
  oss: {
    PROVIDER: 'Aliyun',
    ACCESS_KEY_ID: 'LTAIoUq9zbplWleF',
    ACCESS_KEY_SECRET: 'gdj8pVy15SSRKR71PyJ6g1vLAlMgAY',
    BUCKET: 'smartvis-test',
    REGION: 'oss-cn-hangzhou',
    INTERNAL: false,
    SECURE: true,
    logging: {
      PREFIX: '/logs'
    },
    sts: {
      ROLE_ARN: 'acs:ram::1912033543768022:role/aliyun-oss-smartvistest-user'
    }
  },
  mail: {
    HOST: 'smtp.ethereal.email',
    PORT: 587,
    SECURE: false,
    USERNAME: 'Fred Foo 👻',
    USER: 'foo@example.com',
    PASSWORD: ''
  }
};
