import React, { useState } from 'react';
import PropTypes from 'prop-types';
import StepSlide from '../components/StepSlide';
import Button from 'components/Button';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';

ConnectReplToGitHub.propTypes = {
  index: PropTypes.number,
  innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  okayPressed: PropTypes.bool,
  taskType: PropTypes.string
};

export default function ConnectReplToGitHub({
  index,
  innerRef,
  okayPressed,
  taskType
}) {
  const {
    requestHelpers: { updateMissionStatus }
  } = useAppContext();
  const {
    actions: { onUpdateUserMissionState }
  } = useContentContext();
  const [noPressed, setNoPressed] = useState(false);
  const { userId } = useMyState();

  return (
    <StepSlide
      title="Connect your Repl to GitHub"
      innerRef={innerRef}
      index={index}
    >
      <div
        style={{
          marginBottom: okayPressed ? '2rem' : '2.5rem',
          textAlign: 'center'
        }}
      >
        <p>
          Follow the instructions in the{' '}
          <b style={{ color: Color.brownOrange() }}>tutorial</b> to connect your
          Repl to your GitHub.
        </p>
        {okayPressed && (
          <div
            style={{
              marginTop: '4rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <p style={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
              Were you able to connect your Repl to your GitHub?
            </p>
            <div style={{ marginBottom: noPressed ? '1rem' : '-1.5rem' }}>
              {noPressed ? (
                <div
                  style={{
                    marginTop: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                  }}
                >
                  <p>
                    Your Answer: <b>No, {`something's`} not working</b>
                  </p>
                  <p
                    className={css`
                      margin-top: 3rem;
                      width: 65%;
                      @media (max-width: ${mobileMaxWidth}) {
                        width: 100%;
                      }
                    `}
                  >
                    This probably means you either skipped or {`didn't`} follow
                    the tutorial instructions properly for previous steps. Try
                    starting over from step one and make sure you read and
                    follow the tutorial instructions carefully this time
                  </p>
                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Button
                      color="logoBlue"
                      skeuomorphic
                      onClick={() => handleUpdateSelectedIndex(0)}
                    >
                      Start from the beginning
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  style={{ marginTop: '5.5rem' }}
                  skeuomorphic
                  color="darkerGray"
                  onClick={() => setNoPressed(true)}
                >{`No, something's not working`}</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </StepSlide>
  );

  async function handleUpdateSelectedIndex(newIndex) {
    await updateMissionStatus({
      missionType: taskType,
      newStatus: { selectedIndex: newIndex }
    });
    onUpdateUserMissionState({
      userId,
      missionType: taskType,
      newState: { selectedIndex: newIndex }
    });
  }
}
