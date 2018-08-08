'use strict';

module.exports = {
  filter: (object, allowedKeys) =>
    allowedKeys.reduce((obj, key) => ({
      ...obj,
      [key]: object[key]
    }), {})
};
