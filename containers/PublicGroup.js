import React, { Component } from 'react';

import { connect } from 'react-redux';
import { pushState } from 'redux-router';
import BodyClassName from 'react-body-classname';
import take from 'lodash/array/take';
import uniq from 'lodash/array/uniq';
import values from 'lodash/object/values';
import sortBy from 'lodash/collection/sortBy'

import convertToCents from '../lib/convert_to_cents';
import filterCollection from '../lib/filter_collection';
import formatCurrency from '../lib/format_currency';

import roles from '../constants/roles';
import PublicTopBar from '../components/PublicTopBar';
import Notification from '../components/Notification';
import PublicFooter from '../components/PublicFooter';
import PublicGroupForm from '../components/PublicGroupForm';
import PublicGroupThanks from '../components/PublicGroupThanks';
import TransactionItem from '../components/TransactionItem';
import YoutubeVideo from '../components/YoutubeVideo';
import Metric from '../components/Metric';
import UsersList from '../components/UsersList';
import ShareIcon from '../components/ShareIcon';
import Icon from '../components/Icon';
import DisplayUrl from '../components/DisplayUrl';
import PublicGroupSignup from '../components/PublicGroupSignup';
import Markdown from '../components/Markdown';

import appendDonationForm from '../actions/form/append_donation';
import fetchGroup from '../actions/groups/fetch_by_id';
import fetchUsers from '../actions/users/fetch_by_group';
import fetchTransactions from '../actions/transactions/fetch_by_group';
import donate from '../actions/groups/donate';
import notify from '../actions/notification/notify';
import resetNotifications from '../actions/notification/reset';
import showAdditionalUserInfoForm from '../actions/users/show_additional_user_info_form';
import hideAdditionalUserInfoForm from '../actions/users/hide_additional_user_info_form';
import appendProfileForm from '../actions/form/append_profile';
import updateUser from '../actions/users/update_user';
import validateDonationProfile from '../actions/form/validate_donation_profile';
import logout from '../actions/session/logout';

// Number of expenses and revenue items to show on the public page
const NUM_TRANSACTIONS_TO_SHOW = 3;

export class PublicGroup extends Component {

  GroupVideoOrImage(group) {
    if(group.video) {
      return (
        <div className='PublicGroup-video'>
          <YoutubeVideo video={group.video} />
        </div>
      );
    }
    else {
      return (
        <div className='PublicGroup-image'>
          <img src={group.image} />
        </div>
      );
    }
  }

  render() {
    const {
      group,
      showThankYouPage,
      amount,
      backers,
      donations,
      expenses,
      shareUrl,
      users,
      members,
      showUserForm,
      isAuthenticated
    } = this.props;

    const logoStyle = group.logo ? {
      backgroundImage: 'url(' + group.logo + ')'
    } : {};

    var donationSection;
    if (showThankYouPage || (isAuthenticated && showUserForm)) { // we don't handle donations from loggedin users
      donationSection = <PublicGroupThanks />;
    } else if (showUserForm) {
      donationSection = <PublicGroupSignup {...this.props} />
    } else {
      donationSection = <PublicGroupForm {...this.props} onToken={donateToGroup.bind(this, amount)} />
    }

    return (
      <BodyClassName className='Public'>
        <div className='PublicGroup'>

          <PublicTopBar session={this.props.session} logout={logoutAndRedirect.bind(this)} />
          <Notification {...this.props} />

          <div className='PublicContent'>

            <div className='PublicGroupHeader'>
              <div className='PublicGroupHeader-logo' style={logoStyle} />
              <div className='PublicGroupHeader-website'><DisplayUrl url={group.website} /></div>
              <div className='PublicGroupHeader-description'>
                {group.description}
              </div>
            </div>

            {this.GroupVideoOrImage(group)}

            <div className='PublicGroup-summary'>
              <div className='PublicGroup-metricContainer'>
                <Metric
                  label='Funds Available'
                  value={formatCurrency(group.balance, group.currency, {precision: 0})} />
                <Metric
                  label='Backers'
                  value={group.backersCount} />
              </div>
              <a className='Button Button--green PublicGroup-support' href='#support'>
                Back us
              </a>
              <div className='PublicGroup-share'>
                  <ShareIcon type='twitter' url={shareUrl} name={group.name} description={group.description} />
                  <ShareIcon type='facebook' url={shareUrl} name={group.name} description={group.description} />
                  <ShareIcon type='mail' url={shareUrl} name={group.name} description={group.description} />
                </div>
            </div>

            <div className='PublicGroup-quote'>
              <h2>Our collective</h2>
              <div className='PublicGroup-members'>
                <UsersList users={members} />
              </div>
              <Markdown className='PublicGroup-quoteText' value={group.longDescription} />
            </div>

            <div className='PublicGroup-backers'>
              <h2>Backers</h2>
              <UsersList users={backers} />
            </div>

            <div className='PublicGroup-transactions'>
              <div className='PublicGroup-expenses'>
                <h2>Expenses</h2>
                {(expenses.length === 0) && (
                <div className='PublicGroup-emptyState'>
                    <div className='PublicGroup-expenseIcon'>
                      <Icon type='expense' />
                    </div>
                    <label>
                      All your approved expenses will show up here
                    </label>
                  </div>
                )}
                {expenses.map(expense => <TransactionItem
                                            key={expense.id}
                                            transaction={expense}
                                            user={users[expense.UserId]} />)}
              </div>

              <div className='PublicGroup-donations'>
                <h2>Revenue</h2>
                {(donations.length === 0) && (
                  <div className='PublicGroup-emptyState'>
                    <div className='PublicGroup-donationIcon'>
                      <Icon type='revenue' />
                    </div>
                    <label>
                      All your latest donations will show up here
                    </label>
                  </div>
                )}
                {donations.map(donation => <TransactionItem
                                              key={donation.id}
                                              transaction={donation}
                                              user={users[donation.UserId]} />)}
              </div>
            </div>

            <div id='support'></div>
            {donationSection}

          </div>
          <PublicFooter />
        </div>
      </BodyClassName>
    );
  }

