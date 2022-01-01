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
import { useContentState, useLazyLoad } from 'helpers/hooks';
import { Color, mobileMaxWidth } from 'constants/css';
import { css } from '@emotion/css';
import ErrorBoundary from 'components/ErrorBoundary';
import LocalContext from '../Context';
import localize from 'constants/localize';

const replyLabel = localize('reply2');
const rewardLabel = localize('reward');
const removeLabel = localize('remove');
const editLabel = localize('edit');

Message.propTypes = {
  chessCountdownNumber: PropTypes.number,
  chessOpponent: PropTypes.object,
  channelId: PropTypes.number,
  channelName: PropTypes.string,
  currentChannel: PropTypes.object,
  forceRefreshForMobile: PropTypes.func,
  message: PropTypes.object,
  onDelete: PropTypes.func,
  index: PropTypes.number,
  isLastMsg: PropTypes.bool,
  isNotification: PropTypes.bool,
  loading: PropTypes.bool,
  onAcceptGroupInvitation: PropTypes.func.isRequired,
  onChessBoardClick: PropTypes.func,
  onChessSpoilerClick: PropTypes.func,
  onReceiveNewMessage: PropTypes.func,
  onReplyClick: PropTypes.func,
  onRewardMessageSubmit: PropTypes.func.isRequired,
  onScrollToBottom: PropTypes.func.isRequired,
  onShowSubjectMsgsModal: PropTypes.func,
  zIndex: PropTypes.number
};

