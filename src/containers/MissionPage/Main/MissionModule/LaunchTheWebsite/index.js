import React, { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from 'components/ErrorBoundary';
import MultiStepContainer from '../components/MultiStepContainer';
import WebsiteVerfier from './WebsiteVerifier';
import { useAppContext, useContentContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import MakeAccount from './MakeAccount';

LaunchTheWebsite.propTypes = {
  style: PropTypes.object,
  task: PropTypes.object
};

export default function LaunchTheWebsite({ style, task }) {
  const { userId, state } = useMyState();
  const {
    requestHelpers: { updateMissionStatus }
  } = useAppContext();
  const {
    actions: { onUpdateMissionState }
  } = useContentContext();
  const taskState = useMemo(
    () => state?.missions?.[task?.missionType] || {},
    [state?.missions, task?.missionType]
  );
  const { accountMade, makeAccountOkayPressed } = taskState;
  const FirstButton = useMemo(() => {
    if (!makeAccountOkayPressed && !accountMade) {
      return {
        label: 'Okay',
        color: 'logoBlue',
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
      skeuomorphic: true,
      onClick: async (goNext) => {
        await goNext();
        handleUpdateTaskProgress({ accountMade: true });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeAccountOkayPressed, task.id]);

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
        buttons={[FirstButton]}
        taskId={task.id}
        taskType={task.missionType}
      >
        <MakeAccount
          onSetOkayPressed={() =>
            handleUpdateTaskProgress({ makeAccountOkayPressed: true })
          }
          accountMade={!!accountMade}
          okayPressed={makeAccountOkayPressed}
        />
        <WebsiteVerfier />
      </MultiStepContainer>
    </ErrorBoundary>
  );

  async function handleUpdateTaskProgress(newState) {
    await updateMissionStatus({
      missionType: task.missionType,
      newStatus: newState
    });
    onUpdateMissionState({
      userId,
      missionType: task.missionType,
      newState
    });
  }
}
