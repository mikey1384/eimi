import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import Button from 'components/Button';
import LoadMoreButton from 'components/Buttons/LoadMoreButton';
import ConfirmModal from 'components/Modals/ConfirmModal';
import MessageInput from './MessageInput';
import DropdownButton from 'components/Buttons/DropdownButton';
import Loading from 'components/Loading';
import Message from '../../Message';
import ChannelHeader from './ChannelHeader';
import FullTextReveal from 'components/Texts/FullTextReveal';
import SubjectMsgsModal from '../../Modals/SubjectMsgsModal';
import InviteUsersModal from '../../Modals/InviteUsers';
import ChessModal from '../../Modals/ChessModal';
import GifModal from '../../Modals/GifModal';
import SelectVideoModal from '../../Modals/SelectVideoModal';
import SelectNewOwnerModal from '../../Modals/SelectNewOwnerModal';
import SettingsModal from '../../Modals/SettingsModal';
import CallScreen from './CallScreen';
import ErrorBoundary from 'components/ErrorBoundary';
import Icon from 'components/Icon';
import { v1 as uuidv1 } from 'uuid';
import { GENERAL_CHAT_ID, rewardReasons } from 'constants/defaultValues';
import { addEvent, removeEvent } from 'helpers/listenerHelpers';
import { css } from '@emotion/css';
import { Color } from 'constants/css';
import { socket } from 'constants/io';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useChatContext, useNotiContext } from 'contexts';
import { checkScrollIsAtTheBottom, isMobile } from 'helpers';

MessagesContainer.propTypes = {
  channelName: PropTypes.string,
  chessOpponent: PropTypes.object,
  currentChannel: PropTypes.object.isRequired,
  onChannelEnter: PropTypes.func
};

const CALL_SCREEN_HEIGHT = '30%';
const deviceIsMobile = isMobile(navigator);

