import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import Icon from 'components/Icon';
import { useAppContext, useMissionContext, useContentContext } from 'contexts';
import { Color } from 'constants/css';
import { css } from '@emotion/css';

FinalStep.propTypes = {
  mission: PropTypes.object.isRequired,
  userId: PropTypes.number.isRequired,
  style: PropTypes.object
};

export default function FinalStep({ mission, style, userId }) {
  const {
    requestHelpers: { uploadMissionAttempt }
  } = useAppContext();
  const {
    actions: { onUpdateMissionAttempt }
  } = useMissionContext();
  const {
    actions: { onChangeUserXP, onUpdateUserCoins }
  } = useContentContext();
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '1.7rem',
        ...style
      }}
      className={css`
        > p {
          line-height: 2;
        }
      `}
    >
      <p>
        Great! You have successfully unlocked the <b>change username item</b>{' '}
        from Twinkle Store.
      </p>
      <p>
        Press the <b style={{ color: Color.brownOrange() }}>button</b> below to
        collect your reward
      </p>
      <Button
        filled
        disabled={submitDisabled}
        style={{ marginTop: '5rem', fontSize: '1.7rem' }}
        skeuomorphic
        color="brownOrange"
        onClick={handleCompleteMission}
      >
        <Icon icon="bolt" />
        <span style={{ marginLeft: '1rem' }}>Collect Reward</span>
      </Button>
    </div>
  );

  async function handleCompleteMission() {
    setSubmitDisabled(true);
    const { success, newXpAndRank, newCoins } = await uploadMissionAttempt({
      missionId: mission.id,
      attempt: { status: 'pass' }
    });
    if (success) {
      if (newXpAndRank.xp && mounted.current) {
        onChangeUserXP({
          xp: newXpAndRank.xp,
          rank: newXpAndRank.rank,
          userId
        });
      }
      if (newCoins.netCoins && mounted.current) {
        onUpdateUserCoins({ coins: newCoins.netCoins, userId });
      }
      if (mounted.current) {
        onUpdateMissionAttempt({
          missionId: mission.id,
          newState: { status: 'pass' }
        });
      }
    }
    if (mounted.current) {
      setSubmitDisabled(false);
    }
  }
}
