import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import UsernameText from 'components/Texts/UsernameText';
import ContentLink from 'components/ContentLink';
import { borderRadius, Color } from 'constants/css';
import { addCommasToNumber } from 'helpers/stringHelpers';
import { SELECTED_LANGUAGE } from 'constants/defaultValues';
import localize from 'constants/localize';

const taskCompleteLabel = localize('taskComplete');
const missionAccomplishedLabel = localize('missionAccomplished');

MissionContent.propTypes = {
  uploader: PropTypes.object.isRequired,
  rootObj: PropTypes.object.isRequired
};

export default function MissionContent({ uploader, rootObj: mission }) {
  const rewardDetails = useMemo(() => {
    return mission.xpReward || mission.coinReward ? (
      <div
        style={{
          marginTop: '1rem',
          color: Color.black()
        }}
      >
        {SELECTED_LANGUAGE === 'kr' ? renderKorean() : renderEnglish()}
      </div>
    ) : null;

    function renderEnglish() {
      return (
        <>
          <UsernameText user={uploader} color={Color.blue()} /> was rewarded{' '}
          {mission.xpReward ? (
            <>
              <span style={{ color: Color.logoGreen(), fontWeight: 'bold' }}>
                {addCommasToNumber(mission.xpReward)}{' '}
              </span>
              <span style={{ color: Color.gold(), fontWeight: 'bold' }}>
                XP
              </span>
            </>
          ) : null}
          {mission.xpReward && mission.coinReward ? ' and ' : null}
          {mission.coinReward ? (
            <>
              <Icon
                style={{ color: Color.brownOrange(), fontWeight: 'bold' }}
                icon={['far', 'badge-dollar']}
              />{' '}
              <span style={{ color: Color.brownOrange(), fontWeight: 'bold' }}>
                {mission.coinReward}
              </span>
            </>
          ) : null}
        </>
      );
    }
    function renderKorean() {
      return (
        <>
          <UsernameText user={uploader} color={Color.blue()} />
          ?????????{' '}
          {mission.xpReward ? (
            <>
              <span style={{ color: Color.logoGreen(), fontWeight: 'bold' }}>
                {addCommasToNumber(mission.xpReward)}{' '}
              </span>{' '}
              <span style={{ color: Color.gold(), fontWeight: 'bold' }}>
                XP
              </span>
            </>
          ) : null}
          {mission.xpReward && mission.coinReward ? <>??? </> : null}
          {mission.coinReward ? (
            <>
              <Icon
                style={{ color: Color.brownOrange(), fontWeight: 'bold' }}
                icon={['far', 'badge-dollar']}
              />{' '}
              <span style={{ color: Color.brownOrange(), fontWeight: 'bold' }}>
                {mission.coinReward}
              </span>
            </>
          ) : null}
          {mission.coinReward ? '???' : '???'} ??????????????????
        </>
      );
    }
  }, [mission.coinReward, mission.xpReward, uploader]);

  return (
    <div
      style={{
        marginTop: '2.5rem',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        marginBottom: '-4rem'
      }}
    >
      {mission.rootMission?.title && (
        <div style={{ marginBottom: '0.3rem' }}>
          {mission.rootMission.title}
        </div>
      )}
      <ContentLink
        content={{
          id: mission.id,
          missionType: mission.missionType,
          title: mission.title,
          rootMissionType: mission.rootMission?.missionType
        }}
        contentType="mission"
        style={{ fontWeight: 'bold', fontSize: '2.2rem', color: Color.black() }}
      />
      <div
        style={{
          marginTop: '1.2rem',
          borderRadius,
          boxShadow: `0 0 2px ${Color.brown()}`,
          padding: '0.5rem 2rem',
          fontWeight: 'bold',
          fontSize: '2rem',
          background: Color.brownOrange(),
          color: '#fff'
        }}
      >
        {mission.isTask ? taskCompleteLabel : missionAccomplishedLabel}
      </div>
      {rewardDetails}
    </div>
  );
}
