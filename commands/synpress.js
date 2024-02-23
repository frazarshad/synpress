const log = require('debug')('synpress:synpress');
const playwright = require('./playwright');
const metamask = require('./metamask');
const keplr = require('./keplr');
const helpers = require('../helpers');

module.exports = {
  async resetState() {
    log('Resetting state of synpress');
    await playwright.resetState();
    await metamask.resetState();
    await keplr.resetState();
    await helpers.resetState();
  },
};
