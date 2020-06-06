import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import CreateNewChatModal from './Modals/CreateNewChat';
import UserListModal from 'components/Modals/UserListModal';
import LeftMenu from './LeftMenu';
import RightMenu from './RightMenu';
import Body from './Body';
import Loading from 'components/Loading';
import PleaseLogIn from './PleaseLogIn';
import LocalContext from './Context';
import { phoneMaxWidth } from 'constants/css';
import { socket } from 'constants/io';
import { css } from 'emotion';
import { useMyState } from 'helpers/hooks';
import { useAppContext, useViewContext, useChatContext } from 'contexts';

Chat.propTypes = {
  onFileUpload: PropTypes.func
};

function Chat({ onFileUpload }) {
  const {
    requestHelpers: {
      createNewChat,
      loadChatChannel,
      loadDMChannel,
      updateChatLastRead
    }
  } = useAppContext();
  const { userId, username } = useMyState();
  const {
    state: {
      chatType,
      loaded,
      selectedChannelId,
      channelsObj,
      channelOnCall,
      currentChannelName,
      selectedChatTab
    },
    actions: {
      onClearNumUnreads,
      onCreateNewChannel,
      onEnterChannelWithId,
      onEnterEmptyChat,
      onNotifyThatMemberLeftChannel,
      onOpenDirectMessageChannel,
      onReceiveMessage,
      onReceiveMessageOnDifferentChannel,
      onSetChessModalShown,
      onSetCurrentChannelName,
      onUpdateChessMoveViewTimeStamp,
      onUpdateSelectedChannelId
    }
  } = useChatContext();
  const {
    state: { pageVisible }
  } = useViewContext();
  const [
    currentChannelOnlineMembers,
    setCurrentChannelOnlineMembers
  ] = useState({});
  const [creatingChat, setCreatingChat] = useState(false);
  const [createNewChatModalShown, setCreateNewChatModalShown] = useState(false);
  const [userListModalShown, setUserListModalShown] = useState(false);
  const [partner, setPartner] = useState(null);
  const mounted = useRef(true);

  const isViewingAboutClassPage = useMemo(
    () =>
      !chatType &&
      selectedChatTab === 'class' &&
      !channelsObj[selectedChannelId]?.isClass,
    [channelsObj, chatType, selectedChannelId, selectedChatTab]
  );
  const currentChannel = useMemo(() => channelsObj[selectedChannelId] || {}, [
    channelsObj,
    selectedChannelId
  ]);

  useEffect(() => {
    mounted.current = true;
    if (userId && (loaded || !userId || !socket.connected)) {
      if (userId && selectedChannelId) {
        updateChatLastRead(selectedChannelId);
      }
      onClearNumUnreads(selectedChannelId);
    }
    return function cleanUp() {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, pageVisible, userId, selectedChannelId]);

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
    socket.on('subject_changed', onSubjectChange);
    socket.on('members_online_changed', handleChangeMembersOnline);

    function handleChangeMembersOnline({
      channelId,
      leftChannel,
      membersOnline
    }) {
      const forCurrentChannel = channelId === selectedChannelId;
      if (forCurrentChannel) {
        if (leftChannel) {
          const { userId, username, profilePicId } = leftChannel;
          onNotifyThatMemberLeftChannel({
            channelId,
            userId,
            username,
            profilePicId
          });
        }
        setCurrentChannelOnlineMembers(membersOnline);
      }
    }

    function onNotifiedMoveMade({ channelId }) {
      if (channelId === selectedChannelId) {
        onSetChessModalShown(false);
      }
    }

    function onNotifyMoveViewed(channelId) {
      if (channelId === selectedChannelId) {
        onUpdateChessMoveViewTimeStamp();
      }
    }

    return function cleanUp() {
      socket.removeListener('chess_move_made', onNotifiedMoveMade);
      socket.removeListener('chess_move_viewed', onNotifyMoveViewed);
      socket.removeListener('subject_changed', onSubjectChange);
      socket.removeListener(
        'members_online_changed',
        handleChangeMembersOnline
      );
    };
  });

  useEffect(() => {
    socket.emit(
      'check_online_members',
      selectedChannelId,
      (err, { membersOnline }) => {
        if (err) console.error(err);
        if (mounted.current) {
          setCurrentChannelOnlineMembers(membersOnline);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChannel, selectedChannelId]);

  return (
    <LocalContext.Provider
      value={{
        currentChannelOnlineMembers,
        onFileUpload
      }}
    >
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
                height: 100%;
              }
            `}
          >
            {createNewChatModalShown && (
              <CreateNewChatModal
                creatingChat={creatingChat}
                onHide={() => setCreateNewChatModalShown(false)}
                onDone={handleCreateNewChannel}
              />
            )}
            {userListModalShown && (
              <UserListModal
                onHide={() => setUserListModalShown(false)}
                users={returnUsers(currentChannel, currentChannelOnlineMembers)}
                descriptionShown={(user) =>
                  !!currentChannelOnlineMembers[user.id]
                }
                description="(online)"
                title="Online Status"
              />
            )}
            <LeftMenu
              onChannelEnter={handleChannelEnter}
              onNewButtonClick={() => setCreateNewChatModalShown(true)}
              showUserListModal={() => setUserListModalShown(true)}
            />
            <Body
              channelName={currentChannelName}
              chessOpponent={partner}
              currentChannel={currentChannel}
            />
            {!isViewingAboutClassPage && (
              <RightMenu
                channelOnCall={channelOnCall}
                channelName={currentChannelName}
                currentChannel={currentChannel}
                currentChannelOnlineMembers={currentChannelOnlineMembers}
                selectedChannelId={selectedChannelId}
              />
            )}
          </div>
        ) : (
          <Loading text="Loading Twinkle Chat" />
        )
      ) : (
        <PleaseLogIn />
      )}
    </LocalContext.Provider>
  );

  function returnUsers({ members: allMembers }, currentChannelOnlineMembers) {
    return allMembers.length > 0
      ? allMembers
      : Object.entries(currentChannelOnlineMembers).map(([, member]) => member);
  }

  async function handleChannelEnter(id) {
    if (id === 0) {
      setCurrentChannelOnlineMembers({});
      return onEnterEmptyChat();
    }
    onUpdateSelectedChannelId(id);
    const data = await loadChatChannel({ channelId: id });
    onEnterChannelWithId({ data });
  }

  async function handleCreateNewChannel({
    userId,
    channelName,
    isClosed,
    selectedUsers
  }) {
    setCreatingChat(true);
    if (selectedUsers.length === 1) {
      const recepient = selectedUsers[0];
      const data = await loadDMChannel({ recepient });
      onOpenDirectMessageChannel({
        user: { id: userId, username },
        recepient,
        channelData: data
      });
      setCreateNewChatModalShown(false);
      return setCreatingChat(false);
    }

    const { message, members } = await createNewChat({
      userId,
      channelName,
      isClosed,
      selectedUsers
    });
    onCreateNewChannel({ message, isClosed, members });

    const users = selectedUsers.map((user) => user.id);
    socket.emit('join_chat_group', message.channelId);
    socket.emit('send_group_chat_invitation', users, {
      message,
      isClosed,
      members
    });
    setCreateNewChatModalShown(false);
    setCreatingChat(false);
  }

  function onSubjectChange({ message }) {
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
          id: 2,
          lastUpdate: message.timeStamp,
          isHidden: false,
          channelName: 'General',
          lastMessage: {
            content: message.content,
            sender: {
              id: message.userId,
              username: message.username
            }
          },
          numUnreads: 1
        }
      });
    }
  }
}

export default memo(Chat);
