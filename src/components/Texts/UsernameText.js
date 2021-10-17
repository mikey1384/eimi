import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import DropdownList from 'components/DropdownList';
import { Color } from 'constants/css';
import { useHistory } from 'react-router-dom';
import { useContentState, useMyState } from 'helpers/hooks';
import { useAppContext, useContentContext, useChatContext } from 'contexts';
import { isMobile } from 'helpers';
import { addCommasToNumber } from 'helpers/stringHelpers';

UsernameText.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  style: PropTypes.object,
  user: PropTypes.object,
  wordBreakEnabled: PropTypes.bool
};

const deviceIsMobile = isMobile(navigator);

export default function UsernameText({
  className,
  color,
  style = {},
  user = {},
  wordBreakEnabled
}) {
  const mounted = useRef(true);
  const history = useHistory();
  const timerRef = useRef(null);
  const mouseEntered = useRef(false);
  const {
    requestHelpers: { loadChat, loadDMChannel, loadProfile }
  } = useAppContext();
  const {
    actions: { onInitContent }
  } = useContentContext();
  const { rank, twinkleXP } = useContentState({
    contentType: 'user',
    contentId: user.id
  });
  const { userId } = useMyState();
  const {
    state: { loaded },
    actions: { onInitChat }
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
          {user.username || '(Deleted)'}
        </p>
      </div>
      {menuShown && (
        <DropdownList style={{ width: '100%' }}>
          <li onClick={() => history.push(`/users/${user.username}`)}>
            <a
              style={{ color: Color.darkerGray(), cursor: 'pointer' }}
              onClick={(e) => e.preventDefault()}
            >
              Profile
            </a>
          </li>
          {user.id !== userId && (
            <li onClick={onLinkClick}>
              <a style={{ color: Color.darkerGray() }}>Chat</a>
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
      if (!loaded) {
        const initialData = await loadChat();
        if (mounted.current) {
          onInitChat(initialData);
        }
      }
      const { pathNumber } = await loadDMChannel({ recepient: user });
      if (mounted.current) {
        history.push(pathNumber ? `/chat/${pathNumber}` : `/chat`);
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
