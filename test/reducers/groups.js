import expect from 'expect';
import reducer from '../../reducers/groups';
import {
  GROUP_SUCCESS
} from '../../actions/groups';

describe('groups reducer', () => {

  it('should return the initial state', () => {
    const state = {1: {}};
    expect(reducer(state, {})).toEqual(state);
  });

  it('should add a group', () => {
    const groups = {
      1: {name: 'New York'}
    };
    const state = reducer(undefined, {
      type: GROUP_SUCCESS,
      groups
    });

    expect(state).toEqual(groups);
  });
});
