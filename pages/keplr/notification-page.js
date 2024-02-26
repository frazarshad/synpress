const approveButton = `button[type="button"]`;
const recipientButton = 'button[type="button"]';
const popupContainer = '.popover-container';
const recipientPublicAddress = `${popupContainer} .nickname-popover__public-address__constant`;
const popupCloseButton = `${popupContainer} .popover-header__button`;
const notificationPage = '.notification';
const confirmPageHeader = `${notificationPage} .confirm-page-container-header`;
const networkLabel = `${confirmPageHeader} .network-display`;

module.exports.notificationPageElements = {
  approveButton,
  recipientButton,
  recipientPublicAddress,
  popupCloseButton,
  networkLabel,
};
