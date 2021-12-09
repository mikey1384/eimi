import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import InvalidPage from 'components/InvalidPage';
import FilterBar from 'components/FilterBar';
import Routes from './Routes';
import Loading from 'components/Loading';
import SideMenu from 'components/SideMenu';
import { css } from '@emotion/css';
import { mobileMaxWidth } from 'constants/css';
import { NavLink, useHistory } from 'react-router-dom';
import { useMyState } from 'helpers/hooks';
import { useManagementContext } from 'contexts';
import localize from 'constants/localize';

const accountMgmtLabel = localize('accountMgmt');
const modActivitiesLabel = localize('modActivities');

Management.propTypes = {
  location: PropTypes.object
};

export default function Management({ location }) {
  const history = useHistory();
  const {
    state: { loaded },
    actions: { onLoadManagement }
  } = useManagementContext();
  const { loaded: userLoaded, managementLevel, profileTheme } = useMyState();
  useEffect(() => {
    onLoadManagement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementLevel]);

  return !loaded || !userLoaded ? (
    <Loading />
  ) : managementLevel > 0 ? (
    <div>
      <SideMenu style={{ top: 'CALC(50vh - 8rem)' }}>
        <NavLink to="/management" exact activeClassName="active">
          <span style={{ marginLeft: '1.1rem' }}>{accountMgmtLabel}</span>
        </NavLink>
        <NavLink to="/management/mod-activities" activeClassName="active">
          <span style={{ marginLeft: '1.1rem' }}>{modActivitiesLabel}</span>
        </NavLink>
      </SideMenu>
      <FilterBar
        color={profileTheme}
        style={{ height: '5rem', marginBottom: 0 }}
        className={`mobile ${css`
          @media (max-width: ${mobileMaxWidth}) {
            font-size: 1.3rem;
          }
        `}`}
      >
        <nav
          className={location.pathname === `/management` ? 'active' : ''}
          onClick={() => history.push('/management')}
        >
          {accountMgmtLabel}
        </nav>
        <nav
          className={
            location.pathname === `/management/mod-activities` ? 'active' : ''
          }
          onClick={() => history.push('/management/mod-activities')}
        >
          {modActivitiesLabel}
        </nav>
      </FilterBar>
      <Routes
        className={css`
          width: CALC(100vw - 51rem - 2rem);
          margin-left: 20rem;
          display: flex;
          @media (max-width: ${mobileMaxWidth}) {
            width: 100%;
            margin-top: 0;
            margin-left: 0;
            margin-right: 0;
          }
        `}
        location={location}
      />
    </div>
  ) : (
    <InvalidPage
      title="For authorized moderators only"
      text="You are not authorized to view this page"
    />
  );
}
