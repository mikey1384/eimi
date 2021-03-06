import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from 'components/Icon';
import { Route, useHistory } from 'react-router-dom';
import { Color, desktopMinWidth, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import {
  useAppContext,
  useContentContext,
  useExploreContext,
  useProfileContext
} from 'contexts';

const BodyRef = document.scrollingElement || document.documentElement;

Nav.propTypes = {
  isMobileSideMenu: PropTypes.bool,
  active: PropTypes.bool,
  alert: PropTypes.bool,
  alertColor: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  imgLabel: PropTypes.string,
  isHome: PropTypes.bool,
  onClick: PropTypes.func,
  pathname: PropTypes.string,
  style: PropTypes.object,
  to: PropTypes.string
};

function Nav({
  active,
  alert,
  alertColor,
  className,
  to,
  children,
  imgLabel,
  isHome,
  isMobileSideMenu,
  onClick = () => {},
  pathname,
  style
}) {
  const history = useHistory();
  const onResetProfile = useProfileContext((v) => v.actions.onResetProfile);
  const profileState = useProfileContext((v) => v.state) || {};
  const onReloadContent = useContentContext((v) => v.actions.onReloadContent);
  const onClearLinksLoaded = useExploreContext(
    (v) => v.actions.onClearLinksLoaded
  );
  const onClearVideosLoaded = useExploreContext(
    (v) => v.actions.onClearVideosLoaded
  );
  const onSetSubjectsLoaded = useExploreContext(
    (v) => v.actions.onSetSubjectsLoaded
  );
  const highlighted = useMemo(
    () =>
      ['/featured', '/videos', '/links', '/subjects', '/comments'].includes(
        to
      ) &&
      ['featured', 'videos', 'links', 'subjects', 'comments'].includes(
        pathname.substring(1)
      ),
    [pathname, to]
  );
  const highlightColor = useMemo(
    () => (alert ? alertColor : Color.darkGray()),
    [alert, alertColor]
  );
  const onSetProfilesLoaded = useAppContext(
    (v) => v.user.actions.onSetProfilesLoaded
  );

  return (
    <Route
      path={to}
      exact
      children={({ match }) => (
        <div
          onClick={() => {
            if (!isMobileSideMenu) {
              if (match) {
                handleMatch(match);
              }
              history.push(to);
            } else {
              onClick();
            }
          }}
          className={`${className} ${css`
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            .chat {
              color: ${Color.lightGray()};
            }
            nav {
              text-decoration: none;
              font-weight: bold;
              color: ${Color.lightGray()};
              align-items: center;
              line-height: 1;
            }
            > nav.active {
              color: ${highlightColor}!important;
              > svg {
                color: ${highlightColor}!important;
              }
            }
            @media (min-width: ${desktopMinWidth}) {
              &:hover {
                > nav {
                  > svg {
                    color: ${highlightColor};
                  }
                  color: ${highlightColor};
                }
              }
            }
            @media (max-width: ${mobileMaxWidth}) {
              width: 100%;
              justify-content: center;
              font-size: 3rem;
              nav {
                .nav-label {
                  display: none;
                }
              }
              > nav.active {
                > svg {
                  color: ${highlightColor};
                }
              }
            }
          `}`}
          style={style}
        >
          {!isMobileSideMenu ? (
            <nav
              className={to && (match || highlighted) ? 'active ' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                ...(alert ? { color: alertColor || Color.gold() } : {})
              }}
              onClick={onClick}
            >
              <Icon icon={isHome ? 'home' : imgLabel} />
              <span className="nav-label" style={{ marginLeft: '0.7rem' }}>
                {children}
              </span>
            </nav>
          ) : (
            <nav
              className={active ? 'active ' : ''}
              style={{
                display: 'flex',
                cursor: 'pointer',
                justifyContent: 'center'
              }}
            >
              <Icon
                style={{
                  ...(alert ? { color: alertColor || Color.gold() } : {})
                }}
                icon={imgLabel}
              />
              <span
                className="nav-label"
                style={{
                  marginLeft: '0.7rem',
                  ...(alert ? { color: alertColor || Color.gold() } : {})
                }}
              >
                {children}
              </span>
            </nav>
          )}
        </div>
      )}
    />
  );

  function handleMatch(match) {
    if (match.path === '/') {
      document.getElementById('App').scrollTop = 0;
      BodyRef.scrollTop = 0;
    }
    if (match.path.includes('/users/')) {
      const username = match.path.split('/users/')[1].split('/')[0];
      const { profileId } = profileState[username] || {};
      onReloadContent({
        contentId: profileId,
        contentType: 'user'
      });
      onResetProfile(username);
    }
    if (match.path === '/users') {
      onSetProfilesLoaded(false);
    }
    if (['/featured', '/videos', '/links', '/comments'].includes(match.path)) {
      onClearLinksLoaded();
      onSetSubjectsLoaded(false);
      onClearVideosLoaded();
    }
    document.getElementById('App').scrollTop = 0;
    BodyRef.scrollTop = 0;
  }
}

export default memo(Nav);
