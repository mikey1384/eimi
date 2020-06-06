import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ContentLink from 'components/ContentLink';
import UsernameText from 'components/Texts/UsernameText';
import RoundList from 'components/RoundList';
import Banner from 'components/Banner';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import Rankings from './Rankings';
import NotiItem from './NotiItem';
import MyRank from 'components/MyRank';
import ErrorBoundary from 'components/ErrorBoundary';
import { Color } from 'constants/css';
import { notiFeedListItem } from '../Styles';
import { rewardValue } from 'constants/defaultValues';
import { timeSince } from 'helpers/timeStampHelpers';
import { addCommasToNumber } from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useNotiContext } from 'contexts';

MainFeeds.propTypes = {
  loadMore: PropTypes.object.isRequired,
  activeTab: PropTypes.string,
  notifications: PropTypes.array.isRequired,
  rewards: PropTypes.array,
  selectNotiTab: PropTypes.func.isRequired,
  style: PropTypes.object
};

function MainFeeds({
  activeTab,
  loadMore,
  notifications,
  rewards,
  selectNotiTab,
  style
}) {
  const {
    requestHelpers: {
      fetchNotifications,
      loadMoreNotifications,
      loadMoreRewards,
      updateUserXP
    }
  } = useAppContext();
  const { userId, rank, twinkleXP } = useMyState();
  const {
    state: { numNewNotis, totalRewardAmount },
    actions: {
      onClearRewards,
      onFetchNotifications,
      onLoadMoreNotifications,
      onLoadMoreRewards
    }
  } = useNotiContext();
  const {
    actions: { onChangeUserXP }
  } = useContentContext();
  const [loading, setLoading] = useState(false);
  const [loadingNewFeeds, setLoadingNewFeeds] = useState(false);
  const [collectingReward, setCollectingReward] = useState(false);
  const [originalTotalReward, setOriginalTotalReward] = useState(0);
  const [originalTwinkleXP, setOriginalTwinkleXP] = useState(0);
  const NotificationsItems = useMemo(() => {
    return notifications.map((notification) => {
      return (
        <nav
          style={{ background: '#fff' }}
          className={notiFeedListItem}
          key={notification.id}
        >
          <NotiItem notification={notification} />
        </nav>
      );
    });
  }, [notifications]);
  const RewardListItems = useMemo(() => {
    return rewards.map(
      ({
        id,
        contentId,
        contentType,
        rewardAmount,
        rewardType,
        rewarderId,
        rewarderUsername,
        timeStamp
      }) => (
        <nav
          style={{ background: '#fff' }}
          className={notiFeedListItem}
          key={id}
        >
          <div>
            <UsernameText
              user={{ id: rewarderId, username: rewarderUsername }}
              color={Color.blue()}
            />{' '}
            <span
              style={{
                color:
                  rewardAmount === 25
                    ? Color.gold()
                    : rewardAmount >= 10
                    ? Color.rose()
                    : rewardAmount >= 5
                    ? Color.orange()
                    : rewardAmount >= 3
                    ? Color.pink()
                    : Color.lightBlue(),
                fontWeight: 'bold'
              }}
            >
              rewarded you {rewardAmount === 1 ? 'a' : rewardAmount}{' '}
              {rewardType}
              {rewardAmount > 1 ? 's' : ''}
            </span>{' '}
            for your{' '}
            <ContentLink
              style={{ color: Color.green() }}
              content={{
                id: contentId,
                title: contentType
              }}
              contentType={contentType}
            />
          </div>
          <small>{timeSince(timeStamp)}</small>
        </nav>
      )
    );
  }, [rewards]);

  return (
    <ErrorBoundary style={style}>
      {numNewNotis > 0 && (
        <Banner
          loading={loadingNewFeeds}
          color="gold"
          style={{ marginBottom: '1rem' }}
          onClick={handleNewNotiAlertClick}
          spinnerDelay={100}
        >
          Tap to See {numNewNotis} New Notification
          {numNewNotis > 1 ? 's' : ''}
        </Banner>
      )}
      {activeTab === 'reward' && (
        <Banner
          loading={collectingReward}
          color={totalRewardAmount > 0 ? 'gold' : 'green'}
          style={{ marginBottom: '1rem' }}
          onClick={totalRewardAmount > 0 ? onCollectReward : null}
        >
          {totalRewardAmount > 0 && (
            <>
              <p>Tap to collect all your rewards</p>
              <p style={{ fontSize: '1.5rem' }}>
                ({totalRewardAmount} Twinkles x {rewardValue.star} XP/Twinkle ={' '}
                {addCommasToNumber(totalRewardAmount * rewardValue.star)} XP)
              </p>
            </>
          )}
          {totalRewardAmount === 0 && (
            <>
              <p>
                {addCommasToNumber(originalTotalReward * rewardValue.star)} XP
                Collected!
              </p>
              <p style={{ fontSize: '1.5rem' }}>
                Your XP: {addCommasToNumber(originalTwinkleXP)} {'=>'}{' '}
                {addCommasToNumber(
                  originalTwinkleXP + originalTotalReward * rewardValue.star
                )}
              </p>
            </>
          )}
        </Banner>
      )}
      {activeTab === 'reward' && !!userId && (
        <MyRank myId={userId} rank={rank} twinkleXP={twinkleXP} />
      )}
      {userId && activeTab === 'notification' && notifications.length > 0 && (
        <RoundList style={{ marginTop: 0 }}>{NotificationsItems}</RoundList>
      )}
      {activeTab === 'rankings' && <Rankings />}
      {activeTab === 'reward' && rewards.length > 0 && (
        <RoundList style={{ marginTop: 0 }}>{RewardListItems}</RoundList>
      )}
      {((activeTab === 'notification' && loadMore.notifications) ||
        (activeTab === 'reward' && loadMore.rewards)) &&
        !!userId && (
          <LoadMoreButton
            style={{ marginTop: '1rem' }}
            loading={loading}
            color="lightBlue"
            filled
            stretch
            onClick={onLoadMore}
          />
        )}
    </ErrorBoundary>
  );

  async function onCollectReward() {
    setOriginalTotalReward(totalRewardAmount);
    setOriginalTwinkleXP(twinkleXP);
    setCollectingReward(true);
    const { xp, alreadyDone, rank } = await updateUserXP({
      action: 'collect'
    });
    if (alreadyDone) {
      onClearRewards();
      return setCollectingReward(false);
    }
    onChangeUserXP({ xp, rank, userId });
    onClearRewards();
    setCollectingReward(false);
  }

  async function handleNewNotiAlertClick() {
    setLoadingNewFeeds(true);
    const data = await fetchNotifications();
    onFetchNotifications(data);
    selectNotiTab();
    setLoadingNewFeeds(false);
  }

  async function onLoadMore() {
    setLoading(true);
    if (activeTab === 'notification') {
      const data = await loadMoreNotifications(
        notifications[notifications.length - 1].id
      );
      onLoadMoreNotifications(data);
    } else {
      const data = await loadMoreRewards(rewards[rewards.length - 1].id);
      onLoadMoreRewards(data);
    }
    setLoading(false);
  }
}

export default memo(MainFeeds);
