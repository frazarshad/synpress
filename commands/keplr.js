const log = require('debug')('synpress:keplr');
const playwright = require('./playwright');
const {
  onboardingWelcomePageElements,
  firstTimeFlowImportPageElements,
} = require('../pages/keplr/first-time-flow-page');

const {
  permissionsPageElements,
  notificationPageElements,
} = require('../pages/keplr/notification-page');

let extensionId;
let extensionVersion;
let extensionHomeUrl;
let extensionSettingsUrl;
let extensionAdvancedSettingsUrl;
let extensionExperimentalSettingsUrl;
let extensionAddNetworkUrl;
let extensionNewAccountUrl;
let extensionImportAccountUrl;
let extensionImportTokenUrl;

const keplr = {
  async getExtensionDetails() {
    const metamaskExtensionData = (await playwright.getExtensionsData()).keplr;

    extensionId = metamaskExtensionData.id;
    extensionVersion = metamaskExtensionData.version;
    extensionHomeUrl = `chrome-extension://${extensionId}/home.html`;
    extensionSettingsUrl = `${extensionHomeUrl}#settings`;
    extensionAdvancedSettingsUrl = `${extensionSettingsUrl}/advanced`;
    extensionExperimentalSettingsUrl = `${extensionSettingsUrl}/experimental`;
    extensionAddNetworkUrl = `${extensionSettingsUrl}/networks/add-network`;
    extensionNewAccountUrl = `${extensionHomeUrl}#new-account`;
    extensionImportAccountUrl = `${extensionNewAccountUrl}/import`;
    extensionImportTokenUrl = `${extensionHomeUrl}#import-token`;

    return {
      extensionId,
      extensionVersion,
      extensionSettingsUrl,
      extensionAdvancedSettingsUrl,
      extensionExperimentalSettingsUrl,
      extensionAddNetworkUrl,
      extensionNewAccountUrl,
      extensionImportAccountUrl,
      extensionImportTokenUrl,
    };
  },
  async importWallet(secretWords, password) {
    await playwright.waitAndClickByText(
      onboardingWelcomePageElements.createWalletButton,
      await playwright.metamaskWindow(),
    );
    await playwright.waitAndClickByText(
      onboardingWelcomePageElements.importRecoveryPhraseButton,
      await playwright.metamaskWindow(),
    );
    await playwright.waitAndClickByText(
      onboardingWelcomePageElements.useRecoveryPhraseButton,
      await playwright.metamaskWindow(),
    );
    // await module.exports.optOutAnalytics();
    await playwright.waitAndClickByText(
      firstTimeFlowImportPageElements.phraseCount24,
      await playwright.metamaskWindow(),
    );
    // todo: add support for more secret words (15/18/21/24)
    for (const [index, word] of secretWords.split(' ').entries()) {
      await playwright.waitAndTypeByLocator('textbox', word, index);
    }
    await playwright.waitAndClick(
      'button[type="submit"]',
      await playwright.metamaskWindow(),
    );
    // :focus =  wait for element to be in focus beforce typing
    await playwright.waitAndType('input[name="name"]:focus', 'My wallet');
    await playwright.waitAndType(
      firstTimeFlowImportPageElements.passwordInput,
      password,
    );
    await playwright.waitAndType(
      firstTimeFlowImportPageElements.confirmPasswordInput,
      password,
    );
    await playwright.waitAndClick(
      'button[type="submit"]',
      await playwright.metamaskWindow(),
      { number: 1 },
    );
    await playwright.waitForByText(
      'Select Chains',
      await playwright.metamaskWindow(),
    );
    await playwright.waitAndClick(
      'button[type="button"]',
      await playwright.metamaskWindow(),
    );
    await playwright.waitForByText(
      'Account Created!',
      await playwright.metamaskWindow(),
    );
    await playwright.waitAndClick(
      'button[type="button"]',
      await playwright.metamaskWindow(),
      { dontWait: true },
    );
    return true;
  },
  async acceptAccess(options) {
    const notificationPage = await playwright.switchToMetamaskNotification();
    console.log(options);
    if (options && options.allAccounts) {
      await playwright.waitAndClick(
        notificationPageElements.selectAllCheckbox,
        notificationPage,
      );
    }
    // await playwright.waitAndClick(
    //   notificationPageElements.nextButton,
    //   notificationPage,
    //   { waitForEvent: 'navi' },
    // );

    if (options && options.signInSignature) {
      log(
        [
          '[deprecation-warning]: `options.signInSignature` is no longer used will be deprecated soon',
          'Use `options.confirmSignatureRequest` or `options.confirmDataSignatureRequest`',
        ].join('\n'),
      );
    }

    if (
      options &&
      (options.signInSignature || options.confirmSignatureRequest)
    ) {
      await playwright.waitAndClick(
        permissionsPageElements.connectButton,
        notificationPage,
        { waitForEvent: 'navi' },
      );
      await module.exports.confirmSignatureRequest();
      return true;
    }

    if (options && options.confirmDataSignatureRequest) {
      await playwright.waitAndClick(
        permissionsPageElements.connectButton,
        notificationPage,
        { waitForEvent: 'navi' },
      );
      await module.exports.confirmDataSignatureRequest();
      return true;
    }

    await playwright.waitAndClick(
      permissionsPageElements.approveButton,
      notificationPage,
      { waitForEvent: 'close' },
    );
    return true;
  },
};

module.exports = keplr;
