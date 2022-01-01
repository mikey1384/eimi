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
import { parseChannelPath } from 'helpers';
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
  const acceptInvitation = useAppContext(
    (v) => v.requestHelpers.acceptInvitation
  );
  const changeChannelOwner = useAppContext(
    (v) => v.requestHelpers.changeChannelOwner
  );
  const checkChatAccessible = useAppContext(
    (v) => v.requestHelpers.checkChatAccessible
  );
  const createNewChat = useAppContext((v) => v.requestHelpers.createNewChat);
  const deleteChatMessage = useAppContext(
    (v) => v.requestHelpers.deleteChatMessage
  );
  const editChannelSettings = useAppContext(
    (v) => v.requestHelpers.editChannelSettings
  );
  const editChatMessage = useAppContext(
    (v) => v.requestHelpers.editChatMessage
  );
  const hideChatAttachment = useAppContext(
    (v) => v.requestHelpers.hideChatAttachment
  );
  const hideChat = useAppContext((v) => v.requestHelpers.hideChat);
  const leaveChannel = useAppContext((v) => v.requestHelpers.leaveChannel);
  const loadChatChannel = useAppContext(
    (v) => v.requestHelpers.loadChatChannel
  );
  const loadChatSubject = useAppContext(
    (v) => v.requestHelpers.loadChatSubject
  );
  const loadMoreChatMessages = useAppContext(
    (v) => v.requestHelpers.loadMoreChatMessages
  );
  const loadRankings = useAppContext((v) => v.requestHelpers.loadRankings);
  const loadVocabulary = useAppContext((v) => v.requestHelpers.loadVocabulary);
  const putFavoriteChannel = useAppContext(
    (v) => v.requestHelpers.putFavoriteChannel
  );
  const reloadChatSubject = useAppContext(
    (v) => v.requestHelpers.reloadChatSubject
  );
  const saveChatMessage = useAppContext(
    (v) => v.requestHelpers.saveChatMessage
  );
  const searchChatSubject = useAppContext(
    (v) => v.requestHelpers.searchChatSubject
  );
  const sendInvitationMessage = useAppContext(
    (v) => v.requestHelpers.sendInvitationMessage
  );
  const setChessMoveViewTimeStamp = useAppContext(
    (v) => v.requestHelpers.setChessMoveViewTimeStamp
  );
  const startNewDMChannel = useAppContext(
    (v) => v.requestHelpers.startNewDMChannel
  );
  const updateChatLastRead = useAppContext(
    (v) => v.requestHelpers.updateChatLastRead
  );
  const updateLastChannelId = useAppContext(
    (v) => v.requestHelpers.updateLastChannelId
  );
  const updateUserXP = useAppContext((v) => v.requestHelpers.updateUserXP);
  const uploadChatSubject = useAppContext(
    (v) => v.requestHelpers.uploadChatSubject
  );
  const uploadThumb = useAppContext((v) => v.requestHelpers.uploadThumb);

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
  const state = useInputContext((v) => v.state);
  const onEnterComment = useInputContext((v) => v.actions.onEnterComment);
  const allFavoriteChannelIds = useChatContext(
    (v) => v.state.allFavoriteChannelIds
  );
  const chatType = useChatContext((v) => v.state.chatType);
  const chatStatus = useChatContext((v) => v.state.chatStatus);
  const chessModalShown = useChatContext((v) => v.state.chessModalShown);
  const channelsObj = useChatContext((v) => v.state.channelsObj);
  const channelPathIdHash = useChatContext((v) => v.state.channelPathIdHash);
  const channelOnCall = useChatContext((v) => v.state.channelOnCall);
  const creatingNewDMChannel = useChatContext(
    (v) => v.state.creatingNewDMChannel
  );
  const currentChannelName = useChatContext((v) => v.state.currentChannelName);
  const filesBeingUploaded = useChatContext((v) => v.state.filesBeingUploaded);
  const isRespondingToSubject = useChatContext(
    (v) => v.state.isRespondingToSubject
  );
  const loadingVocabulary = useChatContext((v) => v.state.loadingVocabulary);
  const loaded = useChatContext((v) => v.state.loaded);
  const recepientId = useChatContext((v) => v.state.recepientId);
  const reconnecting = useChatContext((v) => v.state.reconnecting);
  const selectedChannelId = useChatContext((v) => v.state.selectedChannelId);
  const subjectObj = useChatContext((v) => v.state.subjectObj);
  const subjectSearchResults = useChatContext(
    (v) => v.state.subjectSearchResults
  );
  const onClearNumUnreads = useChatContext((v) => v.actions.onClearNumUnreads);
  const onClearSubjectSearchResults = useChatContext(
    (v) => v.actions.onClearSubjectSearchResults
  );
  const onCreateNewChannel = useChatContext(
    (v) => v.actions.onCreateNewChannel
  );
  const onDeleteMessage = useChatContext((v) => v.actions.onDeleteMessage);
  const onEditChannelSettings = useChatContext(
    (v) => v.actions.onEditChannelSettings
  );
  const onEditMessage = useChatContext((v) => v.actions.onEditMessage);
  const onEnterChannelWithId = useChatContext(
    (v) => v.actions.onEnterChannelWithId
  );
  const onEnterEmptyChat = useChatContext((v) => v.actions.onEnterEmptyChat);
  const onHideAttachment = useChatContext((v) => v.actions.onHideAttachment);
  const onHideChat = useChatContext((v) => v.actions.onHideChat);
  const onLeaveChannel = useChatContext((v) => v.actions.onLeaveChannel);
  const onLoadChatSubject = useChatContext((v) => v.actions.onLoadChatSubject);
  const onLoadMoreMessages = useChatContext(
    (v) => v.actions.onLoadMoreMessages
  );
  const onLoadVocabulary = useChatContext((v) => v.actions.onLoadVocabulary);
  const onNotifyThatMemberLeftChannel = useChatContext(
    (v) => v.actions.onNotifyThatMemberLeftChannel
  );
  const onReceiveMessage = useChatContext((v) => v.actions.onReceiveMessage);
  const onReceiveMessageOnDifferentChannel = useChatContext(
    (v) => v.actions.onReceiveMessageOnDifferentChannel
  );
  const onReloadChatSubject = useChatContext(
    (v) => v.actions.onReloadChatSubject
  );
  const onSaveMessage = useChatContext((v) => v.actions.onSaveMessage);
  const onSendFirstDirectMessage = useChatContext(
    (v) => v.actions.onSendFirstDirectMessage
  );
  const onSetChessModalShown = useChatContext(
    (v) => v.actions.onSetChessModalShown
  );
  const onSetCurrentChannelName = useChatContext(
    (v) => v.actions.onSetCurrentChannelName
  );
  const onSetIsRespondingToSubject = useChatContext(
    (v) => v.actions.onSetIsRespondingToSubject
  );
  const onSetLoadingVocabulary = useChatContext(
    (v) => v.actions.onSetLoadingVocabulary
  );
  const onSetCreatingNewDMChannel = useChatContext(
    (v) => v.actions.onSetCreatingNewDMChannel
  );
  const onSetFavoriteChannel = useChatContext(
    (v) => v.actions.onSetFavoriteChannel
  );
  const onSetReplyTarget = useChatContext((v) => v.actions.onSetReplyTarget);
  const onShowIncoming = useChatContext((v) => v.actions.onShowIncoming);
  const onSubmitMessage = useChatContext((v) => v.actions.onSubmitMessage);
  const onSearchChatSubject = useChatContext(
    (v) => v.actions.onSearchChatSubject
  );
  const onTrimMessages = useChatContext((v) => v.actions.onTrimMessages);
  const onUpdateChannelPathIdHash = useChatContext(
    (v) => v.actions.onUpdateChannelPathIdHash
  );
  const onUpdateChessMoveViewTimeStamp = useChatContext(
    (v) => v.actions.onUpdateChessMoveViewTimeStamp
  );
  const onUpdateRecentChessMessage = useChatContext(
    (v) => v.actions.onUpdateRecentChessMessage
  );
  const onUpdateSelectedChannelId = useChatContext(
    (v) => v.actions.onUpdateSelectedChannelId
  );
  const onUploadChatSubject = useChatContext(
    (v) => v.actions.onUploadChatSubject
  );

  const onSetEmbeddedUrl = useContentContext((v) => v.actions.onSetEmbeddedUrl);
  const onSetActualDescription = useContentContext(
    (v) => v.actions.onSetActualDescription
  );
  const onSetActualTitle = useContentContext((v) => v.actions.onSetActualTitle);
  const onSetIsEditing = useContentContext((v) => v.actions.onSetIsEditing);
  const onSetSiteUrl = useContentContext((v) => v.actions.onSetSiteUrl);
  const onSetThumbUrl = useContentContext((v) => v.actions.onSetThumbUrl);
  const onSetMediaStarted = useContentContext(
    (v) => v.actions.onSetMediaStarted
  );

  const pageVisible = useViewContext((v) => v.state.pageVisible);
  const allRanks = useNotiContext((v) => v.state.allRanks);
  const socketConnected = useNotiContext((v) => v.state.socketConnected);
  const onGetRanks = useNotiContext((v) => v.actions.onGetRanks);
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
  const currentPathIdRef = useRef(currentPathId);

  useEffect(() => {
    currentPathIdRef.current = currentPathId;
  }, [currentPathId]);

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
      const channelId = channelPathIdHash[pathId] || parseChannelPath(pathId);
      if (!channelPathIdHash[pathId] && mounted.current) {
        onUpdateChannelPathIdHash({ channelId, pathId });
      }
      if (channelsObj[channelId]?.loaded) {
        if (mounted.current) {
          onUpdateSelectedChannelId(channelId);
        }
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
        if (mounted.current) {
          setLoading(false);
        }
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
    if (currentPathIdRef.current === 'vocabulary') {
      if (mounted.current) {
        onLoadVocabulary({ vocabActivities, wordsObj, wordCollectors });
      }
      if (mounted.current) {
        onSetLoadingVocabulary(false);
      }
    }
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
      if (mounted.current) {
        onCreateNewChannel({ message, isClosed, members, pathId });
      }
      socket.emit('join_chat_group', message.channelId);
      history.push(`/chat/${pathId}`);
      if (mounted.current) {
        setCreateNewChatModalShown(false);
      }
      if (mounted.current) {
        setCreatingChat(false);
      }
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
          message,
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
