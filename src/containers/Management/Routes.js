import React from 'react';
import PropTypes from 'prop-types';
import Main from './Main';
import Notification from 'components/Notification';
import ModActivities from './ModActivities';
import Dashboard from './Dashboard';
import { css } from '@emotion/css';
import { mobileMaxWidth } from 'constants/css';
import { Route, Switch } from 'react-router-dom';

Routes.propTypes = {
  className: PropTypes.string,
  location: PropTypes.object
};

export default function Routes({ location, className }) {
  return (
    <div className={className}>
      <div
        className={css`
          margin-top: 1rem;
          width: CALC(100vw - 54rem);
          margin-left: 1rem;
          @media (max-width: ${mobileMaxWidth}) {
            margin-left: 0;
            width: 100%;
          }
        `}
      >
        <Switch>
          <Route path="/management" exact component={Main} />
          <Route path="/management/mod-activities" component={ModActivities} />
          <Route path="/management/dashboard" component={Dashboard} />
        </Switch>
      </div>
      <Notification
        className={css`
          width: 31rem;
          overflow-y: scroll;
          -webkit-overflow-scrolling: touch;
          right: 1rem;
          top: 4.5rem;
          bottom: 0;
          position: absolute;
          @media (max-width: ${mobileMaxWidth}) {
            display: none;
          }
        `}
        location={location.pathname.substring(1)}
      />
    </div>
  );
}
