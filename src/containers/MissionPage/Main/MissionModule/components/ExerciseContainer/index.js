import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import SuccessMessage from './SuccessMessage';
import FailMessage from './FailMessage';
import Icon from 'components/Icon';
import CodeSandbox from 'components/Forms/CodeSandbox';
import useExercises from './useExercises';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext } from 'contexts';
import { scrollElementToCenter } from 'helpers';

ExerciseContainer.propTypes = {
  codeObj: PropTypes.object,
  exercises: PropTypes.object.isRequired,
  exerciseKey: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  prevExerciseKey: PropTypes.string,
  prevUserId: PropTypes.number,
  onSetCode: PropTypes.func.isRequired,
  style: PropTypes.object,
  taskType: PropTypes.string,
  tutorialRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
};

export default function ExerciseContainer({
  codeObj,
  exercises,
  exerciseKey,
  index,
  prevExerciseKey,
  onSetCode,
  prevUserId,
  style,
  taskType,
  tutorialRef
}) {
  const updateMissionStatus = useAppContext(
    (v) => v.requestHelpers.updateMissionStatus
  );
  const onUpdateUserMissionState = useContentContext(
    (v) => v.actions.onUpdateUserMissionState
  );
  const { userId, username, state = {} } = useMyState();
  const { passed, prevPassed, errorMsg, setErrorMsg, success, exercise } =
    useExercises({
      exercises,
      exerciseKey,
      prevExerciseKey,
      codeObj,
      state,
      onUpdateUserMissionState,
      onSetCode,
      updateMissionStatus,
      taskType,
      username,
      userId
    });
  const ComponentRef = useRef(null);

  return prevPassed ? (
    <ErrorBoundary>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...style
        }}
      >
        <p>
          {index + 1}. {exercise.title}
          {passed && (
            <Icon
              style={{ marginLeft: '1rem' }}
              icon="check"
              color={Color.green()}
            />
          )}
        </p>
        <div
          className={css`
            width: 80%;
            font-size: 1.7rem;
            line-height: 2;
            text-align: center;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
            }
          `}
          style={{ marginTop: '2rem' }}
        >
          {exercise.instruction}
        </div>
        <div
          ref={ComponentRef}
          className={css`
            margin-top: 2rem;
            width: 80%;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
            }
          `}
        >
          <CodeSandbox
            style={{ marginTop: '5rem' }}
            code={exercise.code}
            initialCode={exercise.initialCode}
            onSetCode={exercise.onSetCode}
            onRunCode={exercise.onRunCode}
            onSetErrorMsg={setErrorMsg}
            hasError={!!errorMsg}
            passed={passed || success}
            prevUserId={prevUserId}
            runButtonLabel="check"
          />
          {success && !passed && (
            <SuccessMessage onNextClick={exercise.onNextClick} />
          )}
          {errorMsg && <FailMessage message={errorMsg} />}
          {errorMsg && (
            <div style={{ marginTop: '1rem', fontSize: '1.7rem' }}>
              Need help?{' '}
              <a
                style={{
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: Color.logoBlue()
                }}
                onClick={() => scrollElementToCenter(tutorialRef.current)}
              >
                Read the tutorial for {`"${exercise.title}"`}{' '}
                <Icon icon="arrow-down" />
              </a>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  ) : null;
}
