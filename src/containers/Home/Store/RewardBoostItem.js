import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ItemPanel from './ItemPanel';
import Icon from 'components/Icon';
import MaxLevelItemInfo from './MaxLevelItemInfo';
import { css } from '@emotion/css';
import { Color, mobileMaxWidth } from 'constants/css';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { karmaPointTable, videoRewardHash } from 'constants/defaultValues';
import localize from 'constants/localize';

const selectedLanguage = process.env.REACT_APP_SELECTED_LANGUAGE;
const boostRewardsFromWatchingXPVideosLabel = localize(
  'boostRewardsFromWatchingXPVideos'
);

const item = {
  maxLvl: 10,
  name: [
    boostRewardsFromWatchingXPVideosLabel,
    `${boostRewardsFromWatchingXPVideosLabel} (level 2)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 3)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 4)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 5)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 6)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 7)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 8)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 9)`,
    `${boostRewardsFromWatchingXPVideosLabel} (level 10)`
  ],
  description: [...Array(10).keys()].map((key) => {
    const rewardLevels = [1, 2, 3, 4, 5];
    const colorKey = ['logoBlue', 'pink', 'orange', 'cranberry', 'gold'];
    const keyNumber = Number(key);
    const descriptionLabel =
      selectedLanguage === 'en' ? (
        <>
          {keyNumber === 0 ? 'Unlock' : 'Upgrade'} this item to earn the
          following rewards <b>per minute</b> while watching XP Videos
        </>
      ) : (
        <>
          본 아이템을 {keyNumber === 0 ? '잠금해제' : '업그레이드'} 하시면 XP
          동영상을 보실때 <b>매분마다</b> 아래의 보상을 획득하실 수 있게 됩니다
        </>
      );

    return (
      <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }} key={key}>
        <p>{descriptionLabel}</p>
        <div
          style={{
            width: '100%',
            marginTop: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {rewardLevels.map((rewardLevel, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                width: '80%',
                justifyContent: 'space-between',
                marginTop: index === 0 ? 0 : '1rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: `8rem`,
                  justifyContent: 'center'
                }}
              >
                <div
                  className={css`
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-width: 4rem;
                    padding: 0.5rem 0.5rem;
                    background: ${Color[colorKey[index]]()};
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #fff;
                    @media (max-width: ${mobileMaxWidth}) {
                      font-size: 1rem;
                    }
                  `}
                >
                  <div style={{ fontSize: '1rem', lineHeight: 1 }}>
                    {[...Array(rewardLevel)].map((elem, index) => (
                      <Icon
                        key={index}
                        style={{ verticalAlign: 0 }}
                        icon="star"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginLeft: '3rem',
                  flexGrow: 1
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    width: '95%',
                    justifyContent: 'space-around'
                  }}
                >
                  <div>
                    {videoRewardHash[keyNumber].xp * rewardLevel} XP
                    {rewardLevel > 2 ? (
                      <span>
                        {`, `}
                        <span style={{ marginLeft: '0.5rem' }}>
                          <Icon icon={['far', 'badge-dollar']} />{' '}
                          {videoRewardHash[keyNumber].coin}
                        </span>
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                  <div style={{ color: Color.green() }}>
                    <Icon icon="arrow-right" />
                  </div>
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: Color.brownOrange()
                    }}
                  >
                    {videoRewardHash[keyNumber + 1].xp * rewardLevel} XP
                    {rewardLevel > 2 ? (
                      <span>
                        {`, `}
                        <span style={{ marginLeft: '0.5rem' }}>
                          <Icon icon={['far', 'badge-dollar']} />{' '}
                          {videoRewardHash[keyNumber + 1].coin}
                        </span>
                      </span>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })
};

RewardBoostItem.propTypes = {
  style: PropTypes.object
};

export default function RewardBoostItem({ style }) {
  const { rewardBoostLvl, karmaPoints, userId } = useMyState();
  const {
    actions: { onUpdateProfileInfo }
  } = useContentContext();
  const {
    requestHelpers: { upgradeRewardBoost }
  } = useAppContext();
  const maxLevelItemDescriptionLabel = useMemo(() => {
    if (selectedLanguage === 'en') {
      return `You can now earn (reward level × ${videoRewardHash[rewardBoostLvl].xp}) XP and ${videoRewardHash[rewardBoostLvl].coin} Twinkle Coins per minute while watching XP Videos`;
    }
    return `회원님은 이제 XP동영상을 시청하실 때 매분 (보상레벨 × ${videoRewardHash[rewardBoostLvl].xp})XP와 트윈클 코인 ${videoRewardHash[rewardBoostLvl].coin}개를 획득하실 수 있으십니다`;
  }, [rewardBoostLvl]);

  return (
    <ItemPanel
      isLeveled
      currentLvl={rewardBoostLvl}
      maxLvl={item.maxLvl}
      karmaPoints={karmaPoints}
      requiredKarmaPoints={karmaPointTable.rewardBoost[rewardBoostLvl]}
      locked={!rewardBoostLvl}
      onUnlock={handleUpgrade}
      itemName={item.name[rewardBoostLvl]}
      itemDescription={item.description[rewardBoostLvl]}
      style={style}
      upgradeIcon={<Icon size="3x" icon="bolt" />}
    >
      <MaxLevelItemInfo
        icon="bolt"
        title={
          selectedLanguage === 'en'
            ? 'XP Video Reward Boost - Level 10'
            : 'XP동영상 보상 증가 - Level 10'
        }
        description={maxLevelItemDescriptionLabel}
      />
    </ItemPanel>
  );

  async function handleUpgrade() {
    const success = await upgradeRewardBoost();
    if (success) {
      onUpdateProfileInfo({ userId, rewardBoostLvl: rewardBoostLvl + 1 });
    }
  }
}
