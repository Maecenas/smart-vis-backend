/* eslint-disable max-len,no-return-assign */
'use strict';

const OSS = require('ali-oss');
const { oss } = require('../../config/default');

/**
 * Create a new Aliyun OSS connection client
 *
 * @param {String} accessKeyId AccessKey created via Aliyun console
 * @param {String} accessKeySecret AccessSecret created via Aliyun console
 * @param {String} bucket But created via Aliyun console or via putBucket()
 * @param {String} endpoint The domain/ip address of oss. Neglect {@code region} if given
 * @param: {String} region='oss-cn-hangzhou' The region oss locates. By default is 华东1.
 * @param: {Boolean} internal Access via internal network for ECS would save cost
 * @param: {Boolean} secure Whether to use the HTTPS connection
 * @param: {String|Number} timeout=6000 Timeout for accessing OSS API. By default is 60s.
 * @param: {Boolean} cname True then revolve to user assigned {@code endpoint}
 * @type {OSS}
 */
const client = new OSS({
  region: oss.REGION,
  accessKeyId: oss.ACCESS_KEY_ID,
  accessKeySecret: oss.ACCESS_KEY_SECRET,
  bucket: oss.BUCKET,
  internal: oss.INTERNAL = false,
  secure: oss.SECURE = true,
  timeout: oss.TIMEOUT = 6000
});

/**
 * Create a new Aliyun OSS-STS connection client
 *
 * @param: {String} accessKeyId The acting sts role's AccessKeyID of AccessKey
 * @param: {String} accessKeySecret The acting sts role's AccessKeyID of AccessKey
 * @param: {Function} grantUser Grant user access to OSS
 * @type {OSS.STS}
 */
const stsClient = new OSS.STS({
  accessKeyId: oss.ACCESS_KEY_ID,
  accessKeySecret: oss.ACCESS_KEY_SECRET
});

const accessType = {
  READ_ONLY: Symbol('readonly'),
  READ_WRITE: Symbol('readwrite')
};

function getOSSPolicy(prefix, options = {}) {
  let { access = accessType.READ_WRITE, actions } = options;
  switch (access) {
  case accessType.READ_ONLY:
    actions = actions || [
      'oss:ListObjects',
      'oss:GetObject'
    ];
    break;
  case accessType.READ_WRITE:
  default:
    actions = actions || [
      'oss:ListObjects',
      'oss:GetObject',
      'oss:ListParts',
      'oss:AbortMultipartUpload',
      'oss:PutObject'
    ];
  }
  return {
    Version: '1',
    Statement: [{
      Effect: 'Allow',
      Action: actions,
      Resource: [
        `acs:oss:*:*:${ oss.BUCKET }/${ Array.isArray(prefix) ? prefix.join('/') : prefix }/*`
      ]
    }]
  };
}

function getUserPolicy(userID, options) {
  return getOSSPolicy(userID, options);
}

function getProjectPolicy(userID, projectID, options = {}) {
  // TODO: Refactor with null propagation operator
  // options.access = Symbol.for(options.access?) || Symbol.for('readonly');
  options.access =
    options.access === 'readwrite' ?
      Symbol.for('readwrite') :
      Symbol.for('readonly');
  return getOSSPolicy([userID, projectID], options);
}

OSS.STS.prototype.grantUser = async function ({ userID, options = {} } = {}) {
  try {
    const policy = getUserPolicy(userID, options);
    const sessionName = userID.replace(/-/g, '');
    return await stsClient.assumeRole(oss.sts.ROLE_ARN, policy, options.timeout = 3600, sessionName);
  } catch (err) {
    throw new Error(err.message);
  }
};

OSS.STS.prototype.grantProject = async function ({ userID, projectID, options = {} } = {}) {
  try {
    const policy = getProjectPolicy(userID, projectID, options);
    // TODO: Add public Project AccessToken cache
    const sessionName = projectID.replace(/-/g, '');
    return await stsClient.assumeRole(oss.sts.ROLE_ARN, policy, options.timeout = 3600, sessionName);
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { client, stsClient };
