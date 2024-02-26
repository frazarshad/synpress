/* eslint-disable ui-testing/no-disabled-tests */
describe('Keplr', () => {
  context('Test commands', () => {
    it(`setupKeplr should finish Keplr setup using secret words`, () => {
      cy.setupKeplr(
        'orbit bench unit task food shock brand bracket domain regular warfare company announce wheel grape trust sphere boy doctor half guard ritual three ecology',
        'sepolia',
        'Tester@1234',
      ).then(setupFinished => {
        expect(setupFinished).to.be.true;
      });
    });

    it(`acceptKeplrAccess should accept connection request to Keplr`, () => {
      cy.visit('/');
      cy.contains('Connect Wallet').click();
      cy.acceptKeplrAccess().then(connected => {
        expect(connected).to.be.true;
      });
      cy.get('.card')
        .contains('My Wallet')
        .then(p => console.log(p));

      cy.contains('agoric1p2aqakv3ulz4qfy2nut86j9gx0dx0yw09h96md');
    });

    it(`confirmKeplrTransaction should confirm transaction for token creation (contract deployment) and check tx data`, () => {
      cy.contains('Make an Offer').click();
      cy.confirmKeplrTransaction().then(txData => {
        expect(txData.confirmed).to.be.true;
      });
    });
  });
});
