import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import RewardText from 'components/Texts/RewardText';
import { css } from '@emotion/css';
import { Color, borderRadius, mobileMaxWidth } from 'constants/css';
import { useHistory } from 'react-router-dom';
import { useAppContext, useMissionContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { checkMultiMissionPassStatus } from 'helpers/userDataHelpers';
import { returnMissionThumb } from 'constants/defaultValues';

MissionItem.propTypes = {
  isRepeatable: PropTypes.bool,
  style: PropTypes.object,
  locked: PropTypes.bool,
  mission: PropTypes.object.isRequired,
  missionLink: PropTypes.string.isRequired,
  showStatus: PropTypes.bool
};

export default function MissionItem({
  isRepeatable,
  style,
  locked,
  mission,
  missionLink,
  showStatus = true
}) {
  const history = useHistory();
  const { userId } = useMyState();
  const onOpenSigninModal = useAppContext(
    (v) => v.user.actions.onOpenSigninModal
  );
  const myAttempts = useMissionContext((v) => v.state.myAttempts);
  const statusShown = useMemo(() => {
    if (!showStatus) return false;
    if (mission.isMultiMission) {
      const { numPassedTasks } = checkMultiMissionPassStatus({
        mission,
        myAttempts
      });
      return numPassedTasks > 0;
    }
    return (
      myAttempts[mission.id]?.status &&
      myAttempts[mission.id]?.status !== 'pending'
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, myAttempts, showStatus]);
  const passStatus = useMemo(() => {
    if (mission.isMultiMission) {
      const { numTasks, numPassedTasks, passed } = checkMultiMissionPassStatus({
        mission,
        myAttempts
      });
      if (passed) {
        return 'passed';
      }
      return `${numPassedTasks}/${numTasks} passed`;
    }
    return `${myAttempts[mission.id]?.status}ed`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, myAttempts]);
  const missionThumb = useMemo(
    () => returnMissionThumb(mission.missionType),
    [mission.missionType]
  );

  return (
    <div
      onClick={handleLinkClick}
      style={style}
      className={`${css`
        background: #fff;
        padding: 1rem;
        border: 1px solid ${Color.borderGray()};
        border-radius: ${borderRadius};
        cursor: ${locked ? 'default' : 'pointer'};
        opacity: ${locked ? 0.2 : 1};
        ${locked
          ? ''
          : `&:hover {
          background: ${Color.highlightGray()};
        }`}
      `}${locked ? ' unselectable' : ''}`}
    >
      <p
        className={css`
          font-size: 2rem;
          font-weight: bold;
          @media (max-width: ${mobileMaxWidth}) {
            font-size: 1.7rem;
          }
        `}
      >
        {mission.title}
      </p>
      <div style={{ marginTop: '1rem', display: 'flex' }}>
        <img src={missionThumb} style={{ width: '10rem', height: '6rem' }} />
        <div
          style={{
            marginLeft: '1rem',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{ width: '100%' }}
            className={css`
              font-size: 1.7rem;
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1.3rem;
              }
            `}
          >
            {mission.subtitle}
          </div>
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '1.5rem'
            }}
          >
            <RewardText
              labelClassName={css`
                color: ${Color.darkerGray()};
                font-size: 1.4rem;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.3rem;
                }
              `}
              rewardClassName={css`
                font-size: 1.3rem;
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.2rem;
                }
              `}
              rewardStyle={{ fontSize: '1.2rem' }}
              isRepeating={isRepeatable}
              coinReward={
                isRepeatable ? mission.repeatCoinReward : mission.coinReward
              }
              xpReward={
                isRepeatable ? mission.repeatXpReward : mission.xpReward
              }
            />
            {statusShown && (
              <div
                className={css`
                  font-size: 1.3rem;
                  @media (max-width: ${mobileMaxWidth}) {
                    font-size: 1.1rem;
                  }
                `}
                style={{
                  fontWeight: 'bold',
                  color:
                    myAttempts[mission.id]?.status === 'pass' ||
                    mission.isMultiMission
                      ? Color.green()
                      : Color.rose()
                }}
              >
                {passStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function handleLinkClick() {
    if (locked) return;
    if (userId) {
      history.push(missionLink);
    } else {
      onOpenSigninModal();
    }
  }
}
