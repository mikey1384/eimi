import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import MissionItem from 'components/MissionItem';
import ErrorBoundary from 'components/ErrorBoundary';
import FilterBar from 'components/FilterBar';
import Loading from 'components/Loading';
import { useMissionContext } from 'contexts';
import { mobileMaxWidth } from 'constants/css';
import { checkMultiMissionPassStatus } from 'helpers/userDataHelpers';
import { useMyState } from 'helpers/hooks';
import { css } from '@emotion/css';

MissionList.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  missions: PropTypes.array.isRequired,
  missionObj: PropTypes.object.isRequired
};

export default function MissionList({
  style,
  className,
  missions,
  missionObj
}) {
  const {
    state: { selectedMissionListTab, myAttempts },
    actions: { onSetSelectedMissionListTab }
  } = useMissionContext();
  const { userId } = useMyState();
  const ongoingMissions = useMemo(() => {
    return missions.filter(
      (missionId) => !returnPassStatus({ missionId, myAttempts })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions, myAttempts]);
  const completedMissions = useMemo(() => {
    return missions.filter((missionId) =>
      returnPassStatus({ missionId, myAttempts })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions, myAttempts]);
  useEffect(() => {
    if (selectedMissionListTab) {
      return;
    }
    onSetSelectedMissionListTab('ongoing');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ongoingMissions.length, selectedMissionListTab]);
  let displayedMissions = useMemo(() => {
    if (userId) {
      if (selectedMissionListTab === 'ongoing') {
        return ongoingMissions;
      }
      if (selectedMissionListTab === 'complete') {
        return completedMissions;
      }
      return [];
    }
    return missions;
  }, [
    completedMissions,
    missions,
    ongoingMissions,
    selectedMissionListTab,
    userId
  ]);

  return (
    <ErrorBoundary>
      <div style={style} className={className}>
        <p style={{ fontWeight: 'bold', fontSize: '2.5rem' }}>All Missions</p>
        {userId && (
          <FilterBar
            className={css`
              @media (max-width: ${mobileMaxWidth}) {
                width: CALC(100% + 2rem) !important;
                margin-left: -1rem;
              }
            `}
            style={{ marginTop: '1rem' }}
            bordered
          >
            <nav
              className={selectedMissionListTab === 'ongoing' ? 'active' : ''}
              onClick={() => onSetSelectedMissionListTab('ongoing')}
            >
              In Progress
            </nav>
            <nav
              className={selectedMissionListTab === 'complete' ? 'active' : ''}
              onClick={() => onSetSelectedMissionListTab('complete')}
            >
              Complete
            </nav>
          </FilterBar>
        )}
        <div>
          <div style={{ marginTop: '1rem' }}>
            {displayedMissions.length === 0 ? (
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '18rem',
                  fontWeight: 'bold',
                  fontSize: '2rem'
                }}
              >
                {selectedMissionListTab === 'ongoing' ? (
                  'You have completed every available mission'
                ) : selectedMissionListTab === 'complete' ? (
                  `You haven't completed any mission, yet`
                ) : (
                  <Loading />
                )}
              </div>
            ) : (
              displayedMissions.map((missionId, index) => {
                const mission = missionObj[missionId];
                return (
                  <MissionItem
                    style={{ marginTop: index > 0 ? '1rem' : 0 }}
                    key={missionId}
                    mission={mission}
                    missionLink={`/missions/${mission.missionType}`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );

  function returnPassStatus({ missionId, myAttempts }) {
    const mission = missionObj[missionId];
    if (mission.isMultiMission) {
      const { passed } = checkMultiMissionPassStatus({
        mission,
        myAttempts
      });
      return passed;
    }
    return myAttempts[missionId]?.status === 'pass';
  }
}