  componentWillMount() {
    const {
      fetchGroup,
      slug,
      fetchTransactions,
      fetchUsers
    } = this.props;

    fetchGroup(slug);

    fetchTransactions(slug, {
      per_page: NUM_TRANSACTIONS_TO_SHOW,
      sort: 'createdAt',
      direction: 'desc',
      donation: true
    });

    fetchTransactions(slug, {
      per_page: NUM_TRANSACTIONS_TO_SHOW,
      sort: 'createdAt',
      direction: 'desc',
      expense: true
    });

    fetchUsers(slug);
  }
}

export function donateToGroup(amount, token) {
  const {
    groupid,
    notify,
    donate,
    group,
    showAdditionalUserInfoForm,
    fetchGroup,
    slug,
    fetchTransactions
  } = this.props;

  const payment = {
    stripeToken: token.id,
    email: token.email,
    amount,
    currency: group.currency
  };

  payment.interval = 'month';

  return donate(groupid, payment)
  .then(() => showAdditionalUserInfoForm())
  .then(() => fetchGroup(slug))
  .then(() => fetchTransactions(slug, {
                per_page: NUM_TRANSACTIONS_TO_SHOW,
                sort: 'createdAt',
                direction: 'desc',
                donation: true
  }))
  .catch((err) => notify('error', err.message));
}

export default connect(mapStateToProps, {
  fetchGroup,
  appendDonationForm,
  donate,
  notify,
  resetNotifications,
  pushState,
  fetchTransactions,
  fetchUsers,
  showAdditionalUserInfoForm,
  hideAdditionalUserInfoForm,
  appendProfileForm,
  updateUser,
  logout,
  validateDonationProfile
})(PublicGroup);

function logoutAndRedirect() {
  this.props.logout();
  this.props.replaceState(null, '/app/login?next=');
};

function mapStateToProps({
  router,
  groups,
  form,
  notification,
  transactions,
  users,
  session
}) {
  const slug = router.params.slug;
  const status = router.location.query.status;
  const group = values(groups).find(g => g.slug === slug) || { stripeAccount: {} };
  const GroupId = Number(group.id);

  const hosts = filterCollection(users, { role: roles.HOST });
  const members = filterCollection(users, { role: roles.MEMBER });
  const membersAndHost = [...hosts, ...members];
  const backers = filterCollection(users, { role: roles.BACKER });

  const groupTransactions = filterCollection(transactions, { GroupId });

  const donations = groupTransactions.filter(({amount}) => amount > 0);
  const expenses = groupTransactions.filter(({amount}) => amount < 0);

  return {
    groupid: group.id,
    slug,
    group,
    notification,
    users,
    session,
    backers: uniq(backers, 'id'),
    host: hosts[0] || {},
    members: membersAndHost,
    donations: take(sortBy(donations, txn => txn.createdAt).reverse(), NUM_TRANSACTIONS_TO_SHOW),
    expenses: take(sortBy(expenses, exp => exp.createdAt).reverse(), NUM_TRANSACTIONS_TO_SHOW),
    amount: (form.donation.attributes.amount == null) ? 10 : form.donation.attributes.amount,
    stripeAmount: convertToCents(form.donation.attributes.amount),
    stripeKey: group.stripeAccount && group.stripeAccount.stripePublishableKey,
    inProgress: groups.donateInProgress,
    showThankYouPage: status === 'thankyou',
    shareUrl: window.location.href,
    profileForm: form.profile,
    showUserForm: users.showUserForm || false,
    saveInProgress: users.updateInProgress,
    isAuthenticated: session.isAuthenticated
  };
}
