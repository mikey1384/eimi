import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import RoundList from 'components/RoundList';
import RankingsListItem from 'components/RankingsListItem';
import localize from 'constants/localize';
import FilterBar from 'components/FilterBar';
import MyRank from 'components/MyRank';
import { Color, borderRadius } from 'constants/css';

const noRankersThisMonthLabel = localize('noRankersThisMonth');
const myRankingLabel = localize('myRanking');
const top30Label = localize('top30');
const notRankedForThisMonthLabel = localize('notRankedForThisMonth');

ThisMonth.propTypes = {
  allMonthly: PropTypes.array,
  top30sMonthly: PropTypes.array,
  myId: PropTypes.number,
  myMonthlyRank: PropTypes.number,
  myMonthlyXP: PropTypes.number
};

export default function ThisMonth({
  allMonthly,
  top30sMonthly,
  myId,
  myMonthlyRank,
  myMonthlyXP
}) {
  const [allSelected, setAllSelected] = useState(true);
  const users = useMemo(() => {
    if (allSelected) {
      return allMonthly;
    }
    return top30sMonthly;
  }, [allMonthly, allSelected, top30sMonthly]);
  const loggedIn = !!myId;
  return (
    <>
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
      {loggedIn && allSelected && (
        <MyRank myId={myId} rank={myMonthlyRank} twinkleXP={myMonthlyXP} />
      )}
      {users.length === 0 || (allSelected && myMonthlyXP === 0) ? (
        <div
          style={{
            background: '#fff',
            borderRadius,
            padding: '1rem',
            border: `1px solid ${Color.borderGray()}`
          }}
        >
          {myMonthlyXP === 0
            ? notRankedForThisMonthLabel
            : noRankersThisMonthLabel}
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
