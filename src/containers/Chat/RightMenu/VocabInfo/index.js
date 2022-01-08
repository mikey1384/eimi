import React, { useContext } from 'react';
import BottomMenu from './BottomMenu';
import TopMenu from './TopMenu';
import LocalContext from '../../Context';
import { useMyState } from 'helpers/hooks';

export default function VocabInfo() {
  const {
    state: { allRanks }
  } = useContext(LocalContext);
  const { rank, twinkleXP, userId } = useMyState();
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