function MessagesContainer({
  channelName,
  chessOpponent,
  currentChannel,
  onChannelEnter
}) {
  const {
    requestHelpers: {
      acceptInvitation,
      changeChannelOwner,
      deleteChatMessage,
      editChannelSettings,
      hideChat,
      leaveChannel,
      loadChatChannel,
      loadMoreChatMessages,
      putFavoriteChannel,
      sendInvitationMessage,
      startNewDMChannel,
      updateUserXP
    }
  } = useAppContext();
  const {
    state: { socketConnected }
  } = useNotiContext();
  const {
    state: {
      channelOnCall,
      channelLoading,
      chessModalShown,
      creatingNewDMChannel,
      allFavoriteChannelIds,
      isRespondingToSubject,
      messagesLoadMoreButton,
      messages,
      messagesLoaded,
      recepientId,
      reconnecting,
      replyTarget,
      selectedChannelId,
      subjectObj
    },
    actions: {
      onDeleteMessage,
      onEditChannelSettings,
      onEnterChannelWithId,
      onHideChat,
      onLeaveChannel,
      onLoadMoreMessages,
      onChannelLoadingDone,
      onSendFirstDirectMessage,
      onSetChessModalShown,
      onSetCreatingNewDMChannel,
      onSetFavoriteChannel,
      onSetReplyTarget,
      onSubmitMessage,
      onUpdateSelectedChannelId,
      onUpdateLastMessages
    }
  } = useChatContext();
  const { banned, profilePicUrl, userId, username } = useMyState();
  const [chessCountdownObj, setChessCountdownObj] = useState({});
  const [textAreaHeight, setTextAreaHeight] = useState(0);
  const [inviteUsersModalShown, setInviteUsersModalShown] = useState(false);
  const [loadMoreButtonLock, setLoadMoreButtonLock] = useState(false);
  const [newUnseenMessage, setNewUnseenMessage] = useState(false);
  const [gifModalShown, setGifModalShown] = useState(false);
  const [selectVideoModalShown, setSelectVideoModalShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    shown: false,
    fileName: '',
    filePath: '',
    messageId: null
  });
  const [subjectMsgsModal, setSubjectMsgsModal] = useState({
    shown: false,
    subjectId: null,
    content: ''
  });
  const [settingsModalShown, setSettingsModalShown] = useState(false);
  const [leaveConfirmModalShown, setLeaveConfirmModalShown] = useState(false);
  const [scrollAtBottom, setScrollAtBottom] = useState(true);
  const [selectNewOwnerModalShown, setSelectNewOwnerModalShown] =
    useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [hideModalShown, setHideModalShown] = useState(false);
  const [addToFavoritesShown, setAddToFavoritesShown] = useState(false);

  const ContentRef = useRef(null);
  const MessagesRef = useRef(null);
  const mounted = useRef(true);
  const MessagesContainerRef = useRef({});
  const ChatInputRef = useRef(null);
  const favoritingRef = useRef(false);
  const timerRef = useRef(null);
  const menuLabel = deviceIsMobile ? '' : 'Menu';

  const favorited = useMemo(() => {
    return allFavoriteChannelIds[selectedChannelId];
  }, [allFavoriteChannelIds, selectedChannelId]);

  const selectedChannelIsOnCall = useMemo(
    () => selectedChannelId === channelOnCall.id,
    [channelOnCall.id, selectedChannelId]
  );

  const subjectId = useMemo(
    () => subjectObj[selectedChannelId]?.id,
    [selectedChannelId, subjectObj]
  );

  useEffect(() => {
    mounted.current = true;
    return function onUnmount() {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (selectedChannelId === channelOnCall.id) {
      handleSetScrollToBottom();
    }
  }, [channelOnCall, selectedChannelId]);

  const containerHeight = useMemo(() => {
    return `CALC(100% - 1rem - 2px - ${
      socketConnected && textAreaHeight
        ? `${textAreaHeight}px - 1rem`
        : '5.5rem'
    }${
      socketConnected && isRespondingToSubject
        ? ' - 8rem - 2px'
        : replyTarget
        ? ' - 12rem - 2px'
        : ''
    }
    ${selectedChannelIsOnCall ? ` - ${CALL_SCREEN_HEIGHT}` : ''})`;
  }, [
    isRespondingToSubject,
    replyTarget,
    selectedChannelIsOnCall,
    socketConnected,
    textAreaHeight
  ]);

  const loading = useMemo(
    () => channelLoading || creatingNewDMChannel || reconnecting,
    [channelLoading, creatingNewDMChannel, reconnecting]
  );

  const menuProps = useMemo(() => {
    if (currentChannel.twoPeople) {
      return [
        {
          label: (
            <>
              <Icon icon="minus" />
              <span style={{ marginLeft: '1rem' }}>Hide</span>
            </>
          ),
          onClick: () => setHideModalShown(true)
        }
      ];
    }
    const result = [];
    if (!currentChannel.isClosed || currentChannel.creatorId === userId) {
      result.push({
        label: (
          <>
            <Icon icon="users" />
            <span style={{ marginLeft: '1rem' }}>Invite People</span>
          </>
        ),
        onClick: () => setInviteUsersModalShown(true)
      });
    }
    result.push(
      {
        label:
          currentChannel.creatorId === userId ? (
            <>
              <Icon icon="sliders-h" />
              <span style={{ marginLeft: '1rem' }}>Settings</span>
            </>
          ) : (
            <>
              <Icon icon="pencil-alt" />
              <span style={{ marginLeft: '1rem' }}>Edit Group Name</span>
            </>
          ),
        onClick: () => setSettingsModalShown(true)
      },
      {
        separator: true
      },
      {
        label: (
          <>
            <Icon icon="sign-out-alt" />
            <span style={{ marginLeft: '1rem' }}>Leave</span>
          </>
        ),
        onClick: () => setLeaveConfirmModalShown(true)
      }
    );
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentChannel.twoPeople,
    currentChannel.isClosed,
    currentChannel.creatorId,
    userId,
    selectedChannelId
  ]);

  const channelHeaderShown = useMemo(() => {
    return (
      selectedChannelId === GENERAL_CHAT_ID || !!currentChannel.canChangeSubject
    );
  }, [currentChannel.canChangeSubject, selectedChannelId]);

  useEffect(() => {
    setTimeout(() => {
      if (mounted.current) {
        setPlaceholderHeight(
          `CALC(100vh - 10rem - ${MessagesRef.current?.offsetHeight || 0}px)`
        );
        if (
          MessagesRef.current?.offsetHeight <
          MessagesContainerRef.current?.offsetHeight + 30
        ) {
          handleSetScrollToBottom();
        }
      }
    }, 0);
  }, [loading, messages]);

  useEffect(() => {
    socket.on('chess_countdown_number_received', onReceiveCountdownNumber);
    socket.on('new_message_received', handleReceiveMessage);

    function onReceiveCountdownNumber({ channelId, number }) {
      if (channelId === selectedChannelId) {
        if (number === 0) {
          onSetChessModalShown(false);
        }
        setChessCountdownObj((chessCountdownObj) => ({
          ...chessCountdownObj,
          [channelId]: number
        }));
      }
    }
    function handleReceiveMessage({ message }) {
      if (message.isChessMsg) {
        setChessCountdownObj((chessCountdownObj) => ({
          ...chessCountdownObj,
          [message.channelId]: undefined
        }));
      }
    }

    return function cleanUp() {
      socket.removeListener(
        'chess_countdown_number_received',
        onReceiveCountdownNumber
      );
      socket.removeListener('new_message_received', handleReceiveMessage);
    };
  });

  useEffect(() => {
    const MessagesContainer = MessagesContainerRef.current;
    addEvent(MessagesContainer, 'scroll', handleScroll);

    return function cleanUp() {
      removeEvent(MessagesContainer, 'scroll', handleScroll);
    };

    function handleScroll() {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (mounted.current && MessagesContainerRef.current?.scrollTop === 0) {
          handleLoadMore();
        }
      }, 200);
    }
  });

  useEffect(() => {
    if (messagesLoaded && mounted.current) {
      setTimeout(() => {
        if (mounted.current && MessagesContainerRef.current) {
          MessagesContainerRef.current.scrollTop =
            ContentRef.current?.offsetHeight || 0;
        }
        onChannelLoadingDone();
      }, 0);
      setScrollAtBottom(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesLoaded, reconnecting]);

  useEffect(() => {
    favoritingRef.current = false;
    setLoadMoreButtonLock(false);
  }, [selectedChannelId]);

  const handleChessModalShown = useCallback(() => {
    if (banned?.chess) {
      return;
    }
    const channelId = currentChannel?.id;
    if (chessCountdownObj[channelId] !== 0) {
      onSetReplyTarget(null);
      onSetChessModalShown(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banned?.chess, chessCountdownObj, currentChannel?.id]);

  const handleHideChat = useCallback(async () => {
    await hideChat(selectedChannelId);
    onHideChat(selectedChannelId);
    const data = await loadChatChannel({
      channelId: GENERAL_CHAT_ID
    });
    onEnterChannelWithId({ data });
    setHideModalShown(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  const handleChessSpoilerClick = useCallback(
    (senderId) => {
      socket.emit('viewed_chess_move', selectedChannelId);
      socket.emit('start_chess_timer', {
        currentChannel,
        targetUserId: userId,
        winnerId: senderId,
        isResign: false
      });
      onSetChessModalShown(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChannel, selectedChannelId, userId]
  );

  const handleConfirmChessMove = useCallback(
    async ({ state, isCheckmate, isStalemate }) => {
      const gameWinnerId = isCheckmate ? userId : isStalemate ? 0 : undefined;
      const params = {
        userId,
        chessState: state,
        isChessMsg: 1,
        gameWinnerId
      };
      const content = 'Made a chess move';
      try {
        if (selectedChannelId) {
          onSubmitMessage({
            message: {
              ...params,
              profilePicUrl,
              username,
              content,
              channelId: selectedChannelId
            }
          });
          onSetReplyTarget(null);
          socket.emit('user_made_a_move', {
            userId,
            channelId: selectedChannelId
          });
        } else {
          const { channel, message } = await startNewDMChannel({
            ...params,
            content,
            recepientId
          });
          socket.emit('join_chat_group', message.channelId);
          socket.emit('send_bi_chat_invitation', recepientId, message);
          onSendFirstDirectMessage({ channel, message });
          return;
        }
      } catch (error) {
        console.error(error);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [profilePicUrl, recepientId, selectedChannelId, userId, username]
  );

  const handleDelete = useCallback(async () => {
    const { fileName, filePath, messageId } = deleteModal;
    await deleteChatMessage({ fileName, filePath, messageId });
    onDeleteMessage(messageId);
    setDeleteModal({
      shown: false,
      fileName: '',
      filePath: '',
      messageId: null
    });
    socket.emit('delete_chat_message', {
      channelId: selectedChannelId,
      messageId
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteModal, selectedChannelId]);

  const handleEditSettings = useCallback(
    async ({
      editedChannelName,
      editedIsClosed,
      editedCanChangeSubject,
      editedTheme
    }) => {
      await editChannelSettings({
        channelName: editedChannelName,
        isClosed: editedIsClosed,
        channelId: selectedChannelId,
        canChangeSubject: editedCanChangeSubject,
        theme: editedTheme
      });
      onEditChannelSettings({
        channelName: editedChannelName,
        isClosed: editedIsClosed,
        channelId: selectedChannelId,
        canChangeSubject: editedCanChangeSubject,
        theme: editedTheme
      });
      if (userId === currentChannel.creatorId) {
        socket.emit('new_channel_settings', {
          channelName: editedChannelName,
          isClosed: editedIsClosed,
          channelId: selectedChannelId,
          canChangeSubject: editedCanChangeSubject,
          theme: editedTheme
        });
      }
      setSettingsModalShown(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChannel?.creatorId, selectedChannelId, userId]
  );

  const handleInviteUsersDone = useCallback(
    async ({ users, message, isClass }) => {
      if (isClass) {
        socket.emit('new_chat_message', {
          message: {
            ...message,
            channelId: message.channelId
          },
          channel: {
            ...currentChannel,
            numUnreads: 1,
            lastMessage: {
              content: message.content,
              sender: { id: userId, username }
            },
            channelName
          },
          newMembers: users
        });
        socket.emit(
          'send_group_chat_invitation',
          users.map((user) => user.id),
          {
            message: { ...message, messageId: message.id },
            isClass
          }
        );
      } else {
        const recepientIds = users.map((user) => user.id);
        const { invitationMessage, channels } = await sendInvitationMessage({
          recepients: recepientIds,
          origin: currentChannel.id
        });

        onUpdateLastMessages({
          channels,
          message: invitationMessage,
          sender: { id: userId, username }
        });
      }
      setInviteUsersModalShown(false);
      if (!isClass) {
        onSubmitMessage({
          message: {
            channelId: selectedChannelId,
            userId,
            username,
            id: uuidv1(),
            profilePicUrl,
            content: `sent ${
              users.length === 1 ? 'an ' : ''
            }invitation message${users.length > 1 ? 's' : ''} to ${
              users.length > 1 ? `${users.length} users` : users[0].username
            }`,
            isNotification: true
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      channelName,
      currentChannel,
      profilePicUrl,
      selectedChannelId,
      userId,
      username
    ]
  );

  const handleLeaveChannel = useCallback(async () => {
    if (!leaving) {
      try {
        setLeaving(true);
        await leaveChannel(selectedChannelId);
        onLeaveChannel(selectedChannelId);
        socket.emit('leave_chat_channel', {
          channelId: selectedChannelId,
          userId,
          username,
          profilePicUrl
        });
        const data = await loadChatChannel({ channelId: GENERAL_CHAT_ID });
        onEnterChannelWithId({ data });
        setLeaveConfirmModalShown(false);
        setLeaving(false);
      } catch (error) {
        console.error(error);
        setLeaving(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaving, profilePicUrl, selectedChannelId, userId, username]);

  const handleLeaveConfirm = useCallback(() => {
    if (currentChannel.creatorId === userId) {
      setLeaveConfirmModalShown(false);
      if (currentChannel.members.length === 1) {
        handleLeaveChannel();
      } else {
        setSelectNewOwnerModalShown(true);
      }
    } else {
      handleLeaveChannel();
    }
  }, [
    currentChannel?.creatorId,
    currentChannel?.members?.length,
    handleLeaveChannel,
    userId
  ]);

  const handleLoadMore = useCallback(async () => {
    if (messagesLoadMoreButton) {
      const messageId = messages[0].id;
      const prevContentHeight = ContentRef.current?.offsetHeight || 0;
      if (!loadMoreButtonLock) {
        setLoadMoreButtonLock(true);
        try {
          const { messages, loadedChannelId } = await loadMoreChatMessages({
            userId,
            messageId,
            channelId: selectedChannelId
          });
          onLoadMoreMessages({ messages, loadedChannelId });
          if (MessagesContainerRef.current) {
            MessagesContainerRef.current.scrollTop = Math.max(
              MessagesContainerRef.current.scrollTop,
              (ContentRef.current?.offsetHeight || 0) - prevContentHeight
            );
          }
          setLoadMoreButtonLock(false);
        } catch (error) {
          console.error(error);
          setLoadMoreButtonLock(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadMoreButtonLock,
    messages,
    messagesLoadMoreButton,
    selectedChannelId,
    userId
  ]);

  const handleAcceptGroupInvitation = useCallback(
    async (invitationChannelId) => {
      onUpdateSelectedChannelId(invitationChannelId);
      const { channel, messages, joinMessage } = await acceptInvitation(
        invitationChannelId
      );
      if (channel.id === invitationChannelId) {
        socket.emit('join_chat_group', channel.id);
        onEnterChannelWithId({ data: { channel, messages }, showOnTop: true });
        socket.emit('new_chat_message', {
          message: joinMessage,
          channel,
          newMembers: [{ id: userId, username, profilePicUrl }]
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChannel?.creatorId, selectedChannelId, userId]
  );

  const handleFavoriteClick = useCallback(async () => {
    if (!favoritingRef.current) {
      favoritingRef.current = true;
      try {
        const favorited = await putFavoriteChannel(selectedChannelId);
        onSetFavoriteChannel({ channelId: selectedChannelId, favorited });
        favoritingRef.current = false;
      } catch (error) {
        console.error(error);
        favoritingRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  const handleMessageSubmit = useCallback(
    async ({ content, rewardAmount, rewardReason, target }) => {
      setTextAreaHeight(0);
      let isFirstDirectMessage = selectedChannelId === 0;
      if (isFirstDirectMessage) {
        if (creatingNewDMChannel) return;
        onSetCreatingNewDMChannel(true);
        try {
          const { channel, message } = await startNewDMChannel({
            content,
            userId,
            recepientId
          });
          socket.emit('join_chat_group', message.channelId);
          socket.emit('send_bi_chat_invitation', recepientId, message);
          onSendFirstDirectMessage({ channel, message });
          onSetCreatingNewDMChannel(false);
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }
      const message = {
        userId,
        username,
        profilePicUrl,
        content,
        channelId: selectedChannelId,
        subjectId: isRespondingToSubject ? subjectId : null
      };
      onSubmitMessage({
        message,
        replyTarget: target,
        rewardReason,
        rewardAmount,
        isRespondingToSubject
      });
      onSetReplyTarget(null);
      return Promise.resolve();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      creatingNewDMChannel,
      isRespondingToSubject,
      profilePicUrl,
      recepientId,
      selectedChannelId,
      subjectId,
      userId,
      username
    ]
  );

  const handleRewardMessageSubmit = useCallback(
    async ({ amount, reasonId, message }) => {
      handleMessageSubmit({
        content: rewardReasons[reasonId].message,
        rewardAmount: amount,
        rewardReason: reasonId,
        target: message
      });
      await updateUserXP({
        amount,
        action: 'reward',
        target: 'chat',
        targetId: message.id,
        type: 'increase',
        userId: message.userId
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleMessageSubmit]
  );

  const handleSelectNewOwner = useCallback(
    async ({ newOwner, andLeave }) => {
      const notificationMsg = await changeChannelOwner({
        channelId: selectedChannelId,
        newOwner
      });
      socket.emit('new_channel_owner', {
        channelId: selectedChannelId,
        userId,
        username,
        profilePicUrl,
        newOwner,
        notificationMsg
      });
      if (andLeave) {
        handleLeaveChannel();
      }
      setSelectNewOwnerModalShown(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleLeaveChannel, profilePicUrl, selectedChannelId, userId, username]
  );

  return (
    <ErrorBoundary>
      {!channelHeaderShown && !banned?.chat && selectedChannelId !== 0 && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            zIndex: 50000,
            top: '1rem',
            right: '1rem'
          }}
        >
          <DropdownButton
            skeuomorphic
            color="darkerGray"
            opacity={0.7}
            listStyle={{
              width: '15rem'
            }}
            direction="left"
            icon="bars"
            text={menuLabel}
            menuProps={menuProps}
          />
          <div
            style={{
              marginLeft: '1.5rem'
            }}
          >
            <div
              style={{ cursor: 'pointer', fontSize: '2rem' }}
              onClick={handleFavoriteClick}
              onMouseEnter={() => {
                if (!favorited) {
                  setAddToFavoritesShown(true);
                }
              }}
              onMouseLeave={() => setAddToFavoritesShown(false)}
            >
              <Icon
                color={Color.brownOrange()}
                icon={favorited ? 'star' : ['far', 'star']}
              />
            </div>
            <FullTextReveal
              direction="left"
              className="desktop"
              show={addToFavoritesShown && !favorited}
              text="Add to favorites"
              style={{
                marginTop: '0.5rem',
                fontSize: '1.3rem',
                width: 'auto',
                minWidth: null,
                maxWidth: null,
                padding: '1rem'
              }}
            />
          </div>
        </div>
      )}
      {selectedChannelIsOnCall && (
        <CallScreen style={{ height: CALL_SCREEN_HEIGHT }} />
      )}
      <div
        className={css`
          display: flex;
          flex-direction: column;
          width: 100%;
          position: relative;
          -webkit-overflow-scrolling: touch;
        `}
        style={{
          height: containerHeight
        }}
      >
        {loading && <Loading />}
        <div
          ref={MessagesContainerRef}
          style={{
            position: 'absolute',
            left: '1rem',
            right: '0',
            bottom: '0',
            opacity: loading ? 0 : 1,
            top: channelHeaderShown ? '7rem' : 0,
            overflowY: 'scroll'
          }}
          onScroll={() => {
            if (
              checkScrollIsAtTheBottom({
                content: ContentRef.current,
                container: MessagesContainerRef.current
              })
            ) {
              setScrollAtBottom(true);
              setNewUnseenMessage(false);
            } else {
              setScrollAtBottom(false);
            }
          }}
        >
          <div ref={ContentRef} style={{ width: '100%' }}>
            {!loading && messagesLoadMoreButton ? (
              <div
                style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <LoadMoreButton
                  filled
                  color="lightBlue"
                  loading={loadMoreButtonLock}
                  onClick={handleLoadMore}
                />
              </div>
            ) : (
              <div
                style={{
                  minHeight: placeholderHeight
                }}
              />
            )}
            <div ref={MessagesRef}>
              {messages.map((message, index) => (
                <Message
                  key={selectedChannelId + (message.id || 'newMessage' + index)}
                  zIndex={messages.length - index}
                  channelId={selectedChannelId}
                  channelName={channelName}
                  chessCountdownNumber={chessCountdownObj[selectedChannelId]}
                  chessOpponent={chessOpponent}
                  checkScrollIsAtTheBottom={() =>
                    checkScrollIsAtTheBottom({
                      content: ContentRef.current,
                      container: MessagesContainerRef.current
                    })
                  }
                  currentChannel={currentChannel}
                  index={index}
                  isLastMsg={index === messages.length - 1}
                  isNotification={!!message.isNotification}
                  loading={loading}
                  message={message}
                  onAcceptGroupInvitation={handleAcceptGroupInvitation}
                  onChannelEnter={onChannelEnter}
                  onChessBoardClick={handleChessModalShown}
                  onChessSpoilerClick={handleChessSpoilerClick}
                  onDelete={handleShowDeleteModal}
                  onReceiveNewMessage={handleReceiveNewMessage}
                  onReplyClick={() => ChatInputRef.current.focus()}
                  onRewardMessageSubmit={handleRewardMessageSubmit}
                  onSetScrollToBottom={handleSetScrollToBottom}
                  recepientId={recepientId}
                  onShowSubjectMsgsModal={({ subjectId, content }) =>
                    setSubjectMsgsModal({ shown: true, subjectId, content })
                  }
                />
              ))}
            </div>
          </div>
        </div>
        {!loading && channelHeaderShown && (
          <ChannelHeader
            currentChannel={currentChannel}
            onInputFocus={() => ChatInputRef.current.focus()}
            onSetInviteUsersModalShown={setInviteUsersModalShown}
            onSetLeaveConfirmModalShown={setLeaveConfirmModalShown}
            onSetSettingsModalShown={setSettingsModalShown}
            selectedChannelId={selectedChannelId}
            onFavoriteClick={handleFavoriteClick}
          />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            zIndex: 1000
          }}
        >
          {newUnseenMessage && (
            <Button
              filled
              color="orange"
              style={{ opacity: 0.9 }}
              onClick={() => {
                setNewUnseenMessage(false);
                handleSetScrollToBottom();
              }}
            >
              New Message
            </Button>
          )}
        </div>
        {hideModalShown && (
          <ConfirmModal
            onHide={() => setHideModalShown(false)}
            title="Hide Chat"
            onConfirm={handleHideChat}
          />
        )}
        {deleteModal.shown && (
          <ConfirmModal
            onHide={() =>
              setDeleteModal({ shown: false, filePath: '', messageId: null })
            }
            title="Remove Message"
            onConfirm={handleDelete}
          />
        )}
        {subjectMsgsModal.shown && (
          <SubjectMsgsModal
            subjectId={subjectMsgsModal.subjectId}
            subjectTitle={subjectMsgsModal.content}
            onHide={() =>
              setSubjectMsgsModal({
                shown: false,
                subjectId: null,
                content: ''
              })
            }
          />
        )}
      </div>
      <div
        style={{
          background: Color.inputGray(),
          padding: '1rem',
          borderTop: `1px solid ${Color.borderGray()}`
        }}
      >
        <MessageInput
          innerRef={ChatInputRef}
          loading={loading}
          socketConnected={socketConnected}
          myId={userId}
          isTwoPeopleChannel={currentChannel.twoPeople}
          currentChannelId={selectedChannelId}
          currentChannel={currentChannel}
          onChessButtonClick={handleChessModalShown}
          onMessageSubmit={(content) =>
            handleMessageSubmit({ content, target: replyTarget })
          }
          onHeightChange={(height) => {
            if (height !== textAreaHeight) {
              setTextAreaHeight(height > 46 ? height : 0);
            }
          }}
          onSelectGifButtonClick={() => setGifModalShown(true)}
          onSelectVideoButtonClick={() => setSelectVideoModalShown(true)}
          recepientId={recepientId}
          subjectId={subjectId}
        />
      </div>
      {chessModalShown && (
        <ChessModal
          currentChannel={currentChannel}
          channelId={selectedChannelId}
          countdownNumber={chessCountdownObj[selectedChannelId]}
          myId={userId}
          onConfirmChessMove={handleConfirmChessMove}
          onHide={() => onSetChessModalShown(false)}
          onSetChessCountdownObj={setChessCountdownObj}
          onSpoilerClick={handleChessSpoilerClick}
          opponentId={chessOpponent?.id}
          opponentName={chessOpponent?.username}
          socketConnected={socketConnected}
        />
      )}
      {inviteUsersModalShown && (
        <InviteUsersModal
          onHide={() => setInviteUsersModalShown(false)}
          currentChannel={currentChannel}
          selectedChannelId={selectedChannelId}
          onDone={handleInviteUsersDone}
        />
      )}
      {settingsModalShown && (
        <SettingsModal
          canChangeSubject={currentChannel.canChangeSubject}
          channelName={channelName}
          isClass={currentChannel.isClass}
          isClosed={currentChannel.isClosed}
          members={currentChannel.members}
          onHide={() => setSettingsModalShown(false)}
          onDone={handleEditSettings}
          channelId={selectedChannelId}
          onPurchaseSubject={() =>
            socket.emit('purchased_chat_subject', selectedChannelId)
          }
          onSelectNewOwner={handleSelectNewOwner}
          onSetScrollToBottom={handleSetScrollToBottom}
          theme={currentChannel.theme}
          unlockedThemes={currentChannel.unlockedThemes}
          userIsChannelOwner={currentChannel.creatorId === userId}
        />
      )}
      {leaveConfirmModalShown && (
        <ConfirmModal
          title="Leave Channel"
          onHide={() => setLeaveConfirmModalShown(false)}
          onConfirm={handleLeaveConfirm}
          disabled={leaving}
        />
      )}
      {gifModalShown && (
        <GifModal
          onHide={() => setGifModalShown(false)}
          onSend={(selectedGif) => console.log(selectedGif)}
        />
      )}
      {selectVideoModalShown && (
        <SelectVideoModal
          onHide={() => setSelectVideoModalShown(false)}
          onSend={(videoId) => {
            handleMessageSubmit({
              content: `https://www.twin-kle.com/videos/${videoId}`,
              target: replyTarget
            });
            setSelectVideoModalShown(false);
          }}
        />
      )}
      {!!selectNewOwnerModalShown && (
        <SelectNewOwnerModal
          onHide={() => setSelectNewOwnerModalShown(false)}
          members={currentChannel.members}
          onSubmit={handleSelectNewOwner}
          isClass={currentChannel.isClass}
          andLeave
        />
      )}
    </ErrorBoundary>
  );

  function handleReceiveNewMessage() {
    if (scrollAtBottom) {
      handleSetScrollToBottom();
    } else {
      setNewUnseenMessage(true);
    }
  }

  function handleSetScrollToBottom() {
    if (mounted.current && MessagesContainerRef.current) {
      MessagesContainerRef.current.scrollTop =
        ContentRef.current?.offsetHeight || 0;
      setTimeout(() => {
        if (mounted.current && MessagesContainerRef.current) {
          MessagesContainerRef.current.scrollTop =
            ContentRef.current?.offsetHeight || 0;
        }
      }, 10);
      if (ContentRef.current?.offsetHeight) {
        setScrollAtBottom(true);
      }
    }
  }

  function handleShowDeleteModal({ fileName, filePath, messageId }) {
    setDeleteModal({
      shown: true,
      fileName,
      filePath,
      messageId
    });
  }
}

export default memo(MessagesContainer);
