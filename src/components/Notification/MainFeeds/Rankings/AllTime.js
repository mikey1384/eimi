import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import RoundList from 'components/RoundList';
import RankingsListItem from 'components/RankingsListItem';
import localize from 'constants/localize';
import FilterBar from 'components/FilterBar';
import MyRank from 'components/MyRank';
import { Color, borderRadius } from 'constants/css';

const myRankingLabel = localize('myRanking');
const top30Label = localize('top30');
const notRankedDescriptionLabel = localize('notRankedDescription');

AllTime.propTypes = {
  allRanks: PropTypes.array,
  top30s: PropTypes.array,
  myId: PropTypes.number,
  myAllTimeRank: PropTypes.number,
  myAllTimeXP: PropTypes.number
};

export default function AllTime({
  allRanks,
  myId,
  myAllTimeRank,
  myAllTimeXP,
  top30s
}) {
  const [allSelected, setAllSelected] = useState(true);
  const users = useMemo(() => {
    if (allSelected) {
      return allRanks;
    }
    return top30s;
  }, [allRanks, allSelected, top30s]);
  const loggedIn = !!myId;
  return (
    <>
      {loggedIn && (
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
              setAllSelected(true);
            }}
          >
            {myRankingLabel}
          </nav>
          <nav
            className={allSelected ? '' : 'active'}
            onClick={() => {
              setAllSelected(false);
            }}
          >
            {top30Label}
          </nav>
        </FilterBar>
      )}
      {loggedIn && allSelected && (
        <MyRank myId={myId} rank={myAllTimeRank} twinkleXP={myAllTimeXP} />
      )}
      {users.length === 0 || (allSelected && loggedIn && myAllTimeXP === 0) ? (
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
      ) : (
        <RoundList style={{ marginTop: 0 }}>
          {users.map((user) => (
            <RankingsListItem key={user.id} user={user} myId={myId} />
          ))}
        </RoundList>
      )}
    </>
  );
}
