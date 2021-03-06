import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Tooltip from './Tooltip';
import UserListModal from 'components/Modals/UserListModal';
import LocalContext from '../../Context';
import { useAppContext } from 'contexts';
import { reactionsObj } from 'constants/defaultValues';
import { css } from '@emotion/css';
import { Color, borderRadius, innerBorderRadius } from 'constants/css';
import { useMyState } from 'helpers/hooks';
import { isMobile } from 'helpers';
import { isEqual } from 'lodash';
import localize from 'constants/localize';

const deviceIsMobile = isMobile(navigator);
const youLabel = localize('You');

Reaction.propTypes = {
  reaction: PropTypes.string,
  reactionCount: PropTypes.number,
  reactedUserIds: PropTypes.array,
  onRemoveReaction: PropTypes.func,
  onAddReaction: PropTypes.func,
  reactionsMenuShown: PropTypes.bool
};

function Reaction({
  reaction,
  reactionCount,
  reactedUserIds,
  onRemoveReaction,
  onAddReaction,
  reactionsMenuShown
}) {
  const {
    actions: { onSetUserState },
    state: { userObj }
  } = useContext(LocalContext);
  const loadProfile = useAppContext((v) => v.requestHelpers.loadProfile);
  const ReactionRef = useRef(null);
  const hideTimerRef = useRef(null);
  const hideTimerRef2 = useRef(null);
  const mounted = useRef(true);
  const prevReactedUserIdsExcludingMine = useRef([]);
  const [loadingOtherUsers, setLoadingOtherUsers] = useState(false);
  const [tooltipContext, setTooltipContext] = useState(null);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const { profileTheme, userId, profilePicUrl } = useMyState();
  const userReacted = useMemo(
    () => reactedUserIds.includes(userId),
    [reactedUserIds, userId]
  );

  const reactedUserIdsExcludingMine = useMemo(
    () => reactedUserIds.filter((id) => id !== userId),
    [reactedUserIds, userId]
  );

  useEffect(() => {
    if (
      !isEqual(
        prevReactedUserIdsExcludingMine.current,
        reactedUserIdsExcludingMine
      )
    ) {
      const indexLength = Math.min(reactedUserIdsExcludingMine.length, 2);
      for (let i = 0; i < indexLength; i++) {
        handleLoadProfile(reactedUserIdsExcludingMine[i]);
      }
      prevReactedUserIdsExcludingMine.current = reactedUserIdsExcludingMine;
    }

    async function handleLoadProfile(userId) {
      if (!userObj[userId]?.username) {
        const data = await loadProfile(userId);
        if (mounted.current) {
          onSetUserState({
            userId: userId,
            newState: { ...data, loaded: true }
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactedUserIdsExcludingMine]);

  const reactedUsersExcludingMe = useMemo(() => {
    const users = [];
    for (let reactedUserId of reactedUserIdsExcludingMine) {
      if (userObj[reactedUserId]) {
        users.push(userObj[reactedUserId]);
      }
    }
    return users;
  }, [reactedUserIdsExcludingMine, userObj]);

  const reactedUsers = useMemo(() => {
    const users = [];
    if (userReacted) {
      users.push({
        id: userId,
        username: youLabel,
        profilePicUrl: profilePicUrl
      });
    }
    users.push(...reactedUsersExcludingMe);
    return users;
  }, [userReacted, reactedUsersExcludingMe, userId, profilePicUrl]);

  const truncatedReactedUsers = useMemo(() => {
    return reactedUsers.slice(0, 2);
  }, [reactedUsers]);

  useEffect(() => {
    if (!deviceIsMobile) return;
    if (reactionsMenuShown) {
      const parentElementDimensions =
        ReactionRef.current?.getBoundingClientRect() || {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      setTooltipContext(parentElementDimensions);
    } else {
      hideTimerRef.current = setTimeout(() => {
        if (mounted.current) {
          setTooltipContext(null);
        }
      }, 50);
    }
  }, [reactionsMenuShown]);

  useEffect(() => {
    mounted.current = true;

    return function cleanup() {
      mounted.current = false;
    };
  }, []);

  const handleShowAllReactedUsers = useCallback(async () => {
    setTooltipContext(null);
    setLoadingOtherUsers(true);
    setUserListModalShown(true);
    for (let reactedUserId of reactedUserIdsExcludingMine) {
      if (!userObj[reactedUserId]?.username) {
        const data = await loadProfile(reactedUserId);
        if (mounted.current) {
          onSetUserState({
            userId: reactedUserId,
            newState: { ...data, loaded: true }
          });
        }
      }
    }
    if (mounted.current) {
      setLoadingOtherUsers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactedUserIdsExcludingMine, userObj]);

  const handleClick = useCallback(() => {
    if (userReacted) {
      return onRemoveReaction();
    }
    onAddReaction();
  }, [onAddReaction, onRemoveReaction, userReacted]);

  return (
    <div
      ref={ReactionRef}
      style={{
        borderRadius,
        height: '2.3rem',
        border: `1px solid ${
          userReacted ? Color[profileTheme]() : Color.borderGray()
        }`,
        background: Color.targetGray(),
        marginRight: '0.5rem'
      }}
    >
      <div
        style={{
          ...(userReacted ? { background: Color[profileTheme](0.2) } : {}),
          borderRadius: innerBorderRadius,
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          padding: '0 0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onMouseEnter={handleSetTooltipContext}
        onMouseLeave={handleRemoveTooltipContext}
        onClick={handleClick}
      >
        <div
          className={css`
            width: 1.7rem;
            height: 1.7rem;
            background: url('/img/emojis.png')
              ${reactionsObj[reaction].position} / 5100%;
          `}
        />
        <span
          className="unselectable"
          style={{
            marginLeft: '0.3rem',
            fontSize: '1.3rem'
          }}
        >
          {reactionCount}
        </span>
      </div>
      {tooltipContext && reactedUsers.length > 0 && (
        <Tooltip
          myId={userId}
          onMouseEnter={() => {
            clearTimeout(hideTimerRef.current);
            clearTimeout(hideTimerRef2.current);
          }}
          onMouseLeave={() => {
            hideTimerRef2.current = setTimeout(() => {
              if (mounted.current) {
                setTooltipContext(null);
              }
            }, 300);
          }}
          parentContext={tooltipContext}
          reactedUserIds={reactedUserIds}
          displayedReactedUsers={truncatedReactedUsers}
          onShowAllReactedUsers={handleShowAllReactedUsers}
        />
      )}
      {userListModalShown && (
        <UserListModal
          loading={loadingOtherUsers}
          title={
            <div>
              People who reacted to this with{' '}
              <span
                style={{ display: 'inline-block' }}
                className={css`
                  width: 2rem;
                  height: 2rem;
                  background: url('/img/emojis.png')
                    ${reactionsObj[reaction].position} / 5100%;
                `}
              />
            </div>
          }
          users={reactedUsers}
          onHide={() => setUserListModalShown(false)}
        />
      )}
    </div>
  );

  function handleSetTooltipContext() {
    if (deviceIsMobile) return;
    clearTimeout(hideTimerRef.current);
    clearTimeout(hideTimerRef2.current);
    const parentElementDimensions =
      ReactionRef.current?.getBoundingClientRect() || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    setTooltipContext(parentElementDimensions);
  }

  function handleRemoveTooltipContext() {
    if (deviceIsMobile) return;
    hideTimerRef.current = setTimeout(() => {
      if (mounted.current) {
        setTooltipContext(null);
      }
    }, 200);
  }
}

export default memo(Reaction);
