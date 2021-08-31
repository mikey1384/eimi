import React, { memo, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Nav from './Nav';
import Icon from 'components/Icon';
import { matchPath } from 'react-router';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { getSectionFromPathname } from 'helpers';
import { addCommasToNumber, truncateText } from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { useHomeContext, useViewContext } from 'contexts';
import { socket } from 'constants/io';

MainNavs.propTypes = {
  loggedIn: PropTypes.bool,
  numChatUnreads: PropTypes.number,
  numNewNotis: PropTypes.number,
  numNewPosts: PropTypes.number,
  onMobileMenuOpen: PropTypes.func.isRequired,
  pathname: PropTypes.string,
  defaultSearchFilter: PropTypes.string,
  totalRewardAmount: PropTypes.number
};

function MainNavs({
  loggedIn,
  numChatUnreads,
  numNewNotis,
  numNewPosts,
  onMobileMenuOpen,
  pathname,
  defaultSearchFilter,
  totalRewardAmount
}) {
  const { twinkleCoins, userId, banned } = useMyState();
  const {
    state: { exploreCategory, contentPath, contentNav, profileNav, homeNav },
    actions: {
      onSetExploreCategory,
      onSetContentPath,
      onSetContentNav,
      onSetProfileNav,
      onSetHomeNav
    }
  } = useViewContext();
  const {
    state: { feedsOutdated }
  } = useHomeContext();
  const loaded = useRef(false);

  const chatMatch = useMemo(
    () =>
      matchPath(pathname, {
        path: '/chat',
        exact: true
      }),
    [pathname]
  );

  const homeMatch = useMemo(
    () =>
      matchPath(pathname, {
        path: '/',
        exact: true
      }),
    [pathname]
  );

  const usersMatch = useMemo(
    () =>
      matchPath(pathname, {
        path: '/users',
        exact: true
      }),
    [pathname]
  );

  const earnMatch = useMemo(
    () =>
      matchPath(pathname, {
        path: '/earn',
        exact: true
      }),
    [pathname]
  );

  const storeMatch = useMemo(
    () =>
      matchPath(pathname, {
        path: '/store',
        exact: true
      }),
    [pathname]
  );

  const contentPageMatch = useMemo(() => {
    const subjectPageMatch = matchPath(pathname, {
      path: '/subjects/:id',
      exact: true
    });
    const playlistsMatch = matchPath(pathname, {
      path: '/playlists/:id',
      exact: true
    });
    const videoPageMatch = matchPath(pathname, {
      path: '/videos/:id',
      exact: true
    });
    const linkPageMatch = matchPath(pathname, {
      path: '/links/:id',
      exact: true
    });
    const commentPageMatch = matchPath(pathname, {
      path: '/comments/:id',
      exact: true
    });
    const missionPageMatch = matchPath(pathname, {
      path: '/missions/:id'
    });

    return (
      !!subjectPageMatch ||
      !!playlistsMatch ||
      !!videoPageMatch ||
      !!linkPageMatch ||
      !!commentPageMatch ||
      !!missionPageMatch
    );
  }, [pathname]);

  const profilePageMatch = matchPath(pathname, {
    path: '/users/:userId'
  });

  useEffect(() => {
    const { section } = getSectionFromPathname(pathname);
    if (homeMatch) {
      onSetHomeNav('/');
    } else if (usersMatch) {
      onSetHomeNav('/users');
    } else if (earnMatch) {
      onSetHomeNav('/earn');
    } else if (storeMatch) {
      onSetHomeNav('/store');
    }

    if (contentPageMatch) {
      if (contentNav !== section) {
        onSetContentNav(section);
      }
      onSetContentPath(pathname.substring(1));
    }
    if (profilePageMatch) {
      onSetProfileNav(pathname);
    }
    if (['links', 'videos', 'subjects'].includes(section)) {
      onSetExploreCategory(section);
      loaded.current = true;
    } else if (!loaded.current && defaultSearchFilter) {
      onSetExploreCategory(
        ['videos', 'subjects', 'links'].includes(defaultSearchFilter)
          ? defaultSearchFilter
          : 'subjects'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearchFilter, pathname]);

  const contentIconType = useMemo(
    () =>
      contentNav === 'videos' || contentNav === 'playlists'
        ? 'film'
        : contentNav === 'links'
        ? 'book'
        : contentNav === 'subjects'
        ? 'bolt'
        : contentNav === 'missions'
        ? 'clipboard-check'
        : 'comment-alt',
    [contentNav]
  );

  const profileUsername = useMemo(() => {
    let result = '';
    if (profileNav) {
      const splitProfileNav = profileNav.split('/users/')[1].split('/');
      result = splitProfileNav[0];
    }
    return result;
  }, [profileNav]);

  const chatAlertShown = useMemo(
    () => loggedIn && !chatMatch && numChatUnreads > 0,
    [chatMatch, loggedIn, numChatUnreads]
  );

  useEffect(() => {
    socket.emit('change_busy_status', !chatMatch);
  }, [chatMatch]);

  return (
    <div
      className={css`
        padding: 0;
        display: flex;
        justify-content: center;
        width: auto;
        @media (max-width: ${mobileMaxWidth}) {
          width: 100%;
        }
      `}
    >
      <Nav
        isMobileSideMenu
        className="mobile"
        alert={numNewNotis > 0 || totalRewardAmount > 0}
        alertColor={Color.gold()}
        imgLabel="bars"
        onClick={onMobileMenuOpen}
      />
      {profileNav && (
        <Nav
          to={profileNav}
          pathname={pathname}
          className="mobile"
          imgLabel="user"
        />
      )}
      <Nav
        to={homeNav}
        isHome
        className="mobile"
        imgLabel="home"
        alert={pathname === '/' && (numNewPosts > 0 || feedsOutdated)}
      />
      <Nav
        to={`/${exploreCategory}`}
        pathname={pathname}
        className="mobile"
        imgLabel="search"
      />
      {contentNav && (
        <Nav
          to={`/${contentPath}`}
          pathname={pathname}
          className="mobile"
          imgLabel={contentIconType}
        />
      )}
      <Nav
        to={`/missions`}
        pathname={pathname}
        className="mobile"
        imgLabel="tasks"
      />
      {!banned?.chat && (
        <Nav
          to="/chat"
          pathname={pathname}
          className="mobile"
          imgLabel="comments"
          alert={chatAlertShown}
        />
      )}
      {profileNav && (
        <Nav
          to={profileNav}
          pathname={pathname}
          className="desktop"
          style={{ marginRight: '2rem' }}
          imgLabel="user"
        >
          {truncateText({ text: profileUsername.toUpperCase(), limit: 7 })}
        </Nav>
      )}
      <Nav
        to={homeNav}
        isHome
        pathname={pathname}
        className="desktop"
        imgLabel="home"
        alert={pathname === '/' && !usersMatch && numNewPosts > 0}
      >
        HOME
        {pathname === '/' && !usersMatch && numNewPosts > 0
          ? ` (${numNewPosts})`
          : ''}
      </Nav>
      <Nav
        to={`/${exploreCategory}`}
        pathname={pathname}
        className="desktop"
        style={{ marginLeft: '2rem' }}
        imgLabel="search"
      >
        EXPLORE
      </Nav>
      {contentNav && (
        <Nav
          to={`/${contentPath}`}
          pathname={pathname}
          className="desktop"
          style={{ marginLeft: '2rem' }}
          imgLabel={contentIconType}
        >
          {contentNav.substring(0, contentNav.length - 1).toUpperCase()}
        </Nav>
      )}
      <Nav
        to={`/missions`}
        pathname={pathname}
        className="desktop"
        style={{ marginLeft: '2rem' }}
        imgLabel="tasks"
      >
        MISSIONS
      </Nav>
      <div
        className={css`
          margin-left: 2rem;
          @media (max-width: ${mobileMaxWidth}) {
            margin-left: 0;
          }
        `}
      >
        {!banned?.chat && (
          <Nav
            to="/chat"
            pathname={pathname}
            className="desktop"
            imgLabel="comments"
            alert={chatAlertShown}
          >
            CHAT
          </Nav>
        )}
      </div>
      {userId && typeof twinkleCoins === 'number' && (
        <div
          className={`mobile ${css`
            @media (max-width: ${mobileMaxWidth}) {
              font-size: 1.3rem;
            }
          `}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingRight: '1rem'
          }}
        >
          <Icon
            style={{ marginRight: '0.5rem' }}
            icon={['far', 'badge-dollar']}
          />
          {addCommasToNumber(twinkleCoins)}
        </div>
      )}
    </div>
  );
}

export default memo(MainNavs);
