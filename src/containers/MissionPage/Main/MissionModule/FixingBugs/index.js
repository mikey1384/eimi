import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import ExerciseContainer from '../components/ExerciseContainer';
import exercises from './exercises';
import TaskComplete from '../components/TaskComplete';
import { useMyState } from 'helpers/hooks';
import { css } from '@emotion/css';

FixingBugs.propTypes = {
  task: PropTypes.object.isRequired,
  onSetMissionState: PropTypes.func.isRequired,
  tutorialRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object])
};

const exerciseKeys = Object.keys(exercises);

export default function FixingBugs({ task, onSetMissionState, tutorialRef }) {
  const { codeObj = {} } = task;
  const { missions } = useMyState();
  const allPassed = useMemo(() => {
    let passed = true;
    for (let key of exerciseKeys) {
      if (missions[task.missionType]?.[key] !== 'pass') {
        passed = false;
        break;
      }
    }
    return passed;
  }, [missions, task.missionType]);

  return (
    <ErrorBoundary
      className={css`
        width: 100%;
        font-size: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        p {
          font-size: 2rem;
          font-weight: bold;
        }
      `}
    >
      {exerciseKeys.map((exerciseKey, index) => (
        <ExerciseContainer
          key={exerciseKey}
          exercises={exercises}
          index={index}
          exerciseKey={exerciseKey}
          prevExerciseKey={index === 0 ? null : exerciseKeys[index - 1]}
          codeObj={codeObj}
          onSetCode={({ code, exerciseLabel }) =>
            onSetMissionState({
              missionId: task.id,
              newState: { codeObj: { ...codeObj, [exerciseLabel]: code } }
            })
          }
          taskType={task.missionType}
          prevUserId={task.prevUserId}
          style={{ marginTop: index === 0 ? 0 : '10rem' }}
          tutorialRef={tutorialRef}
        />
      ))}
      {allPassed && (
        <TaskComplete
          style={{ marginTop: '10rem' }}
          taskId={task.id}
          passMessage="You made it!"
          passMessageFontSize="2.2rem"
        />
      )}
    </ErrorBoundary>
  );
}
