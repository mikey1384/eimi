import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import FilterBar from 'components/FilterBar';
import Ranker from './Ranker';
import { useAppContext } from 'contexts';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import { css } from 'emotion';

GrammarRankings.propTypes = {
  mission: PropTypes.object.isRequired
};

export default function GrammarRankings({
  mission,
  mission: {
    myAttempt: { numRepeated }
  }
}) {
  const [allSelected, setAllSelected] = useState(numRepeated > 0);
  const [top30s, setTop30s] = useState([]);
  const [all, setAll] = useState([]);
  const {
    requestHelpers: { loadMissionRankings }
  } = useAppContext();
  useEffect(() => {
    init();

    async function init() {
      const { top30s, all } = await loadMissionRankings(mission.id);
      setTop30s(top30s);
      setAll(all);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rankers = useMemo(() => (allSelected ? all : top30s), [
    all,
    allSelected,
    top30s
  ]);

  return (
    <div>
      {numRepeated > 0 && (
        <FilterBar bordered>
          <nav
            onClick={() => setAllSelected(true)}
            className={allSelected ? 'active' : ''}
          >
            Rankings
          </nav>
          <nav
            onClick={() => setAllSelected(false)}
            className={!allSelected ? 'active' : ''}
          >
            Top 30s
          </nav>
        </FilterBar>
      )}
      <div
        className={css`
          border: 1px solid ${Color.borderGray()};
          border-radius: ${borderRadius};
          @media (max-width: ${mobileMaxWidth}) {
            border-left: 0;
            border-right: 0;
            border-radius: 0;
          }
        `}
        style={{
          width: '100%',
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'center',
          background: Color.wellGray()
        }}
      >
        <div
          className={css`
            min-width: 40rem;
            width: 40%;
            @media (max-width: ${mobileMaxWidth}) {
              min-width: 0;
              width: 100%;
            }
          `}
        >
          {rankers.map((ranker) => (
            <Ranker key={ranker.id} user={ranker} />
          ))}
        </div>
      </div>
    </div>
  );
}
