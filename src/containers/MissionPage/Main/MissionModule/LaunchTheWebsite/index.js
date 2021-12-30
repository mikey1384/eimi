import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import MultiStepContainer from '../components/MultiStepContainer';
import LetsLaunch from './LetsLaunch';
import MakeAccount from './MakeAccount';
import FinalizeYourCode from './FinalizeYourCode';
import ConnectReplToGitHub from './ConnectReplToGitHub';
import UpdateYourRepl from './UpdateYourRepl';
import defaultCode from './defaultCode';
import RequiresComputer from '../components/RequiresComputer';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import { isMobile } from 'helpers';

LaunchTheWebsite.propTypes = {
  style: PropTypes.object,
  task: PropTypes.object
};

const deviceIsMobile = isMobile(navigator);

export default function LaunchTheWebsite({ style, task }) {
  const { userId, state, username } = useMyState();
  const updateMissionStatus = useAppContext(
    (v) => v.requestHelpers.updateMissionStatus
  );
  const onUpdateUserMissionState = useContentContext(
    (v) => v.actions.onUpdateUserMissionState
  );
  const taskState = useMemo(
    () => state?.missions?.[task?.missionType] || {},
    [state?.missions, task?.missionType]
  );
  const { makeAccountOkayPressed, connectReplToGitHubOkayPressed } = taskState;
  const FirstButton = useMemo(() => {
    return {
      label: 'Save and move on',
      color: 'blue',
      skeuomorphic: true,
      onClick: async (onNext) => {
        await handleSaveCode(taskState.code);
        onNext();
      }
    };

    async function handleSaveCode(code) {
      await updateMissionStatus({
        missionType: task.missionType,
        newStatus: { code }
      });
    }
  }, [task.missionType, taskState.code, updateMissionStatus]);

  const SecondButton = useMemo(() => {
    if (!makeAccountOkayPressed) {
      return {
        label: 'Okay',
        color: 'logoBlue',
        noArrow: true,
        skeuomorphic: true,
        onClick: () => {
          window.open('https://vercel.com');
          setTimeout(
            () => handleUpdateTaskProgress({ makeAccountOkayPressed: true }),
            1000
          );
        }
      };
    }
    return {
      label: 'I made an account',
      color: 'green',
      skeuomorphic: true
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeAccountOkayPressed, task.id]);

  const FourthButton = useMemo(() => {
    if (!connectReplToGitHubOkayPressed) {
      return {
        label: 'Okay',
        color: 'logoBlue',
        noArrow: true,
        disabled: deviceIsMobile,
        skeuomorphic: true,
        onClick: () =>
          handleUpdateTaskProgress({ connectReplToGitHubOkayPressed: true })
      };
    }
    return {
      label: 'Yes',
      color: 'green',
      disabled: deviceIsMobile,
      skeuomorphic: true
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectReplToGitHubOkayPressed, task.id]);
  const code = useMemo(
    () => taskState.code || defaultCode({ username }),
    [taskState.code, username]
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function onDismount() {
      mounted.current = false;
    };
  }, []);

  return (
    <ErrorBoundary style={style}>
      <MultiStepContainer
        buttons={[
          FirstButton,
          SecondButton,
          {
            label: 'Yes I did',
            color: 'green',
            skeuomorphic: true,
            disabled: deviceIsMobile
          },
          FourthButton
        ]}
        taskId={task.id}
        taskType={task.missionType}
      >
        <FinalizeYourCode
          code={taskState.code}
          onSetCode={handleSetCode}
          task={task}
          username={username}
        />
        <MakeAccount
          onSetOkayPressed={() =>
            handleUpdateTaskProgress({ makeAccountOkayPressed: true })
          }
          okayPressed={makeAccountOkayPressed}
        />
        <RequiresComputer>
          <UpdateYourRepl code={code} />
        </RequiresComputer>
        <RequiresComputer>
          <ConnectReplToGitHub
            taskType={task.missionType}
            okayPressed={connectReplToGitHubOkayPressed}
          />
        </RequiresComputer>
        <LetsLaunch taskId={task.id} />
      </MultiStepContainer>
    </ErrorBoundary>
  );

  function handleSetCode(code) {
    onUpdateUserMissionState({
      userId,
      missionType: task.missionType,
      newState: { code }
    });
  }

  async function handleUpdateTaskProgress(newState) {
    await updateMissionStatus({
      missionType: task.missionType,
      newStatus: newState
    });
    onUpdateUserMissionState({
      userId,
      missionType: task.missionType,
      newState
    });
  }
}
