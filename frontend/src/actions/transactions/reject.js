import { postJSON } from '../../lib/api';
import * as constants from '../../constants/transactions';

/**
 * Reject a transaction in a group
 */

export default (groupid, transactionid) => {
  const url = `groups/${groupid}/transactions/${transactionid}/approve`;

  return dispatch => {
    dispatch(request(groupid, transactionid));
    return postJSON(url, { approved: false })
      .then(json => dispatch(success(groupid, transactionid, json)))
      .catch(error => {
        dispatch(failure(error));
        throw new Error(error.message);
      });
  };
};

function request(groupid, transactionid) {
  return {
    type: constants.REJECT_TRANSACTION_REQUEST,
    groupid,
    transactionid
  };
}

function success(groupid, transactionid, json) {
  return {
    type: constants.REJECT_TRANSACTION_SUCCESS,
    groupid,
    transactionid,
    response: json,
  };
}

function failure(error) {
  return {
    type: constants.REJECT_TRANSACTION_FAILURE,
    error,
  };
}
