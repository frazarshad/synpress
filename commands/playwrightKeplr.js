const log = require('debug')('synpress:playwright');
const fetch = require('node-fetch');
const _ = require('underscore');

let browser;
let mainWindow;
let keplrWindow;
let activeTabName;
let extensionsData = {};

module.exports = {
  async resetState() {
    log('Resetting state of playwright');
    browser = undefined;
    mainWindow = undefined;
    keplrWindow = undefined;
    activeTabName = undefined;
    extensionsData = {};
  },

  async init(playwrightInstance) {
    const chromium = playwrightInstance
      ? playwrightInstance
      : require('@playwright/test').chromium;
    const debuggerDetails = await fetch('http://127.0.0.1:9222/json/version'); //DevSkim: ignore DS137138
    const debuggerDetailsConfig = await debuggerDetails.json();
    const webSocketDebuggerUrl = debuggerDetailsConfig.webSocketDebuggerUrl;
    if (process.env.SLOW_MODE) {
      if (!isNaN(process.env.SLOW_MODE)) {
        browser = await chromium.connectOverCDP(webSocketDebuggerUrl, {
          slowMo: Number(process.env.SLOW_MODE),
        });
      } else {
        browser = await chromium.connectOverCDP(webSocketDebuggerUrl, {
          slowMo: 50,
        });
      }
    } else {
      browser = await chromium.connectOverCDP(webSocketDebuggerUrl);
    }
    return browser.isConnected();
  },

  async assignWindows() {
    const keplrExtensionData = (await module.exports.getExtensionsData()).keplr;

    let pages = await browser.contexts()[0].pages();

    for (const page of pages) {
      if (page.url().includes('specs/runner')) {
        mainWindow = page;
      } else if (
        page
          .url()
          .includes(`chrome-extension://${keplrExtensionData.id}/register.html`)
      ) {
        keplrWindow = page;
      }
    }
    return true;
  },
  async assignActiveTabName(tabName) {
    activeTabName = tabName;
    return true;
  },

  async isKeplrWindowActive() {
    return activeTabName === 'keplr';
  },
  async switchToCypressWindow() {
    if (mainWindow) {
      await mainWindow.bringToFront();
      await module.exports.assignActiveTabName('cypress');
    }
    return true;
  },

  async clear() {
    browser = null;
    return true;
  },

  async clearWindows() {
    mainWindow = null;
    keplrWindow = null;
    return true;
  },

  async isCypressWindowActive() {
    return activeTabName === 'cypress';
  },

  async switchToKeplrWindow() {
    await keplrWindow.bringToFront();
    await module.exports.assignActiveTabName('keplr');
    return true;
  },

  async waitFor(selector, page = keplrWindow, number = 0) {
    await module.exports.waitUntilStable(page);
    await page.waitForSelector(selector, { strict: false });
    const element = page.locator(selector).nth(number);
    await element.waitFor();
    await element.focus();
    if (process.env.STABLE_MODE) {
      if (!isNaN(process.env.STABLE_MODE)) {
        await page.waitForTimeout(Number(process.env.STABLE_MODE));
      } else {
        await page.waitForTimeout(300);
      }
    }
    return element;
  },
  async waitForByText(text, page = keplrWindow) {
    await module.exports.waitUntilStable(page);
    // await page.waitForSelector(selector, { strict: false });
    const element = page.getByText(text).first();
    await element.waitFor();
    await element.focus();
    if (process.env.STABLE_MODE) {
      if (!isNaN(process.env.STABLE_MODE)) {
        await page.waitForTimeout(Number(process.env.STABLE_MODE));
      } else {
        await page.waitForTimeout(300);
      }
    }
    return element;
  },

  async waitAndClick(selector, page = keplrWindow, args = {}) {
    const element = await module.exports.waitFor(
      selector,
      page,
      args.number || 0,
    );
    if (args.numberOfClicks && !args.waitForEvent) {
      await element.click({
        clickCount: args.numberOfClicks,
        force: args.force,
      });
    } else if (args.numberOfClicks && args.waitForEvent) {
      await Promise.all([
        page.waitForEvent(args.waitForEvent),
        element.click({ clickCount: args.numberOfClicks, force: args.force }),
      ]);
    } else if (args.waitForEvent) {
      if (args.waitForEvent.includes('navi')) {
        await Promise.all([
          page.waitForNavigation(),
          element.click({ force: args.force }),
        ]);
      } else {
        await Promise.all([
          page.waitForEvent(args.waitForEvent),
          element.click({ force: args.force }),
        ]);
      }
    } else {
      await element.click({ force: args.force });
    }
    await module.exports.waitUntilStable();
    return element;
  },

  async waitForByRole(role, number = 0, page = keplrWindow) {
    await module.exports.waitUntilStable(page);
    // await page.waitForSelector(selector, { strict: false });
    const element = page.getByRole(role).nth(number);
    await element.waitFor();
    await element.focus();
    if (process.env.STABLE_MODE) {
      if (!isNaN(process.env.STABLE_MODE)) {
        await page.waitForTimeout(Number(process.env.STABLE_MODE));
      } else {
        await page.waitForTimeout(300);
      }
    }
    return element;
  },

  async waitAndType(selector, value, page = keplrWindow) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    const element = await module.exports.waitFor(selector, page);
    await element.type(value);
    await module.exports.waitUntilStable(page);
  },

  async waitAndTypeByLocator(selector, value, number = 0, page = keplrWindow) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    const element = await module.exports.waitForByRole(selector, number, page);
    await element.type(value);
    await module.exports.waitUntilStable(page);
  },

  async waitUntilStable(page) {
    const metamaskExtensionData = (await module.exports.getExtensionsData())
      .keplr;

    if (
      page &&
      page
        .url()
        .includes(
          `chrome-extension://${metamaskExtensionData.id}/register.html`,
        )
    ) {
      await page.waitForLoadState('load');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForLoadState('networkidle');
    }
    await keplrWindow.waitForLoadState('load');
    await keplrWindow.waitForLoadState('domcontentloaded');
    await keplrWindow.waitForLoadState('networkidle');

    if (mainWindow) {
      await mainWindow.waitForLoadState('load');
      await mainWindow.waitForLoadState('domcontentloaded');
      // todo: this may slow down tests and not be necessary but could improve stability
      // await mainWindow.waitForLoadState('networkidle');
    }
  },

  keplrWindow() {
    return keplrWindow;
  },

  async getExtensionsData() {
    if (!_.isEmpty(extensionsData)) {
      return extensionsData;
    }

    const context = await browser.contexts()[0];
    const page = await context.newPage();

    await page.goto('chrome://extensions');
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');

    const devModeButton = page.locator('#devMode');
    await devModeButton.waitFor();
    await devModeButton.focus();
    await devModeButton.click();

    const extensionDataItems = await page.locator('extensions-item').all();
    for (const extensionData of extensionDataItems) {
      const extensionName = (
        await extensionData
          .locator('#name-and-version')
          .locator('#name')
          .textContent()
      ).toLowerCase();

      const extensionVersion = (
        await extensionData
          .locator('#name-and-version')
          .locator('#version')
          .textContent()
      ).replace(/(\n| )/g, '');

      const extensionId = (
        await extensionData.locator('#extension-id').textContent()
      ).replace('ID: ', '');

      extensionsData[extensionName] = {
        version: extensionVersion,
        id: extensionId,
      };
    }
    await page.close();

    return extensionsData;
  },
};
