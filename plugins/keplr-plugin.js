const helpers = require('../helpers');
const playwright = require('../commands/playwrightKeplr');
const keplr = require('../commands/keplr');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  on('before:browser:launch', async (browser = {}, arguments_) => {
    if (browser.name === 'chrome') {
      // metamask welcome screen blocks cypress from loading
      arguments_.args.push(
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      );
      if (process.env.CI) {
        // Avoid: "dri3 extension not supported" error
        arguments_.args.push('--disable-gpu');
      }
      if (process.env.HEADLESS_MODE) {
        arguments_.args.push('--headless=new');
      }
      if (browser.isHeadless) {
        arguments_.args.push('--window-size=1920,1080');
      }
    }

    if (!process.env.SKIP_METAMASK_INSTALL) {
      // NOTE: extensions cannot be loaded in headless Chrome
      const metamaskPath = await helpers.prepareMetamask(
        process.env.METAMASK_VERSION || '10.25.0',
      );
      arguments_.extensions.push(metamaskPath);
    }

    return arguments_;
  });

  on('task', {
    error(message) {
      console.error('\u001B[31m', 'ERROR:', message, '\u001B[0m');
      return true;
    },
    warn(message) {
      console.warn('\u001B[33m', 'WARNING:', message, '\u001B[0m');
      return true;
    },
    // playwright commands for Keplr
    initPlaywright: playwright.init,
    assignWindows: playwright.assignWindows,
    assignActiveTabName: playwright.assignActiveTabName,
    isKeplrWindowActive: playwright.isKeplrWindowActive,
    switchToCypressWindow: playwright.switchToCypressWindow,
    clearPlaywright: playwright.clear,
    clearWindows: playwright.clearWindows,
    isCypressWindowActive: playwright.isCypressWindowActive,
    switchToKeplrWindow: playwright.switchToKeplrWindow,

    // keplr commands
    importKeplrAccount: keplr.importWallet,
    acceptKeplrAccess: keplr.acceptAccess,
    confirmKeplrTransaction: keplr.confirmTransaction,
    setupKeplr: async ({
      secretWordsOrPrivateKey,
      network,
      password,
      enableAdvancedSettings,
      enableExperimentalSettings,
    }) => {
      await keplr.initialSetup(null, {
        secretWordsOrPrivateKey,
        network,
        password,
        enableAdvancedSettings,
        enableExperimentalSettings,
      });
      return true;
    },
  });

  return config;
};
