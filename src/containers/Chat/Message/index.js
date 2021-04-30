import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import FileUploadStatusIndicator from 'components/FileUploadStatusIndicator';
import ProfilePic from 'components/ProfilePic';
import UsernameText from 'components/Texts/UsernameText';
import Chess from '../Chess';
import GameOverMessage from './GameOverMessage';
import ContentFileViewer from 'components/ContentFileViewer';
import TextMessage from './TextMessage';
import Icon from 'components/Icon';
import DropdownButton from 'components/Buttons/DropdownButton';
import TargetMessage from './TargetMessage';
import TargetSubject from './TargetSubject';
import RewardMessage from './RewardMessage';
import Invitation from './Invitation';
import DrawOffer from './DrawOffer';
import MessageRewardModal from '../Modals/MessageRewardModal';
import { useInView } from 'react-intersection-observer';
import { socket } from 'constants/io';
import { unix } from 'moment';
import { MessageStyle } from '../Styles';
import {
  fetchURLFromText,
  getFileInfoFromFileName
} from 'helpers/stringHelpers';
import { useMyState, useContentState, useLazyLoad } from 'helpers/hooks';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import {
  useAppContext,
  useContentContext,
  useNotiContext,
  useChatContext
} from 'contexts';

Message.propTypes = {
  checkScrollIsAtTheBottom: PropTypes.func.isRequired,
  chessCountdownNumber: PropTypes.number,
  chessOpponent: PropTypes.object,
  channelId: PropTypes.number,
  channelName: PropTypes.string,
  currentChannel: PropTypes.object,
  message: PropTypes.object,
  style: PropTypes.object,
  onDelete: PropTypes.func,
  index: PropTypes.number,
  innerRef: PropTypes.func,
  isLastMsg: PropTypes.bool,
  isNotification: PropTypes.bool,
  loading: PropTypes.bool,
  onAcceptGroupInvitation: PropTypes.func.isRequired,
  onChannelEnter: PropTypes.func,
  onChessBoardClick: PropTypes.func,
  onChessSpoilerClick: PropTypes.func,
  onReceiveNewMessage: PropTypes.func,
  onReplyClick: PropTypes.func,
  onRewardClick: PropTypes.func,
  onRewardMessageSubmit: PropTypes.func.isRequired,
  onSetScrollToBottom: PropTypes.func,
  onShowSubjectMsgsModal: PropTypes.func,
  recepientId: PropTypes.number
};

