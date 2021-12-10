import React, { useEffect, useMemo, useRef, useState } from 'react';
import Loading from 'components/Loading';
import ErrorBoundary from 'components/ErrorBoundary';
import FilterBar from 'components/FilterBar';
import RoundList from 'components/RoundList';
import MyRank from 'components/MyRank';
import RankingsListItem from 'components/RankingsListItem';
import { Color, borderRadius } from 'constants/css';
import { useMyState } from 'helpers/hooks';
import { useNotiContext } from 'contexts';
import localize from 'constants/localize';

const myRankingLabel = localize('myRanking');
const top30Label = localize('top30');
const notRankedDescriptionLabel = localize('notRankedDescription');

export default function Rankings() {
  const { rank, twinkleXP, userId } = useMyState();
  const {
    state: { allRanks, top30s, rankingsLoaded }
  } = useNotiContext();
  const [allSelected, setAllSelected] = useState(true);
  const userChangedTab = useRef(false);
  const mounted = useRef(true);
  const prevId = useRef(userId);

  useEffect(() => {
    userChangedTab.current = false;
    if (!rankingsLoaded && mounted.current) {
      setAllSelected(!!userId);
    }
    prevId.current = userId;
  }, [userId, rankingsLoaded]);

  useEffect(() => {
    setAllSelected(!!userId);
  }, [userId]);

  const users = useMemo(
    () => (allSelected ? allRanks : top30s),
    [allRanks, allSelected, top30s]
  );

  return (
    <ErrorBoundary>
      {!!userId && (
        <FilterBar
          bordered
          style={{
            height: '4.5rem',
            fontSize: '1.6rem'
          }}
        >
          <nav
            className={allSelected ? 'active' : ''}
            onClick={() => {
              userChangedTab.current = true;
              setAllSelected(true);
            }}
          >
            {myRankingLabel}
          </nav>
          <nav
            className={allSelected ? '' : 'active'}
            onClick={() => {
              userChangedTab.current = true;
              setAllSelected(false);
            }}
          >
            {top30Label}
          </nav>
        </FilterBar>
      )}
      {rankingsLoaded === false && <Loading />}
      {!!rankingsLoaded && allSelected && !!userId && (
        <MyRank myId={userId} rank={rank} twinkleXP={twinkleXP} />
      )}
      {rankingsLoaded && allSelected && users.length === 0 && !!userId && (
        <div
          style={{
            background: '#fff',
            borderRadius,
            padding: '1rem',
            border: `1px solid ${Color.borderGray()}`
          }}
        >
          {notRankedDescriptionLabel}
        </div>
      )}
      {rankingsLoaded && users.length > 0 && (
        <RoundList style={{ marginTop: 0 }}>
          {users.map((user) => (
            <RankingsListItem key={user.id} user={user} myId={userId} />
          ))}
        </RoundList>
      )}
    </ErrorBoundary>
  );
}
