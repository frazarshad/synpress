const log = require('debug')('synpress:metamask');
const playwright = require('./playwrightKeplr');
const { onboardingElements } = require('../pages/keplr/first-time-flow-page');

let extensionId;
let extensionVersion;
let extensionImportAccountUrl;

const keplr = {
  async resetState() {
    log('Resetting state of keplr');
    extensionId = undefined;
    extensionVersion = undefined;
    extensionImportAccountUrl = undefined;
    switchBackToCypressWindow = undefined;
  },
  extensionId: () => {
    return extensionId;
  },
  extensionUrls: () => {
    return {
      extensionImportAccountUrl,
    };
  },

  async getExtensionDetails() {
    const keplrExtensionData = (await playwright.getExtensionsData()).keplr;

    extensionId = keplrExtensionData.id;
    extensionVersion = keplrExtensionData.version;
    extensionImportAccountUrl = `${extensionNewAccountUrl}/register.html`;

    return {
      extensionId,
      extensionVersion,
      extensionImportAccountUrl,
    };
  },

  async importWallet(secretWords, password) {
    await playwright.waitAndClickByText(
      onboardingElements.createWalletButton,
      await playwright.keplrWindow(),
    );
    await playwright.waitAndClickByText(
      onboardingElements.importRecoveryPhraseButton,
      await playwright.keplrWindow(),
    );
    await playwright.waitAndClickByText(
      onboardingElements.useRecoveryPhraseButton,
      await playwright.keplrWindow(),
    );
    await playwright.waitAndClickByText(
      onboardingElements.phraseCount24,
      await playwright.keplrWindow(),
    );

    for (const [index, word] of secretWords.split(' ').entries()) {
      await playwright.waitAndTypeByLocator(
        onboardingElements.textAreaSelector,
        word,
        index,
      );
    }

    await playwright.waitAndClick(
      onboardingElements.submitPhraseButton,
      await playwright.keplrWindow(),
    );

    await playwright.waitAndType(
      onboardingElements.walletInput,
      onboardingElements.walletName,
    );
    await playwright.waitAndType(onboardingElements.passwordInput, password);
    await playwright.waitAndType(
      onboardingElements.confirmPasswordInput,
      password,
    );

    await playwright.waitAndClick(
      onboardingElements.submitWalletDataButton,
      await playwright.keplrWindow(),
      { number: 1 },
    );

    await playwright.waitForByText(
      onboardingElements.phraseSelectChain,
      await playwright.keplrWindow(),
    );

    await playwright.waitAndClick(
      onboardingElements.submitChainButton,
      await playwright.keplrWindow(),
    );

    await playwright.waitForByText(
      onboardingElements.phraseAccountCreated,
      await playwright.keplrWindow(),
    );

    await playwright.waitAndClick(
      onboardingElements.finishButton,
      await playwright.keplrWindow(),
      { dontWait: true },
    );

    return true;
  },

  async initialSetup(
    playwrightInstance,
    {
      secretWordsOrPrivateKey,
      network,
      password,
      enableAdvancedSettings,
      enableExperimentalSettings,
    },
  ) {
    if (playwrightInstance) {
      await playwright.init(playwrightInstance);
    } else {
      await playwright.init();
    }

    await playwright.assignWindows();
    await playwright.assignActiveTabName('keplr');
    await module.exports.getExtensionDetails();
    await module.exports.importWallet(secretWordsOrPrivateKey, password);
  },

  
};

module.exports = keplr;