function Message({
  channelId,
  channelName,
  chessCountdownNumber,
  chessOpponent,
  currentChannel,
  currentChannel: { theme },
  index,
  isLastMsg,
  isNotification,
  loading,
  message,
  message: {
    id: messageId,
    attachmentHidden,
    chessState,
    content,
    fileToUpload,
    fileName,
    filePath,
    fileSize,
    gameWinnerId,
    inviteFrom,
    isChessMsg,
    isDraw,
    isDrawOffer,
    isNewMessage,
    isReloadedSubject,
    isSubject,
    linkDescription,
    linkTitle,
    linkUrl,
    moveViewTimeStamp,
    numMsgs,
    rewardAmount,
    rewardReason,
    subjectId,
    thumbUrl,
    timeStamp,
    uploaderAuthLevel,
    userId,
    isResign
  },
  onAcceptGroupInvitation,
  onChannelEnter,
  onChessBoardClick,
  onDelete,
  onChessSpoilerClick,
  onReceiveNewMessage,
  onReplyClick,
  onRewardMessageSubmit,
  onSetScrollToBottom,
  onShowSubjectMsgsModal
}) {
  const [ComponentRef, inView] = useInView({
    threshold: 0
  });
  const PanelRef = useRef(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [visible, setVisible] = useState(true);
  useLazyLoad({
    PanelRef,
    inView,
    onSetPlaceholderHeight: setPlaceholderHeight,
    onSetVisible: setVisible,
    delay: 1000
  });
  const {
    authLevel,
    canDelete,
    canEdit,
    canReward,
    isCreator,
    userId: myId,
    username: myUsername,
    profilePicUrl: myProfilePicUrl
  } = useMyState();
  const userIsUploader = myId === userId;
  const userCanEditThis =
    !inviteFrom &&
    !isDrawOffer &&
    (((canEdit || canDelete) && authLevel > uploaderAuthLevel) ||
      userIsUploader);
  const userCanRewardThis = useMemo(
    () => canReward && authLevel > uploaderAuthLevel && myId !== userId,
    [authLevel, canReward, uploaderAuthLevel, userId, myId]
  );
  const {
    requestHelpers: {
      editChatMessage,
      saveChatMessage,
      setChessMoveViewTimeStamp
    }
  } = useAppContext();
  const {
    actions: {
      onSetEmbeddedUrl,
      onSetActualDescription,
      onSetActualTitle,
      onSetIsEditing,
      onSetSiteUrl,
      onSetThumbUrl,
      onSetVideoStarted
    }
  } = useContentContext();
  const { thumbUrl: recentThumbUrl, isEditing, started } = useContentState({
    contentType: 'chat',
    contentId: messageId
  });

  const {
    state: { filesBeingUploaded, reconnecting },
    actions: {
      onEditMessage,
      onSaveMessage,
      onSetReplyTarget,
      onUpdateChessMoveViewTimeStamp,
      onUpdateRecentChessMessage
    }
  } = useChatContext();

  const [uploadStatus = {}] = useMemo(
    () =>
      filesBeingUploaded[channelId]?.filter(
        ({ filePath: path }) => path === filePath
      ) || [],
    [channelId, filePath, filesBeingUploaded]
  );
  const {
    state: { socketConnected }
  } = useNotiContext();
  let {
    username,
    profilePicUrl,
    targetMessage,
    targetSubject,
    isCallNotification,
    ...post
  } = message;
  const [messageRewardModalShown, setMessageRewardModalShown] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState('');
  const [spoilerOff, setSpoilerOff] = useState(false);

  if (fileToUpload && !userId) {
    userId = myId;
    username = myUsername;
    profilePicUrl = myProfilePicUrl;
  }
  useEffect(() => {
    if (!message.id && message.isChessMsg) {
      onUpdateRecentChessMessage(message);
    }
    if (
      userIsUploader &&
      !message.id &&
      !message.fileToUpload &&
      !message.isSubject &&
      (!message.isNotification || isCallNotification)
    ) {
      handleSaveMessage();
    }
    async function handleSaveMessage() {
      const messageId = await saveChatMessage({
        message: post,
        targetMessageId: targetMessage?.id,
        targetSubject
      });
      onSaveMessage({ messageId, index });
      socket.emit('new_chat_message', {
        message: {
          ...message,
          uploaderAuthLevel: authLevel,
          isNewMessage: true,
          id: messageId
        },
        channel: {
          ...currentChannel,
          numUnreads: 1,
          lastMessage: {
            content,
            sender: { id: myId, username: myUsername }
          }
        }
      });
    }

    return function cleanUp() {
      onSetVideoStarted({
        contentType: 'chat',
        contentId: messageId,
        started: false
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const userMadeLastMove = chessState
      ? JSON.parse(chessState)?.move?.by === myId
      : false;
    if (!userMadeLastMove && !moveViewTimeStamp) {
      setSpoilerOff(false);
    } else {
      setSpoilerOff(true);
    }
  }, [chessState, moveViewTimeStamp, myId]);

  useEffect(() => {
    if (isLastMsg && (!isNewMessage || userIsUploader)) {
      handleScrollToBottomBasedComponentHeight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, reconnecting]);

  useEffect(() => {
    const url = fetchURLFromText(content);
    if (url) {
      setExtractedUrl(url);
      onSetEmbeddedUrl({ contentId: messageId, contentType: 'chat', url });
      if (linkDescription) {
        onSetActualDescription({
          contentId: messageId,
          contentType: 'chat',
          description: linkDescription
        });
      }
      if (linkTitle) {
        onSetActualTitle({
          contentId: messageId,
          contentType: 'chat',
          title: linkTitle
        });
      }
      if (linkUrl) {
        onSetSiteUrl({
          contentId: messageId,
          contentType: 'chat',
          siteUrl: linkUrl
        });
      }
      if (thumbUrl) {
        onSetThumbUrl({
          contentId: messageId,
          contentType: 'chat',
          thumbUrl
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  useEffect(() => {
    if (isLastMsg && isNewMessage && !userIsUploader) {
      onReceiveNewMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contentShown = useMemo(
    () => inView || isLastMsg || started || visible || !placeholderHeight,
    [inView, isLastMsg, placeholderHeight, started, visible]
  );

  const messageMenuItems = useMemo(() => {
    const result = [
      {
        label: (
          <>
            <Icon icon="reply" />
            <span style={{ marginLeft: '1rem' }}>Reply</span>
          </>
        ),
        onClick: () => {
          onSetReplyTarget(
            rewardAmount
              ? targetMessage
              : { ...message, thumbUrl: thumbUrl || recentThumbUrl }
          );
          onReplyClick();
        }
      }
    ];
    if (userCanEditThis && !rewardAmount) {
      result.push({
        label: (
          <>
            <Icon icon="pencil-alt"></Icon>
            <span style={{ marginLeft: '1rem' }}>Edit</span>
          </>
        ),
        onClick: () => {
          onSetIsEditing({
            contentId: messageId,
            contentType: 'chat',
            isEditing: true
          });
        }
      });
    }
    if ((userIsUploader || canDelete) && !isDrawOffer) {
      result.push({
        label: (
          <>
            <Icon icon="trash-alt"></Icon>
            <span style={{ marginLeft: '1rem' }}>Remove</span>
          </>
        ),
        onClick: () => {
          onDelete({ messageId });
        }
      });
    }
    if (
      ((userCanRewardThis && channelId === 2) ||
        (isCreator && !userIsUploader)) &&
      !rewardAmount
    ) {
      result.push({
        label: (
          <>
            <Icon icon="star"></Icon>
            <span style={{ marginLeft: '1rem' }}>Reward</span>
          </>
        ),
        style: { color: '#fff', background: Color.pink() },
        className: css`
          opacity: 0.9;
          &:hover {
            opacity: 1 !important;
          }
        `,
        onClick: () => setMessageRewardModalShown(true)
      });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canDelete,
    channelId,
    isCreator,
    isDrawOffer,
    message,
    messageId,
    recentThumbUrl,
    rewardAmount,
    targetMessage,
    thumbUrl,
    userCanEditThis,
    userCanRewardThis,
    userIsUploader
  ]);

  const displayedTimeStamp = useMemo(() => unix(timeStamp).format('LLL'), [
    timeStamp
  ]);

  const fileViewerMarginBottom = useMemo(
    () => getFileInfoFromFileName(fileName)?.fileType === 'audio' && '2rem',
    [fileName]
  );

  const dropdownButtonShown = useMemo(
    () => !!messageId && !isNotification && !isChessMsg && !isEditing,
    [isChessMsg, isEditing, isNotification, messageId]
  );

  const handleChessSpoilerClick = useCallback(async () => {
    onSetReplyTarget(null);
    try {
      await setChessMoveViewTimeStamp({ channelId, message });
      onUpdateChessMoveViewTimeStamp();
      onChessSpoilerClick(userId);
    } catch (error) {
      console.error(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId, message, userId]);

  const handleRewardMessageSubmit = useCallback(
    ({ reasonId, amount }) => {
      onRewardMessageSubmit({ amount, reasonId, message });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [message]
  );

  const handleSetScrollToBottom = useCallback(() => {
    if (isLastMsg) {
      onSetScrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLastMsg]);

  const handleEditCancel = useCallback(() => {
    onSetIsEditing({
      contentId: messageId,
      contentType: 'chat',
      isEditing: false
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId]);

  const handleEditDone = useCallback(
    async (editedMessage) => {
      const messageIsSubject = !!isSubject || !!isReloadedSubject;
      const subjectChanged = await editChatMessage({
        editedMessage,
        messageId,
        isSubject: messageIsSubject,
        subjectId
      });
      onEditMessage({
        editedMessage,
        messageId,
        isSubject: messageIsSubject,
        subjectChanged
      });
      socket.emit('edit_chat_message', {
        channelId,
        editedMessage,
        messageId,
        isSubject: messageIsSubject
      });
      onSetIsEditing({
        contentId: messageId,
        contentType: 'chat',
        isEditing: false
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [channelId, isReloadedSubject, isSubject, messageId, subjectId]
  );

  const handleScrollToBottomBasedComponentHeight = useCallback(() => {
    if (placeholderHeight < 200) {
      handleSetScrollToBottom();
    }
  }, [handleSetScrollToBottom, placeholderHeight]);

  if (!chessState && (gameWinnerId || isDraw)) {
    return (
      <GameOverMessage
        winnerId={gameWinnerId}
        opponentName={channelName}
        myId={myId}
        isResign={!!isResign}
        isDraw={!!isDraw}
      />
    );
  }

  return (
    <div
      ref={ComponentRef}
      className={MessageStyle.container}
      style={{
        width: '100%'
      }}
    >
      {contentShown ? (
        <div ref={PanelRef} className={MessageStyle.container}>
          <div className={MessageStyle.profilePic}>
            <ProfilePic
              style={{ width: '100%', height: '100%' }}
              userId={userId}
              profilePicUrl={profilePicUrl}
            />
          </div>
          <div
            className={css`
              width: CALC(100% - 5vw - 3rem);
              display: flex;
              flex-direction: column;
              margin-left: 2rem;
              margin-right: 1rem;
              position: relative;
              white-space: pre-wrap;
              overflow-wrap: break-word;
              word-break: break-word;
              @media (max-width: ${mobileMaxWidth}) {
                margin-left: 1rem;
              }
            `}
          >
            <div>
              <UsernameText
                className={css`
                  font-size: 1.8rem;
                  line-height: 1;
                  @media (max-width: ${mobileMaxWidth}) {
                    font-size: 1.6rem;
                  }
                `}
                user={{
                  id: userId,
                  username
                }}
              />{' '}
              <span className={MessageStyle.timeStamp}>
                {displayedTimeStamp}
              </span>
            </div>
            <div style={{ width: '100%' }}>
              {inviteFrom ? (
                <Invitation
                  sender={{ id: userId, username }}
                  inviteFrom={inviteFrom}
                  messageId={messageId}
                  onChannelEnter={onChannelEnter}
                  onAcceptGroupInvitation={onAcceptGroupInvitation}
                />
              ) : isDrawOffer ? (
                <DrawOffer
                  userId={userId}
                  username={username}
                  onClick={onChessBoardClick}
                />
              ) : isChessMsg ? (
                <Chess
                  channelId={channelId}
                  countdownNumber={chessCountdownNumber}
                  gameWinnerId={gameWinnerId}
                  loaded
                  spoilerOff={spoilerOff}
                  myId={myId}
                  initialState={chessState}
                  moveViewed={!!moveViewTimeStamp}
                  onBoardClick={onChessBoardClick}
                  onSpoilerClick={handleChessSpoilerClick}
                  opponentId={chessOpponent?.id}
                  opponentName={chessOpponent?.username}
                  senderId={userId}
                  style={{ marginTop: '1rem', width: '100%' }}
                />
              ) : fileToUpload && !loading ? (
                <FileUploadStatusIndicator
                  key={channelId}
                  fileName={fileToUpload.name}
                  uploadComplete={!!uploadStatus.uploadComplete}
                  uploadProgress={uploadStatus.uploadProgress}
                />
              ) : (
                <>
                  {targetSubject && <TargetSubject subject={targetSubject} />}
                  {targetMessage && (
                    <TargetMessage
                      message={targetMessage}
                      onSetScrollToBottom={handleSetScrollToBottom}
                    />
                  )}
                  {filePath && (
                    <ContentFileViewer
                      contentId={messageId}
                      contentType="chat"
                      content={content}
                      filePath={filePath}
                      fileName={fileName}
                      fileSize={fileSize}
                      thumbUrl={thumbUrl || recentThumbUrl}
                      style={{
                        marginTop: '1rem',
                        marginBottom: fileViewerMarginBottom
                      }}
                    />
                  )}
                  {rewardAmount ? (
                    <RewardMessage
                      rewardAmount={rewardAmount}
                      rewardReason={rewardReason}
                    />
                  ) : (
                    <TextMessage
                      attachmentHidden={!!attachmentHidden}
                      channelId={channelId}
                      content={content}
                      extractedUrl={extractedUrl}
                      myId={myId}
                      messageId={messageId}
                      numMsgs={numMsgs}
                      isNotification={isNotification}
                      isSubject={!!isSubject}
                      isReloadedSubject={!!isReloadedSubject}
                      MessageStyle={MessageStyle}
                      isEditing={isEditing}
                      onEditCancel={handleEditCancel}
                      onEditDone={handleEditDone}
                      onSetScrollToBottom={handleSetScrollToBottom}
                      onShowSubjectMsgsModal={onShowSubjectMsgsModal}
                      socketConnected={socketConnected}
                      subjectId={subjectId}
                      targetMessage={targetMessage}
                      theme={theme}
                      userCanEditThis={userCanEditThis}
                    />
                  )}
                </>
              )}
            </div>
            {dropdownButtonShown && (
              <DropdownButton
                skeuomorphic
                color="darkerGray"
                icon="chevron-down"
                style={{ position: 'absolute', top: 0, right: '5px' }}
                direction="left"
                opacity={0.8}
                onButtonClick={handleScrollToBottomBasedComponentHeight}
                menuProps={messageMenuItems}
              />
            )}
          </div>
          {messageRewardModalShown && (
            <MessageRewardModal
              userToReward={{
                username,
                id: userId
              }}
              onSubmit={handleRewardMessageSubmit}
              onHide={() => setMessageRewardModalShown(false)}
            />
          )}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: placeholderHeight
          }}
        />
      )}
    </div>
  );
}

export default memo(Message);
