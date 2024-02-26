module.exports = (on, config) => {
  const extension = process.env.EXTENSION;
  let selectedConfig;
  if (extension === 'metamask') {
    selectedConfig = require('./metamask-plugin');
  } else {
    selectedConfig = require('./keplr-plugin');
  }

  return selectedConfig(on, config);
};
