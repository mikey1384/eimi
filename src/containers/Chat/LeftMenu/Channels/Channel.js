import React, { memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Color, desktopMinWidth, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import { stringIsEmpty } from 'helpers/stringHelpers';
import { useMyState } from 'helpers/hooks';
import { useHistory, useLocation } from 'react-router-dom';
import localize from 'constants/localize';

Channel.propTypes = {
  channel: PropTypes.object.isRequired,
  customChannelNames: PropTypes.object.isRequired,
  selectedChannelId: PropTypes.number
};

function Channel({
  customChannelNames,
  channel: {
    id: channelId,
    channelName,
    messageIds = [],
    messagesObj = {},
    twoPeople,
    members,
    numUnreads,
    pathId
  },
  selectedChannelId
}) {
  const history = useHistory();
  const location = useLocation();
  const currentPathId = useMemo(() => {
    return Number(location.pathname.split('chat/')[1]);
  }, [location.pathname]);
  const { profileTheme, userId } = useMyState();
  const effectiveChannelName = useMemo(
    () => customChannelNames[channelId] || channelName,
    [channelName, customChannelNames, channelId]
  );
  const selected = useMemo(() => {
    if (currentPathId === 'vocabulary') return false;
    if (pathId === currentPathId || channelId === selectedChannelId) {
      return true;
    }
    return false;
  }, [pathId, currentPathId, channelId, selectedChannelId]);
  const lastMessage = useMemo(() => {
    const lastMessageId = messageIds[0];
    return messagesObj[lastMessageId];
  }, [messageIds, messagesObj]);
  const PreviewMessage = useMemo(() => {
    return renderPreviewMessage(lastMessage || {});
    function renderPreviewMessage({
      content,
      fileName,
      gameWinnerId,
      userId: senderId,
      username: senderName,
      isDraw
    }) {
      const messageSender = senderId
        ? senderId === userId
          ? localize('You')
          : senderName
        : '';
      if (fileName && stringIsEmpty(content)) {
        return (
          <span>
            {`${messageSender}:`} {`"${fileName}"`}
          </span>
        );
      }
      if (isDraw) {
        return <span>chess match ended in a draw</span>;
      }
      if (typeof gameWinnerId === 'number') {
        if (gameWinnerId === 0) {
          return <span>The chess match ended in a draw</span>;
        }
        return gameWinnerId === userId ? (
          <span>You won the chess match!</span>
        ) : (
          <span>You lost the chess match</span>
        );
      }
      if (messageSender && content) {
        const truncatedContent =
          content.startsWith('/spoiler ') || content.startsWith('/secret ')
            ? 'Secret Message'
            : content.substr(0, 100);
        return (
          <>
            <span>{`${messageSender}: `}</span>
            <span>{truncatedContent}</span>
          </>
        );
      }
      return '\u00a0';
    }
  }, [lastMessage, userId]);
  const otherMember = twoPeople
    ? members
        ?.filter(({ id: memberId }) => memberId !== userId)
        ?.map(({ username }) => username)?.[0]
    : undefined;

  const ChannelName = useMemo(
    () => otherMember || effectiveChannelName || '(Deleted)',
    [effectiveChannelName, otherMember]
  );

  const handleChannelClick = useCallback(() => {
    if (pathId) {
      return history.push(`/chat/${pathId}`);
    }
    history.push('/chat/new');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, pathId]);

  return (
    <div
      key={channelId}
      className={css`
        @media (min-width: ${desktopMinWidth}) {
          &:hover {
            background: ${Color.checkboxAreaGray()};
          }
        }
      `}
      style={{
        width: '100%',
        cursor: 'pointer',
        padding: '1rem',
        height: '6.5rem',
        ...(selected ? { backgroundColor: Color.highlightGray() } : {})
      }}
      onClick={handleChannelClick}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          height: '100%',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            whiteSpace: 'nowrap',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <p
              style={{
                color:
                  channelId === 2
                    ? Color[
                        profileTheme === 'black'
                          ? 'logoBlue'
                          : profileTheme === 'vantablack'
                          ? 'darkBlue'
                          : profileTheme
                      ]()
                    : !effectiveChannelName && !otherMember && '#7c7c7c',
                fontWeight: 'bold',
                margin: 0,
                padding: 0,
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                lineHeight: 'normal'
              }}
              className={css`
                @media (max-width: ${mobileMaxWidth}) {
                  font-size: 1.5rem;
                }
              `}
            >
              {ChannelName}
            </p>
          </div>
          <div
            className={css`
              @media (max-width: ${mobileMaxWidth}) {
                font-size: 1.3rem;
              }
            `}
            style={{
              width: '100%',
              textOverflow: 'ellipsis',
              overflow: 'hidden'
            }}
          >
            {PreviewMessage}
          </div>
        </div>
        {channelId !== selectedChannelId &&
          numUnreads > 0 &&
          lastMessage?.sender?.id !== userId && (
            <div
              style={{
                background: Color.rose(),
                display: 'flex',
                color: '#fff',
                fontWeight: 'bold',
                minWidth: '2rem',
                height: '2rem',
                borderRadius: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                right: '1.5rem',
                bottom: '1.2rem'
              }}
            >
              {numUnreads}
            </div>
          )}
      </div>
    </div>
  );
}

export default memo(Channel);
