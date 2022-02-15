import React from 'react';
import { useNotiContext } from 'contexts';
import moment from 'moment';
import MonthItem from './MonthItem';

const monthLabel = moment().format('MMMM');
const yearLabel = moment().format('YYYY');

export default function CurrentMonth() {
  const top30sMonthly = useNotiContext((v) => v.state.top30sMonthly);

  return (
    <MonthItem
      monthLabel={monthLabel}
      yearLabel={yearLabel}
      top30={top30sMonthly}
    />
  );
}