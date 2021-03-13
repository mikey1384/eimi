import React from 'react';
import PropTypes from 'prop-types';
import UserView from './UserView';
import CreatorView from './CreatorView';
import { panel } from '../../../Styles';

ViewTutorial.propTypes = {
  isCreator: PropTypes.bool,
  missionId: PropTypes.number,
  onStartClick: PropTypes.func.isRequired,
  onSetMissionState: PropTypes.func.isRequired,
  style: PropTypes.object,
  tutorialPrompt: PropTypes.string,
  tutorialButtonLabel: PropTypes.string
};

export default function ViewTutorial({
  isCreator,
  missionId,
  onStartClick,
  onSetMissionState,
  style,
  tutorialPrompt,
  tutorialButtonLabel
}) {
  return (
    <div className={panel} style={{ padding: '2rem', width: '100%', ...style }}>
      {isCreator ? (
        <CreatorView
          missionId={missionId}
          onSetMissionState={onSetMissionState}
          tutorialPrompt={tutorialPrompt}
          tutorialButtonLabel={tutorialButtonLabel}
        />
      ) : (
        <UserView
          tutorialPrompt={tutorialPrompt}
          tutorialButtonLabel={tutorialButtonLabel}
          onStartClick={onStartClick}
        />
      )}
    </div>
  );
}