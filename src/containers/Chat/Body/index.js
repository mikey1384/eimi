import React, { memo, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import MessagesContainer from './MessagesContainer';
import Vocabulary from './Vocabulary';
import Loading from 'components/Loading';
import AboutClass from './AboutClass';
import { phoneMaxWidth, Color } from 'constants/css';
import { css } from 'emotion';
import { useChatContext } from 'contexts';

Body.propTypes = {
  channelName: PropTypes.string,
  chessOpponent: PropTypes.object,
  currentChannel: PropTypes.object
};

function Body({ channelName, chessOpponent, currentChannel }) {
  const {
    state: {
      chatType,
      loadingVocabulary,
      selectedChatTab,
      selectedChannelId,
      channelsObj
    },
    actions: { onSetReplyTarget, onSetIsRespondingToSubject }
  } = useChatContext();
  const isViewingAboutClassPage = useMemo(
    () =>
      !chatType &&
      selectedChatTab === 'class' &&
      !channelsObj[selectedChannelId]?.isClass,
    [channelsObj, chatType, selectedChannelId, selectedChatTab]
  );

  useEffect(() => {
    onSetReplyTarget(null);
    onSetIsRespondingToSubject(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  return (
    <div
      className={css`
        height: 100%;
        width: ${isViewingAboutClassPage ? '80vw' : '60vw'};
        border-left: 1px solid ${Color.borderGray()};
        padding: 0;
        position: relative;
        background: #fff;
        @media (max-width: ${phoneMaxWidth}) {
          width: ${chatType === 'vocabulary'
            ? '77vw'
            : isViewingAboutClassPage
            ? '120vw'
            : '85vw'};
        }
      `}
    >
      {loadingVocabulary ? (
        <Loading text="Loading Vocabulary" />
      ) : (
        <>
          {chatType === 'vocabulary' ? (
            <Vocabulary />
          ) : isViewingAboutClassPage ? (
            <AboutClass />
          ) : (
            <MessagesContainer
              channelName={channelName}
              chessOpponent={chessOpponent}
              currentChannel={currentChannel}
            />
          )}
        </>
      )}
    </div>
  );
}

export default memo(Body);
