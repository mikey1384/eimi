export default function NotiActions(dispatch) {
  return {
    onChangeSocketStatus(connected) {
      return dispatch({
        type: 'CHANGE_SOCKET_STATUS',
        connected
      });
    },
    onCheckVersion(data) {
      return dispatch({
        type: 'CHECK_VERSION',
        data
      });
    },
    onClearRewards() {
      return dispatch({
        type: 'CLEAR_REWARDS'
      });
    },
    onClearNotifications() {
      return dispatch({
        type: 'CLEAR_NOTIFICATIONS'
      });
    },
    onFetchNotifications({
      currentChatSubject,
      loadMoreNotifications,
      notifications
    }) {
      return dispatch({
        type: 'LOAD_NOTIFICATIONS',
        currentChatSubject,
        loadMoreNotifications,
        notifications
      });
    },
    onLoadRewards({
      rewards,
      loadMoreRewards,
      totalRewardedTwinkles,
      totalRewardedTwinkleCoins
    }) {
      return dispatch({
        type: 'LOAD_REWARDS',
        rewards,
        loadMoreRewards,
        totalRewardedTwinkles,
        totalRewardedTwinkleCoins
      });
    },
    onGetRanks({
      all,
      top30s,
      allMonthly,
      top30sMonthly,
      myMonthlyRank,
      myAllTimeRank,
      myAllTimeXP,
      myMonthlyXP
    }) {
      return dispatch({
        type: 'LOAD_RANKS',
        all,
        top30s,
        allMonthly,
        top30sMonthly,
        myMonthlyRank,
        myAllTimeRank,
        myAllTimeXP,
        myMonthlyXP
      });
    },
    onIncreaseNumNewNotis() {
      return dispatch({
        type: 'INCREASE_NUM_NEW_NOTIS'
      });
    },
    onIncreaseNumNewPosts() {
      return dispatch({
        type: 'INCREASE_NUM_NEW_POSTS'
      });
    },
    onLoadMoreNotifications({ loadMoreNotifications, notifications }) {
      return dispatch({
        type: 'LOAD_MORE_NOTIFICATIONS',
        loadMoreNotifications,
        notifications
      });
    },
    onLoadMoreRewards(data) {
      return dispatch({
        type: 'LOAD_MORE_REWARDS',
        data
      });
    },
    onNotifyChatSubjectChange(subject) {
      return dispatch({
        type: 'CHAT_SUBJECT_CHANGE',
        subject
      });
    },
    onResetNumNewPosts() {
      return dispatch({
        type: 'RESET_NUM_NEW_POSTS'
      });
    },
    onResetRewards() {
      return dispatch({
        type: 'RESET_REWARDS'
      });
    },
    onSetPrevUserId(userId) {
      return dispatch({
        type: 'SET_PREV_USER_ID_FOR_NOTIFICATION',
        userId
      });
    },
    onShowUpdateNotice(shown) {
      return dispatch({
        type: 'SHOW_UPDATE_NOTICE',
        shown
      });
    }
  };
}
