import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, Route } from 'react-router-dom';
import Icon from 'components/Icon';
import ErrorBoundary from 'components/ErrorBoundary';
import { borderRadius, Color, mobileMaxWidth } from 'constants/css';
import { isMobile } from 'helpers';
import { useMyState } from 'helpers/hooks';
import { useAppContext } from 'contexts';
import { css } from '@emotion/css';
import localize from 'constants/localize';

HomeMenuItems.propTypes = {
  history: PropTypes.object,
  style: PropTypes.object
};

const peopleLabel = localize('people');
const storiesLabel = localize('stories');
const earnXPLabel = localize('earnXP');
const storeLabel = localize('store');
const deviceIsMobile = isMobile(navigator);

export default function HomeMenuItems({ history, style = {} }) {
  const onSetProfilesLoaded = useAppContext(
    (v) => v.user.actions.onSetProfilesLoaded
  );
  const { managementLevel, profileTheme } = useMyState();
  const year = useMemo(() => {
    const dt = new Date();
    return dt.getFullYear();
  }, []);

  return (
    <ErrorBoundary>
      <div
        className={`unselectable ${css`
          width: 100%;
          background: #fff;
          display: flex;
          font-size: 1.7rem;
          flex-direction: column;
          border: 1px solid ${Color.borderGray()};
          border-radius: ${borderRadius};
          border-left: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          padding-top: 1rem;
          > nav {
            height: 4rem;
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;
            color: ${Color.gray()};
            justify-content: center;
            > a {
              width: 100%;
              height: 100%;
              text-align: center;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${Color.darkGray()};
              text-decoration: none;
            }
            .homemenu__item {
              width: 100%;
              height: 100%;
              display: grid;
              grid-template-columns: 2px 4rem 1fr;
              grid-template-rows: 100%;
              grid-template-areas: 'selection icon label';
              > .selection {
                grid-area: selection;
                margin-left: -1px;
              }
              > .icon {
                grid-area: icon;
                padding-left: 1rem;
                justify-self: center;
                align-self: center;
              }
              > .label {
                grid-area: label;
                padding-left: 2rem;
                justify-self: start;
                align-self: center;
              }
            }
          }
          > nav:hover {
            background: ${Color.highlightGray()};
            color: ${Color.black()};
            a {
              color: ${Color.black()};
            }
          }
          > nav.active {
            .homemenu__item {
              > .selection {
                background: ${Color[profileTheme]()};
                border: 1px solid ${Color[profileTheme]()};
                box-shadow: 0 0 1px ${Color[profileTheme]()};
              }
            }
            font-weight: bold;
            color: ${Color.black()};
            a {
              color: ${Color.black()};
            }
          }
          @media (max-width: ${mobileMaxWidth}) {
            font-size: 2rem;
            background: #fff;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
            > nav {
              height: 5rem;
              a {
                justify-content: center;
                padding: 0;
              }
            }
            > nav:hover {
              background: none;
              color: ${Color.darkGray()};
              a {
                color: ${Color.darkGray()};
              }
            }
            > nav.active {
              .homemenu__item {
                > .selection {
                  margin-left: 0;
                }
              }
            }
          }
          @media (min-width: 2304px) {
            border-left: 1px solid ${Color.borderGray()};
          }
        `}`}
        style={style}
      >
        <Route
          path="/"
          exact
          children={({ match }) => (
            <nav
              className={match ? 'active' : ''}
              onClick={() => history.push('/')}
            >
              <a href="/" onClick={(e) => e.preventDefault()}>
                <div className="homemenu__item">
                  <div className="selection" />
                  <div className="icon">
                    <Icon icon="book" size="1x" />
                  </div>
                  <div className="label">{storiesLabel}</div>
                </div>
              </a>
            </nav>
          )}
        />
        <Route
          exact
          path="/users"
          children={({ match }) => (
            <nav
              className={match ? 'active' : ''}
              onClick={handleOnPeopleClick}
            >
              <a href="/users" onClick={(e) => e.preventDefault()}>
                <div className="homemenu__item">
                  <div className="selection" />
                  <div className="icon">
                    <Icon icon="users" size="1x" />
                  </div>
                  <div className="label">{peopleLabel}</div>
                </div>
              </a>
            </nav>
          )}
        />
        {false && (
          <Route
            exact
            path="/earn"
            children={({ match }) => (
              <nav
                className={match ? 'active' : ''}
                onClick={() => history.push('/earn')}
              >
                <a href="/earn" onClick={(e) => e.preventDefault()}>
                  <div className="homemenu__item">
                    <div className="selection" />
                    <div className="icon">
                      <Icon icon="bolt" size="1x" />
                    </div>
                    <div className="label">{earnXPLabel}</div>
                  </div>
                </a>
              </nav>
            )}
          />
        )}
        {false && (
          <Route
            exact
            path="/store"
            children={({ match }) => (
              <nav
                className={match ? 'active' : ''}
                onClick={() => history.push('/store')}
              >
                <a href="/store" onClick={(e) => e.preventDefault()}>
                  <div className="homemenu__item">
                    <div className="selection" />
                    <div className="icon">
                      <Icon icon="shopping-bag" size="1x" />
                    </div>
                    <div className="label">{storeLabel}</div>
                  </div>
                </a>
              </nav>
            )}
          />
        )}
        {managementLevel > 0 && deviceIsMobile && (
          <Route
            exact
            path="/management"
            children={({ match }) => (
              <nav
                className={match ? 'active' : ''}
                onClick={() => history.push('/management')}
              >
                <a href="/management" onClick={(e) => e.preventDefault()}>
                  <div className="homemenu__item">
                    <div className="selection" />
                    <div className="icon">
                      <Icon icon="sliders-h" size="1x" />
                    </div>
                    <span className="label">Manage</span>
                  </div>
                </a>
              </nav>
            )}
          />
        )}
        <div
          style={{
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'flex-start',
            // marginTop: '1.5rem',
            marginLeft: '1rem',
            // marginBottom: '0.5rem',
            marginBottom: '1rem',
            color: Color.gray()
          }}
        >
          {false && (
            <div>
              © {year} Twinkle Network ·{' '}
              <Link to="/privacy" style={{ color: Color.gray() }}>
                Privacy
              </Link>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );

  function handleOnPeopleClick() {
    if (deviceIsMobile) {
      onSetProfilesLoaded(false);
    }
    history.push('/users');
  }
}
