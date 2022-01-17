import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Color } from 'constants/css';
import { useAppContext, useMissionContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import ErrorBoundary from 'components/ErrorBoundary';
import Button from 'components/Button';
import Icon from 'components/Icon';

TaskComplete.propTypes = {
  innerRef: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  style: PropTypes.object,
  taskId: PropTypes.number.isRequired,
  passMessage: PropTypes.string,
  passMessageFontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default function TaskComplete({
  innerRef,
  style,
  taskId,
  passMessage,
  passMessageFontSize
}) {
  const { userId } = useMyState();
  const uploadMissionAttempt = useAppContext(
    (v) => v.requestHelpers.uploadMissionAttempt
  );
  const myAttempts = useMissionContext((v) => v.state.myAttempts);
  const onUpdateMissionAttempt = useMissionContext(
    (v) => v.actions.onUpdateMissionAttempt
  );
  const myAttempt = useMemo(() => myAttempts[taskId], [myAttempts, taskId]);
  const onSetUserState = useAppContext((v) => v.user.actions.onSetUserState);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  return myAttempt?.status ? null : (
    <ErrorBoundary
      innerRef={innerRef}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: '1.7rem',
        ...style
      }}
    >
      <p
        style={{
          fontWeight: 'bold',
          fontSize: passMessageFontSize || '1.8rem',
          marginBottom: '1.5rem',
          color: Color.black()
        }}
      >
        {passMessage}
      </p>
      <p style={{ color: Color.black() }}>
        Press the <b style={{ color: Color.brownOrange() }}>button</b> below to
        collect your reward
      </p>
      <Button
        filled
        disabled={submitDisabled}
        style={{ marginTop: '3.5rem', fontSize: '1.7rem' }}
        skeuomorphic
        color="brownOrange"
        onClick={handleTaskComplete}
      >
        <Icon icon="bolt" />
        <span style={{ marginLeft: '1rem' }}>Task Complete</span>
      </Button>
    </ErrorBoundary>
  );

  async function handleTaskComplete() {
    setSubmitDisabled(true);
    const { success, newXpAndRank, newCoins } = await uploadMissionAttempt({
      missionId: taskId,
      attempt: { status: 'pass' }
    });
    if (success) {
      if (newXpAndRank.xp && mounted.current) {
        onSetUserState({
          userId,
          newState: { twinkeXP: newXpAndRank.xp, rank: newXpAndRank.rank }
        });
      }
      if (newCoins.netCoins && mounted.current) {
        onSetUserState({
          userId,
          newState: { twinkleCoins: newCoins.netCoins }
        });
      }
      if (mounted.current) {
        onUpdateMissionAttempt({
          missionId: taskId,
          newState: { status: 'pass' }
        });
      }
    }
    if (mounted.current) {
      setSubmitDisabled(false);
    }
  }
}
