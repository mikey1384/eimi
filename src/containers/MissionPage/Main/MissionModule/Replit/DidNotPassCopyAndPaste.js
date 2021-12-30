import React, { useEffect, useMemo, useState, useRef } from 'react';
import ErrorBoundary from 'components/ErrorBoundary';
import MissionItem from 'components/MissionItem';
import Loading from 'components/Loading';
import { Color } from 'constants/css';
import { css } from '@emotion/css';
import { useAppContext, useMissionContext } from 'contexts';

export default function DidNotPassCopyAndPaste() {
  const loadMission = useAppContext((v) => v.requestHelpers.loadMission);
  const onLoadMission = useMissionContext((v) => v.actions.onLoadMission);
  const missionObj = useMissionContext((v) => v.state.missionObj);
  const missionTypeIdHash = useMissionContext((v) => v.state.missionTypeIdHash);
  const [loading, setLoading] = useState(false);

  const copyAndPasteMission = useMemo(
    () => missionObj?.[missionTypeIdHash?.['copy-and-paste']],
    [missionObj, missionTypeIdHash]
  );

  const mounted = useRef(true);

  useEffect(() => {
    if (!copyAndPasteMission && missionTypeIdHash?.['copy-and-paste']) {
      handleLoadCopyAndPasteMission(missionTypeIdHash?.['copy-and-paste']);
    }
    async function handleLoadCopyAndPasteMission(missionId) {
      setLoading(true);
      const { page } = await loadMission({ missionId });
      if (mounted.current) {
        onLoadMission({ mission: page });
      }
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [
    copyAndPasteMission,
    loadMission,
    missionObj,
    missionTypeIdHash,
    onLoadMission
  ]);

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  return (
    <ErrorBoundary
      className={css`
        width: 100%;
        font-size: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        > p {
          font-size: 1.7rem;
        }
        > h2 {
          color: ${Color.cranberry()};
          font-size: 2.2rem;
        }
      `}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          <h2>Requirement not met</h2>
          <p style={{ marginTop: '1rem' }}>
            Please come back after completing the <b>Copy and Paste</b> mission
          </p>
          {copyAndPasteMission && (
            <MissionItem
              style={{ marginTop: '2.5rem' }}
              mission={copyAndPasteMission}
              missionLink={`/missions/${copyAndPasteMission.missionType}`}
            />
          )}
        </>
      )}
    </ErrorBoundary>
  );
}
