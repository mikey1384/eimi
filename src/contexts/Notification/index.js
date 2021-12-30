import React, { useReducer } from 'react';
import { createContext } from 'use-context-selector';
import PropTypes from 'prop-types';
import NotiActions from './actions';
import NotiReducer from './reducer';

export const NotiContext = createContext();
export const initialNotiState = {
  versionMatch: true,
  notifications: [],
  rewards: [],
  currentChatSubject: {},
  loadMore: {
    notifications: false,
    rewards: false
  },
  numNewNotis: 0,
  numNewPosts: 0,
  rankingsLoaded: false,
  allRanks: [],
  prevUserId: null,
  top30s: [],
  socketConnected: false,
  totalRewardedTwinkles: 0,
  totalRewardedTwinkleCoins: 0,
  updateDetail: '',
  updateNoticeShown: false
};

NotiContextProvider.propTypes = {
  children: PropTypes.node
};

export function NotiContextProvider({ children }) {
  const [notiState, notiDispatch] = useReducer(NotiReducer, initialNotiState);
  return (
    <NotiContext.Provider
      value={{
        state: notiState,
        actions: NotiActions(notiDispatch)
      }}
    >
      {children}
    </NotiContext.Provider>
  );
}
