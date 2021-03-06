// const resetDb = require('../lib/reset_db.js');


module.exports = {
/* #AddExpenseFlow
   // Commented out since we are disabling that flow right now

  '@tags': ['create_expense'],
  beforeEach: (client) => {
    resetDb(client)
    // login
      .url('http://localhost:3030/login')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=email]', 'testuser@opencollective.com')
      .setValue('input[type=password]', 'password')
      .click('button[type=submit]')
      .pause(2000)

      // check main page
      .assert.containsText('body', 'My collectives')

      // select a collective
      .click('div[class=GroupLink]')
      .pause(1000)
      .assert.containsText('body', 'CURRENT BALANCE')

      // click on footer
      .click('div[class=Footer-addButton]')
      .pause(1000)
      .waitForElementVisible('div[class=PopOverMenu-group]', 1000)
      .assert.containsText('div[class=PopOverMenu-group]', 'Add expense')
      // click on 'Submit Expense'
      .click('.js-transactionNewLink')
      .pause(2000)
      .assert.containsText('body', 'Submit Expense')
      .assert.urlContains('http://localhost:3030/groups/1/transactions/new');
  },

  'Submits an expense': (client) => {
    const description = 'Day out in tahoe';
    const amount = 10;

    client
      .assert.containsText('body', 'Submit Expense')
      .setValue('.js-transaction-description input', description)
      .setValue('.js-transaction-amount input', amount)
      .submitForm('form.TransactionForm-form')
      .pause(1000)
      .assert.urlContains('groups/1/transactions')
      .assert.containsText('.Transaction', description.toUpperCase())
      .end();
  },

  'Shows an error message if an empty form is submitted': (client) => {
    client
      .assert.containsText('body', 'Submit Expense')
      .submitForm('form.TransactionForm-form')
      .pause(1000)
      .assert.urlContains('groups/1/transactions/new')
      .assert.containsText('.Notification', '"Description" is not allowed to be empty')
      .end();
  }
  */
};
