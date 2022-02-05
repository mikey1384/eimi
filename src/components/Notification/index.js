import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import MainFeeds from './MainFeeds';
import ChatFeeds from './ChatFeeds';
import ErrorBoundary from 'components/ErrorBoundary';
import FilterBar from 'components/FilterBar';
import Loading from 'components/Loading';
import { container } from './Styles';
import { defaultChatSubject } from 'constants/defaultValues';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useNotiContext } from 'contexts';
import localize from 'constants/localize';

const newsLabel = localize('news');
const rankingsLabel = localize('rankings');

Notification.propTypes = {
  className: PropTypes.string,
  location: PropTypes.string,
  style: PropTypes.object
};

function Notification({ className, location, style }) {
  const loadRankings = useAppContext((v) => v.requestHelpers.loadRankings);
  const fetchNotifications = useAppContext(
    (v) => v.requestHelpers.fetchNotifications
  );
  const { userId, twinkleXP } = useMyState();
  const loadMore = useNotiContext((v) => v.state.loadMore);
  const notifications = useNotiContext((v) => v.state.notifications);
  const numNewNotis = useNotiContext((v) => v.state.numNewNotis);
  const prevUserId = useNotiContext((v) => v.state.prevUserId);
  const rewards = useNotiContext((v) => v.state.rewards);
  const totalRewardedTwinkles = useNotiContext(
    (v) => v.state.totalRewardedTwinkles
  );
  const totalRewardedTwinkleCoins = useNotiContext(
    (v) => v.state.totalRewardedTwinkleCoins
  );
  const {
    content = defaultChatSubject,
    loaded,
    ...subject
  } = useNotiContext((v) => v.state.currentChatSubject);
  const onClearNotifications = useNotiContext(
    (v) => v.actions.onClearNotifications
  );
  const onFetchNotifications = useNotiContext(
    (v) => v.actions.onFetchNotifications
  );
  const onGetRanks = useNotiContext((v) => v.actions.onGetRanks);
  const onResetRewards = useNotiContext((v) => v.actions.onResetRewards);
  const onSetPrevUserId = useNotiContext((v) => v.actions.onSetPrevUserId);

  const loadingNotificationRef = useRef(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('rankings');
  const userChangedTab = useRef(false);
  const mounted = useRef(true);
  const prevTwinkleXP = useRef(twinkleXP);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      onResetRewards();
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userChangedTab.current) {
      if (!userId) {
        setActiveTab('rankings');
      } else {
        const tab =
          activeTab === 'reward' ||
          totalRewardedTwinkles + totalRewardedTwinkleCoins > 0
            ? 'reward'
            : activeTab === 'notification' ||
              (location === 'home' && notifications.length > 0) ||
              numNewNotis > 0
            ? 'notification'
            : 'rankings';
        setActiveTab(tab);
      }
    }
  }, [
    userId,
    notifications,
    rewards.length,
    activeTab,
    totalRewardedTwinkles,
    totalRewardedTwinkleCoins,
    location,
    numNewNotis
  ]);

  useEffect(() => {
    userChangedTab.current = false;
    handleFetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    onResetRewards();
    if (userId !== prevUserId) {
      if (activeTab === 'reward') {
        setActiveTab('notification');
      }
      onClearNotifications();
      handleFetchNotifications(true);
    }
    onSetPrevUserId(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevUserId, userId]);

  useEffect(() => {
    if (
      typeof twinkleXP === 'number' &&
      twinkleXP > (prevTwinkleXP.current || 0)
    ) {
      fetchRankings();
    }
    prevTwinkleXP.current = twinkleXP;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [twinkleXP]);

  const rewardTabShown = useMemo(() => {
    return (
      (!loadingNotifications || activeTab === 'reward') && rewards.length > 0
    );
  }, [activeTab, loadingNotifications, rewards.length]);

  return (
    <ErrorBoundary>
      <div style={style} className={`${container} ${className}`}>
        <section
          style={{
            marginBottom: '1rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {loaded && location === 'home' && false && (
            <ChatFeeds
              myId={userId}
              content={content}
              style={{
                marginBottom: '1rem'
              }}
              {...subject}
            />
          )}
          {userId && (numNewNotis > 0 || notifications.length > 0) && (
            <FilterBar
              bordered
              style={{
                fontSize: '1.6rem',
                height: '5rem',
                marginBottom:
                  loadingNotifications && activeTab === 'reward' ? 0 : null
              }}
            >
              <nav
                className={`${activeTab === 'notification' && 'active'} ${
                  numNewNotis > 0 && 'alert'
                }`}
                onClick={() => {
                  userChangedTab.current = true;
                  setActiveTab('notification');
                }}
              >
                {newsLabel}
              </nav>
              <nav
                className={activeTab === 'rankings' ? 'active' : undefined}
                onClick={() => {
                  userChangedTab.current = true;
                  setActiveTab('rankings');
                }}
              >
                {rankingsLabel}
              </nav>
              {rewardTabShown && (
                <nav
                  className={`${activeTab === 'reward' && 'active'} ${
                    totalRewardedTwinkles + totalRewardedTwinkleCoins > 0 &&
                    'alert'
                  }`}
                  onClick={() => {
                    userChangedTab.current = true;
                    setActiveTab('reward');
                  }}
                >
                  Rewards
                </nav>
              )}
            </FilterBar>
          )}
          <div style={{ position: 'relative' }}>
            {loadingNotifications && activeTab === 'reward' && (
              <Loading
                style={{
                  position: 'absolute',
                  height: 0,
                  top: '2rem'
                }}
              />
            )}
            <MainFeeds
              loadingNotifications={loadingNotifications}
              loadMore={loadMore}
              activeTab={activeTab}
              notifications={notifications}
              rewards={rewards}
              selectNotiTab={() => {
                userChangedTab.current = true;
                setActiveTab('notification');
              }}
            />
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );

  function handleFetchNotifications(reloading) {
    if (reloading || notifications.length === 0) {
      fetchNews();
    }
    fetchRankings();
  }

  async function fetchNews() {
    if (!loadingNotificationRef.current) {
      setLoadingNotifications(true);
      loadingNotificationRef.current = true;
      const data = await fetchNotifications();
      if (mounted.current) {
        onFetchNotifications(data);
      }
      if (mounted.current) {
        setLoadingNotifications(false);
      }
      loadingNotificationRef.current = false;
    }
  }
  async function fetchRankings() {
    const {
      all,
      top30s,
      allMonthly,
      top30sMonthly,
      myMonthlyRank,
      myAllTimeRank,
      myAllTimeXP,
      myMonthlyXP
    } = await loadRankings();
    if (mounted.current) {
      onGetRanks({
        all,
        top30s,
        allMonthly,
        top30sMonthly,
        myMonthlyRank,
        myAllTimeRank,
        myAllTimeXP,
        myMonthlyXP
      });
    }
  }
}

export default memo(Notification);
