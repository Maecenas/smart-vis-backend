'use strict';

const crypto = require('crypto');
let hashFunc = function () {
  return crypto.createHash('md5');
};

function getPasswordHash(password = Math.random().toString(36).slice(-8), passwordSalt) {
  if (passwordSalt) {
    return {
      hashCode: hashFunc().update(`${password}:${passwordSalt}`).digest('hex'),
      salt: passwordSalt
    };
  }
  return hashFunc().update(password).digest('hex');
}

function validatePassword(password, passwordHash, passwordSalt) {
  if (passwordSalt) {
    return hashFunc().update(`${password}:${passwordSalt}`).digest('hex') === passwordHash;
  }
  return hashFunc().update(password).digest('hex') === passwordHash;
}

function setHashFuntion(hashAlgorithm) {
  hashFunc = crypto.createHash(hashAlgorithm);
}

module.exports = {
  hash: getPasswordHash,
  validate: validatePassword,
  setHash: setHashFuntion
};