function Message({
  channelId,
  chessCountdownNumber,
  chessOpponent,
  currentChannel,
  forceRefreshForMobile,
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
    invitePath,
    invitationChannelId,
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
  onChessBoardClick,
  onDelete,
  onChessSpoilerClick,
  onReceiveNewMessage,
  onReplyClick,
  onRewardMessageSubmit,
  onScrollToBottom,
  onShowSubjectMsgsModal,
  zIndex
}) {
  const {
    actions: {
      onEditMessage,
      onSaveMessage,
      onSetEmbeddedUrl,
      onSetActualDescription,
      onSetActualTitle,
      onSetIsEditing,
      onSetSiteUrl,
      onSetThumbUrl,
      onSetMediaStarted,
      onSetReplyTarget,
      onUpdateChessMoveViewTimeStamp,
      onUpdateRecentChessMessage
    },
    myState: {
      authLevel,
      canDelete,
      canEdit,
      canReward,
      isCreator,
      userId: myId,
      username: myUsername,
      profilePicUrl: myProfilePicUrl
    },
    requests: { editChatMessage, saveChatMessage, setChessMoveViewTimeStamp },
    state: { filesBeingUploaded, socketConnected }
  } = useContext(LocalContext);
  const {
    thumbUrl: recentThumbUrl,
    isEditing,
    started
  } = useContentState({
    contentType: 'chat',
    contentId: messageId
  });
  const [ComponentRef, inView] = useInView({
    threshold: 0
  });
  const PanelRef = useRef(null);
  const DropdownButtonRef = useRef(null);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [visible, setVisible] = useState(true);
  useLazyLoad({
    PanelRef,
    inView,
    onSetPlaceholderHeight: setPlaceholderHeight,
    onSetVisible: setVisible,
    delay: 1000
  });
  const userIsUploader = useMemo(() => myId === userId, [myId, userId]);
  useEffect(() => {
    if (isLastMsg && userIsUploader) {
      onScrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLastMsg, userIsUploader]);
  useEffect(() => {
    if (isLastMsg && isNewMessage && !userIsUploader) {
      onReceiveNewMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLastMsg, isNewMessage, userIsUploader]);
  const userCanEditThis = useMemo(
    () =>
      !invitePath &&
      !isDrawOffer &&
      (((canEdit || canDelete) && authLevel > uploaderAuthLevel) ||
        userIsUploader),
    [
      authLevel,
      canDelete,
      canEdit,
      invitePath,
      isDrawOffer,
      uploaderAuthLevel,
      userIsUploader
    ]
  );
  const userCanRewardThis = useMemo(
    () => canReward && authLevel > uploaderAuthLevel && myId !== userId,
    [authLevel, canReward, uploaderAuthLevel, userId, myId]
  );

  const [uploadStatus = {}] = useMemo(
    () =>
      filesBeingUploaded[channelId]?.filter(
        ({ filePath: path }) => path === filePath
      ) || [],
    [channelId, filePath, filesBeingUploaded]
  );
  let {
    username,
    profilePicUrl,
    targetMessage,
    targetSubject,
    isCallNotification,
    tempMessageId,
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
      onUpdateRecentChessMessage({ channelId, message });
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
      onSaveMessage({
        messageId,
        index,
        channelId,
        tempMessageId
      });
      const messageToSendOverSocket = {
        ...message,
        uploaderAuthLevel: authLevel,
        isNewMessage: true,
        id: messageId
      };
      delete messageToSendOverSocket.tempMessageId;
      const channelData = {
        id: currentChannel.id,
        channelName: currentChannel.channelName,
        members: currentChannel.members,
        twoPeople: currentChannel.twoPeople,
        pathId: currentChannel.pathId
      };
      socket.emit('new_chat_message', {
        message: messageToSendOverSocket,
        channel: channelData
      });
    }

    return function cleanUp() {
      onSetMediaStarted({
        contentType: 'chat',
        contentId: messageId,
        started: false
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const userMadeLastMove = chessState ? chessState?.move?.by === myId : false;
    if (!userMadeLastMove && !moveViewTimeStamp) {
      setSpoilerOff(false);
    } else {
      setSpoilerOff(true);
    }
  }, [chessState, moveViewTimeStamp, myId]);

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
            <span style={{ marginLeft: '1rem' }}>{replyLabel}</span>
          </>
        ),
        onClick: () => {
          onSetReplyTarget({
            channelId: currentChannel.id,
            target: rewardAmount
              ? targetMessage
              : { ...message, thumbUrl: thumbUrl || recentThumbUrl }
          });
          onReplyClick();
        }
      }
    ];
    if (userCanEditThis && !rewardAmount) {
      result.push({
        label: (
          <>
            <Icon icon="pencil-alt"></Icon>
            <span style={{ marginLeft: '1rem' }}>{editLabel}</span>
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
            <span style={{ marginLeft: '1rem' }}>{removeLabel}</span>
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
            <span style={{ marginLeft: '1rem' }}>{rewardLabel}</span>
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

  const displayedTimeStamp = useMemo(
    () => unix(timeStamp).format('lll'),
    [timeStamp]
  );

  const fileViewerMarginBottom = useMemo(
    () => getFileInfoFromFileName(fileName)?.fileType === 'audio' && '2rem',
    [fileName]
  );

  const dropdownButtonShown = useMemo(
    () => !!messageId && !isNotification && !isChessMsg && !isEditing,
    [isChessMsg, isEditing, isNotification, messageId]
  );

  const handleChessSpoilerClick = useCallback(async () => {
    onSetReplyTarget({ channelId: currentChannel.id, target: null });
    try {
      await setChessMoveViewTimeStamp({ channelId, message });
      onUpdateChessMoveViewTimeStamp(channelId);
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
        channelId,
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

  if (!chessState && (gameWinnerId || isDraw)) {
    return (
      <GameOverMessage
        winnerId={gameWinnerId}
        opponentName={chessOpponent?.username}
        myId={myId}
        isResign={!!isResign}
        isDraw={!!isDraw}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div
        ref={ComponentRef}
        className={MessageStyle.container}
        style={{
          width: '100%',
          display: 'block',
          zIndex
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
              <div>
                {invitePath ? (
                  <Invitation
                    sender={{ id: userId, username }}
                    channelId={channelId}
                    invitationChannelId={invitationChannelId}
                    invitePath={invitePath}
                    messageId={messageId}
                    onAcceptGroupInvitation={onAcceptGroupInvitation}
                  />
                ) : isDrawOffer ? (
                  <DrawOffer
                    myId={myId}
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
                    {targetMessage && <TargetMessage message={targetMessage} />}
                    {filePath && (
                      <ContentFileViewer
                        contentId={messageId}
                        contentType="chat"
                        content={content}
                        filePath={filePath}
                        fileName={fileName}
                        fileSize={fileSize}
                        onMediaPlay={() =>
                          onSetMediaStarted({
                            contentType: 'chat',
                            contentId: messageId,
                            started: true
                          })
                        }
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
                        forceRefreshForMobile={forceRefreshForMobile}
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
                        onShowSubjectMsgsModal={onShowSubjectMsgsModal}
                        socketConnected={socketConnected}
                        subjectId={subjectId}
                        targetMessage={targetMessage}
                        theme={currentChannel.theme}
                        userCanEditThis={userCanEditThis}
                      />
                    )}
                  </>
                )}
              </div>
              {dropdownButtonShown && (
                <DropdownButton
                  skeuomorphic
                  innerRef={DropdownButtonRef}
                  color="darkerGray"
                  icon="chevron-down"
                  style={{ position: 'absolute', top: 0, right: 0 }}
                  opacity={0.8}
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
    </ErrorBoundary>
  );
}

export default memo(Message);
