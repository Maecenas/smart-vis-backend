'use strict';

const OSS = require('ali-oss');
const oss = require('../../config/default').oss;

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

module.exports = { client, stsClient };

function getUserPolicy(userID) {
  return {
    Version: '1',
    Statement: [{
      Effect: 'Allow',
      Action: [
        'oss:ListObjects',
        'oss:GetObject',
        'oss:ListParts',
        'oss:AbortMultipartUpload',
        'oss:PutObject'
      ],
      Resource: `acs:oss:*:*:smartvis-test/${userID}/`
    }]
  };
}

stsClient.grantUser = async function ({ userID, timeout } = {}) {
  try {
    const policy = getUserPolicy(userID);
    const sessionName = userID.replace(/-/g, '');
    return await stsClient.assumeRole(oss.sts.ROLE_ARN, policy, timeout, sessionName);
  } catch (err) {
    console.log(err);
    return { err: err };
  }
};
