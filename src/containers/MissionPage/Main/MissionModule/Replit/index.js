import React, { useMemo } from 'react';
import ErrorBoundary from 'components/ErrorBoundary';
import ReplitVerifier from './ReplitVerifier';
import { useMissionContext } from 'contexts';

export default function Replit() {
  const {
    state: { missionTypeIdHash, myAttempts }
  } = useMissionContext();
  const copyAndPasteId = useMemo(() => missionTypeIdHash['copy-and-paste'], [
    missionTypeIdHash
  ]);
  const myCopyAndPasteAttempt = useMemo(() => myAttempts[copyAndPasteId], [
    copyAndPasteId,
    myAttempts
  ]);
  const copyAndPasteAttemptPassed = useMemo(
    () => myCopyAndPasteAttempt?.status === 'pass',
    [myCopyAndPasteAttempt?.status]
  );

  return (
    <ErrorBoundary style={{ width: '100%' }}>
      {copyAndPasteAttemptPassed ? (
        <ReplitVerifier />
      ) : (
        <div>Did not pass copy and paste yet</div>
      )}
    </ErrorBoundary>
  );
}
