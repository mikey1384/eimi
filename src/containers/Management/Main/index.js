import React, { useEffect, useMemo } from 'react';
import ErrorBoundary from 'components/ErrorBoundary';
import Moderators from './Moderators';
import AccountTypes from './AccountTypes';
import BannedUsers from './BannedUsers';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useManagementContext } from 'contexts';

export default function Main() {
  const { managementLevel } = useMyState();
  const canManage = useMemo(() => managementLevel > 1, [managementLevel]);
  const loadAccountTypes = useAppContext(
    (v) => v.requestHelpers.loadAccountTypes
  );
  const loadBannedUsers = useAppContext(
    (v) => v.requestHelpers.loadBannedUsers
  );
  const loadModerators = useAppContext((v) => v.requestHelpers.loadModerators);
  const onLoadAccountTypes = useManagementContext(
    (v) => v.actions.onLoadAccountTypes
  );
  const onLoadBannedUsers = useManagementContext(
    (v) => v.actions.onLoadBannedUsers
  );
  const onLoadModerators = useManagementContext(
    (v) => v.actions.onLoadModerators
  );

  useEffect(() => {
    initModerators();
    initAccountTypes();
    initBannedUsers();
    async function initModerators() {
      const moderators = await loadModerators();
      onLoadModerators(moderators);
    }
    async function initAccountTypes() {
      const data = await loadAccountTypes();
      onLoadAccountTypes(data);
    }
    async function initBannedUsers() {
      const data = await loadBannedUsers();
      onLoadBannedUsers(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary style={{ paddingBottom: '10rem' }}>
      <Moderators canManage={canManage} />
      <AccountTypes canManage={canManage} />
      <BannedUsers canManage={canManage} />
    </ErrorBoundary>
  );
}
