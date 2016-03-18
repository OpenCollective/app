const config = require('config');
const resetDb = require('../lib/reset_db.js');

module.exports = {
  '@tags': ['approve_transaction'],
  beforeEach: (client) => {
    const description = `Day out in tahoe ${Math.random()}`;
    const amount = 10;

    resetDb(client)
      // login
      .url(`${config.host.app}/login`)
      .waitForElementVisible('body', 1000)
      .setValue('input[type=email]', 'testuser@opencollective.com')
      .setValue('input[type=password]', 'password')
      .click('button[type=submit]')
      .pause(1000)

      // submit transaction
      .url(`${config.host.app}/groups/1/transactions/new`)
      .setValue('.js-transaction-description input', description)
      .setValue('.js-transaction-amount input', amount)
      .waitForElementVisible("option[value='manual']", 1000)
      .click("option[value='manual']")
      .submitForm('form.TransactionForm-form')
      .waitForElementVisible('.Transaction', 1000)
      .waitForElementVisible('.Export-link', 1000);
  },

  'Approves an expense': (client) => {
    client
      .click('.Transaction')
      .waitForElementVisible('.Button--approve', 1000)
      .assert.containsText('body', 'APPROVE')
      .click('.Button--approve')
      .waitForElementVisible('.Transaction', 2000)
      .pause(1000) // wait for transaction
      .assert.urlEquals(`${config.host.app}/groups/1/transactions`)
      .assert.containsText('.Transaction:first-child', 'Reimbursed')
      .end();
  }
};