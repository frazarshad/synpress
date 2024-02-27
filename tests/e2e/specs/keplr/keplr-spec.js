/* eslint-disable ui-testing/no-disabled-tests */
describe('Keplr', () => {
  context('Test commands', () => {
    it(`setupKeplr should finish Keplr setup using secret words`, () => {
      cy.setupKeplr().then(setupFinished => {
        expect(setupFinished).to.be.true;
      });
    });

    it(`acceptKeplrAccess should accept connection request to Keplr`, () => {
      cy.visit('/');
      cy.contains('Connect Wallet').click();
      cy.acceptKeplrAccess().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });
      cy.get('.card')
        .contains('My Wallet')
        .then(p => console.log(p));

      cy.contains('agoric1p2aqakv3ulz4qfy2nut86j9gx0dx0yw09h96md');
    });

    it(`confirmKeplrTransaction should confirm transaction for token creation (contract deployment) and check tx data`, () => {
      cy.contains('Make an Offer').click();
      cy.confirmKeplrTransaction().then(taskCompleted => {
        expect(taskCompleted).to.be.true;
      });
    });
  });
});
