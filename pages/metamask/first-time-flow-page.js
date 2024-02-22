const onboardingFlow = '.onboarding-flow';
const metametricsPage = `${onboardingFlow} [data-testid="onboarding-metametrics"]`;
const optOutAnalyticsButton = `${metametricsPage} [data-testid="metametrics-no-thanks"]`;
module.exports.metametricsPageElements = {
  metametricsPage,
  optOutAnalyticsButton,
};

const app = '#app-content .app';
const onboardingWelcomePage = `${onboardingFlow} [data-testid="onboarding-welcome"]`;
const importWalletButton = 'Import an existing wallet';
const createWalletButton = 'Create a new wallet';
const importRecoveryPhraseButton = 'Import existing recovery phrase';
const useRecoveryPhraseButton = 'Use recovery phrase or private key';
module.exports.onboardingWelcomePageElements = {
  app,
  onboardingWelcomePage,
  importWalletButton,
  createWalletButton,
  importRecoveryPhraseButton,
  useRecoveryPhraseButton,
};

const firstTimeFlowImportPage = `${onboardingFlow} [data-testid="import-srp"]`;
const secretWordsInput = number =>
  `${firstTimeFlowImportPage} [data-testid="import-srp__srp-word-${number}"]`;
const confirmSecretRecoverPhraseButton = 'Import';
const phraseCount24 = '24 words';

const createPasswordPage = `${onboardingFlow} [data-testid="create-password"]`;
const passwordInput = 'input[name="password"]';
const confirmPasswordInput = 'input[name="confirmPassword"]';
const termsCheckbox = `${createPasswordPage} [data-testid="create-password-terms"]`;
const importButton = `${createPasswordPage} [data-testid="create-password-import"]`;
const createButton = `${createPasswordPage} [data-testid="create-password-wallet"]`;
module.exports.firstTimeFlowImportPageElements = {
  firstTimeFlowImportPage,
  secretWordsInput,
  confirmSecretRecoverPhraseButton,
  createPasswordPage,
  passwordInput,
  confirmPasswordInput,
  termsCheckbox,
  importButton,
  createButton,
  phraseCount24,
};

const secureYourWalletPage = '[data-testid="seed-phrase-intro"]';
const nextButton = `${secureYourWalletPage} button`;
module.exports.secureYourWalletPageElements = {
  secureYourWalletPage,
  nextButton,
};

const revealSeedPage = '[data-testid="secure-your-wallet"]';
const remindLaterButton = `${revealSeedPage} [data-testid="secure-wallet-later"]`;
const skipBackupCheckbox = `[data-testid="skip-srp-backup-popover-checkbox"]`;
const confirmSkipBackupButton = `[data-testid="skip-srp-backup"]`;
module.exports.revealSeedPageElements = {
  revealSeedPage,
  remindLaterButton,
  skipBackupCheckbox,
  confirmSkipBackupButton,
};

const endOfFlowPage = `${onboardingFlow} [data-testid="creation-successful"]`;
const allDoneButton = `${endOfFlowPage} [data-testid="onboarding-complete-done"]`;
module.exports.endOfFlowPageElements = {
  endOfFlowPage,
  allDoneButton,
};

const pinExtensionPage = `${onboardingFlow} [data-testid="onboarding-pin-extension"]`;
const nextTabButton = `${pinExtensionPage} [data-testid="pin-extension-next"]`;
const doneButton = `${pinExtensionPage} [data-testid="pin-extension-done"]`;
module.exports.pinExtensionPageElements = {
  pinExtensionPage,
  nextTabButton,
  doneButton,
};
