/* eslint-disable guard-for-in, no-restricted-syntax, no-param-reassign */

import produce from 'immer';
import { values, groupBy, merge } from 'lodash';
import { actionTypes } from '../constants';
import { isComposable } from './compositeReducer';

export default function crossSliceReducer(state = {}, action) {
  // Only relevant for queries
  if (!isComposable(action)) {
    return state;
  }

  return produce(state, draft => {
    switch (action.type) {
      case actionTypes.GET_SUCCESS:
      case actionTypes.DOCUMENT_MODIFIED:
      case actionTypes.DOCUMENT_ADDED:
      case actionTypes.DOCUMENT_REMOVED:
      case actionTypes.LISTENER_RESPONSE:
        // Take all of the composite values and plop them into data, replacing the existing data entirely
        const groups = groupBy(
          values(state.composite),
          c => c.storeAs || c.collection,
        );

        for (const storeAs in groups) {
          const updated = {};
          for (const item of groups[storeAs]) {
            merge(updated, item.data);
          }
          draft.data[storeAs] = updated; // Since we're operating on the whole cake, instead of just a slice, we want to reduce the referential impact to the bits we're working with.
        }
        return draft;
      default:
        return state;
    }
  });
}
