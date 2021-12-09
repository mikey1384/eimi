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
  dropdownMenuReversed: PropTypes.bool,
  style: PropTypes.object,
  user: PropTypes.object,
  wordBreakEnabled: PropTypes.bool
};

export default function UsernameText({
  className,
  color,
  dropdownMenuReversed,
  style = {},
  user = {},
  wordBreakEnabled
}) {
  const mounted = useRef(true);
  const history = useHistory();
  const timerRef = useRef(null);
  const mouseEntered = useRef(false);
  const {
    requestHelpers: { loadDMChannel, loadProfile }
  } = useAppContext();
  const {
    actions: { onInitContent }
  } = useContentContext();
  const { rank, twinkleXP } = useContentState({
    contentType: 'user',
    contentId: user.id
  });
  const { userId, username, profilePicUrl, authLevel } = useMyState();
  const {
    actions: { onOpenNewChatTab }
  } = useChatContext();
  const [menuShown, setMenuShown] = useState(false);
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

  return (
    <div
      style={{
        display: 'inline',
        ...(menuShown ? {} : { overflowX: 'hidden', textOverflow: 'ellipsis' }),
        position: 'relative',
        ...style
      }}
      className={className}
      onMouseLeave={() => {
        mouseEntered.current = false;
        clearTimeout(timerRef.current);
        setMenuShown(false);
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
      {menuShown && (
        <DropdownList
          isReversed={dropdownMenuReversed}
          style={{ width: '100%' }}
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

  async function onMouseEnter() {
    mouseEntered.current = true;
    clearTimeout(timerRef.current);
    if (user.username && !deviceIsMobile) {
      if (!twinkleXP && !user.twinkleXP) {
        timerRef.current = setTimeout(async () => {
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
              setMenuShown(true);
            }
          }
        }, 200);
      } else {
        timerRef.current = setTimeout(() => setMenuShown(true), 300);
      }
    }
  }

  async function onLinkClick() {
    setMenuShown(false);
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
    if (user.username) {
      if (!twinkleXP && !user.twinkleXP && !menuShown) {
        const data = await loadProfile(user.id);
        if (mounted.current) {
          onInitContent({ contentId: user.id, contentType: 'user', ...data });
        }
        if (mounted.current) {
          setMenuShown(true);
        }
      } else {
        setMenuShown(!menuShown);
      }
    }
  }
}
