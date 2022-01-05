import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import DropdownList from 'components/DropdownList';
import { Color } from 'constants/css';
import { useHistory } from 'react-router-dom';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useChatContext } from 'contexts';
import { isMobile } from 'helpers';
import { addCommasToNumber } from 'helpers/stringHelpers';
import localize from 'constants/localize';

const deviceIsMobile = isMobile(navigator);
const chatLabel = localize('chat2');
const deletedLabel = localize('deleted');
const profileLabel = localize('Profile');

UsernameText.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  onMenuShownChange: PropTypes.func,
  style: PropTypes.object,
  user: PropTypes.object,
  wordBreakEnabled: PropTypes.bool
};

export default function UsernameText({
  className,
  color,
  onMenuShownChange,
  style = {},
  user = {},
  wordBreakEnabled
}) {
  const mounted = useRef(true);
  const history = useHistory();
  const coolDownRef = useRef(null);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const hideTimerRef2 = useRef(null);
  const UsernameTextRef = useRef(null);
  const mouseEntered = useRef(false);
  const loadDMChannel = useAppContext((v) => v.requestHelpers.loadDMChannel);
  const loadProfile = useAppContext((v) => v.requestHelpers.loadProfile);
  const onInitContent = useContentContext((v) => v.actions.onInitContent);
  const { rank, twinkleXP } = useContentState({
    contentType: 'user',
    contentId: user.id
  });
  const { userId, username, profilePicUrl, authLevel } = useMyState();
  const onOpenNewChatTab = useChatContext((v) => v.actions.onOpenNewChatTab);
  const [dropdownContext, setDropdownContext] = useState(null);
  const menuShownRef = useRef(false);
  const userXP = useMemo(() => {
    if (!twinkleXP && !user.twinkleXP) {
      return null;
    }
    return addCommasToNumber(twinkleXP || user.twinkleXP);
  }, [twinkleXP, user.twinkleXP]);
  const userRank = useMemo(() => {
    return rank || user.rank;
  }, [rank, user.rank]);

  useEffect(() => {
    mounted.current = true;

    return function cleanup() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    menuShownRef.current = !!dropdownContext;
    onMenuShownChange?.(!!dropdownContext);
  }, [dropdownContext, onMenuShownChange]);

  return (
    <div
      ref={UsernameTextRef}
      style={{
        display: 'inline',
        ...(dropdownContext
          ? {}
          : { overflowX: 'hidden', textOverflow: 'ellipsis' }),
        position: 'relative',
        ...style
      }}
      className={className}
      onMouseLeave={() => {
        clearTimeout(showTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          if (mounted.current) {
            setDropdownContext(null);
          }
        }, 500);
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'inline'
        }}
      >
        <p
          style={{
            display: 'inline',
            cursor: 'pointer',
            fontWeight: 'bold',
            ...(wordBreakEnabled
              ? { overflowWrap: 'break-word', wordBreak: 'break-word' }
              : {}),
            color: user.username
              ? color || Color.darkerGray()
              : Color.lighterGray()
          }}
          onClick={onUsernameClick}
          onMouseEnter={onMouseEnter}
        >
          {user.username || `(${deletedLabel})`}
        </p>
      </div>
      {dropdownContext && (
        <DropdownList
          dropdownContext={dropdownContext}
          onHideMenu={handleHideMenuWithCoolDown}
          onMouseEnter={() => {
            clearTimeout(hideTimerRef.current);
            clearTimeout(hideTimerRef2.current);
          }}
          style={{ minWidth: '10rem' }}
          onMouseLeave={() => {
            hideTimerRef2.current = setTimeout(() => {
              if (mounted.current) {
                setDropdownContext(null);
              }
            }, 500);
          }}
        >
          <li onClick={() => history.push(`/users/${user.username}`)}>
            <a
              style={{ color: Color.darkerGray(), cursor: 'pointer' }}
              onClick={(e) => e.preventDefault()}
            >
              {profileLabel}
            </a>
          </li>
          {user.id !== userId && (
            <li onClick={onLinkClick}>
              <a style={{ color: Color.darkerGray() }}>{chatLabel}</a>
            </li>
          )}
          {userXP && (
            <li
              style={{
                padding: '5px',
                background:
                  !!userRank && userRank < 4
                    ? Color.darkerGray()
                    : Color.highlightGray(),
                color: !!userRank && userRank < 4 ? '#fff' : Color.darkerGray(),
                fontSize: '1rem',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              {userXP} XP
              {!!userRank && userRank < 4 ? (
                <span
                  style={{
                    fontWeight: 'bold',
                    color:
                      userRank === 1
                        ? Color.gold()
                        : userRank === 2
                        ? '#fff'
                        : Color.orange()
                  }}
                >
                  {' '}
                  (#{userRank})
                </span>
              ) : (
                ''
              )}
            </li>
          )}
        </DropdownList>
      )}
    </div>
  );

  function handleHideMenuWithCoolDown() {
    coolDownRef.current = true;
    setDropdownContext(null);
    setTimeout(() => {
      coolDownRef.current = false;
    }, 10);
  }

  async function onMouseEnter() {
    mouseEntered.current = true;
    const parentElementDimensions =
      UsernameTextRef.current?.getBoundingClientRect() || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    if (user.username && !deviceIsMobile) {
      clearTimeout(hideTimerRef.current);
      clearTimeout(hideTimerRef2.current);
      clearTimeout(showTimerRef.current);
      if (!twinkleXP && !user.twinkleXP) {
        showTimerRef.current = setTimeout(async () => {
          const data = await loadProfile(user.id);
          if (mouseEntered.current) {
            if (mounted.current) {
              onInitContent({
                contentId: user.id,
                contentType: 'user',
                ...data
              });
            }
            if (mounted.current) {
              setDropdownContext(parentElementDimensions);
            }
          }
        }, 500);
      } else {
        showTimerRef.current = setTimeout(
          () => setDropdownContext(parentElementDimensions),
          500
        );
      }
    }
  }

  async function onLinkClick() {
    setDropdownContext(null);
    if (user.id !== userId) {
      const { pathId } = await loadDMChannel({ recepient: user });
      if (mounted.current) {
        if (!pathId) {
          onOpenNewChatTab({
            user: { username, id: userId, profilePicUrl, authLevel },
            recepient: {
              username: user.username,
              id: user.id,
              profilePicUrl: user.profilePicUrl,
              authLevel: user.authLevel
            }
          });
        }
        history.push(pathId ? `/chat/${pathId}` : `/chat/new`);
      }
    }
  }

  async function onUsernameClick() {
    const elementContext = {
      x: UsernameTextRef.current.getBoundingClientRect().left,
      y: UsernameTextRef.current.getBoundingClientRect().top,
      width: UsernameTextRef.current.getBoundingClientRect().width,
      height: UsernameTextRef.current.getBoundingClientRect().height
    };
    if (user.username) {
      if (!twinkleXP && !user.twinkleXP && !menuShownRef.current) {
        const data = await loadProfile(user.id);
        if (mounted.current) {
          onInitContent({ contentId: user.id, contentType: 'user', ...data });
        }
        if (mounted.current) {
          setDropdownContext(elementContext);
        }
      } else {
        setDropdownContext(menuShownRef.current ? null : elementContext);
      }
    }
  }
}
