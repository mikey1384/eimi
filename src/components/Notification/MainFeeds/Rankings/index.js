import React, { useEffect, useRef, useState } from 'react';
import Loading from 'components/Loading';
import ErrorBoundary from 'components/ErrorBoundary';
import FilterBar from 'components/FilterBar';
import ThisMonth from './ThisMonth';
import AllTime from './AllTime';
import { useMyState } from 'helpers/hooks';
import { useNotiContext } from 'contexts';
import localize from 'constants/localize';
import moment from 'moment';

const monthLabel = moment().format('MMMM');
const allTimeLabel = localize('allTime');

export default function Rankings() {
  const { userId } = useMyState();
  const [thisMonthSelected, setThisMonthSelected] = useState(!!userId);
  const allRanks = useNotiContext((v) => v.state.allRanks);
  const top30s = useNotiContext((v) => v.state.top30s);
  const allMonthly = useNotiContext((v) => v.state.allMonthly);
  const top30sMonthly = useNotiContext((v) => v.state.top30sMonthly);
  const rankingsLoaded = useNotiContext((v) => v.state.rankingsLoaded);
  const myMonthlyRank = useNotiContext((v) => v.state.myMonthlyRank);
  const myAllTimeRank = useNotiContext((v) => v.state.myAllTimeRank);
  const myMonthlyXP = useNotiContext((v) => v.state.myMonthlyXP);
  const myAllTimeXP = useNotiContext((v) => v.state.myAllTimeXP);
  const userChangedTab = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    userChangedTab.current = false;
    if (!rankingsLoaded && mounted.current) {
      setThisMonthSelected(!!userId);
    }
  }, [userId, rankingsLoaded]);

  useEffect(() => {
    setThisMonthSelected(!!userId);
  }, [userId]);

  return (
    <ErrorBoundary>
      <FilterBar
        bordered
        style={{
          height: '4.5rem',
          fontSize: '1.6rem'
        }}
      >
        <nav
          className={thisMonthSelected ? 'active' : ''}
          onClick={() => {
            userChangedTab.current = true;
            setThisMonthSelected(true);
          }}
        >
          {monthLabel}
        </nav>
        <nav
          className={thisMonthSelected ? '' : 'active'}
          onClick={() => {
            userChangedTab.current = true;
            setThisMonthSelected(false);
          }}
        >
          {allTimeLabel}
        </nav>
      </FilterBar>
      {rankingsLoaded === false && <Loading />}
      {rankingsLoaded && (
        <>
          {thisMonthSelected ? (
            <ThisMonth
              allMonthly={allMonthly}
              top30sMonthly={top30sMonthly}
              myMonthlyRank={myMonthlyRank}
              myMonthlyXP={myMonthlyXP}
              myId={userId}
            />
          ) : (
            <AllTime
              allRanks={allRanks}
              top30s={top30s}
              myAllTimeRank={myAllTimeRank}
              myAllTimeXP={myAllTimeXP}
              myId={userId}
            />
          )}
        </>
      )}
    </ErrorBoundary>
  );
}
