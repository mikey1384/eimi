import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router';
import { NavLink } from 'react-router-dom';
import { css } from '@emotion/css';
import { mobileMaxWidth } from 'constants/css';
import { socket } from 'constants/io';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { getSectionFromPathname } from 'helpers';
import { useExploreContext } from 'contexts';
import { useMyState } from 'helpers/hooks';
import ErrorBoundary from 'components/ErrorBoundary';
import Notification from 'components/Notification';
import SideMenu from 'components/SideMenu';
import Search from './Search';
import Categories from './Categories';
import Icon from 'components/Icon';
import Videos from './Videos';
import Links from './Links';
import localize from 'constants/localize';

const videosLabel = localize('videos2');
const linksLabel = localize('links');

Explore.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired
};

export default function Explore({ history, location }) {
  const searchText = useExploreContext((v) => v.state.search.searchText);
  const onSetPrevUserId = useExploreContext((v) => v.actions.onSetPrevUserId);
  const { userId } = useMyState();
  const mounted = useRef(true);
  const disconnected = useRef(false);
  const ContainerRef = useRef({});
  const SearchBoxRef = useRef(null);
  const category = getSectionFromPathname(location.pathname)?.section;

  useEffect(() => {
    mounted.current = true;
    return function cleanUp() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    onSetPrevUserId(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    function onConnect() {
      disconnected.current = false;
    }
    function onDisconnect() {
      disconnected.current = true;
    }
    return function cleanUp() {
      socket.removeListener('connect', onConnect);
      socket.removeListener('disconnect', onDisconnect);
    };
  });

  return (
    <ErrorBoundary>
      <div
        ref={ContainerRef}
        className={css`
          width: 100%;
          display: flex;
          @media (max-width: ${mobileMaxWidth}) {
            margin-top: 0;
          }
        `}
      >
        <SideMenu>
          <NavLink to="/videos" activeClassName="active">
            <Icon icon="film" />
            <span style={{ marginLeft: '1.1rem' }}>{videosLabel}</span>
          </NavLink>
          <NavLink to="/links" activeClassName="active">
            <Icon icon="book" />
            <span style={{ marginLeft: '1.1rem' }}>{linksLabel}</span>
          </NavLink>
        </SideMenu>
        <div
          className={css`
            width: CALC(100vw - 51rem - 2rem);
            margin-left: 20rem;
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
              margin-top: 0;
              margin-left: 0;
              margin-right: 0;
            }
          `}
        >
          {stringIsEmpty(searchText) && (
            <Categories
              style={{ marginTop: '5rem', marginBottom: '3rem' }}
              filter={category}
              onSetDefaultSearchFilter={handleSetDefaultSearchFilter}
            />
          )}
          <Search
            history={history}
            pathname={location.pathname}
            innerRef={SearchBoxRef}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              marginBottom: '3rem'
            }}
          />
          <Switch>
            <Route path="/videos" component={Videos} />
            <Route path="/links" component={Links} />
          </Switch>
          <Categories
            style={{ marginTop: '3rem', marginBottom: '4rem' }}
            filter={category}
          />
          <div
            className={css`
              display: none;
              @media (max-width: ${mobileMaxWidth}) {
                display: block;
                width: 100%;
                height: 5rem;
              }
            `}
          />
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
        />
      </div>
    </ErrorBoundary>
  );

  async function handleSetDefaultSearchFilter() {
    if (stringIsEmpty(searchText)) {
      SearchBoxRef.current?.focus();
    }
  }
}
