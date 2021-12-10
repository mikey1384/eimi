import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import PropTypes from 'prop-types';
import CreateNewChat from './Modals/CreateNewChat';
import UserListModal from 'components/Modals/UserListModal';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';
import Body from './Body';
import Loading from 'components/Loading';
import PleaseLogIn from './PleaseLogIn';
import LocalContext from './Context';
import { phoneMaxWidth } from 'constants/css';
import { socket } from 'constants/io';
import { css } from '@emotion/css';
import { useMyState } from 'helpers/hooks';
import { useLocation, useHistory } from 'react-router-dom';
import {
  useAppContext,
  useContentContext,
  useInputContext,
  useNotiContext,
  useViewContext,
  useChatContext
} from 'contexts';
import { GENERAL_CHAT_ID } from 'constants/defaultValues';
import ErrorBoundary from 'components/ErrorBoundary';

Chat.propTypes = {
  onFileUpload: PropTypes.func
};

function Chat({ onFileUpload }) {
  const { pathname } = useLocation();
  const history = useHistory();
  const {
    requestHelpers: {
      acceptInvitation,
      changeChannelOwner,
      checkChatAccessible,
      createNewChat,
      deleteChatMessage,
      editChannelSettings,
      editChatMessage,
      hideChatAttachment,
      hideChat,
      leaveChannel,
      loadChatChannel,
      loadChatSubject,
      loadGeneralChatPathId,
      loadMoreChatMessages,
      loadRankings,
      loadVocabulary,
      parseChannelPath,
      putFavoriteChannel,
      reloadChatSubject,
      saveChatMessage,
      searchChatSubject,
      sendInvitationMessage,
      setChessMoveViewTimeStamp,
      startNewDMChannel,
      updateChatLastRead,
      updateLastChannelId,
      updateUserXP,
      uploadChatSubject,
      uploadThumb
    }
  } = useAppContext();
  const {
    authLevel,
    banned,
    canDelete,
    canEdit,
    canReward,
    fileUploadLvl,
    lastChatPath,
    isCreator,
    userId,
    username,
    profilePicUrl,
    profileTheme,
    rank,
    twinkleXP
  } = useMyState();
  const {
    state,
    actions: { onEnterComment }
  } = useInputContext();
  const {
    state: {
      allFavoriteChannelIds,
      chatType,
      chatStatus,
      chessModalShown,
      channelsObj,
      channelPathIdHash,
      channelOnCall,
      creatingNewDMChannel,
      currentChannelName,
      filesBeingUploaded,
      isRespondingToSubject,
      loadingVocabulary,
      loaded,
      recepientId,
      reconnecting,
      selectedChannelId,
      subjectObj,
      subjectSearchResults
    },
    actions: {
      onClearNumUnreads,
      onClearSubjectSearchResults,
      onCreateNewChannel,
      onDeleteMessage,
      onEditChannelSettings,
      onEditMessage,
      onEnterChannelWithId,
      onEnterEmptyChat,
      onHideAttachment,
      onHideChat,
      onLeaveChannel,
      onLoadChatSubject,
      onLoadMoreMessages,
      onLoadVocabulary,
      onNotifyThatMemberLeftChannel,
      onReceiveMessage,
      onReceiveMessageOnDifferentChannel,
      onReloadChatSubject,
      onSaveMessage,
      onSendFirstDirectMessage,
      onSetChessModalShown,
      onSetCurrentChannelName,
      onSetIsRespondingToSubject,
      onSetLoadingVocabulary,
      onSetCreatingNewDMChannel,
      onSetFavoriteChannel,
      onSetReplyTarget,
      onShowIncoming,
      onSubmitMessage,
      onSearchChatSubject,
      onTrimMessages,
      onUpdateChannelPathIdHash,
      onUpdateChessMoveViewTimeStamp,
      onUpdateRecentChessMessage,
      onUpdateSelectedChannelId,
      onUploadChatSubject
    }
  } = useChatContext();
  const {
    actions: {
      onSetEmbeddedUrl,
      onSetActualDescription,
      onSetActualTitle,
      onSetIsEditing,
      onSetSiteUrl,
      onSetThumbUrl,
      onSetMediaStarted
    }
  } = useContentContext();
  const {
    state: { pageVisible }
  } = useViewContext();
  const {
    state: { allRanks, socketConnected },
    actions: { onGetRanks }
  } = useNotiContext();
  const [creatingChat, setCreatingChat] = useState(false);
  const [createNewChatModalShown, setCreateNewChatModalShown] = useState(false);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const prevPathId = useRef('');
  const prevUserId = useRef(null);
  const mounted = useRef(true);
  const currentChannel = useMemo(
    () => channelsObj[selectedChannelId] || {},
    [channelsObj, selectedChannelId]
  );

  const currentPathId = useMemo(() => pathname.split('chat/')[1], [pathname]);

  useEffect(() => {
    if (currentPathId === 'vocabulary') {
      handleEnterVocabulary();
      prevPathId.current = currentPathId;
      return;
    }
    if (
      currentPathId &&
      Number(currentPathId) !== Number(prevPathId.current) &&
      userId
    ) {
      prevPathId.current = currentPathId;
      if (currentPathId === 'new') {
        if (channelsObj[0]?.twoPeople) {
          onEnterEmptyChat();
        } else {
          history.replace(`/chat`);
        }
      } else {
        handleChannelEnter(currentPathId);
      }
    }

    async function handleChannelEnter(pathId) {
      loadingRef.current = true;
      const { isAccessible, generalChatPathId } = await checkChatAccessible(
        pathId
      );
      if (!isAccessible) {
        return history.replace(`/chat/${generalChatPathId}`);
      }
      const channelId =
        channelPathIdHash[pathId] || (await parseChannelPath(pathId));
      if (!channelPathIdHash[pathId] && mounted.current) {
        onUpdateChannelPathIdHash({ channelId, pathId });
      }
      if (mounted.current) {
        onUpdateSelectedChannelId(channelId);
      }
      if (channelsObj[channelId]?.loaded) {
        if (lastChatPath !== `/${pathId}`) {
          updateLastChannelId(channelId);
        }
        return;
      }
      if (mounted.current) {
        setLoading(true);
      }
      const data = await loadChatChannel({ channelId });
      if (
        !isNaN(Number(prevPathId.current)) &&
        data.channel.pathId !== Number(prevPathId.current)
      ) {
        setLoading(false);
        loadingRef.current = false;
        return;
      }
      if (mounted.current) {
        onEnterChannelWithId({ data });
      }
      if (mounted.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPathId, currentChannel.pathId, chatType]);

  useEffect(() => {
    if (!currentPathId) {
      if (chatType === 'vocabulary') {
        prevPathId.current = 'vocabulary';
        history.replace(`/chat/vocabulary`);
      } else if (!isNaN(currentChannel.pathId)) {
        prevPathId.current = currentChannel.pathId;
        history.replace(`/chat/${currentChannel.pathId}`);
      }
    }
  }, [chatType, currentChannel.pathId, currentPathId, history]);

  useEffect(() => {
    if (!prevUserId.current) {
      prevUserId.current = userId;
      return;
    }
    history.replace(`/chat`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleEnterVocabulary = useCallback(async () => {
    if (chatType === 'vocabulary') return;
    onSetLoadingVocabulary(true);
    const { vocabActivities, wordsObj, wordCollectors } =
      await loadVocabulary();
    onLoadVocabulary({ vocabActivities, wordsObj, wordCollectors });
    onSetLoadingVocabulary(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatType]);

  useEffect(() => {
    if (userId && loaded && selectedChannelId) {
      updateChatLastRead(selectedChannelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, userId, selectedChannelId]);

  useEffect(() => {
    if (pageVisible) {
      onClearNumUnreads();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageVisible, socketConnected]);

  useEffect(() => {
    const otherMember = currentChannel.twoPeople
      ? currentChannel?.members?.filter(
          (member) => Number(member.id) !== userId
        )?.[0]
      : null;
    setPartner(otherMember);
    onSetCurrentChannelName(
      otherMember?.username || channelsObj[currentChannel?.id]?.channelName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelsObj, currentChannel, userId]);

  useEffect(() => {
    socket.on('chess_move_made', onNotifiedMoveMade);
    socket.on('chess_move_viewed', onNotifyMoveViewed);
    socket.on('subject_changed', handleTopicChange);
    socket.on('member_left', handleMemberLeft);

    async function handleMemberLeft({ channelId, leaver }) {
      const forCurrentChannel = channelId === selectedChannelId;
      if (forCurrentChannel) {
        updateChatLastRead(channelId);
        const { userId, username, profilePicUrl } = leaver;
        onNotifyThatMemberLeftChannel({
          channelId,
          userId,
          username,
          profilePicUrl
        });
      }
    }

    function onNotifiedMoveMade({ channelId }) {
      if (channelId === selectedChannelId) {
        onSetChessModalShown(false);
      }
    }

    function onNotifyMoveViewed(channelId) {
      onUpdateChessMoveViewTimeStamp(channelId);
    }

    return function cleanUp() {
      socket.removeListener('chess_move_made', onNotifiedMoveMade);
      socket.removeListener('chess_move_viewed', onNotifyMoveViewed);
      socket.removeListener('subject_changed', handleTopicChange);
      socket.removeListener('member_left', handleMemberLeft);
    };
  });

  useEffect(() => {
    socket.emit('change_away_status', pageVisible);
    mounted.current = true;
    return function cleanUp() {
      onClearNumUnreads();
      if (selectedChannelId) {
        onTrimMessages(selectedChannelId);
      }
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChannelId]);

  const currentChannelOnlineMembers = useMemo(() => {
    if (currentChannel.id === GENERAL_CHAT_ID) {
      const result = {};
      for (let [, member] of Object.entries(chatStatus)) {
        if (member?.isOnline) {
          result[member.id] = member;
        }
      }
      return result;
    }
    const onlineMembersArray = (currentChannel?.members || []).filter(
      (member) => !!chatStatus[member.id]?.isOnline
    );
    const result = {};
    for (let member of onlineMembersArray) {
      result[member.id] = member;
    }
    return result;
  }, [chatStatus, currentChannel.id, currentChannel?.members]);

  const handleCreateNewChannel = useCallback(
    async ({ userId, channelName, isClosed }) => {
      setCreatingChat(true);
      const { message, members, pathId } = await createNewChat({
        userId,
        channelName,
        isClosed
      });
      onCreateNewChannel({ message, isClosed, members, pathId });
      socket.emit('join_chat_group', message.channelId);
      history.push(`/chat/${pathId}`);
      setCreateNewChatModalShown(false);
      setCreatingChat(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleTopicChange = useCallback(
    ({ message, channelId, channelName }) => {
      let messageIsForCurrentChannel = message.channelId === selectedChannelId;
      let senderIsUser = message.userId === userId;
      if (senderIsUser) return;
      if (messageIsForCurrentChannel) {
        onReceiveMessage({ message, pageVisible });
      }
      if (!messageIsForCurrentChannel) {
        onReceiveMessageOnDifferentChannel({
          pageVisible,
          channel: {
            id: channelId,
            channelName,
            isHidden: false,
            numUnreads: 1
          }
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageVisible, selectedChannelId, userId]
  );

  return (
    <LocalContext.Provider
      value={{
        actions: {
          onClearSubjectSearchResults,
          onDeleteMessage,
          onEditChannelSettings,
          onEditMessage,
          onEnterChannelWithId,
          onEnterComment,
          onGetRanks,
          onHideAttachment,
          onHideChat,
          onLeaveChannel,
          onLoadChatSubject,
          onLoadMoreMessages,
          onReceiveMessageOnDifferentChannel,
          onReloadChatSubject,
          onSaveMessage,
          onSearchChatSubject,
          onSendFirstDirectMessage,
          onSetActualDescription,
          onSetActualTitle,
          onSetChessModalShown,
          onSetCreatingNewDMChannel,
          onSetEmbeddedUrl,
          onSetIsEditing,
          onSetIsRespondingToSubject,
          onSetFavoriteChannel,
          onSetMediaStarted,
          onSetReplyTarget,
          onSetSiteUrl,
          onSetThumbUrl,
          onShowIncoming,
          onSubmitMessage,
          onUpdateChessMoveViewTimeStamp,
          onUpdateRecentChessMessage,
          onUploadChatSubject,
          onUpdateChannelPathIdHash
        },
        inputState: state,
        myState: {
          authLevel,
          banned,
          canDelete,
          canEdit,
          canReward,
          fileUploadLvl,
          isCreator,
          profileTheme,
          profilePicUrl,
          rank,
          twinkleXP,
          userId,
          username
        },
        requests: {
          acceptInvitation,
          changeChannelOwner,
          deleteChatMessage,
          editChatMessage,
          editChannelSettings,
          hideChat,
          hideChatAttachment,
          leaveChannel,
          loadChatChannel,
          loadGeneralChatPathId,
          loadMoreChatMessages,
          loadChatSubject,
          loadRankings,
          parseChannelPath,
          putFavoriteChannel,
          reloadChatSubject,
          saveChatMessage,
          searchChatSubject,
          sendInvitationMessage,
          setChessMoveViewTimeStamp,
          startNewDMChannel,
          updateUserXP,
          uploadChatSubject,
          uploadThumb
        },
        state: {
          allFavoriteChannelIds,
          allRanks,
          channelOnCall,
          channelPathIdHash,
          chatType,
          chatStatus,
          chessModalShown,
          creatingNewDMChannel,
          filesBeingUploaded,
          isRespondingToSubject,
          loadingVocabulary,
          recepientId,
          reconnecting,
          selectedChannelId,
          socketConnected,
          subjectObj,
          subjectSearchResults
        },
        onFileUpload
      }}
    >
      <ErrorBoundary>
        {userId ? (
          loaded ? (
            <div
              className={css`
                width: 100%;
                height: 100%;
                display: flex;
                font-size: 1.6rem;
                position: relative;
                @media (max-width: ${phoneMaxWidth}) {
                  width: 152vw;
                  height: CALC(100% - 7rem);
                }
              `}
            >
              {createNewChatModalShown && (
                <CreateNewChat
                  creatingChat={creatingChat}
                  onHide={() => setCreateNewChatModalShown(false)}
                  onDone={handleCreateNewChannel}
                />
              )}
              {userListModalShown && (
                <UserListModal
                  onHide={() => setUserListModalShown(false)}
                  users={returnUsers(
                    currentChannel,
                    currentChannelOnlineMembers
                  )}
                  descriptionShown={(user) =>
                    !!currentChannelOnlineMembers[user.id]
                  }
                  description="(online)"
                  title="Online Status"
                />
              )}
              <LeftMenu
                onNewButtonClick={() => setCreateNewChatModalShown(true)}
                showUserListModal={() => setUserListModalShown(true)}
              />
              <Body
                loading={loading}
                channelName={currentChannelName}
                chessOpponent={partner}
                currentChannel={currentChannel}
              />
              <RightMenu
                channelOnCall={channelOnCall}
                channelName={currentChannelName}
                currentChannel={currentChannel}
                currentChannelOnlineMembers={currentChannelOnlineMembers}
                selectedChannelId={selectedChannelId}
              />
            </div>
          ) : (
            <Loading text="Loading Twinkle Chat" />
          )
        ) : (
          <PleaseLogIn />
        )}
      </ErrorBoundary>
    </LocalContext.Provider>
  );

  function returnUsers({ members: allMembers }, currentChannelOnlineMembers) {
    return allMembers.length > 0
      ? allMembers
      : Object.entries(currentChannelOnlineMembers).map(([, member]) => member);
  }
}

export default memo(Chat);
