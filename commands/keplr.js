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

  async confirmSignatureRequest() {
    const notificationPage = await playwright.switchToKeplrNotification();
    if (
      (await playwright
        .keplrNotificationWindow()
        .locator(signaturePageElements.signatureRequestScrollDownButton)
        .count()) > 0
    ) {
      await playwright.waitAndClick(
        signaturePageElements.signatureRequestScrollDownButton,
        notificationPage,
      );
    }
    await playwright.waitAndClick(
      signaturePageElements.confirmSignatureRequestButton,
      notificationPage,
      { waitForEvent: 'close' },
    );
    return true;
  },

  async confirmDataSignatureRequest() {
    const notificationPage = await playwright.switchToKeplrNotification();
    if (
      (await playwright
        .keplrNotificationWindow()
        .locator(signaturePageElements.signatureRequestScrollDownButton)
        .count()) > 0
    ) {
      await playwright.waitAndClick(
        signaturePageElements.signatureRequestScrollDownButton,
        notificationPage,
      );
    }
    await playwright.waitAndClick(
      dataSignaturePageElements.confirmDataSignatureRequestButton,
      notificationPage,
      { waitForEvent: 'close' },
    );
    return true;
  },

  async acceptAccess(options) {
    const notificationPage = await playwright.switchToKeplrNotification();

    if (options && options.allAccounts) {
      await playwright.waitAndClick(
        notificationPageElements.selectAllCheckbox,
        notificationPage,
      );
    }

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

  async confirmTransaction(gasConfig) {
    let txData = {};
    const notificationPage = await playwright.switchToKeplrNotification();
    if (gasConfig) {
      log(
        '[confirmTransaction] gasConfig is present, determining transaction type..',
      );
      if (
        (await playwright
          .keplrNotificationWindow()
          .locator(confirmPageElements.editGasFeeLegacyButton)
          .count()) > 0
      ) {
        log('[confirmTransaction] Looks like legacy tx');
        if (typeof gasConfig === 'object') {
          log('[confirmTransaction] Editing legacy tx..');
          await playwright.waitAndClick(
            confirmPageElements.editGasFeeLegacyButton,
            notificationPage,
          );
          if (
            (await playwright
              .keplrNotificationWindow()
              .locator(confirmPageElements.editGasFeeLegacyOverrideAckButton)
              .count()) > 0
          ) {
            log(
              '[confirmTransaction] Override acknowledgement modal is present, closing..',
            );
            await playwright.waitAndClick(
              confirmPageElements.editGasFeeLegacyOverrideAckButton,
              notificationPage,
            );
          }
          if (gasConfig.gasLimit) {
            log('[confirmTransaction] Changing gas limit..');
            await playwright.waitAndSetValue(
              gasConfig.gasLimit.toString(),
              confirmPageElements.gasLimitLegacyInput,
              notificationPage,
            );
          }
          if (gasConfig.gasPrice) {
            log('[confirmTransaction] Changing gas price..');
            await playwright.waitAndSetValue(
              gasConfig.gasPrice.toString(),
              confirmPageElements.gasPriceLegacyInput,
              notificationPage,
            );
          }
          await playwright.waitAndClick(
            confirmPageElements.saveCustomGasFeeButton,
            notificationPage,
          );
        } else {
          log(
            "[confirmTransaction] Legacy tx doesn't support eip-1559 fees (low, market, aggressive, site), using default values..",
          );
        }
      } else {
        log('[confirmTransaction] Looks like eip-1559 tx');
        await playwright.waitAndClick(
          confirmPageElements.editGasFeeButton,
          notificationPage,
        );
        if (typeof gasConfig === 'string') {
          if (gasConfig === 'low') {
            log('[confirmTransaction] Changing gas fee to low..');
            await playwright.waitAndClick(
              confirmPageElements.gasOptionLowButton,
              notificationPage,
            );
          } else if (gasConfig === 'market') {
            log('[confirmTransaction] Changing gas fee to market..');
            await playwright.waitAndClick(
              confirmPageElements.gasOptionMediumButton,
              notificationPage,
            );
          } else if (gasConfig === 'aggressive') {
            log('[confirmTransaction] Changing gas fee to aggressive..');
            await playwright.waitAndClick(
              confirmPageElements.gasOptionHighButton,
              notificationPage,
            );
          } else if (gasConfig === 'site') {
            log('[confirmTransaction] Changing gas fee to site suggested..');
            await playwright.waitAndClick(
              confirmPageElements.gasOptionDappSuggestedButton,
              notificationPage,
            );
          }
        } else {
          log('[confirmTransaction] Editing eip-1559 tx..');
          await playwright.waitAndClick(
            confirmPageElements.gasOptionCustomButton,
            notificationPage,
          );
          if (gasConfig.gasLimit) {
            log('[confirmTransaction] Changing gas limit..');
            await playwright.waitAndClick(
              confirmPageElements.editGasLimitButton,
              notificationPage,
            );
            await playwright.waitAndSetValue(
              gasConfig.gasLimit.toString(),
              confirmPageElements.gasLimitInput,
              notificationPage,
            );
          }
          if (gasConfig.baseFee) {
            log('[confirmTransaction] Changing base fee..');
            await playwright.waitAndSetValue(
              gasConfig.baseFee.toString(),
              confirmPageElements.baseFeeInput,
              notificationPage,
            );
          }
          if (gasConfig.priorityFee) {
            log('[confirmTransaction] Changing priority fee..');
            await playwright.waitAndSetValue(
              gasConfig.priorityFee.toString(),
              confirmPageElements.priorityFeeInput,
              notificationPage,
            );
          }
          await playwright.waitAndClick(
            confirmPageElements.saveCustomGasFeeButton,
            notificationPage,
          );
        }
      }
    }
    log('[confirmTransaction] Checking if recipient address is present..');
    console.log(
      'hmm',
      await playwright
        .keplrNotificationWindow()
        .locator(confirmPageElements.recipientButton)
        .count(),
    );
    if (
      (await playwright
        .keplrNotificationWindow()
        .locator(confirmPageElements.recipientButton)
        .count()) > 0
    ) {
      log('[confirmTransaction] Getting recipient address..');

      const tooltip = undefined;

      // Handles the case where the recipient address is saved and has a "nickname".
      if (tooltip === 'tippy-tooltip-2') {
        txData.recipientPublicAddress = await playwright.waitAndGetValue(
          confirmPageElements.recipientButton,
          notificationPage,
        );
      } else {
        await playwright.waitAndClick(
          confirmPageElements.recipientButton,
          notificationPage,
        );
        txData.recipientPublicAddress = await playwright.waitAndGetValue(
          recipientPopupElements.recipientPublicAddress,
          notificationPage,
        );
        await playwright.waitAndClick(
          recipientPopupElements.popupCloseButton,
          notificationPage,
        );
      }
    }
    log('[confirmTransaction] Checking if network name is present..');
    if (
      (await playwright
        .keplrNotificationWindow()
        .locator(confirmPageElements.networkLabel)
        .count()) > 0
    ) {
      log('[confirmTransaction] Getting network name..');
      txData.networkName = await playwright.waitAndGetValue(
        confirmPageElements.networkLabel,
        notificationPage,
      );
    }
    // todo: handle setting of custom nonce here
    log('[confirmTransaction] Getting transaction nonce..');

    log('[confirmTransaction] Confirming transaction..');
    await playwright.waitAndClick(
      confirmPageElements.recipientButton,
      notificationPage,
      { waitForEvent: 'close' },
    );
    txData.confirmed = true;
    log('[confirmTransaction] Transaction confirmed!');
    return txData;
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
