import React, { useContext } from 'react';
import BottomMenu from './BottomMenu';
import TopMenu from './TopMenu';
import LocalContext from '../../Context';

export default function VocabInfo() {
  const {
    myState: { rank, twinkleXP, userId },
    state: { allRanks }
  } = useContext(LocalContext);
  return (
    <div style={{ height: '100%' }}>
      <TopMenu />
      <BottomMenu
        rank={rank}
        allRanks={allRanks}
        twinkleXP={twinkleXP}
        userId={userId}
      />
    </div>
  );
}
