import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Loading from 'components/Loading';
import Mission from './Mission';
import Tutorial from './Tutorial';
import InvalidPage from 'components/InvalidPage';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useMissionContext } from 'contexts';

MissionPage.propTypes = {
  match: PropTypes.object.isRequired
};

export default function MissionPage({
  match: {
    params: { missionId }
  }
}) {
  const mounted = useRef(true);
  const { loaded, userId } = useMyState();
  const {
    requestHelpers: { loadMission, updateCurrentMission }
  } = useAppContext();
  const {
    actions: { onUpdateCurrentMission }
  } = useContentContext();
  const {
    actions: { onLoadMission },
    state: { missionObj }
  } = useMissionContext();

  const mission = useMemo(() => missionObj[missionId] || {}, [
    missionId,
    missionObj
  ]);

  useEffect(() => {
    if (userId) {
      updateCurrentMission(missionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    onUpdateCurrentMission({ missionId: Number(missionId), userId });
    if (!mission.loaded) {
      init();
    }

    async function init() {
      const data = await loadMission(missionId);
      if (mounted.current) {
        onLoadMission(data);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mounted.current = true;

    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  return loaded ? (
    userId ? (
      <div style={{ paddingTop: '1rem' }}>
        {mission ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column'
            }}
          >
            <Mission
              missionId={mission.id}
              description={mission.description}
              subtitle={mission.subtitle}
              missionType={mission.missionType}
              title={mission.title}
            />
            <Tutorial
              style={{ marginTop: '5rem' }}
              tutorialId={mission.tutorialId}
            />
          </div>
        ) : (
          <Loading text="Loading Mission..." />
        )}
      </div>
    ) : (
      <InvalidPage
        title="For Registered Users Only"
        text="Please Log In or Sign Up"
      />
    )
  ) : (
    <Loading />
  );
}
