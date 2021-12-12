import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import SectionPanel from 'components/SectionPanel';
import BarChart from './BarChart';
import ErrorBoundary from 'components/ErrorBoundary';
import { useAppContext } from 'contexts';
import localize from 'constants/localize';

const monthlyXpGrowthLabel = localize('monthlyXpGrowth');

MonthlyXp.propTypes = {
  selectedTheme: PropTypes.string,
  userId: PropTypes.number.isRequired
};

export default function MonthlyXp({ selectedTheme, userId }) {
  const {
    requestHelpers: { loadMonthlyXp }
  } = useAppContext();
  const [data, setData] = useState();
  const [loaded, setLoaded] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    init();
    async function init() {
      const data = await loadMonthlyXp(userId);
      if (mounted.current) {
        setData(data);
        setLoaded(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <ErrorBoundary>
      <SectionPanel
        customColorTheme={selectedTheme}
        title={monthlyXpGrowthLabel}
        loaded={loaded}
      >
        {data && (
          <BarChart bars={data?.bars || []} topValue={data?.topValue || 1} />
        )}
      </SectionPanel>
    </ErrorBoundary>
  );
}
