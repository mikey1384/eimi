import React from 'react';
import PropTypes from 'prop-types';
import Mission from './Mission';
import Tutorial from './Tutorial';
import Loading from 'components/Loading';

Main.propTypes = {
  mission: PropTypes.object.isRequired,
  onSetMissionState: PropTypes.func.isRequired,
  style: PropTypes.object
};

export default function Main({ mission, onSetMissionState, style }) {
  return (
    <div style={{ width: '100%', ...style }}>
      {mission ? (
        <div style={{ width: '100%' }}>
          <Mission
            style={{ width: '100%' }}
            mission={mission}
            onSetMissionState={onSetMissionState}
          />
          <Tutorial
            missionId={mission.id}
            missionTitle={mission.title}
            style={{ marginTop: '5rem', marginBottom: '1rem', width: '100%' }}
            tutorialStarted={mission.tutorialStarted}
            onSetMissionState={onSetMissionState}
            tutorialId={mission.tutorialId}
            tutorialIsPublished={mission.tutorialIsPublished}
          />
        </div>
      ) : (
        <Loading text="Loading Mission..." />
      )}
    </div>
  );
}